import admin from "firebase-admin"
import { FirebaseScrypt } from 'firebase-scrypt'

const serviceAccount = require("./serviceAccountKey.json")

const addQuizQuestion = (batch, levelRef, question_num, question_text, answers, answerCorrectness) => {
    const questionRef = levelRef.collection("multipleChoiceQuestions").doc(question_num);
    batch.set(questionRef, {
	"id": question_num,
	"name": question_text
    })
    
    const answersRef = questionRef.collection("answers");
    for (const [index, answer] of answers.entries()){
	const answerRef = answersRef.doc(index.toString())
	batch.set(answerRef, {
	    "correct": answerCorrectness[index] == true,
	    "name": answer
	})
    }

    return batch;
}

const addQuizLevel = (batch, quizRef,  levelName) => {
    const levelRef = quizRef.collection("Level").doc(levelName);
    batch.set(levelRef, {
	"name": levelName
    })
    return levelRef
}

const addQuiz = (db, batch, name, thumbnail) => {
    let quizRef = db.collection('quizzes').doc(name)
    batch.set(quizRef, {
	"name": name,
	"thumbnail": thumbnail
    })
    return quizRef
}

const quizData = [
    (db, batch) => {
	let quizRef = addQuiz(db, batch, "quiz1", "https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/The_C_Programming_Language_logo.svg/460px-The_C_Programming_Language_logo.svg.png")

	const levelEasy = addQuizLevel(batch, quizRef, "Easy")
	addQuizQuestion(batch, levelEasy, "0", "easy question", ["easy answer 1", "easy answer 2"], [true, false])
	addQuizQuestion(batch, levelEasy, "1", "easy question where first and third are correct", ["easy answer 1-1", "easy answer 1-2", "easy answer 1-3"], [true, false, true, false])
	addQuizQuestion(batch, levelEasy, "2", "easy question where first is only correct answer", ["true easy answer", "easy answer 1-2-2", "easy answer 1-3-2"], [true, false, false, false])

	const levelMedium = addQuizLevel(batch, quizRef, "Medium")
	addQuizQuestion(batch, levelMedium, "0", "medium quiz question 1", ["ans1", "ans2"], [true, false])
	addQuizQuestion(batch, levelMedium, "1", "medium quiz question 2", ["ans11", "ans12"], [true, false])
	addQuizQuestion(batch, levelMedium, "2", "medium quiz question 3", ["ans21", "ans22"], [true, false])
	addQuizQuestion(batch, levelMedium, "3", "medium quiz question 4", ["ans31", "ans32"], [true, false])
    },
    (db, batch) => {
	let quizRef = addQuiz(db, batch, "quiz2", "https://upload.wikimedia.org/wikipedia/en/3/30/Java_programming_language_logo.svg")

	const levelEasy = addQuizLevel(batch, quizRef, "Easy")
	addQuizQuestion(batch, levelEasy, "0", "TestQ0", ["ans1", "ans2"], [true, false])
	addQuizQuestion(batch, levelEasy, "1", "TestQ1", ["ans11", "ans12"], [true, false])
	addQuizQuestion(batch, levelEasy, "2", "TestQ2", ["ans21", "ans22"], [true, false])

	const levelMedium = addQuizLevel(batch, quizRef, "Medium")
	addQuizQuestion(batch, levelMedium, "0", "TestQ0", ["ans1", "ans2"], [true, false])
	addQuizQuestion(batch, levelMedium, "1", "TestQ1", ["ans11", "ans12"], [true, false])
	addQuizQuestion(batch, levelMedium, "2", "TestQ2", ["ans21", "ans22"], [true, false])
	addQuizQuestion(batch, levelMedium, "3", "TestQ3", ["ans31", "ans32"], [true, false])

	const levelHard = addQuizLevel(batch, quizRef, "Hard")
	addQuizQuestion(batch, levelHard, "0", "TestQ0", ["ans1", "ans2"], [true, false])
	addQuizQuestion(batch, levelHard, "1", "TestQ1", ["ans11", "ans12"], [true, false])
	addQuizQuestion(batch, levelHard, "2", "TestQ2", ["ans21", "ans22"], [true, false])
	addQuizQuestion(batch, levelHard, "3", "TestQ3", ["ans31", "ans32"], [true, false])

    }
]

const userData = [
    {
	"email": "1zfubzvgdimpdznytyf@tmmwj.com",
	"isAdmin": false,
	"uid": "gvGmR6s6PYc7h7nAfdiEOEOfPXO1"
    },
    {
	"email": "0zfubzvgdimpdznytyf@tmmwj.com",
	"isAdmin": true,
	"uid": "gvGmR6s6PYc7h7nAfdiEOEOfPXO0"
    }
]
/*
const hash_config = {
    algorithm: "SCRYPT",
    key: Buffer.from("rBxx6mC08arwXPG9WQsvji6dt4yKn9nZiUfbv3iWsOc2cDg5ERLFVd3z0245MiFG3ekEqGoRDEVD59mhdS6k7w=="),
    saltSeparator: Buffer.from("Bw=="),
    rounds: 8,
    memoryCost: 14,
}
*/
const userAuth = [
    {
	uid: 'gvGmR6s6PYc7h7nAfdiEOEOfPXO1',
	email: '1zfubzvgdimpdznytyf@tmmwj.com',
	password:"gvGmR6s6PYc7h7nAfdiEOEOfPXO1@"
    },
    {
	uid: 'gvGmR6s6PYc7h7nAfdiEOEOfPXO0',
	email: '0zfubzvgdimpdznytyf@tmmwj.com',
	password:"gvGmR6s6PYc7h7nAfdiEOEOfPXO0@"
    }
]



export function firestoreSeed(){
    return new Promise((resolve, reject) =>{
	let app
	if(!admin.apps.length){
	    app = admin.default.initializeApp({credential: admin.credential.cert(serviceAccount)});
	}else{
	    app = admin.app()
	}

	const db = admin.firestore(app);
	try {
	    db.collection('users').get().then((userDocs) => {
		const promises = []
		userDocs.forEach(doc => promises.push(db.recursiveDelete(doc.ref)));
		Promise.all(promises).then(_ => {
		    const batch = db.batch();
		    for(const user of userData) {
			const ref = db.collection('users').doc(user["uid"])
			batch.set(ref, user);
		    }
		    batch.commit().then((result) => {
			db.collection('quizzes').get().then((quizDocs) => {
			    const promises = []
			    quizDocs.forEach(doc => promises.push(db.recursiveDelete(doc.ref)));
			    Promise.all(promises).then(_ => {
				const batch = db.batch();
				for(const quiz of quizData){
				    quiz(db, batch)
				}
				batch.commit().then(_ => {
				    app.delete();
				    resolve(true);
				})
			    })
			})
		    })
		})
	    })
	} catch (e) {
	    console.log("Error adding document: ", e);
	    //app.delete();
	    resolve(false);
	}
    })
}

export function authSeed(){
    return new Promise((resolve, reject) =>{
	let app
	if(!admin.apps.length){
	    app = admin.default.initializeApp({credential: admin.credential.cert(serviceAccount)});
	}else{
	    app = admin.app()
	}
	const auth = admin.auth(app)
	try {
	    console.log("Here1!");
	    const promises = []
	    auth.listUsers(10).then((userList, err) => {
		if(err){
		    console.log(err);
		    app.delete();
		    resolve(false);
		}
		console.log("Here2!");
		userList.users.forEach(user => promises.push(auth.deleteUser(user.uid)));
		console.log(promises)
		Promise.all(promises).then(_ => {
		    console.log("Here3!");
		    const promises = []
		    for(const user of userAuth){
			promises.push(auth.createUser(user));
		    }
		    console.log("Here4!");
		    Promise.all(promises).then((result) => {
			app.delete();
			resolve(true);
		    })
		})
		
	    })
	} catch (e) {
	    console.log("Error adding users to auth: ", e);
	    app.delete();
	    resolve(false);
	}
    })
}
