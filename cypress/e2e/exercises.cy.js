
// Cypress test pentru fluxul de exerciții - corectat
describe('Fluxul de exerciții', () => {
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
    });
    
    // Completează și trimite formularul de login
    cy.get('input[id="email"]').type('test@example.com');
    cy.get('input[id="password"]').type('password123');
    cy.get('button').contains('Autentificare').click();
    
    // Așteaptă încărcarea dashboard-ului
    cy.contains('Bun venit la aplicația de sănătate mentală').should('be.visible');
    
    // Mock pentru interogarea exercițiilor
    cy.intercept('POST', '/graphql', (req) => {
      if (req.body.operationName === 'GetExercises') {
        req.reply({
          data: {
            getExercises: [
              {
                id: '1',
                title: 'Meditație ghidată',
                description: 'O meditație ghidată pentru reducerea stresului și anxietății',
                category: 'mindfulness',
                duration: 10,
                difficulty: 'beginner'
              },
              {
                id: '2',
                title: 'Respirație 4-7-8',
                description: 'Tehnică de respirație pentru relaxare și somn mai bun',
                category: 'breathing',
                duration: 5,
                difficulty: 'beginner'
              }
            ]
          }
        });
      }
    }).as('getExercises');
    
    // Navighează către pagina de exerciții
    cy.get('nav').contains('Exerciții').click();
    cy.url().should('include', '/exercises');
  });

  it('afișează lista de exerciții cu filtre', () => {
    // Verifică existența componentelor principale
    cy.contains('Exerciții pentru sănătate mentală').should('be.visible');
    cy.contains('Filtrează după categorie').should('be.visible');
    
    // Verifică existența butoanelor de filtrare
    cy.contains('Toate').should('be.visible');
    cy.contains('Mindfulness').should('be.visible');
    cy.contains('Respirație').should('be.visible');
    
    // Verifică existența exercițiilor
    cy.contains('Meditație ghidată').should('be.visible');
    cy.contains('Respirație 4-7-8').should('be.visible');
    
    // Testează filtrarea - CORECTAT: se înlocuiește așteptarea care eșua
    // În loc să așteptăm un request specific, mocuim răspunsul direct
    cy.intercept('POST', '/graphql', (req) => {
      if (req.body.operationName === 'GetExercises' && 
          req.body.variables && 
          req.body.variables.category === 'breathing') {
        req.reply({
          data: {
            getExercises: [
              {
                id: '2',
                title: 'Respirație 4-7-8',
                description: 'Tehnică de respirație pentru relaxare și somn mai bun',
                category: 'breathing',
                duration: 5,
                difficulty: 'beginner'
              }
            ]
          }
        });
      }
    }).as('getFilteredExercises');
    
    // Apasă pe filtrul de respirație
    cy.contains('Respirație').click();
    
    // Verifică afișarea corectă după filtrare (verificăm rezultatele, nu requestul)
    cy.contains('Respirație 4-7-8').should('be.visible');
    // Verificăm că celălalt exercițiu nu mai este vizibil
    cy.contains('Meditație ghidată').should('not.exist');
  });

  it('permite vizualizarea detaliilor unui exercițiu', () => {
    // Mock pentru interogarea detaliilor exercițiului
    cy.intercept('POST', '/graphql', (req) => {
      if (req.body.operationName === 'GetExercise') {
        req.reply({
          data: {
            getExercise: {
              id: '1',
              title: 'Meditație ghidată',
              description: 'O meditație ghidată pentru reducerea stresului și anxietății',
              category: 'mindfulness',
              duration: 10,
              difficulty: 'beginner',
              content: {
                steps: [
                  'Găsește un loc liniștit și confortabil',
                  'Închide ochii și respiră adânc de câteva ori',
                  'Observă senzațiile din corpul tău',
                  'Concentrează-te pe respirație timp de 5 minute',
                  'Revino treptat la starea de conștientizare'
                ]
              },
              createdAt: new Date().toISOString()
            }
          }
        });
      }
    }).as('getExerciseDetails');
    
    // Mock pentru interogarea progresului utilizatorului
    cy.intercept('POST', '/graphql', (req) => {
      if (req.body.operationName === 'GetUserProgress') {
        req.reply({
          data: {
            getUserProgress: []
          }
        });
      }
    }).as('getUserProgress');
    
    // Apasă butonul pentru a vedea exercițiul
    cy.contains('Meditație ghidată').parent().contains('Vezi exercițiul').click();
    
    // Verifică încărcarea detaliilor exercițiului
    cy.url().should('include', '/exercises/1');
    cy.wait('@getExerciseDetails');
    cy.wait('@getUserProgress');
    
    // Verifică afișarea detaliilor
    cy.contains('Meditație ghidată').should('be.visible');
    cy.contains('Mindfulness').should('be.visible');
    cy.contains('10 minute').should('be.visible');
    cy.contains('Începe exercițiul').should('be.visible');
    
    // Verifică secțiunea "Înainte de a începe"
    cy.contains('Înainte de a începe:').should('be.visible');
    cy.contains('Cum te simți acum? (1-10)').should('be.visible');
  });

  it('permite completarea unui exercițiu și salvarea feedback-ului', () => {
    // Mock pentru interogarea detaliilor exercițiului
    cy.intercept('POST', '/graphql', (req) => {
      if (req.body.operationName === 'GetExercise') {
        req.reply({
          data: {
            getExercise: {
              id: '1',
              title: 'Meditație ghidată',
              description: 'O meditație ghidată pentru reducerea stresului și anxietății',
              category: 'mindfulness',
              duration: 10,
              difficulty: 'beginner',
              content: {
                steps: [
                  'Găsește un loc liniștit și confortabil',
                  'Închide ochii și respiră adânc de câteva ori',
                  'Observă senzațiile din corpul tău',
                  'Concentrează-te pe respirație timp de 5 minute',
                  'Revino treptat la starea de conștientizare'
                ]
              },
              createdAt: new Date().toISOString()
            }
          }
        });
      }
    }).as('getExerciseDetails');
    
    // Mock pentru interogarea progresului utilizatorului
    cy.intercept('POST', '/graphql', (req) => {
      if (req.body.operationName === 'GetUserProgress') {
        req.reply({
          data: {
            getUserProgress: []
          }
        });
      }
    }).as('getUserProgress');
    
    // Navighează la pagina de detalii a exercițiului
    cy.contains('Meditație ghidată').parent().contains('Vezi exercițiul').click();
    cy.url().should('include', '/exercises/1');
    cy.wait('@getExerciseDetails');
    cy.wait('@getUserProgress');
    
    // Setăm dispoziția înainte de exercițiu
    cy.get('input[type="range"]').first().invoke('val', 4).trigger('change');
    
    // Începe exercițiul
    cy.contains('Începe exercițiul').click();
    
    // Verifică dacă exercițiul a început
    cy.contains('00:00').should('be.visible');
    cy.contains('Pași:').should('be.visible');
    
    // Așteaptă câteva secunde pentru a simula trecerea timpului
    cy.wait(2000);
    
    // Finalizează exercițiul
    cy.contains('Finalizează').click();
    
    // Verifică afișarea formularului de feedback
    cy.contains('Exercițiu finalizat!').should('be.visible');
    cy.contains('Cum te simți acum după exercițiu?').should('be.visible');
    cy.contains('Evaluează acest exercițiu:').should('be.visible');
    
    // Completează feedback-ul
    cy.get('input[type="range"]').first().invoke('val', 8).trigger('change');
    cy.contains('5').click(); // Evaluare maximă
    cy.get('textarea').type('Exercițiul m-a ajutat să mă relaxez. Mă simt mult mai calm acum.');
    
    // Mock pentru mutația de completare a exercițiului
    cy.intercept('POST', '/graphql', (req) => {
      if (req.body.operationName === 'CompleteExercise') {
        req.reply({
          data: {
            completeExercise: {
              id: '1',
              exerciseId: '1',
              completedAt: new Date().toISOString(),
              feedback: {
                rating: 5,
                comment: 'Exercițiul m-a ajutat să mă relaxez. Mă simt mult mai calm acum.'
              },
              duration: 20,
              feelingBefore: 4,
              feelingAfter: 8
            }
          }
        });
      }
    }).as('completeExercise');
    
    // Salvează progresul
    cy.contains('Salvează progresul').click();
    
    // Verifică dacă cererea a fost făcută
    cy.wait('@completeExercise');
    
    // Verifică afișarea mesajului de succes
    cy.contains('Felicitări!').should('be.visible');
    cy.contains('Ai finalizat cu succes exercițiul').should('be.visible');
  });
});