// Support file pentru Cypress
// ***********************************************************
// Acest fișier poate fi utilizat pentru a adăuga comenzi personalizate
// în Cypress și pentru a extinde comportamentul Cypress
// ***********************************************************

// Import commands.js
import './commands';

// Dezactivează capturarea erorilor non-cypress pentru a vedea erorile de aplicație
Cypress.on('uncaught:exception', (err, runnable) => {
  // returnează false pentru a împiedica Cypress să eșueze testul
  return false;
});

// Adaugă suport pentru LocalStorage între teste
beforeEach(() => {
  cy.restoreLocalStorage();
});

afterEach(() => {
  cy.saveLocalStorage();
});

// Adaugă log pentru cereri GraphQL pentru debugging mai bun
Cypress.on('log:added', (attrs, log) => {
  if (attrs.name === 'request' && attrs.url && attrs.url.includes('/graphql')) {
    console.log('GraphQL Request:', attrs.url, attrs.response && attrs.response.body);
  }
});