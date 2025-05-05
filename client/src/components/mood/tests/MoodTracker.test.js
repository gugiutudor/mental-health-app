// client/src/components/mood/__tests__/MoodTracker.test.js
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MockedProvider } from '@apollo/client/testing';
import MoodTracker from '../MoodTracker';
import { CREATE_MOOD_ENTRY } from '../../../graphql/mutations';
import { GET_MOOD_ENTRIES } from '../../../graphql/queries';

// Mock pentru Formik (necesar pentru a evita probleme cu reset)
jest.mock('formik', () => {
  const originalModule = jest.requireActual('formik');
  return {
    ...originalModule,
    useFormik: jest.fn(options => {
      const formik = originalModule.useFormik(options);
      formik.resetForm = jest.fn();
      return formik;
    })
  };
});

// Mockuri pentru mutațiile și query-urile GraphQL
const mocks = [
  {
    request: {
      query: CREATE_MOOD_ENTRY,
      variables: {
        input: {
          mood: 7,
          notes: 'Test notes',
          factors: {
            sleep: 4,
            stress: 2,
            activity: 3,
            social: 4
          }
        }
      }
    },
    result: {
      data: {
        createMoodEntry: {
          id: 'mood123',
          date: new Date().toISOString(),
          mood: 7,
          notes: 'Test notes',
          factors: {
            sleep: 4,
            stress: 2,
            activity: 3,
            social: 4
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
        getMoodEntries: [
          {
            id: 'mood123',
            date: new Date().toISOString(),
            mood: 7,
            notes: 'Test notes',
            factors: {
              sleep: 4,
              stress: 2,
              activity: 3,
              social: 4
            },
            tags: []
          }
        ]
      }
    }
  }
];

describe('MoodTracker Component Tests', () => {
  it('should render the mood tracker form', () => {
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <MoodTracker />
      </MockedProvider>
    );
    
    // Verifică elementele formularului
    expect(screen.getByText('Cum te simți astăzi? (1-10)')).toBeInTheDocument();
    expect(screen.getByText('Note (opțional)')).toBeInTheDocument();
    expect(screen.getByText('Factori de influență')).toBeInTheDocument();
    expect(screen.getByText('Calitatea somnului')).toBeInTheDocument();
    expect(screen.getByText('Nivelul de stres')).toBeInTheDocument();
    expect(screen.getByText('Activitate fizică')).toBeInTheDocument();
    expect(screen.getByText('Interacțiune socială')).toBeInTheDocument();
    
    // Verifică butonul de salvare
    expect(screen.getByText('Salvează dispoziția')).toBeInTheDocument();
  });
  
  it('should submit the form with correct values', async () => {
    const user = userEvent.setup();
    
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <MoodTracker />
      </MockedProvider>
    );
    
    // Completează formularul
    const notesInput = screen.getByPlaceholderText('Adaugă detalii despre cum te simți...');
    await user.type(notesInput, 'Test notes');
    
    // Modifică valoarea dispoziției (slider)
    const moodSlider = screen.getByRole('slider', { name: /cum te simți astăzi/i });
    await user.clear(moodSlider);
    await user.type(moodSlider, '7');
    
    // Modifică valorile factorilor
    const sleepSlider = screen.getByRole('slider', { name: /calitatea somnului/i });
    await user.clear(sleepSlider);
    await user.type(sleepSlider, '4');
    
    const stressSlider = screen.getByRole('slider', { name: /nivelul de stres/i });
    await user.clear(stressSlider);
    await user.type(stressSlider, '2');
    
    const activitySlider = screen.getByRole('slider', { name: /activitate fizică/i });
    await user.clear(activitySlider);
    await user.type(activitySlider, '3');
    
    const socialSlider = screen.getByRole('slider', { name: /interacțiune socială/i });
    await user.clear(socialSlider);
    await user.type(socialSlider, '4');
    
    // Trimite formularul
    const submitButton = screen.getByText('Salvează dispoziția');
    await user.click(submitButton);
    
    // Verifică că formularul a fost trimis cu succes (așteptăm mesajul de succes)
    await waitFor(() => {
      expect(screen.getByText('Înregistrarea dispoziției a fost salvată cu succes!')).toBeInTheDocument();
    });
  });
  
  it('should show loading state while submitting', async () => {
    const user = userEvent.setup();
    
    // Mock cu întârziere pentru a vedea starea de loading
    const slowMocks = [
      {
        request: {
          query: CREATE_MOOD_ENTRY,
          variables: {
            input: {
              mood: 5,
              notes: '',
              factors: {
                sleep: 3,
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
              id: 'mood123',
              date: new Date().toISOString(),
              mood: 5,
              notes: '',
              factors: {
                sleep: 3,
                stress: 3,
                activity: 3,
                social: 3
              },
              tags: []
            }
          }
        },
        delay: 100 // Întârziere de 100ms
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
    
    render(
      <MockedProvider mocks={slowMocks} addTypename={false}>
        <MoodTracker />
      </MockedProvider>
    );
    
    // Trimite formularul
    const submitButton = screen.getByText('Salvează dispoziția');
    await user.click(submitButton);
    
    // Verifică starea de loading
    expect(screen.getByText('Se salvează...')).toBeInTheDocument();
    
    // Așteptăm terminarea mutației
    await waitFor(() => {
      expect(screen.getByText('Înregistrarea dispoziției a fost salvată cu succes!')).toBeInTheDocument();
    });
  });
  
  it('should show default values for factors', () => {
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <MoodTracker />
      </MockedProvider>
    );
    
    // Verifică valorile implicite
    const moodValue = screen.getByText('5', { selector: 'span' });
    expect(moodValue).toBeInTheDocument();
    
    const sleepValue = screen.getAllByText('3', { selector: 'span' })[0];
    expect(sleepValue).toBeInTheDocument();
    
    const stressValue = screen.getAllByText('3', { selector: 'span' })[1];
    expect(stressValue).toBeInTheDocument();
    
    const activityValue = screen.getAllByText('3', { selector: 'span' })[2];
    expect(activityValue).toBeInTheDocument();
    
    const socialValue = screen.getAllByText('3', { selector: 'span' })[3];
    expect(socialValue).toBeInTheDocument();
  });
});