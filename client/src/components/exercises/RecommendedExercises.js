import React from 'react';
import { useQuery } from '@apollo/client';
import { GET_RECOMMENDED_EXERCISES } from '../../graphql/queries';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const Container = styled.div`
  margin-bottom: 2rem;
`;

const Title = styled.h2`
  margin-bottom: 1rem;
  color: #2d3748;
  font-size: 1.5rem;
`;

const ExerciseList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ExerciseCard = styled.div`
  background-color: white;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
`;

const ExerciseContent = styled.div`
  padding: 1rem;
`;

const ExerciseHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.5rem;
`;

const ExerciseTitle = styled.h3`
  font-size: 1.125rem;
  color: #2d3748;
  margin: 0;
`;

const ExerciseScore = styled.div`
  background-color: ${props => {
    if (props.score >= 0.8) return '#c6f6d5';
    if (props.score >= 0.5) return '#feebc8';
    return '#fed7d7';
  }};
  color: ${props => {
    if (props.score >= 0.8) return '#2f855a';
    if (props.score >= 0.5) return '#c05621';
    return '#c53030';
  }};
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
`;

const ExerciseDescription = styled.p`
  font-size: 0.875rem;
  color: #4a5568;
  margin: 0.5rem 0;
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

const ExerciseCategory = styled.span`
  background-color: #e9d8fd;
  color: #6b46c1;
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
`;

const ExerciseDifficulty = styled.span`
  background-color: ${props => {
    if (props.difficulty === 'beginner') return '#c6f6d5';
    if (props.difficulty === 'intermediate') return '#feebc8';
    return '#fed7d7';
  }};
  color: ${props => {
    if (props.difficulty === 'beginner') return '#2f855a';
    if (props.difficulty === 'intermediate') return '#c05621';
    return '#c53030';
  }};
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
`;

const ViewButton = styled(Link)`
  display: block;
  text-align: center;
  background-color: #4c51bf;
  color: white;
  font-size: 0.875rem;
  font-weight: 500;
  padding: 0.5rem;
  border-radius: 0 0 8px 8px;
  text-decoration: none;
  transition: background-color 0.2s;

  &:hover {
    background-color: #434190;
    text-decoration: none;
    color: white;
  }
`;

const LoadingContainer = styled.div`
  padding: 1rem;
  text-align: center;
  color: #718096;
`;

const ErrorContainer = styled.div`
  background-color: #fed7d7;
  border-radius: 8px;
  padding: 1rem;
  color: #c53030;
  font-size: 0.875rem;
`;

const EmptyContainer = styled.div`
  padding: 1rem;
  text-align: center;
  color: #718096;
  background-color: #f7fafc;
  border-radius: 8px;
`;

const RecommendedExercises = ({ limit = 3 }) => {
  const { loading, error, data } = useQuery(GET_RECOMMENDED_EXERCISES, {
    variables: { limit }
  });

  // Obține eticheta categoriei
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
  
  // Obține eticheta dificultății
  const getDifficultyLabel = (difficulty) => {
    const difficulties = {
      'beginner': 'Începător',
      'intermediate': 'Intermediar',
      'advanced': 'Avansat'
    };
    
    return difficulties[difficulty] || difficulty;
  };

  // Convertește scorul în procentaj pentru afișare
  const getScorePercentage = (score) => {
    return Math.round(score * 100);
  };

  return (
    <Container>
      <Title>Exerciții recomandate</Title>
      
      {loading ? (
        <LoadingContainer>
          <p>Se încarcă recomandările...</p>
        </LoadingContainer>
      ) : error ? (
        <ErrorContainer>
          <p>Eroare la încărcarea recomandărilor: {error.message}</p>
        </ErrorContainer>
      ) : data && data.getRecommendedExercises && data.getRecommendedExercises.length > 0 ? (
        <ExerciseList>
          {data.getRecommendedExercises.map(({ exercise, score }) => (
            <ExerciseCard key={exercise.id}>
              <ExerciseContent>
                <ExerciseHeader>
                  <ExerciseTitle>{exercise.title}</ExerciseTitle>
                  <ExerciseScore score={score}>
                    {getScorePercentage(score)}% potrivire
                  </ExerciseScore>
                </ExerciseHeader>
                
                <ExerciseDescription>
                  {exercise.description.length > 80
                    ? `${exercise.description.substring(0, 80)}...`
                    : exercise.description}
                </ExerciseDescription>
                
                <ExerciseDetails>
                  <ExerciseCategory>
                    {getCategoryLabel(exercise.category)}
                  </ExerciseCategory>
                  
                  {exercise.difficulty && (
                    <ExerciseDifficulty difficulty={exercise.difficulty}>
                      {getDifficultyLabel(exercise.difficulty)}
                    </ExerciseDifficulty>
                  )}
                  
                  <ExerciseDetail>
                    <span role="img" aria-label="time">⏱️</span>
                    {exercise.duration} min
                  </ExerciseDetail>
                </ExerciseDetails>
              </ExerciseContent>
              
              <ViewButton to={`/exercises/${exercise.id}`}>
                Vezi exercițiul
              </ViewButton>
            </ExerciseCard>
          ))}
        </ExerciseList>
      ) : (
        <EmptyContainer>
          <p>Nu există recomandări disponibile momentan.</p>
          <p>Adaugă mai multe înregistrări de dispoziție pentru a primi recomandări personalizate.</p>
        </EmptyContainer>
      )}
    </Container>
  );
};

export default RecommendedExercises;