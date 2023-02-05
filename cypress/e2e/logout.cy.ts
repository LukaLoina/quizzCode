import users from "../fixtures/users.json"

describe('logout spec', () => {
    const logoutSelectors = {
	"headerMenu": ".header__menu",
	"logoutButton": ".mat-menu-item",
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
	it(`can log out as ${user.type}`, () => {
	    cy.visit('/')
	    cy.login(user.email, user.password)
	    cy.get(logoutSelectors.headerMenu).click()
	    cy.get(logoutSelectors.logoutButton).contains("Log out").click()
	})
    })
})
