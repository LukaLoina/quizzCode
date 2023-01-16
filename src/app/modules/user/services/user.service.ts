import { Injectable } from '@angular/core'
import {
  AngularFirestore,
  DocumentChangeAction
} from '@angular/fire/compat/firestore'
import { firstValueFrom, map, tap } from 'rxjs'
import { Question } from 'src/app/shared/models/Question'
import { AttemptedQuiz, Quiz } from 'src/app/shared/models/Quiz'
import { User } from 'src/app/shared/models/User'
import { StoreService } from 'src/app/shared/services/store.service'

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor (
    private db: AngularFirestore,
    private storeService: StoreService
  ) {}

  getUserQuizLanguages (user: User) {
    const quizzes: AttemptedQuiz[] = []
    firstValueFrom(
      this.db
        .collection(`users/${user.uid}/solvedQuizzes`)
        .snapshotChanges()
        .pipe(
          map(actions =>
            actions.map(
              ({ payload: { doc } }: DocumentChangeAction<unknown>) => {
                quizzes.push({
                  name: doc.data()['name'],
                  thumbnail: doc.data()['thumbnail'],
                  isCompleted: false,
                  questions: []
                })
              }
            )
          ),
          tap(async () => {
            await this.getAllUserQuizzes(user, quizzes)
          })
        )
    )
  }

  async getAllUserQuizzes (user: User, quizzes: AttemptedQuiz[]) {
    const allQuizzes: AttemptedQuiz[] = []
    for (const quiz of quizzes) {
      await firstValueFrom(
        this.db
          .collection(`users/${user.uid}/solvedQuizzes/${quiz.name}/Level`)
          .snapshotChanges()
          .pipe(
            map(actions =>
              actions.map(
                ({ payload: { doc } }: DocumentChangeAction<unknown>) => {
                  allQuizzes.push({
                    name: quiz.name,
                    thumbnail: quiz.thumbnail,
                    score: doc.data()['score'],
                    isCompleted: doc.data()['isCompleted'],
                    totalQuestions: doc.data()['totalQuestions'],
                    level: doc.id,
                    questions: []
                  })
                }
              )
            )
          )
      )
    }
    this.storeService.updateUserQuizzes(allQuizzes)
  }

  loadAttemptedQuiz (
    language: string,
    level: string,
    user: User,
    allQuizzes: Quiz[],
    questions: Question[]
  ) {
    firstValueFrom(
      this.db
        .collection(`users/${user.uid}/solvedQuizzes`)
        .doc(language)
        .get()
        .pipe(
          map(doc => {
            if (!doc.exists) {
              this.saveQuiz(language, level, user, allQuizzes, questions)
            } else {
              firstValueFrom(
                this.db
                  .collection(
                    `users/${user.uid}/solvedQuizzes/${language}/Level`
                  )
                  .doc(level)
                  .get()
                  .pipe(
                    map(doc => {
                      if (!doc.exists || doc.data()['isCompleted']) {
                        this.saveQuiz(
                          language,
                          level,
                          user,
                          allQuizzes,
                          questions
                        )
                      }
                    })
                  )
              ).then(() =>
                this.storeService.updateAttemptedQuiz({
                  name: doc.id,
                  level: level,
                  isCompleted: doc.data()['isCompleted'],
                  thumbnail: allQuizzes.find(quiz => quiz.name === language)
                    .thumbnail,
                  questions: this.getAttemptedQuizQuestions(
                    language,
                    level,
                    user
                  )
                })
              )
            }
          })
        )
    )
  }

  saveQuiz (
    language: string,
    level: string,
    user: User,
    allQuizzes: Quiz[],
    questions: Question[]
  ) {
    this.db
      .collection(`users/${user.uid}/solvedQuizzes`)
      .doc(language)
      .set(
        {
          name: language,
          thumbnail: allQuizzes.find(quiz => quiz.name === language).thumbnail
        },
        { merge: true }
      )
    this.db
      .collection(`users/${user.uid}/solvedQuizzes/${language}/Level`)
      .doc(level)
      .set(
        { score: 0, totalQuestions: questions.length, isCompleted: false },
        { merge: true }
      )
    questions.forEach(question => {
      this.db
        .collection(
          `users/${user.uid}/solvedQuizzes/${language}/Level/${level}/questions`
        )
        .doc(question.name)
        .set({ name: question.name, answers: [] }, { merge: true })
        .then(() => {
          this.storeService.updateAttemptedQuiz({
            name: language,
            level: level,
            isCompleted: false,
            thumbnail: allQuizzes.find(quiz => quiz.name === language)
              .thumbnail,
            questions: this.getAttemptedQuizQuestions(language, level, user)
          })
        })
    })
  }

  saveQuizQuestion (
    question: Question,
    user: User,
    attemptedQuiz: AttemptedQuiz
  ) {
    const ans = question.answers
    this.db
      .collection(
        `users/${user.uid}/solvedQuizzes/${attemptedQuiz.name}/Level/${attemptedQuiz.level}/questions`
      )
      .doc(question.name)
      .set(
        {
          name: question.name,
          answers: ans
        },
        { merge: true }
      )
      .then(() => {
        this.storeService.updateAttemptedQuiz({
          name: attemptedQuiz.name,
          level: attemptedQuiz.level,
          thumbnail: attemptedQuiz.thumbnail,
          isCompleted: false,
          questions: this.getAttemptedQuizQuestions(
            attemptedQuiz.name,
            attemptedQuiz.level,
            user
          )
        })
      })
  }

  saveQuizScore (attemptedQuiz: AttemptedQuiz, user: User) {
    var sum = 0
    attemptedQuiz.questions.forEach(question => {
      if (question.answers.length !== 0 && question.answers[0].correct) sum++
    })
    this.db
      .collection(`users/${user.uid}/solvedQuizzes/${attemptedQuiz.name}/Level`)
      .doc(attemptedQuiz.level)
      .set({ score: sum, isCompleted: true }, { merge: true })
    this.storeService.updateScoreInAttemptedQuiz(sum)
    this.storeService.updateTotalQuestionsInAttemptedQuiz(
      attemptedQuiz.questions.length
    )
    this.storeService.updateCompletionInAttemptedQuiz(true)
  }

  getAttemptedQuizQuestions (language: string, level: string, user: User) {
    const questions: Question[] = []
    firstValueFrom(
      this.db
        .collection(
          `users/${user.uid}/solvedQuizzes/${language}/Level/${level}/questions`
        )
        .snapshotChanges()
        .pipe(
          map(actions =>
            actions.map(
              ({ payload: { doc } }: DocumentChangeAction<unknown>) => {
                questions.push({
                  id: doc.data()['id'],
                  name: doc.data()['name'],
                  answers: doc.data()['answers']
                })
              }
            )
          )
        )
    )
    return questions
  }
}
