// Cypress test pentru fluxul de autentificare - actualizat pentru firstName/lastName
describe('Autentificare', () => {
  beforeEach(() => {
    // Vizitează pagina de login înainte de fiecare test
    cy.visit('/login');
  });

  it('afișează formularul de login corect', () => {
    // Verifică existența elementelor formularului
    cy.get('h2').should('contain', 'Autentificare');
    cy.get('label').contains('Email').should('exist');
    cy.get('label').contains('Parolă').should('exist');
    cy.get('button').contains('Autentificare').should('exist');
    cy.get('a').contains('Înregistrează-te').should('exist');
  });

  it('afișează eroare pentru credențiale invalide', () => {
    // Completează formularul cu date invalide
    cy.get('input[id="email"]').type('invalid@example.com');
    cy.get('input[id="password"]').type('wrongpassword');
    
    // Interceptează cererea GraphQL pentru login
    cy.intercept('POST', '/graphql', (req) => {
      if (req.body.operationName === 'LoginUser') {
        req.reply({
          data: null,
          errors: [
            {
              message: 'Email sau parolă incorectă'
            }
          ]
        });
      }
    }).as('loginRequest');
    
    // Trimite formularul
    cy.get('button').contains('Autentificare').click();
    
    // Verifică dacă cererea a fost făcută
    cy.wait('@loginRequest');
    
    // Verifică afișarea mesajului de eroare
    cy.contains('Email sau parolă incorectă').should('be.visible');
  });

  it('redirecționează la dashboard după autentificare reușită', () => {
    // Completează formularul cu date valide
    cy.get('input[id="email"]').type('test@example.com');
    cy.get('input[id="password"]').type('password123');
    
    // Interceptează cererea GraphQL pentru login
    cy.intercept('POST', '/graphql', (req) => {
      if (req.body.operationName === 'LoginUser') {
        req.reply({
          data: {
            login: {
              token: 'fake-token',
              user: {
                id: '1',
                firstName: 'Test',
                lastName: 'User',
                email: 'test@example.com',
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
    
    // Trimite formularul
    cy.get('button').contains('Autentificare').click();
    
    // Verifică dacă cererea a fost făcută
    cy.wait('@loginRequest');
    
    // Verifică dacă am fost redirecționați la dashboard
    cy.url().should('include', '/');
    cy.contains('Bun venit la aplicația de sănătate mentală').should('be.visible');
    cy.contains('Salut, Test!').should('be.visible');
  });
  
  it('afișează și validează formularul de înregistrare corect', () => {
    // Navighează la pagina de înregistrare
    cy.visit('/register');
    
    // Verifică existența elementelor formularului
    cy.get('h2').should('contain', 'Înregistrare');
    cy.get('label').contains('Prenume').should('exist');
    cy.get('label').contains('Nume de familie').should('exist');
    cy.get('label').contains('Email').should('exist');
    cy.get('label').contains('Parolă').should('exist');
    cy.get('label').contains('Confirmă parola').should('exist');
    cy.get('button').contains('Înregistrare').should('exist');
    
    // Încearcă să trimiți formularul fără a completa câmpurile obligatorii
    cy.get('button').contains('Înregistrare').click();
    
    // Verifică mesajele de eroare
    cy.contains('Prenumele este obligatoriu').should('be.visible');
    cy.contains('Numele de familie este obligatoriu').should('be.visible');
    cy.contains('Adresa de email este obligatorie').should('be.visible');
    cy.contains('Parola este obligatorie').should('be.visible');
    
    // Completează formularul cu date valide
    cy.get('input[id="firstName"]').type('John');
    cy.get('input[id="lastName"]').type('Doe');
    cy.get('input[id="email"]').type('john.doe@example.com');
    cy.get('input[id="password"]').type('password123');
    cy.get('input[id="confirmPassword"]').type('password123');
    
    // Interceptează cererea GraphQL pentru înregistrare
    cy.intercept('POST', '/graphql', (req) => {
      if (req.body.operationName === 'RegisterUser') {
        req.reply({
          data: {
            register: {
              token: 'fake-token',
              user: {
                id: '1',
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@example.com',
                dateJoined: new Date().toISOString()
              }
            }
          }
        });
      }
    }).as('registerRequest');
    
    // Trimite formularul
    cy.get('button').contains('Înregistrare').click();
    
    // Verifică dacă cererea a fost făcută
    cy.wait('@registerRequest');
    
    // Verifică dacă am fost redirecționați la dashboard
    cy.url().should('include', '/');
    cy.contains('Bun venit la aplicația de sănătate mentală').should('be.visible');
    cy.contains('Salut, John!').should('be.visible');
  });
});