// Custom commands pentru Cypress
// ***********************************************
// Aici poți adăuga comenzi personalizate și suprascrie
// comenzi existente.
// ***********************************************

// Comandă pentru a simula autentificarea
Cypress.Commands.add('login', (email = 'test@example.com', password = 'password123') => {
  // Mock pentru autentificare
  cy.intercept('POST', '/graphql', (req) => {
    if (req.body.operationName === 'LoginUser') {
      req.reply({
        data: {
          login: {
            token: 'fake-token',
            user: {
              id: '1',
              name: 'Test User',
              email: email,
              dateJoined: new Date().toISOString(),
              preferences: {
                notifications: true,
                reminderTime: '20:00',
                theme: 'auto'
              },
              streak: 0
            }
          }
        }
      });
    }
  }).as('loginRequest');

  // Vizitează pagina de login
  cy.visit('/login');
  
  // Completează și trimite formularul
  cy.get('input[id="email"]').type(email);
  cy.get('input[id="password"]').type(password);
  cy.get('button').contains('Autentificare').click();
  
  // Așteaptă finalizarea cererii
  cy.wait('@loginRequest');
  
  // Verifică dacă autentificarea a reușit
  cy.url().should('include', '/');
});

// Comandă pentru a simula deconectarea
Cypress.Commands.add('logout', () => {
  cy.get('nav').contains('Deconectare').click();
  cy.url().should('include', '/login');
});

// Comandă pentru a salva localStorage între teste
let LOCAL_STORAGE_MEMORY = {};

Cypress.Commands.add('saveLocalStorage', () => {
  Object.keys(localStorage).forEach(key => {
    LOCAL_STORAGE_MEMORY[key] = localStorage.getItem(key);
  });
});

Cypress.Commands.add('restoreLocalStorage', () => {
  Object.keys(LOCAL_STORAGE_MEMORY).forEach(key => {
    localStorage.setItem(key, LOCAL_STORAGE_MEMORY[key]);
  });
});

// Comandă pentru a aștepta încărcarea unei componente specifice
Cypress.Commands.add('waitForComponent', (selector, options = {}) => {
  const timeout = options.timeout || 10000;
  const interval = options.interval || 100;
  
  return new Cypress.Promise((resolve, reject) => {
    let attempts = Math.floor(timeout / interval);
    
    const checkElement = () => {
      attempts--;
      
      cy.get('body').then($body => {
        if ($body.find(selector).length > 0) {
          resolve();
          return;
        }
        
        if (attempts <= 0) {
          reject(new Error(`Element ${selector} not found within ${timeout}ms`));
          return;
        }
        
        setTimeout(checkElement, interval);
      });
    };
    
    checkElement();
  });
});

// Comandă pentru a simula completarea unui formular de dispoziție
Cypress.Commands.add('fillMoodForm', (mood = 7, notes = '', sleep = 3, stress = 3, activity = 3, social = 3) => {
  // Modifică valoarea dispoziției
  cy.get('input[id="mood"]').invoke('val', mood).trigger('change');
  
  // Adaugă note dacă sunt specificate
  if (notes) {
    cy.get('textarea[id="notes"]').type(notes);
  }
  
  // Modifică factorii
  cy.get('input[id="factors.sleep"]').invoke('val', sleep).trigger('change');
  cy.get('input[id="factors.stress"]').invoke('val', stress).trigger('change');
  cy.get('input[id="factors.activity"]').invoke('val', activity).trigger('change');
  cy.get('input[id="factors.social"]').invoke('val', social).trigger('change');
});