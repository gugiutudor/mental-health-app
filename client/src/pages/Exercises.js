import React, { useState } from 'react';
import { useQuery } from '@apollo/client';
import { GET_EXERCISES } from '../graphql/queries';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const ExercisesContainer = styled.div`
  max-width: 1200px;
  margin: 2rem auto;
  padding: 0 1rem;
`;

const FiltersSection = styled.div`
  margin-bottom: 2rem;
  background-color: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const FilterGroup = styled.div`
  margin-bottom: 1rem;

  &:last-child {
    margin-bottom: 0;
  }
`;

const FilterLabel = styled.h3`
  margin-bottom: 0.5rem;
  font-size: 1rem;
`;

const CategoryButtons = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const CategoryButton = styled.button`
  padding: 0.5rem 1rem;
  border-radius: 9999px;
  border: 1px solid #4c51bf;
  background-color: ${props => props.active ? '#4c51bf' : 'transparent'};
  color: ${props => props.active ? 'white' : '#4c51bf'};
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: ${props => props.active ? '#434190' : '#edf2f7'};
  }
`;

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
`;

const ExerciseCard = styled.div`
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
  }
`;

const ExerciseCardContent = styled.div`
  padding: 1.5rem;
`;

const ExerciseTitle = styled.h3`
  font-size: 1.25rem;
  margin-bottom: 0.5rem;
  color: #2d3748;
`;

const ExerciseDescription = styled.p`
  font-size: 0.875rem;
  color: #4a5568;
  margin-bottom: 1rem;
  line-height: 1.5;
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
  gap: 0.25rem;
  font-size: 0.875rem;
  color: #718096;
`;

const ExerciseTagContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
`;

const ExerciseTag = styled.span`
  background-color: #e9d8fd;
  color: #6b46c1;
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
`;

const ViewButton = styled(Link)`
  display: inline-block;
  background-color: #4c51bf;
  color: white;
  font-size: 0.875rem;
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  text-decoration: none;
  margin-top: 0.75rem;
  transition: background-color 0.2s;

  &:hover {
    background-color: #434190;
    text-decoration: none;
  }
`;

const LoadingContainer = styled.div`
  text-align: center;
  padding: 2rem;
  font-size: 1.125rem;
  color: #4a5568;
`;

const ErrorContainer = styled.div`
  background-color: #fed7d7;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1.5rem;
  color: #c53030;
`;

const NoResultsContainer = styled.div`
  text-align: center;
  padding: 2rem;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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
      <h1 style={{ marginBottom: '1.5rem' }}>Exerciții pentru sănătate mentală</h1>
      
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
          <p>Nu există exerciții disponibile pentru filtrele selectate.</p>
        </NoResultsContainer>
      )}
    </ExercisesContainer>
  );
};

export default Exercises;