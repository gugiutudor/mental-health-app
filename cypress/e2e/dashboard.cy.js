// Cypress test pentru dashboard și funcționalități de bază - actualizat pentru firstName/lastName
describe('Dashboard și funcționalități principale', () => {
  beforeEach(() => {
    // Autentificare înainte de fiecare test
    cy.visit('/login');
    
    // Mock pentru autentificare
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
    });
    
    // Completează și trimite formularul de login
    cy.get('input[id="email"]').type('test@example.com');
    cy.get('input[id="password"]').type('password123');
    cy.get('button').contains('Autentificare').click();
    
    // Așteaptă încărcarea dashboard-ului
    cy.contains('Bun venit la aplicația de sănătate mentală').should('be.visible');
    
    // Mock pentru interogarea înregistrărilor de dispoziție
    cy.intercept('POST', '/graphql', (req) => {
      if (req.body.operationName === 'GetMoodEntries') {
        req.reply({
          data: {
            getMoodEntries: [
              {
                id: '1',
                date: new Date().toISOString(),
                mood: 7,
                notes: 'O zi bună',
                factors: {
                  sleep: 4,
                  stress: 2,
                  activity: 3,
                  social: 4
                },
                tags: ['relaxare', 'productiv'],
                createdAt: new Date().toISOString()
              }
            ]
          }
        });
      }
    }).as('getMoodEntries');
    
    // Mock pentru interogarea exercițiilor recomandate
    cy.intercept('POST', '/graphql', (req) => {
      if (req.body.operationName === 'GetRecommendedExercises') {
        req.reply({
          data: {
            getRecommendedExercises: [
              {
                exercise: {
                  id: '1',
                  title: 'Meditație de 5 minute',
                  description: 'O scurtă meditație pentru reducerea stresului',
                  category: 'mindfulness',
                  duration: 5,
                  difficulty: 'beginner'
                },
                score: 0.8
              }
            ]
          }
        });
      }
    }).as('getRecommendedExercises');
  });

  it('afișează componentele principale ale dashboard-ului', () => {
    // Verifică existența secțiunilor principale
    cy.get('h1').should('contain', 'Bun venit la aplicația de sănătate mentală');
    cy.contains('Dispoziția ta').should('be.visible');
    cy.contains('Adaugă dispoziția curentă').should('be.visible');
    cy.contains('Istoricul dispoziției').should('be.visible');
    cy.contains('Exerciții recomandate').should('be.visible');
    cy.contains('Sfatul zilei').should('be.visible');
  });

  it('permite adăugarea unei noi înregistrări de dispoziție', () => {
    // Interceptează cererea GraphQL pentru crearea înregistrării
    cy.intercept('POST', '/graphql', (req) => {
      if (req.body.operationName === 'CreateMoodEntry') {
        req.reply({
          data: {
            createMoodEntry: {
              id: '2',
              date: new Date().toISOString(),
              mood: 8,
              notes: 'Mă simt energic azi',
              factors: {
                sleep: 5,
                stress: 2,
                activity: 4,
                social: 3
              },
              tags: []
            }
          }
        });
      }
    }).as('createMoodEntry');
    
    // Completează formularul pentru dispoziție
    cy.contains('Adaugă dispoziția curentă').parent().within(() => {
      // Modifică valoarea dispoziției
      cy.get('input[type="range"]').first().invoke('val', 8).trigger('change');
      
      // Adaugă note
      cy.get('textarea').type('Mă simt energic azi');
      
      // Modifică factorii
      cy.contains('Calitatea somnului').parent().find('input[type="range"]').invoke('val', 5).trigger('change');
      cy.contains('Nivelul de stres').parent().find('input[type="range"]').invoke('val', 2).trigger('change');
      cy.contains('Activitate fizică').parent().find('input[type="range"]').invoke('val', 4).trigger('change');
      
      // Trimite formularul
      cy.contains('Salvează dispoziția').click();
    });
    
    // Verifică dacă cererea a fost făcută
    cy.wait('@createMoodEntry');
    
    // Verifică afișarea mesajului de succes
    cy.contains('Înregistrarea dispoziției a fost salvată cu succes').should('be.visible');
  });

  it('permite navigarea către pagina de exerciții', () => {
    // Mock pentru interogarea exercițiilor
    cy.intercept('POST', '/graphql', (req) => {
      if (req.body.operationName === 'GetExercises') {
        req.reply({
          data: {
            getExercises: [
              {
                id: '1',
                title: 'Meditație de 5 minute',
                description: 'O scurtă meditație pentru reducerea stresului',
                category: 'mindfulness',
                duration: 5,
                difficulty: 'beginner'
              },
              {
                id: '2',
                title: 'Exerciții de respirație',
                description: 'Tehnici de respirație pentru relaxare',
                category: 'breathing',
                duration: 10,
                difficulty: 'beginner'
              }
            ]
          }
        });
      }
    }).as('getExercises');
    
    // Navighează către pagina de exerciții
    cy.get('nav').contains('Exerciții').click();
    
    // Verifică dacă suntem pe pagina corectă
    cy.url().should('include', '/exercises');
    cy.contains('Exerciții pentru sănătate mentală').should('be.visible');
    
    // Așteaptă încărcarea exercițiilor
    cy.wait('@getExercises');
    
    // Verifică afișarea exercițiilor
    cy.contains('Meditație de 5 minute').should('be.visible');
    cy.contains('Exerciții de respirație').should('be.visible');
  });

  it('permite navigarea către pagina de resurse', () => {
    // Mock pentru interogarea resurselor
    cy.intercept('POST', '/graphql', (req) => {
      if (req.body.operationName === 'GetResources') {
        req.reply({
          data: {
            getResources: [
              {
                id: '1',
                title: 'Gestionarea anxietății',
                description: 'Articol despre tehnici de gestionare a anxietății',
                type: 'article',
                url: 'https://example.com/anxiety',
                tags: ['anxietate', 'stres'],
                createdAt: new Date().toISOString()
              }
            ]
          }
        });
      }
    }).as('getResources');
    
    // Navighează către pagina de resurse
    cy.get('nav').contains('Resurse').click();
    
    // Verifică dacă suntem pe pagina corectă
    cy.url().should('include', '/resources');
    cy.contains('Resurse pentru sănătate mentală').should('be.visible');
    
    // Așteaptă încărcarea resurselor
    cy.wait('@getResources');
    
    // Verifică afișarea resurselor
    cy.contains('Gestionarea anxietății').should('be.visible');
  });

  it('permite navigarea către pagina de profil', () => {
    // Mock pentru interogarea profilului
    cy.intercept('POST', '/graphql', (req) => {
      if (req.body.operationName === 'GetUserProfile') {
        req.reply({
          data: {
            me: {
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
              streak: 5,
              lastActive: new Date().toISOString()
            }
          }
        });
      }
    }).as('getUserProfile');
    
    // Navighează către pagina de profil
    cy.get('nav').contains('Profil').click();
    
    // Verifică dacă suntem pe pagina corectă
    cy.url().should('include', '/profile');
    cy.contains('Profilul meu').should('be.visible');
    
    // Așteaptă încărcarea profilului
    cy.wait('@getUserProfile');
    
    // Verifică afișarea datelor profilului
    cy.contains('Editează profilul').should('be.visible');
    cy.get('input[name="firstName"]').should('have.value', 'Test');
    cy.get('input[name="lastName"]').should('have.value', 'User');
    cy.get('input[name="email"]').should('have.value', 'test@example.com');
  });

  it('permite deconectarea', () => {
    // Apasă butonul de deconectare
    cy.get('nav').contains('Deconectare').click();
    
    // Verifică dacă am fost redirecționați la pagina de login
    cy.url().should('include', '/login');
    cy.contains('Autentificare').should('be.visible');
    
    // Verifică că localStorage a fost curățat
    cy.window().its('localStorage.token').should('be.undefined');
    cy.window().its('localStorage.user').should('be.undefined');
  });
});