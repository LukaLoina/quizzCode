import users from "../fixtures/users.json"

describe('login spec', () => {
    const loginSelectors = {
	"email": "input[type=email]",
	"emailError": "#mat-error-0",
	"password": "input[name=password]",
	"passwordError": "#mat-error-1",
	"button": "button[type=submit]",
	"error":".login__form__errors"
    }
    
    before(() => {
	cy.task('db:seed')
	cy.task('auth:seed')
    })

    beforeEach(() => {
	cy.clearAllSessionStorage()
	indexedDB.deleteDatabase('firebase-heartbeat-database')
	indexedDB.deleteDatabase('firebaseLocalStorageDb')
	indexedDB.deleteDatabase('validate-browser-context-for-indexeddb-analytics-module')
    })
    
    users.forEach((user) => {
	it(`can log in as ${user.type}`, () => {
	    cy.visit('/')
	    cy.get(loginSelectors.email).type(user.email)
	    cy.get(loginSelectors.password).type(user.password)
	    cy.get(loginSelectors.button).click()
	    cy.location('pathname').should('eq', '/quizzes')
	})
    })

    it("shows error if user does not exist", () => {
	cy.visit('/')
	cy.get(loginSelectors.email).type("nonexistant@user.me")
	cy.get(loginSelectors.password).type("Somep@ssword1")
	cy.get(loginSelectors.button).click()
	cy.location('pathname').should('eq', '/login')
	cy.contains(loginSelectors.error, "Firebase: There is no user record corresponding to this identifier. The user may have been deleted. (auth/user-not-found).");
	
    })

    users.forEach((user) => {
	it(`shows error if ${user.type} tries to log in with wrong password`, () => {
	    cy.visit('/')
	    cy.get(loginSelectors.email).type(user.email)
	    cy.get(loginSelectors.password).type(user.password+"something")
	    cy.get(loginSelectors.button).click()
	    cy.location('pathname').should('eq', '/login')
	    cy.contains(loginSelectors.error, "Firebase: The password is invalid or the user does not have a password. (auth/wrong-password).");
	})
    })

    it("shows error if email has invalid form", () => {
	cy.visit('/')
	cy.get(loginSelectors.password).type("gvGmR6s6PYc7h7nAfdiEOEOfPXO0@")
	cy.get(loginSelectors.email).type("Test");
	cy.get("body").click("topLeft") // error shows only after email field loses focus
	cy.contains(loginSelectors.emailError, "Please provide a valid email.");
	cy.get(loginSelectors.button).should('be.disabled')
    })

    it("shows error if password is too short", () => {
	cy.visit('/')
	cy.get(loginSelectors.email).type("0zfubzvgdimpdznytyf@tmmwj.com")
	cy.get(loginSelectors.password).type("aaa");
	cy.get("body").click("topLeft") // error shows only after email field loses focus
	cy.contains(loginSelectors.passwordError, "Password should have at least 8 characters");
	cy.get(loginSelectors.button).should('be.disabled')
    })

    it("shows error if password does not contain number", () => {
	cy.visit('/')
	cy.get(loginSelectors.email).type("0zfubzvgdimpdznytyf@tmmwj.com")
	cy.get(loginSelectors.password).type("@aaaaaaaaaaa");
	cy.get("body").click("topLeft") // error shows only after email field loses focus
	cy.contains(loginSelectors.passwordError, "Password should have min 1 number and special character.");
	cy.get(loginSelectors.button).should('be.disabled')
    })

    it("shows error if password does not contain special character", () => {
	cy.visit('/')
	cy.get(loginSelectors.email).type("0zfubzvgdimpdznytyf@tmmwj.com")
	cy.get(loginSelectors.password).type("aaaaaaaaaaa1");
	cy.get("body").click("topLeft") // error shows only after email field loses focus
	cy.contains(loginSelectors.passwordError, "Password should have min 1 number and special character.");
	cy.get(loginSelectors.button).should('be.disabled')
    })

    it("shows error if password does not contain nether special character or number", () => {
	cy.visit('/')
	cy.get(loginSelectors.email).type("0zfubzvgdimpdznytyf@tmmwj.com")
	cy.get(loginSelectors.password).type("aaaaaaaaaaa");
	cy.get("body").click("topLeft") // error shows only after email field loses focus
	cy.contains(loginSelectors.passwordError, "Password should have min 1 number and special character.");
	cy.get(loginSelectors.button).should('be.disabled')
    })
})
