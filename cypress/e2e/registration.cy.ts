describe('registration spec', () => {
    const registrationSelectors = {
	"email": "input[type=email]",
	"emailError": "#mat-error-0",
	"password": "input[name=password]",
	"passwordError": "#mat-error-1",
	"repeatPassword": "input[name=repeatPassword]",
	"repeatPasswordError": "#mat-error-2",
	"button": "button[type=submit]"
    }
    
    before(() => {
	cy.task('db:seed')
	cy.task('auth:seed')
    })
    
    it('registers account', () => {
	cy.visit('/register')
	cy.get(registrationSelectors.email).type("Test@email.com")
	cy.get(registrationSelectors.password).type("TestPassword@1")
	cy.get(registrationSelectors.repeatPassword).type("TestPassword@1")
	cy.get(registrationSelectors.button).click()
    })

    it('shows error if email is in wrong format', () => {
	cy.visit('/register')
	cy.get(registrationSelectors.email).type("Test")
	cy.get(registrationSelectors.password).type("TestPassword@1")
	cy.get(registrationSelectors.repeatPassword).type("TestPassword@1")
	cy.get("body").click('topLeft') //error shows only after email field loses focus
	cy.contains(registrationSelectors.emailError, "Please provide a valid email.")
	cy.get(registrationSelectors.button).should("be.disabled")
	
    })

    it("shows error if password is too short", () => {
	cy.visit('/register')
	cy.get(registrationSelectors.email).type("Test@email.com")
	cy.get(registrationSelectors.password).type("Test")
	cy.get(registrationSelectors.repeatPassword).type("Test")
	cy.get("body").click('topLeft') //error shows only after email field loses focus
	cy.contains(registrationSelectors.passwordError, "Password should have at least 8 characters")
	cy.get(registrationSelectors.button).should("be.disabled")
    })

    it("shows error if repeat password is too short", () => {
	cy.visit('/register')
	cy.get(registrationSelectors.email).type("Test@email.com")
	cy.get(registrationSelectors.password).type("Test")
	cy.get(registrationSelectors.repeatPassword).type("Test")
	cy.get("body").click('topLeft') //error shows only after email field loses focus
	cy.contains(registrationSelectors.repeatPasswordError, "Password should have at least 8 characters")
	cy.get(registrationSelectors.button).should("be.disabled")
    })
    
    it("shows error if password does not contain special character and number", () => {
	cy.visit('/register')
	cy.get(registrationSelectors.email).type("Test@email.com")
	cy.get(registrationSelectors.password).type("TestPassword")
	cy.get(registrationSelectors.repeatPassword).type("TestPassword")
	cy.get("body").click('topLeft') //error shows only after email field loses focus
	cy.contains(registrationSelectors.passwordError, "Password should have min 1 number and special character.")
	cy.get(registrationSelectors.button).should("be.disabled")
    })
    it("shows error if repeat password does not contain special character and number", () => {
	cy.visit('/register')
	cy.get(registrationSelectors.email).type("Test@email.com")
	cy.get(registrationSelectors.password).type("TestPassword")
	cy.get(registrationSelectors.repeatPassword).type("TestPassword")
	cy.get("body").click('topLeft') //error shows only after email field loses focus
	cy.contains(registrationSelectors.repeatPasswordError, "Password should have min 1 number and special character.")
	cy.get(registrationSelectors.button).should("be.disabled")
    })
    
    it("shows error if password and repeat password do not match", () => {
	cy.visit('/register')
	cy.get(registrationSelectors.email).type("Test@email.com")
	cy.get(registrationSelectors.password).type("TestPassword1")
	cy.get(registrationSelectors.repeatPassword).type("TestPassword")
	cy.get("body").click('topLeft') //error shows only after email field loses focus
	cy.contains(registrationSelectors.repeatPasswordError, "Passwords do not match.")
	cy.get(registrationSelectors.button).should("be.disabled")
    })
    
})
