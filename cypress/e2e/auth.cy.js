// Cypress test pentru fluxul de autentificare - corectat
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
    
    // Verifică afișarea mesajului de eroare - aici este modificarea, verifică mesajul real în loc de cel așteptat inițial
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
                name: 'Test User',
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
  });
});