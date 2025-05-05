// client/src/__mocks__/server.js
import { setupServer } from 'msw/node';
import { graphql } from 'msw';

// Definir manipuladores de GraphQL para pruebas
export const handlers = [
  // Autentificación
  graphql.mutation('LoginUser', (req, res, ctx) => {
    const { email } = req.variables.input;
    
    // Simular éxito para email de prueba
    if (email === 'test@example.com') {
      return res(
        ctx.data({
          login: {
            token: 'test-token',
            user: {
              id: 'user123',
              name: 'Test User',
              email: 'test@example.com',
              dateJoined: '2023-01-01T00:00:00.000Z',
              preferences: {
                notifications: true,
                reminderTime: '20:00',
                theme: 'auto'
              },
              streak: 5
            }
          }
        })
      );
    }
    
    // Simular error para otros emails
    return res(
      ctx.errors([
        {
          message: 'Email sau parolă incorectă',
          locations: [{ line: 2, column: 3 }],
          path: ['login']
        }
      ])
    );
  }),
  
  graphql.mutation('RegisterUser', (req, res, ctx) => {
    const { email } = req.variables.input;
    
    // Simular éxito para nuevo email
    if (email === 'new@example.com') {
      return res(
        ctx.data({
          register: {
            token: 'test-token',
            user: {
              id: 'newuser123',
              name: req.variables.input.name,
              email: req.variables.input.email,
              dateJoined: new Date().toISOString()
            }
          }
        })
      );
    }
    
    // Simular error para email existente
    return res(
      ctx.errors([
        {
          message: 'Email-ul este deja utilizat',
          locations: [{ line: 2, column: 3 }],
          path: ['register']
        }
      ])
    );
  }),
  
  // Perfil de usuario
  graphql.query('GetUserProfile', (req, res, ctx) => {
    return res(
      ctx.data({
        me: {
          id: 'user123',
          name: 'Test User',
          email: 'test@example.com',
          dateJoined: '2023-01-01T00:00:00.000Z',
          preferences: {
            notifications: true,
            reminderTime: '20:00',
            theme: 'auto'
          },
          streak: 5,
          lastActive: new Date().toISOString()
        }
      })
    );
  }),
  
  // Entradas de estado de ánimo
  graphql.query('GetMoodEntries', (req, res, ctx) => {
    return res(
      ctx.data({
        getMoodEntries: [
          {
            id: 'mood1',
            date: new Date().toISOString(),
            mood: 7,
            notes: 'Feeling good today',
            factors: {
              sleep: 4,
              stress: 2,
              activity: 3,
              social: 4
            },
            tags: ['productive', 'energetic'],
            createdAt: new Date().toISOString()
          },
          {
            id: 'mood2',
            date: new Date(Date.now() - 86400000).toISOString(), // yesterday
            mood: 5,
            notes: 'Average day',
            factors: {
              sleep: 3,
              stress: 3,
              activity: 2,
              social: 3
            },
            tags: ['neutral'],
            createdAt: new Date(Date.now() - 86400000).toISOString()
          }
        ]
      })
    );
  }),
  
  // Ejercicios
  graphql.query('GetExercises', (req, res, ctx) => {
    return res(
      ctx.data({
        getExercises: [
          {
            id: 'ex1',
            title: 'Breathing Exercise',
            description: 'A simple breathing exercise to reduce stress',
            category: 'breathing',
            duration: 5,
            content: {
              steps: ['Step 1: Inhale deeply', 'Step 2: Hold', 'Step 3: Exhale slowly']
            },
            difficulty: 'beginner',
            createdAt: new Date().toISOString()
          },
          {
            id: 'ex2',
            title: 'Mindfulness Meditation',
            description: 'A guided mindfulness meditation',
            category: 'mindfulness',
            duration: 10,
            content: {
              steps: ['Step 1: Find a comfortable position', 'Step 2: Focus on your breath']
            },
            difficulty: 'intermediate',
            createdAt: new Date().toISOString()
          }
        ]
      })
    );
  }),
  
  // Recursos
  graphql.query('GetResources', (req, res, ctx) => {
    return res(
      ctx.data({
        getResources: [
          {
            id: 'res1',
            title: 'Understanding Anxiety',
            description: 'An article about anxiety management techniques',
            type: 'article',
            url: 'https://example.com/anxiety',
            tags: ['anxiety', 'stress'],
            createdAt: new Date().toISOString()
          },
          {
            id: 'res2',
            title: 'Guided Sleep Meditation',
            description: 'A meditation audio to help with sleep',
            type: 'audio',
            url: 'https://example.com/sleep-audio',
            tags: ['sleep', 'relaxation'],
            createdAt: new Date().toISOString()
          }
        ]
      })
    );
  })
];

// Configurar un servidor mock
export const server = setupServer(...handlers);