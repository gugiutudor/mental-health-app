// Test actualizat pentru Dashboard.test.js
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { MockedProvider } from '@apollo/client/testing';
import Dashboard from '../../src/pages/Dashboard';
import { GET_MOOD_ENTRIES, GET_MOOD_STATISTICS, GET_RECOMMENDED_EXERCISES } from '../../src/graphql/queries';
import { AuthProvider } from '../../src/context/AuthContext';

// Mock pentru Chart.js și alte componente vizuale
jest.mock('react-chartjs-2', () => ({
  Line: () => <div data-testid="mock-chart">Chart Component</div>
}));

// Mock pentru React Router
jest.mock('react-router-dom', () => {
  const originalModule = jest.requireActual('react-router-dom');
  return {
    ...originalModule,
    useNavigate: () => jest.fn(),
    Link: ({ children, to, ...props }) => (
      <a href={to} {...props}>
        {children}
      </a>
    )
  };
});

// Mock pentru componente importate - actualizat pentru a include MoodHistory în loc de MoodChart
jest.mock('../../src/components/mood/MoodHistory', () => () => <div data-testid="mood-history">Mood History</div>);
jest.mock('../../src/components/mood/MoodTracker', () => () => <div data-testid="mood-tracker">Mood Tracker</div>);
jest.mock('../../src/components/exercises/RecommendedExercises', () => () => <div data-testid="recommended-exercises">Recommended Exercises</div>);
jest.mock('../../src/components/resources/RecommendedResources', () => () => <div data-testid="recommended-resources">Recommended Resources</div>);

describe('Dashboard Page', () => {
  // Obține data curentă pentru mock-uri
  const currentDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30);
  
  const mockEntries = [
    {
      id: '1',
      date: currentDate.toISOString(),
      mood: 7,
      notes: 'Feeling good',
      factors: {
        sleep: 4,
        stress: 2,
        activity: 3,
        social: 4
      },
      tags: ['relaxed', 'productive'],
      createdAt: currentDate.toISOString()
    }
  ];

  const mockExercises = [
    {
      exercise: {
        id: '1',
        title: 'Meditație mindfulness',
        description: 'O sesiune de meditație pentru reducerea stresului',
        category: 'mindfulness',
        duration: 10,
        difficulty: 'beginner'
      },
      score: 0.8
    }
  ];

  const mocks = [
    // Mock pentru toate query-urile necesare cu variabile flexibile
    {
      request: {
        query: GET_MOOD_ENTRIES,
        variables: { limit: 7 }
      },
      result: {
        data: {
          getMoodEntries: mockEntries
        }
      }
    },
    {
      request: {
        query: GET_MOOD_ENTRIES,
        variables: { limit: 30 }
      },
      result: {
        data: {
          getMoodEntries: mockEntries
        }
      }
    },
    {
      request: {
        query: GET_MOOD_ENTRIES,
        variables: { limit: 5 }
      },
      result: {
        data: {
          getMoodEntries: mockEntries
        }
      }
    },
    {
      request: {
        query: GET_RECOMMENDED_EXERCISES,
        variables: { limit: 3 }
      },
      result: {
        data: {
          getRecommendedExercises: mockExercises
        }
      }
    },
    {
      request: {
        query: GET_MOOD_STATISTICS,
        variables: {
          startDate: startDate.toISOString().split('T')[0],
          endDate: currentDate.toISOString().split('T')[0]
        }
      },
      result: {
        data: {
          getMoodStatistics: {
            averageMood: 7,
            moodTrend: [5, 6, 7],
            factorCorrelations: [
              { factor: 'sleep', correlation: 0.7 },
              { factor: 'stress', correlation: -0.5 }
            ]
          }
        }
      }
    }
  ];

  beforeEach(() => {
    // Pregătim localStorage cu date de utilizator
    const userData = { name: 'Test User', email: 'test@example.com' };
    localStorage.setItem('token', 'fake-token');
    localStorage.setItem('user', JSON.stringify(userData));
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('renders dashboard title and description', () => {
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <MemoryRouter>
          <AuthProvider>
            <Dashboard />
          </AuthProvider>
        </MemoryRouter>
      </MockedProvider>
    );
    
    // Verificăm titlul și descrierea (care sunt statice și vor fi mereu vizibile)
    expect(screen.getByText(/bun venit la aplicația de sănătate mentală/i)).toBeInTheDocument();
    expect(screen.getByText(/monitorizează starea ta emoțională/i)).toBeInTheDocument();
  });

  it('renders section headings correctly', () => {
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <MemoryRouter>
          <AuthProvider>
            <Dashboard />
          </AuthProvider>
        </MemoryRouter>
      </MockedProvider>
    );
    
    // Verificăm titlurile secțiunilor actualizate
    expect(screen.getByText(/istoricul dispoziției/i)).toBeInTheDocument();
    expect(screen.getByText(/adaugă dispoziția curentă/i)).toBeInTheDocument();
    expect(screen.getByText(/sfatul zilei/i)).toBeInTheDocument();
  });

  it('displays daily tip', () => {
    // Mock Math.random pentru a selecta un sfat specific
    const mockRandom = jest.spyOn(Math, 'random').mockReturnValue(0);
    
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <MemoryRouter>
          <AuthProvider>
            <Dashboard />
          </AuthProvider>
        </MemoryRouter>
      </MockedProvider>
    );
    
    // Verificăm că există un sfat zilnic (oricare ar fi acesta)
    expect(screen.getByText(/acordă-ți 5 minute pentru a respira adânc/i)).toBeInTheDocument();
    
    // Curățăm mock-ul
    mockRandom.mockRestore();
  });

  it('renders MoodHistory component', () => {
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <MemoryRouter>
          <AuthProvider>
            <Dashboard />
          </AuthProvider>
        </MemoryRouter>
      </MockedProvider>
    );
    
    // Verifică afișarea componentei MoodHistory
    expect(screen.getByTestId('mood-history')).toBeInTheDocument();
  });

  it('renders MoodTracker component', () => {
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <MemoryRouter>
          <AuthProvider>
            <Dashboard />
          </AuthProvider>
        </MemoryRouter>
      </MockedProvider>
    );
    
    // Verifică afișarea componentei MoodTracker
    expect(screen.getByTestId('mood-tracker')).toBeInTheDocument();
  });
});