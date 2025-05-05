// client/src/pages/__tests__/Dashboard.test.js
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { MockedProvider } from '@apollo/client/testing';
import { AuthProvider } from '../../context/AuthContext';
import Dashboard from '../Dashboard';
import { GET_MOOD_ENTRIES, GET_RECOMMENDED_EXERCISES } from '../../graphql/queries';

// Mock pentru Chart.js (este folosit în MoodChart)
jest.mock('chart.js', () => ({
  Chart: {
    register: jest.fn()
  },
  CategoryScale: jest.fn(),
  LinearScale: jest.fn(),
  PointElement: jest.fn(),
  LineElement: jest.fn(),
  Title: jest.fn(),
  Tooltip: jest.fn(),
  Legend: jest.fn()
}));

// Mock pentru componenta MoodChart
jest.mock('../../components/mood/MoodChart', () => {
  return {
    __esModule: true,
    default: () => <div data-testid="mood-chart">Mock Mood Chart</div>
  };
});

// Mock pentru componenta MoodTracker
jest.mock('../../components/mood/MoodTracker', () => {
  return {
    __esModule: true,
    default: () => <div data-testid="mood-tracker">Mock Mood Tracker</div>
  };
});

// Mock pentru componenta MoodHistory
jest.mock('../../components/mood/MoodHistory', () => {
  return {
    __esModule: true,
    default: () => <div data-testid="mood-history">Mock Mood History</div>
  };
});

// Mock pentru componenta RecommendedExercises
jest.mock('../../components/exercises/RecommendedExercises', () => {
  return {
    __esModule: true,
    default: () => <div data-testid="recommended-exercises">Mock Recommended Exercises</div>
  };
});

// Mock pentru componenta RecommendedResources
jest.mock('../../components/resources/RecommendedResources', () => {
  return {
    __esModule: true,
    default: () => <div data-testid="recommended-resources">Mock Recommended Resources</div>
  };
});

// Mockuri pentru query-urile GraphQL
const mocks = [
  {
    request: {
      query: GET_MOOD_ENTRIES,
      variables: { limit: 7 }
    },
    result: {
      data: {
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
            tags: ['productive', 'energetic']
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
            tags: ['neutral']
          }
        ]
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
        getRecommendedExercises: [
          {
            exercise: {
              id: 'ex1',
              title: 'Breathing Exercise',
              description: 'A simple breathing exercise',
              category: 'breathing',
              duration: 5,
              difficulty: 'beginner'
            },
            score: 0.8
          },
          {
            exercise: {
              id: 'ex2',
              title: 'Mindfulness Meditation',
              description: 'A guided mindfulness meditation',
              category: 'mindfulness',
              duration: 10,
              difficulty: 'intermediate'
            },
            score: 0.6
          }
        ]
      }
    }
  }
];

const renderDashboard = (mocks = []) => {
  // Simulează un utilizator autentificat
  localStorage.setItem('token', 'test-token');
  localStorage.setItem('user', JSON.stringify({ id: 'user123', name: 'Test User' }));
  
  return render(
    <BrowserRouter>
      <MockedProvider mocks={mocks} addTypename={false}>
        <AuthProvider>
          <Dashboard />
        </AuthProvider>
      </MockedProvider>
    </BrowserRouter>
  );
};

describe('Dashboard Page Tests', () => {
  beforeEach(() => {
    localStorage.clear();
  });
  
  it('should render dashboard components correctly', async () => {
    renderDashboard(mocks);
    
    // Verifică titlul dashboard-ului
    expect(screen.getByText('Bun venit la aplicația de sănătate mentală')).toBeInTheDocument();
    
    // Verifică că toate secțiunile principale sunt afișate
    expect(screen.getByText('Dispoziția ta')).toBeInTheDocument();
    expect(screen.getByText('Adaugă dispoziția curentă')).toBeInTheDocument();
    expect(screen.getByText('Istoricul dispoziției')).toBeInTheDocument();
    expect(screen.getByText('Sfatul zilei')).toBeInTheDocument();
    
    // Așteptăm încărcarea componentelor care folosesc query-uri
    await waitFor(() => {
      expect(screen.getByTestId('mood-chart')).toBeInTheDocument();
      expect(screen.getByTestId('mood-tracker')).toBeInTheDocument();
      expect(screen.getByTestId('mood-history')).toBeInTheDocument();
      expect(screen.getByTestId('recommended-exercises')).toBeInTheDocument();
      expect(screen.getByTestId('recommended-resources')).toBeInTheDocument();
    });
  });
  
  it('should display loading state while fetching data', () => {
    renderDashboard(mocks);
    
    // Verifică mesajul de încărcare pentru datele de dispoziție
    expect(screen.getByText('Se încarcă datele...')).toBeInTheDocument();
  });
  
  it('should display error message when mood entries query fails', async () => {
    // Mock cu eroare pentru GET_MOOD_ENTRIES
    const errorMocks = [
      {
        request: {
          query: GET_MOOD_ENTRIES,
          variables: { limit: 7 }
        },
        error: new Error('Failed to fetch mood entries')
      },
      // Mock normal pentru exerciții
      mocks[1]
    ];
    
    renderDashboard(errorMocks);
    
    // Așteptăm afișarea mesajului de eroare
    await waitFor(() => {
      expect(screen.getByText(/Eroare la încărcarea datelor/)).toBeInTheDocument();
    });
  });
  
  it('should display message when no mood entries exist', async () => {
    // Mock cu array gol pentru GET_MOOD_ENTRIES
    const emptyMoodEntriesMocks = [
      {
        request: {
          query: GET_MOOD_ENTRIES,
          variables: { limit: 7 }
        },
        result: {
          data: {
            getMoodEntries: []
          }
        }
      },
      // Mock normal pentru exerciții
      mocks[1]
    ];
    
    renderDashboard(emptyMoodEntriesMocks);
    
    // Așteptăm afișarea mesajului pentru lipsa înregistrărilor
    await waitFor(() => {
      expect(screen.getByText('Nu există înregistrări de dispoziție. Adaugă prima ta înregistrare folosind formularul de mai jos.')).toBeInTheDocument();
    });
  });
  
  it('should display daily tip', () => {
    // Mock pentru Math.random pentru a controla sfatul afișat
    const originalRandom = Math.random;
    Math.random = jest.fn().mockReturnValue(0); // Returnează primul sfat
    
    renderDashboard(mocks);
    
    // Verifică că secțiunea sfat zilnic există
    expect(screen.getByText('Sfatul zilei')).toBeInTheDocument();
    
    // Verifică sfatul afișat (primul din array)
    expect(screen.getByText('Acordă-ți 5 minute pentru a respira adânc și a te concentra pe momentul prezent.')).toBeInTheDocument();
    
    // Restaurează Math.random
    Math.random = originalRandom;
  });
  
  it('should have correct layout structure', () => {
    const { container } = renderDashboard(mocks);
    
    // Verifică structura layout-ului (grid)
    const gridElement = container.querySelector('.dashboard-grid');
    expect(gridElement).toBeTruthy();
    
    // Verifică că există coloanele stânga și dreapta
    const leftColumn = container.querySelector('.left-column');
    const rightColumn = container.querySelector('.right-column');
    expect(leftColumn).toBeTruthy();
    expect(rightColumn).toBeTruthy();
  });
});