// Test pentru componenta ExerciseList
import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ExerciseList from '../../src/components/exercises/ExerciseList';

describe('ExerciseList Component', () => {
  const mockExercises = [
    {
      exercise: {
        id: '1',
        title: 'Meditație mindfulness',
        description: 'O sesiune de meditație mindfulness pentru reducerea stresului și anxietății.',
        category: 'mindfulness',
        duration: 10,
        difficulty: 'beginner'
      },
      score: 0.8
    },
    {
      exercise: {
        id: '2',
        title: 'Exerciții de respirație',
        description: 'Tehnici de respirație pentru relaxare și îmbunătățirea concentrării.',
        category: 'breathing',
        duration: 5,
        difficulty: 'beginner'
      },
      score: 0.7
    },
    {
      exercise: {
        id: '3',
        title: 'Restructurare cognitivă',
        description: 'Identificarea și restructurarea gândurilor negative automate.',
        category: 'cognitive',
        duration: 15,
        difficulty: 'intermediate'
      },
      score: 0.6
    }
  ];

  const renderWithRouter = (ui) => {
    return render(ui, { wrapper: BrowserRouter });
  };

  it('renders exercise cards correctly', () => {
    renderWithRouter(<ExerciseList exercises={mockExercises} />);
    
    // Verifică dacă toate exercițiile sunt afișate
    expect(screen.getByText('Meditație mindfulness')).toBeInTheDocument();
    expect(screen.getByText('Exerciții de respirație')).toBeInTheDocument();
    expect(screen.getByText('Restructurare cognitivă')).toBeInTheDocument();
    
    // Verifică descrierile
    expect(screen.getByText(/O sesiune de meditație mindfulness/)).toBeInTheDocument();
    expect(screen.getByText(/Tehnici de respirație pentru relaxare/)).toBeInTheDocument();
    expect(screen.getByText(/Identificarea și restructurarea gândurilor negative/)).toBeInTheDocument();
  });

  it('displays correct category labels', () => {
    renderWithRouter(<ExerciseList exercises={mockExercises} />);
    
    // Verifică etichetele categoriilor
    expect(screen.getByText('Mindfulness')).toBeInTheDocument();
    expect(screen.getByText('Respirație')).toBeInTheDocument();
    expect(screen.getByText('Cognitiv')).toBeInTheDocument();
  });

  it('displays correct difficulty labels', () => {
    renderWithRouter(<ExerciseList exercises={mockExercises} />);
    
    // Verifică etichetele dificultăților
    expect(screen.getAllByText('Începător').length).toBe(2);
    expect(screen.getByText('Intermediar')).toBeInTheDocument();
  });

  it('displays correct duration information', () => {
    renderWithRouter(<ExerciseList exercises={mockExercises} />);
    
    // Verifică duratele
    expect(screen.getByText('10 minute')).toBeInTheDocument();
    expect(screen.getByText('5 minute')).toBeInTheDocument();
    expect(screen.getByText('15 minute')).toBeInTheDocument();
  });

  it('renders view buttons with correct links', () => {
    renderWithRouter(<ExerciseList exercises={mockExercises} />);
    
    // Verifică butoanele și link-urile
    const viewButtons = screen.getAllByText('Vezi exercițiul');
    
    expect(viewButtons.length).toBe(3);
    expect(viewButtons[0].closest('a')).toHaveAttribute('href', '/exercises/1');
    expect(viewButtons[1].closest('a')).toHaveAttribute('href', '/exercises/2');
    expect(viewButtons[2].closest('a')).toHaveAttribute('href', '/exercises/3');
  });

  it('truncates long descriptions', () => {
    const longDescriptionExercises = [
      {
        exercise: {
          id: '4',
          title: 'Exercițiu cu descriere lungă',
          description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce euismod, nisi vel consectetur interdum, nisl nunc egestas nisi, eu aliquet nunc nisl eu nisl. Nulla facilisi. Nulla facilisi. Nulla facilisi. Nulla facilisi. Nulla facilisi. Nulla facilisi. Nulla facilisi. Nulla facilisi.',
          category: 'cognitive',
          duration: 20,
          difficulty: 'advanced'
        },
        score: 0.5
      }
    ];
    
    renderWithRouter(<ExerciseList exercises={longDescriptionExercises} />);
    
    // Verifică dacă descrierea este trunchiată
    expect(screen.getByText(/Lorem ipsum dolor sit amet/)).toBeInTheDocument();
    expect(screen.queryByText(/Nulla facilisi. Nulla facilisi. Nulla facilisi. Nulla facilisi./)).not.toBeInTheDocument();
    expect(screen.getByText(/\.\.\./)).toBeInTheDocument();
  });

  it('renders empty state when no exercises are provided', () => {
    renderWithRouter(<ExerciseList exercises={[]} />);
    
    // Verifică dacă nu sunt afișate exerciții
    expect(screen.queryByText('Vezi exercițiul')).not.toBeInTheDocument();
  });
});