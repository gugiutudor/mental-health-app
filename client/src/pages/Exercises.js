import React, { useState } from 'react';
import { useQuery } from '@apollo/client';
import { GET_EXERCISES } from '../graphql/queries';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const ExercisesContainer = styled.div`
  max-width: 1200px;
  margin: 2rem auto;
  padding: 0 1.5rem;
`;

const PageHeader = styled.div`
  margin-bottom: 2rem;
  
  h1 {
    color: var(--primary-color);
    font-size: 2rem;
    font-weight: 700;
    margin-bottom: 0.75rem;
  }
  
  p {
    color: #718096;
    font-size: 1.1rem;
    line-height: 1.5;
  }
`;

const FiltersSection = styled.div`
  margin-bottom: 2rem;
  background-color: var(--card-bg);
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  
  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const FilterGroup = styled.div`
  margin-bottom: 1.25rem;

  &:last-child {
    margin-bottom: 0;
  }
`;

const FilterLabel = styled.h3`
  margin-bottom: 0.75rem;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--primary-color);
`;

const CategoryButtons = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
`;

const CategoryButton = styled.button`
  padding: 0.6rem 1.2rem;
  border-radius: 9999px;
  border: 1px solid var(--primary-color);
  background-color: ${props => props.active ? 'var(--primary-color)' : 'transparent'};
  color: ${props => props.active ? 'white' : 'var(--primary-color)'};
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: ${props => props.active ? '0 2px 4px rgba(0, 0, 0, 0.1)' : 'none'};

  &:hover {
    background-color: ${props => props.active ? 'var(--primary-hover)' : 'rgba(79, 70, 229, 0.1)'};
    transform: translateY(-1px);
  }
`;

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.75rem;
`;

const ExerciseCard = styled.div`
  background-color: var(--card-bg);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s, box-shadow 0.3s;
  height: 100%;
  display: flex;
  flex-direction: column;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
  }
`;

const ExerciseCardContent = styled.div`
  padding: 1.5rem;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
`;

const ExerciseTitle = styled.h3`
  font-size: 1.25rem;
  margin-bottom: 0.75rem;
  color: var(--primary-color);
  font-weight: 700;
`;

const ExerciseDescription = styled.p`
  font-size: 0.95rem;
  color: #4a5568;
  margin-bottom: 1rem;
  line-height: 1.6;
  flex-grow: 1;
`;

const ExerciseDetails = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: 1rem;
`;

const ExerciseDetail = styled.span`
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.9rem;
  color: #718096;
`;

const ExerciseTagContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  margin-top: 0.75rem;
`;

const ExerciseTag = styled.span`
  background-color: #e9d8fd;
  color: #6b46c1;
  font-size: 0.85rem;
  padding: 0.35rem 0.7rem;
  border-radius: 9999px;
  font-weight: 500;
`;

const ViewButton = styled(Link)`
  display: inline-block;
  background-color: var(--primary-color);
  color: white;
  font-size: 0.95rem;
  font-weight: 600;
  padding: 0.75rem 1.25rem;
  border-radius: 8px;
  text-decoration: none;
  margin-top: 1.25rem;
  transition: all 0.2s;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  &:hover {
    background-color: var(--primary-hover);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.15);
    transform: translateY(-2px);
    text-decoration: none;
    color: white;
  }
`;

const LoadingContainer = styled.div`
  text-align: center;
  padding: 3rem;
  font-size: 1.25rem;
  color: #4a5568;
  background-color: var(--card-bg);
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
`;

const ErrorContainer = styled.div`
  background-color: #fed7d7;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  color: #c53030;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
`;

const NoResultsContainer = styled.div`
  text-align: center;
  padding: 3rem 1.5rem;
  background-color: var(--card-bg);
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  
  h3 {
    color: var(--primary-color);
    font-size: 1.5rem;
    margin-bottom: 1rem;
  }
  
  p {
    color: #718096;
    font-size: 1.1rem;
  }
`;

const Exercises = () => {
  const [selectedCategory, setSelectedCategory] = useState('');
  
  // Obține exercițiile
  const { loading, error, data } = useQuery(GET_EXERCISES, {
    variables: { 
      category: selectedCategory || undefined,
      limit: 50
    }
  });

  // Categorii de exerciții disponibile
  const categories = [
    { value: '', label: 'Toate' },
    { value: 'mindfulness', label: 'Mindfulness' },
    { value: 'breathing', label: 'Respirație' },
    { value: 'cognitive', label: 'Cognitiv' },
    { value: 'physical', label: 'Fizic' },
    { value: 'social', label: 'Social' },
    { value: 'creative', label: 'Creativ' },
    { value: 'other', label: 'Altele' }
  ];

  // Handler pentru schimbarea categoriei
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };

  // Funcție pentru obținerea etichetei dificultății
  const getDifficultyLabel = (difficulty) => {
    const difficulties = {
      'beginner': 'Începător',
      'intermediate': 'Intermediar',
      'advanced': 'Avansat'
    };
    
    return difficulties[difficulty] || difficulty;
  };

  return (
    <ExercisesContainer>
      <PageHeader>
        <h1>Exerciții pentru sănătate mentală</h1>
        <p>Descoperă exerciții personalizate care te ajută să-ți îmbunătățești starea de spirit și echilibrul mental.</p>
      </PageHeader>
      
      <FiltersSection>
        <FilterGroup>
          <FilterLabel>Filtrează după categorie</FilterLabel>
          <CategoryButtons>
            {categories.map(category => (
              <CategoryButton 
                key={category.value} 
                active={selectedCategory === category.value}
                onClick={() => handleCategoryChange(category.value)}
              >
                {category.label}
              </CategoryButton>
            ))}
          </CategoryButtons>
        </FilterGroup>
      </FiltersSection>
      
      {loading ? (
        <LoadingContainer>
          <p>Se încarcă exercițiile...</p>
        </LoadingContainer>
      ) : error ? (
        <ErrorContainer>
          <p>Eroare la încărcarea exercițiilor: {error.message}</p>
        </ErrorContainer>
      ) : data && data.getExercises && data.getExercises.length > 0 ? (
        <GridContainer>
          {data.getExercises.map(exercise => (
            <ExerciseCard key={exercise.id}>
              <ExerciseCardContent>
                <ExerciseTitle>{exercise.title}</ExerciseTitle>
                <ExerciseDescription>
                  {exercise.description.length > 120
                    ? `${exercise.description.substring(0, 120)}...`
                    : exercise.description}
                </ExerciseDescription>
                
                <ExerciseTagContainer>
                  <ExerciseTag>{categories.find(c => c.value === exercise.category)?.label || exercise.category}</ExerciseTag>
                  {exercise.difficulty && (
                    <ExerciseTag>{getDifficultyLabel(exercise.difficulty)}</ExerciseTag>
                  )}
                </ExerciseTagContainer>
                
                <ExerciseDetails>
                  <ExerciseDetail>
                    <span role="img" aria-label="time">⏱️</span>
                    {exercise.duration} minute
                  </ExerciseDetail>
                </ExerciseDetails>
                
                <ViewButton to={`/exercises/${exercise.id}`}>
                  Vezi exercițiul
                </ViewButton>
              </ExerciseCardContent>
            </ExerciseCard>
          ))}
        </GridContainer>
      ) : (
        <NoResultsContainer>
          <h3>Nu am găsit exerciții</h3>
          <p>Nu există exerciții disponibile pentru filtrele selectate.</p>
        </NoResultsContainer>
      )}
    </ExercisesContainer>
  );
};

export default Exercises;