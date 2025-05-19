// Test pentru componenta MoodTracker
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import MoodTracker from '../../src/components/mood/MoodTracker';
import { CREATE_MOOD_ENTRY } from '../../src/graphql/mutations';
import { GET_MOOD_ENTRIES } from '../../src/graphql/queries';

// Mock pentru react-chartjs-2
jest.mock('react-chartjs-2', () => ({
  Line: () => null
}));

// Mock pentru date-fns
jest.mock('date-fns', () => ({
  format: jest.fn(() => 'formatted-date')
}));

describe('MoodTracker Component', () => {
  const mocks = [
    {
      request: {
        query: CREATE_MOOD_ENTRY,
        variables: {
          input: {
            mood: 7,
            notes: 'Test mood entry',
            factors: {
              sleep: 4,
              stress: 3,
              activity: 3,
              social: 3
            }
          }
        }
      },
      result: {
        data: {
          createMoodEntry: {
            id: '1',
            date: new Date().toISOString(),
            mood: 7,
            notes: 'Test mood entry',
            factors: {
              sleep: 4,
              stress: 3,
              activity: 3,
              social: 3
            },
            tags: []
          }
        }
      }
    },
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
    }
  ];

  it('renders the mood tracking form', () => {
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <MoodTracker />
      </MockedProvider>
    );
    
    // Verifică dacă elementele principale ale formularului sunt afișate
    expect(screen.getByText('Cum te simți astăzi? (1-10)')).toBeInTheDocument();
    expect(screen.getByText('Note (opțional)')).toBeInTheDocument();
    expect(screen.getByText('Factori de influență')).toBeInTheDocument();
    expect(screen.getByText('Salvează dispoziția')).toBeInTheDocument();

    // Verifică sliderele pentru factori
    expect(screen.getByText('Calitatea somnului')).toBeInTheDocument();
    expect(screen.getByText('Nivelul de stres')).toBeInTheDocument();
    expect(screen.getByText('Activitate fizică')).toBeInTheDocument();
    expect(screen.getByText('Interacțiune socială')).toBeInTheDocument();
  });

  it('allows changing mood level with the slider', () => {
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <MoodTracker />
      </MockedProvider>
    );
    
    // Găsește sliderul pentru nivelul de dispoziție
    const moodSlider = screen.getByLabelText('Cum te simți astăzi? (1-10)');
    
    // Verifică valoarea inițială (5)
    expect(screen.getByText('5')).toBeInTheDocument();
    
    // Schimbă valoarea sliderului
    fireEvent.change(moodSlider, { target: { value: '8' } });
    
    // Verifică dacă valoarea s-a actualizat
    expect(screen.getByText('8')).toBeInTheDocument();
  });

  it('allows entering notes', () => {
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <MoodTracker />
      </MockedProvider>
    );
    
    // Găsește textArea pentru note
    const notesField = screen.getByPlaceholderText('Adaugă detalii despre cum te simți...');
    
    // Introduce text
    fireEvent.change(notesField, { target: { value: 'Test mood entry' } });
    
    // Verifică dacă valoarea s-a actualizat
    expect(notesField.value).toBe('Test mood entry');
  });

  it('submits mood entry data when form is submitted', async () => {
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <MoodTracker />
      </MockedProvider>
    );
    
    // Completează formularul
    const moodSlider = screen.getByLabelText('Cum te simți astăzi? (1-10)');
    fireEvent.change(moodSlider, { target: { value: '7' } });
    
    const notesField = screen.getByPlaceholderText('Adaugă detalii despre cum te simți...');
    fireEvent.change(notesField, { target: { value: 'Test mood entry' } });
    
    const sleepSlider = screen.getByLabelText('Calitatea somnului');
    fireEvent.change(sleepSlider, { target: { value: '4' } });
    
    // Trimite formularul
    fireEvent.click(screen.getByText('Salvează dispoziția'));
    
    // Așteptă răspunsul din mock
    await waitFor(() => {
      expect(screen.getByText('Înregistrarea dispoziției a fost salvată cu succes!')).toBeInTheDocument();
    });
  });
});