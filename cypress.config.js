// Configurație pentru Cypress
const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // implementează event listeners Node.js aici
    },
    baseUrl: 'http://localhost:3000',
    viewportWidth: 1280,
    viewportHeight: 720,
    defaultCommandTimeout: 5000,
    chromeWebSecurity: false, // pentru testarea cross-origin
  },
  video: false, // dezactivat pentru a reduce timpul de execuție în CI
  screenshotOnRunFailure: true,
  retries: {
    runMode: 2, // reîncearcă testele failed de 2 ori în modul CI
    openMode: 0 // nu reîncerca în modul dezvoltare
  },
  env: {
    apiUrl: 'http://localhost:4000/graphql',
  },
});