import { defineConfig } from "cypress";
import { firestoreSeed, authSeed } from "./cypress/tasks/firebase"

export default defineConfig({
    e2e: {
    	baseUrl: 'http://localhost:4200',
	setupNodeEvents(on, config) {
	    // implement node event listeners here
	    on('task', {
		'db:seed': () => { return firestoreSeed() },
		'auth:seed': () => { return authSeed() }
	    })
	}
    },
});
