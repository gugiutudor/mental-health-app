import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const ExerciseListContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ExerciseCard = styled.div`
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
`;

const ExerciseCardContent = styled.div`
  padding: 1rem;
`;

const ExerciseTitle = styled.h3`
  font-size: 1.125rem;
  margin-bottom: 0.5rem;
  color: #2d3748;
`;

const ExerciseDescription = styled.p`
  font-size: 0.875rem;
  color: #4a5568;
  margin-bottom: 0.5rem;
`;

const ExerciseDetails = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: 0.5rem;
`;

const ExerciseDetail = styled.span`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
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
  }
`;

const ExerciseList = ({ exercises }) => {
  const getCategoryLabel = (category) => {
    const categories = {
      'mindfulness': 'Mindfulness',
      'breathing': 'Respirație',
      'cognitive': 'Cognitiv',
      'physical': 'Fizic',
      'social': 'Social',
      'creative': 'Creativ',
      'other': 'Altele'
    };
    
    return categories[category] || category;
  };
  
  const getDifficultyLabel = (difficulty) => {
    const difficulties = {
      'beginner': 'Începător',
      'intermediate': 'Intermediar',
      'advanced': 'Avansat'
    };
    
    return difficulties[difficulty] || difficulty;
  };

  return (
    <ExerciseListContainer>
      {exercises.map(({ exercise, score }) => (
        <ExerciseCard key={exercise.id}>
          <ExerciseCardContent>
            <ExerciseTitle>{exercise.title}</ExerciseTitle>
            <ExerciseDescription>
              {exercise.description.length > 100
                ? `${exercise.description.substring(0, 100)}...`
                : exercise.description}
            </ExerciseDescription>
            
            <ExerciseTagContainer>
              <ExerciseTag>{getCategoryLabel(exercise.category)}</ExerciseTag>
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
    </ExerciseListContainer>
  );
};

export default ExerciseList;