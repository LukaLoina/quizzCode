import users from "../fixtures/users.json"

describe('quiz spec', () => {
    const quizSelectors = {
	"quizSelection": "app-available-quiz",
	"quizDialog": "app-quiz-level-dialog",
	"quizDialogButton": ".mat-button-toggle-button",
	"quizStartButton": ".quiz-dialog__actions__submit",
	"quizQuestionText": ".form__question",
	"quizAnswers": ".form__answers__input",
	"quizNextQuestionButton": "button[ng-reflect-message=\"Next page\"]",
	"quizPreviousQuestionButton": "button[ng-reflect-message=\"Previous page\"]",
	"quizFirstQuestionButton": "button[ng-reflect-message=\"First page\"]",
	"quizLastQuestionButton": "button[ng-reflect-message=\"Last page\"]",
	"quizFinishButton": ".quiz__submit",
	"quizFinishDialogSubmit": ".quiz-dialog__actions__submit",
	"quizFinishDialogExit": ".quiz-dialog__actions__close",
	"quizFinishDialogResults":".mat-dialog-content > p",
	"quizContinue": ".quiz__info__actions__action",
	"quizRetry": ".quiz__info__actions__action",
	"quizInfo": ".quiz__info",
    }
    
    before(() => {
	cy.task('db:seed', null, { timeout: 60000 })
	cy.task('auth:seed', null, { timeout: 60000 })
    })

    beforeEach(() => {
	cy.clearAllSessionStorage()
	indexedDB.deleteDatabase('firebase-heartbeat-database')
	indexedDB.deleteDatabase('firebaseLocalStorageDb')
	indexedDB.deleteDatabase('validate-browser-context-for-indexeddb-analytics-module')
    })

    users.forEach((user) => {
	it(`finishes quiz as ${user.type}`, () => {
    	    cy.login(user.email, user.password)
	    cy.visit('/quizzes')

	    //start quiz1
	    cy.get(quizSelectors.quizSelection).eq(0).click()
	    cy.get(quizSelectors.quizDialog).find(quizSelectors.quizDialogButton).eq(0).click()
	    cy.get(quizSelectors.quizStartButton).click()
	    
	    //answer question 1
	    cy.get(quizSelectors.quizQuestionText).contains("easy question");
	    cy.get(quizSelectors.quizAnswers).eq(0).check()
	    cy.get(quizSelectors.quizAnswers).eq(0).should("be.checked")

	    //go to next question
	    cy.get(quizSelectors.quizNextQuestionButton).click()
	    

	    //answer question 2
	    cy.get(quizSelectors.quizQuestionText).contains("easy question where first and third are correct");
	    cy.get(quizSelectors.quizAnswers).eq(0).check()
	    cy.get(quizSelectors.quizAnswers).eq(0).should("be.checked")
	    cy.get(quizSelectors.quizAnswers).eq(2).check()
	    cy.get(quizSelectors.quizAnswers).eq(2).should("be.checked")
	    cy.get(quizSelectors.quizNextQuestionButton).click()
	    
	    //answer question 3
	    cy.get(quizSelectors.quizQuestionText).contains("easy question where first is only correct answer");
	    cy.get(quizSelectors.quizAnswers).eq(0).check()
	    cy.get(quizSelectors.quizAnswers).eq(0).should("be.checked")

	    //finish quiz
	    cy.get(quizSelectors.quizFinishButton).click()
	    cy.get(quizSelectors.quizFinishDialogSubmit).click()
	    cy.get(quizSelectors.quizFinishDialogExit).click()
	    
	})
    })
    users.forEach((user) => {
	it(`should retain answers correctly for ${user.type}`, () => {
	    cy.login(user.email, user.password)
	    cy.visit('/quizzes')

	    //start quiz1
	    cy.get(quizSelectors.quizSelection).eq(0).click()
	    cy.get(quizSelectors.quizDialog).find(quizSelectors.quizDialogButton).eq(0).click()
	    cy.get(quizSelectors.quizStartButton).click()
	    
	    //answer question 1
	    cy.get(quizSelectors.quizQuestionText).contains("easy question");
	    cy.get(quizSelectors.quizAnswers).eq(0).check()
	    cy.get(quizSelectors.quizAnswers).eq(0).should("be.checked")

	    //go to next question
	    cy.get(quizSelectors.quizNextQuestionButton).click()
	    

	    //answer question 2
	    cy.get(quizSelectors.quizQuestionText).contains("easy question where first and third are correct");
	    cy.get(quizSelectors.quizAnswers).eq(0).check()
	    cy.get(quizSelectors.quizAnswers).eq(0).should("be.checked")
	    cy.wait(1000) // it fails to correctly retain questions if they are checked too fast, possible race condition on checking answer
	    cy.get(quizSelectors.quizAnswers).eq(2).check()
	    cy.get(quizSelectors.quizAnswers).eq(2).should("be.checked")
	    cy.get(quizSelectors.quizNextQuestionButton).click()
	    
	    //answer question 3
	    cy.get(quizSelectors.quizQuestionText).contains("easy question where first is only correct answer");
	    cy.get(quizSelectors.quizAnswers).eq(0).check()
	    cy.get(quizSelectors.quizAnswers).eq(0).should("be.checked")

	    //go to first question
	    cy.get(quizSelectors.quizFirstQuestionButton).click()

	    //check question 1
	    cy.get(quizSelectors.quizQuestionText).contains("easy question");
	    cy.get(quizSelectors.quizAnswers).eq(0).should("be.checked")

	    //go to next question
	    cy.get(quizSelectors.quizNextQuestionButton).click()
	    
	    //check question 2
	    cy.get(quizSelectors.quizQuestionText).contains("easy question where first and third are correct");
	    cy.get(quizSelectors.quizAnswers).eq(0).should("be.checked")
	    cy.get(quizSelectors.quizAnswers).eq(1).should("not.be.checked")
	    cy.get(quizSelectors.quizAnswers).eq(2).should("be.checked")

	    //go to next question
	    cy.get(quizSelectors.quizNextQuestionButton).click()

	    //check question 3
	    cy.get(quizSelectors.quizQuestionText).contains("easy question where first is only correct answer");
	    cy.get(quizSelectors.quizAnswers).eq(0).should("be.checked")
	    
	    //finish quiz
	    cy.get(quizSelectors.quizFinishButton).click()
	    cy.get(quizSelectors.quizFinishDialogSubmit).click()
	    cy.get(quizSelectors.quizFinishDialogExit).click()
	})
    })

    users.forEach((user) => {
	it(`can select quiz level as ${user.type}`, () => {
	    cy.login(user.email, user.password)
	    cy.visit('/quizzes')

	    //start quiz1
	    cy.get(quizSelectors.quizSelection).eq(0).click()
	    cy.get(quizSelectors.quizDialog).find(quizSelectors.quizDialogButton).eq(0).click()
	    cy.get(quizSelectors.quizStartButton).click()

	    cy.get(quizSelectors.quizQuestionText).contains("easy question");
	    
	    cy.visit('/quizzes')

	    cy.get(quizSelectors.quizSelection).eq(0).click()
	    cy.get(quizSelectors.quizDialog).find(quizSelectors.quizDialogButton).eq(1).click()
	    cy.get(quizSelectors.quizStartButton).click()

	    cy.get(quizSelectors.quizQuestionText).contains("medium quiz question 1");
	})
    })
    users.forEach((user) => {
	it(`can leave and return to the quiz later as ${user.type}`, () => {
	    cy.login(user.email, user.password)
	    cy.visit('/quizzes')

	    //start quiz1
	    cy.get(quizSelectors.quizSelection).eq(0).click()
	    cy.get(quizSelectors.quizDialog).find(quizSelectors.quizDialogButton).eq(0).click()
	    cy.get(quizSelectors.quizStartButton).click()
	    
	    //answer question 1
	    cy.get(quizSelectors.quizQuestionText).contains("easy question");
	    cy.get(quizSelectors.quizAnswers).eq(1).check()

	    //go to next question
	    cy.get(quizSelectors.quizNextQuestionButton).click()


	    //answer question 2
	    cy.get(quizSelectors.quizQuestionText).contains("easy question where first and third are correct");
	    cy.get(quizSelectors.quizAnswers).eq(0).check()
	    cy.get(quizSelectors.quizNextQuestionButton).click()

	    //leave quiz
	    cy.visit('/quizzes')

	    //continue quiz
	    cy.get(quizSelectors.quizContinue).eq(0).click()

	    //quiz starts from question 1 but answers stay selected

	    //on question 1
	    cy.get(quizSelectors.quizQuestionText).contains("easy question");
	    cy.get(quizSelectors.quizAnswers).eq(1).should("be.checked")
	    cy.get(quizSelectors.quizNextQuestionButton).click()

	    //on question 2
	    cy.get(quizSelectors.quizQuestionText).contains("easy question where first and third are correct");
	    cy.get(quizSelectors.quizAnswers).eq(0).should("be.checked")
	    cy.get(quizSelectors.quizNextQuestionButton).click()
	    
	    //answer question 3
	    cy.get(quizSelectors.quizQuestionText).contains("easy question where first is only correct answer");
	    cy.get(quizSelectors.quizAnswers).eq(0).check()
	    
	    
	    //finish quiz
	    cy.get(quizSelectors.quizFinishButton).click()
	    cy.get(quizSelectors.quizFinishDialogSubmit).click()
	    cy.get(quizSelectors.quizFinishDialogExit).click()
	})
    })

    users.forEach((user) => {
	it(`can retry same quiz as ${user.type}`, () => {
	    cy.login(user.email, user.password)
	    cy.visit('/quizzes')

	    //start quiz1
	    cy.get(quizSelectors.quizSelection).eq(0).click()
	    cy.get(quizSelectors.quizDialog).find(quizSelectors.quizDialogButton).eq(0).click()
	    cy.get(quizSelectors.quizStartButton).click()
	    
	    //answer question 1
	    cy.get(quizSelectors.quizQuestionText).contains("easy question");
	    cy.get(quizSelectors.quizAnswers).eq(1).check()

	    //go to next question
	    cy.get(quizSelectors.quizNextQuestionButton).click()
	    
	    //answer question 2
	    cy.get(quizSelectors.quizQuestionText).contains("easy question where first and third are correct");
	    cy.get(quizSelectors.quizAnswers).eq(0).check()
	    cy.get(quizSelectors.quizNextQuestionButton).click()
	    
	    //answer question 3
	    cy.get(quizSelectors.quizQuestionText).contains("easy question where first is only correct answer");
	    cy.get(quizSelectors.quizAnswers).eq(0).check()
	    
	    
	    //finish quiz
	    cy.get(quizSelectors.quizFinishButton).click()
	    cy.get(quizSelectors.quizFinishDialogSubmit).click()
	    cy.get(quizSelectors.quizFinishDialogExit).click()

	    //retry quiz
	    cy.get(quizSelectors.quizRetry).eq(0).click()

	    //answer question 1
	    cy.get(quizSelectors.quizQuestionText).contains("easy question");
	    cy.get(quizSelectors.quizAnswers).eq(0).should("not.be.checked")
	    cy.get(quizSelectors.quizAnswers).eq(1).should("not.be.checked")
	    cy.get(quizSelectors.quizAnswers).eq(1).check()

	    //go to next question
	    cy.get(quizSelectors.quizNextQuestionButton).click()
	    
	    //answer question 2
	    cy.get(quizSelectors.quizQuestionText).contains("easy question where first and third are correct");
	    cy.get(quizSelectors.quizAnswers).eq(0).should("not.be.checked")
	    cy.get(quizSelectors.quizAnswers).eq(1).should("not.be.checked")
	    cy.get(quizSelectors.quizAnswers).eq(2).should("not.be.checked")
	    cy.get(quizSelectors.quizAnswers).eq(0).check()
	    cy.get(quizSelectors.quizNextQuestionButton).click()
	    
	    //answer question 3
	    cy.get(quizSelectors.quizQuestionText).contains("easy question where first is only correct answer");
	    cy.get(quizSelectors.quizAnswers).eq(0).should("not.be.checked")
	    cy.get(quizSelectors.quizAnswers).eq(1).should("not.be.checked")
	    cy.get(quizSelectors.quizAnswers).eq(2).should("not.be.checked")
	    cy.get(quizSelectors.quizAnswers).eq(0).check()

	    //finish quiz
	    cy.get(quizSelectors.quizFinishButton).click()
	    cy.get(quizSelectors.quizFinishDialogSubmit).click()
	    cy.get(quizSelectors.quizFinishDialogExit).click()
	})
    })

    users.forEach((user) => {
	it(`can retry same quiz from finish dialog as ${user.type}`, () => {
	    cy.login(user.email, user.password)
	    cy.visit('/quizzes')

	    //start quiz1
	    cy.get(quizSelectors.quizSelection).eq(0).click()
	    cy.get(quizSelectors.quizDialog).find(quizSelectors.quizDialogButton).eq(0).click()
	    cy.get(quizSelectors.quizStartButton).click()
	    
	    //answer question 1
	    cy.get(quizSelectors.quizQuestionText).contains("easy question");
	    cy.get(quizSelectors.quizAnswers).eq(1).check()

	    //go to next question
	    cy.get(quizSelectors.quizNextQuestionButton).click()
	    
	    //answer question 2
	    cy.get(quizSelectors.quizQuestionText).contains("easy question where first and third are correct");
	    cy.get(quizSelectors.quizAnswers).eq(0).check()
	    cy.get(quizSelectors.quizNextQuestionButton).click()
	    
	    //answer question 3
	    cy.get(quizSelectors.quizQuestionText).contains("easy question where first is only correct answer");
	    cy.get(quizSelectors.quizAnswers).eq(0).check()
	    
	    
	    //finish quiz and select try again in dialog
	    cy.get(quizSelectors.quizFinishButton).click()
	    cy.get(quizSelectors.quizFinishDialogSubmit).click()
	    cy.get(quizSelectors.quizFinishDialogSubmit).click()

	    //quiz stays on last question so jump to first one
	    //go to first question
	    cy.get(quizSelectors.quizFirstQuestionButton).click()

	    //answer question 1
	    cy.get(quizSelectors.quizQuestionText).contains("easy question");
	    cy.get(quizSelectors.quizAnswers).eq(0).should("not.be.checked")
	    cy.get(quizSelectors.quizAnswers).eq(1).should("not.be.checked")
	    cy.get(quizSelectors.quizAnswers).eq(1).check()

	    //go to next question
	    cy.get(quizSelectors.quizNextQuestionButton).click()
	    
	    //answer question 2
	    cy.get(quizSelectors.quizQuestionText).contains("easy question where first and third are correct");
	    cy.get(quizSelectors.quizAnswers).eq(0).should("not.be.checked")
	    cy.get(quizSelectors.quizAnswers).eq(1).should("not.be.checked")
	    cy.get(quizSelectors.quizAnswers).eq(2).should("not.be.checked")
	    cy.get(quizSelectors.quizAnswers).eq(0).check()
	    cy.get(quizSelectors.quizNextQuestionButton).click()
	    
	    //answer question 3
	    cy.get(quizSelectors.quizQuestionText).contains("easy question where first is only correct answer");
	    cy.get(quizSelectors.quizAnswers).eq(0).should("not.be.checked")
	    cy.get(quizSelectors.quizAnswers).eq(1).should("not.be.checked")
	    cy.get(quizSelectors.quizAnswers).eq(2).should("not.be.checked")
	    cy.get(quizSelectors.quizAnswers).eq(0).check()

	    //finish quiz
	    cy.get(quizSelectors.quizFinishButton).click()
	    cy.get(quizSelectors.quizFinishDialogSubmit).click()
	    cy.get(quizSelectors.quizFinishDialogExit).click()
	})
    })

    users.forEach((user) => {
	it(`can move trough quiz questions as ${user.type}`, () => {
	    cy.login(user.email, user.password)
	    cy.visit('/quizzes')

	    //start quiz1
	    cy.get(quizSelectors.quizSelection).eq(0).click()
	    cy.get(quizSelectors.quizDialog).find(quizSelectors.quizDialogButton).eq(0).click()
	    cy.get(quizSelectors.quizStartButton).click()

	    //check that all buttons are in expected state
	    cy.get(quizSelectors.quizPreviousQuestionButton).should("be.disabled")
	    cy.get(quizSelectors.quizFirstQuestionButton).should("be.disabled")
	    cy.get(quizSelectors.quizLastQuestionButton).should("be.enabled")
	    cy.get(quizSelectors.quizNextQuestionButton).should("be.enabled")
	    
	    //go to next question
	    cy.get(quizSelectors.quizNextQuestionButton).click()

	    //check that all buttons are in expected state
	    cy.get(quizSelectors.quizPreviousQuestionButton).should("be.enabled")
	    cy.get(quizSelectors.quizFirstQuestionButton).should("be.enabled")
	    cy.get(quizSelectors.quizLastQuestionButton).should("be.enabled")
	    cy.get(quizSelectors.quizNextQuestionButton).should("be.enabled")
	    
	    //go to next question
	    cy.get(quizSelectors.quizNextQuestionButton).click()

	    //check that all buttons are in expected state
	    cy.get(quizSelectors.quizPreviousQuestionButton).should("be.enabled")
	    cy.get(quizSelectors.quizFirstQuestionButton).should("be.enabled")
	    cy.get(quizSelectors.quizLastQuestionButton).should("be.disabled")
	    cy.get(quizSelectors.quizNextQuestionButton).should("be.disabled")

	    
	    //go to previous question
	    cy.get(quizSelectors.quizPreviousQuestionButton).click()

	    //check that all buttons are in expected state
	    cy.get(quizSelectors.quizPreviousQuestionButton).should("be.enabled")
	    cy.get(quizSelectors.quizFirstQuestionButton).should("be.enabled")
	    cy.get(quizSelectors.quizLastQuestionButton).should("be.enabled")
	    cy.get(quizSelectors.quizNextQuestionButton).should("be.enabled")
	    
	    //go to previous question
	    cy.get(quizSelectors.quizPreviousQuestionButton).click()

	    //check that all buttons are in expected state
	    cy.get(quizSelectors.quizPreviousQuestionButton).should("be.disabled")
	    cy.get(quizSelectors.quizFirstQuestionButton).should("be.disabled")
	    cy.get(quizSelectors.quizLastQuestionButton).should("be.enabled")
	    cy.get(quizSelectors.quizNextQuestionButton).should("be.enabled")
	    
	    //go to last question
	    cy.get(quizSelectors.quizLastQuestionButton).click()

	    //check that all buttons are in expected state
	    cy.get(quizSelectors.quizPreviousQuestionButton).should("be.enabled")
	    cy.get(quizSelectors.quizFirstQuestionButton).should("be.enabled")
	    cy.get(quizSelectors.quizLastQuestionButton).should("be.disabled")
	    cy.get(quizSelectors.quizNextQuestionButton).should("be.disabled")

	    //go to first question
	    cy.get(quizSelectors.quizFirstQuestionButton).click()

	    //check that all buttons are in expected state
	    cy.get(quizSelectors.quizPreviousQuestionButton).should("be.disabled")
	    cy.get(quizSelectors.quizFirstQuestionButton).should("be.disabled")
	    cy.get(quizSelectors.quizLastQuestionButton).should("be.enabled")
	    cy.get(quizSelectors.quizNextQuestionButton).should("be.enabled")
	})
    })

    users.forEach((user) => {
	it(`can see results of completed quizes as ${user.type}`, () => {
	    cy.login(user.email, user.password)
	    cy.visit('/quizzes')

	    //start quiz1
	    cy.get(quizSelectors.quizSelection).eq(0).click()
	    cy.get(quizSelectors.quizDialog).find(quizSelectors.quizDialogButton).eq(0).click()
	    cy.get(quizSelectors.quizStartButton).click()
	    
	    //answer question 1
	    cy.get(quizSelectors.quizQuestionText).contains("easy question");
	    cy.get(quizSelectors.quizAnswers).eq(0).check()
	    cy.wait(1000)

	    //go to next question
	    cy.get(quizSelectors.quizNextQuestionButton).click()
	    

	    //answer question 2
	    cy.get(quizSelectors.quizQuestionText).contains("easy question where first and third are correct");
	    cy.get(quizSelectors.quizAnswers).eq(0).check()
	    cy.wait(1000)
	    cy.get(quizSelectors.quizNextQuestionButton).click()
	    
	    //answer question 3
	    cy.get(quizSelectors.quizQuestionText).contains("easy question where first is only correct answer");
	    cy.get(quizSelectors.quizAnswers).eq(0).check()
	    cy.wait(1000)
	    
	    //finish quiz
	    cy.get(quizSelectors.quizFinishButton).click()
	    cy.get(quizSelectors.quizFinishDialogSubmit).click()
	    cy.get(quizSelectors.quizFinishDialogResults).contains("3 / 4")
	    cy.get(quizSelectors.quizFinishDialogExit).click()

	    cy.get(quizSelectors.quizInfo).children().eq(2).contains("3 / 4") //nisam našao bolji način za dohvatiti rezultat kviza na stranici za odabir kvizova
	})
    })

    users.forEach((user) => {
	it(`can retake completed quizes as ${user.type}`, () => {
	    cy.login(user.email, user.password)
	    cy.visit('/quizzes')

	    //start quiz1
	    cy.get(quizSelectors.quizSelection).eq(0).click()
	    cy.get(quizSelectors.quizDialog).find(quizSelectors.quizDialogButton).eq(0).click()
	    cy.get(quizSelectors.quizStartButton).click()
	    
	    //answer question 1
	    cy.get(quizSelectors.quizQuestionText).contains("easy question");
	    cy.get(quizSelectors.quizAnswers).eq(0).check()

	    //go to next question
	    cy.get(quizSelectors.quizNextQuestionButton).click()
	    

	    //answer question 2
	    cy.get(quizSelectors.quizQuestionText).contains("easy question where first and third are correct");
	    cy.get(quizSelectors.quizAnswers).eq(0).check()
	    cy.get(quizSelectors.quizNextQuestionButton).click()
	    
	    //answer question 3
	    cy.get(quizSelectors.quizQuestionText).contains("easy question where first is only correct answer");
	    cy.get(quizSelectors.quizAnswers).eq(0).check()
	    
	    
	    //finish quiz
	    cy.get(quizSelectors.quizFinishButton).click()
	    cy.get(quizSelectors.quizFinishDialogSubmit).click()
	    cy.get(quizSelectors.quizFinishDialogExit).click()



	    //start quiz1
	    cy.get(quizSelectors.quizSelection).eq(0).click()
	    cy.get(quizSelectors.quizDialog).find(quizSelectors.quizDialogButton).eq(0).click()
	    cy.get(quizSelectors.quizStartButton).click()
	    
	    //answer question 1
	    cy.get(quizSelectors.quizQuestionText).contains("easy question");
	    cy.get(quizSelectors.quizAnswers).eq(1).check()

	    //go to next question
	    cy.get(quizSelectors.quizNextQuestionButton).click()
	    

	    //answer question 2
	    cy.get(quizSelectors.quizQuestionText).contains("easy question where first and third are correct");
	    cy.get(quizSelectors.quizAnswers).eq(0).check()
	    cy.get(quizSelectors.quizNextQuestionButton).click()
	    
	    //answer question 3
	    cy.get(quizSelectors.quizQuestionText).contains("easy question where first is only correct answer");
	    cy.get(quizSelectors.quizAnswers).eq(0).check()
	    
	    
	    //finish quiz
	    cy.get(quizSelectors.quizFinishButton).click()
	    cy.get(quizSelectors.quizFinishDialogSubmit).click()
	    cy.get(quizSelectors.quizFinishDialogExit).click()
	})
    })
})
