import React from 'react';
import { useQuery } from '@apollo/client';
import { GET_RECOMMENDED_EXERCISES } from '../../graphql/queries';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const Container = styled.div`
  margin-bottom: 1rem;
`;

const SectionHeading = styled.h2`
  margin-bottom: 1.5rem;
  color: var(--primary-color);
  font-size: 1.4rem;
  font-weight: 700;
  position: relative;
  padding-bottom: 0.5rem;
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 40px;
    height: 3px;
    background-color: var(--primary-color);
    border-radius: 3px;
  }
`;

const ExerciseList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const ExerciseCard = styled.div`
  background-color: var(--card-bg);
  border-radius: 12px;
  border: 1px solid var(--border-color);
  overflow: hidden;
  transition: all 0.3s ease;
  position: relative;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
    border-color: var(--primary-color);
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(135deg, var(--primary-color) 0%, #5146e2 100%);
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &:hover::before {
    opacity: 1;
  }
`;

const ExerciseContent = styled.div`
  padding: 1.5rem;
`;

const ExerciseHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
  gap: 1rem;
`;

const ExerciseTitle = styled.h3`
  font-size: 1.1rem;
  color: var(--primary-color);
  margin: 0;
  font-weight: 700;
  line-height: 1.3;
  flex: 1;
`;

const ExerciseScore = styled.div`
  background: ${props => {
    if (props.score >= 0.8) return 'linear-gradient(135deg, #c6f6d5 0%, #9ae6b4 100%)';
    if (props.score >= 0.5) return 'linear-gradient(135deg, #feebc8 0%, #fed7aa 100%)';
    return 'linear-gradient(135deg, #fed7d7 0%, #fecaca 100%)';
  }};
  color: ${props => {
    if (props.score >= 0.8) return '#2f855a';
    if (props.score >= 0.5) return '#c05621';
    return '#c53030';
  }};
  font-size: 0.8rem;
  font-weight: 700;
  padding: 0.4rem 0.8rem;
  border-radius: 15px;
  white-space: nowrap;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border: 1px solid ${props => {
    if (props.score >= 0.8) return '#9ae6b4';
    if (props.score >= 0.5) return '#fed7aa';
    return '#fecaca';
  }};
`;

const ExerciseDescription = styled.p`
  font-size: 0.95rem;
  color: var(--text-color);
  margin: 0.75rem 0;
  line-height: 1.5;
  opacity: 0.8;
`;

const ExerciseDetails = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-top: 1rem;
  flex-wrap: wrap;
`;

const ExerciseCategory = styled.span`
  background: linear-gradient(135deg, #e9d8fd 0%, #f0e6ff 100%);
  color: #6b46c1;
  font-size: 0.85rem;
  padding: 0.4rem 0.8rem;
  border-radius: 15px;
  font-weight: 600;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border: 1px solid #e9d8fd;
`;

const ExerciseDifficulty = styled.span`
  background: ${props => {
    if (props.difficulty === 'beginner') return 'linear-gradient(135deg, #c6f6d5 0%, #9ae6b4 100%)';
    if (props.difficulty === 'intermediate') return 'linear-gradient(135deg, #feebc8 0%, #fed7aa 100%)';
    return 'linear-gradient(135deg, #fed7d7 0%, #fecaca 100%)';
  }};
  color: ${props => {
    if (props.difficulty === 'beginner') return '#2f855a';
    if (props.difficulty === 'intermediate') return '#c05621';
    return '#c53030';
  }};
  font-size: 0.85rem;
  padding: 0.4rem 0.8rem;
  border-radius: 15px;
  font-weight: 600;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const ExerciseDetail = styled.span`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.85rem;
  color: #718096;
  font-weight: 500;
`;

const ViewButton = styled(Link)`
  display: block;
  text-align: center;
  background: linear-gradient(135deg, var(--primary-color) 0%, #5146e2 100%);
  color: white;
  font-size: 0.95rem;
  font-weight: 600;
  padding: 0.8rem 1.5rem;
  border-radius: 20px;
  text-decoration: none;
  transition: all 0.3s ease;
  margin-top: 1.25rem;
  box-shadow: 0 3px 8px rgba(79, 70, 229, 0.3);

  &:hover {
    background: linear-gradient(135deg, var(--primary-hover) 0%, #4338ca 100%);
    color: white;
    text-decoration: none;
    box-shadow: 0 5px 12px rgba(79, 70, 229, 0.4);
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }
`;

const LoadingContainer = styled.div`
  padding: 2rem;
  text-align: center;
  color: #718096;
  background-color: var(--card-bg);
  border-radius: 12px;
  border: 1px solid var(--border-color);
  
  .spinner {
    width: 30px;
    height: 30px;
    border: 3px solid #e2e8f0;
    border-top: 3px solid var(--primary-color);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 1rem;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const ErrorContainer = styled.div`
  background: linear-gradient(135deg, #fed7d7 0%, #fecaca 100%);
  border-radius: 12px;
  padding: 1.5rem;
  color: #c53030;
  font-size: 0.95rem;
  box-shadow: 0 4px 8px rgba(197, 48, 48, 0.2);
  border: 1px solid #f56565;
  text-align: center;
  
  h4 {
    margin-bottom: 0.5rem;
    font-size: 1.1rem;
    font-weight: 700;
  }
`;

const EmptyContainer = styled.div`
  padding: 2rem;
  text-align: center;
  color: #718096;
  background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
  border-radius: 12px;
  border: 1px solid var(--border-color);
  
  .icon {
    font-size: 2.5rem;
    margin-bottom: 1rem;
    opacity: 0.6;
  }
  
  h4 {
    color: var(--primary-color);
    margin-bottom: 0.5rem;
    font-weight: 700;
  }
  
  p {
    margin: 0.5rem 0 0;
    line-height: 1.5;
    font-size: 0.95rem;
  }
`;

const RecommendedExercises = ({ limit = 3 }) => {
  const { loading, error, data } = useQuery(GET_RECOMMENDED_EXERCISES, {
    variables: { limit }
  });

  // Obține eticheta categoriei
  const getCategoryLabel = (category) => {
    const categories = {
      'mindfulness': { label: 'Mindfulness', icon: '🧘' },
      'breathing': { label: 'Respirație', icon: '🌬️' },
      'cognitive': { label: 'Cognitiv', icon: '🧠' },
      'physical': { label: 'Fizic', icon: '💪' },
      'social': { label: 'Social', icon: '👥' },
      'creative': { label: 'Creativ', icon: '🎨' },
      'other': { label: 'Altele', icon: '📝' }
    };
    
    return categories[category] || { label: category, icon: '📝' };
  };
  
  // Obține eticheta dificultății
  const getDifficultyLabel = (difficulty) => {
    const difficulties = {
      'beginner': { label: 'Începător', icon: '🌱' },
      'intermediate': { label: 'Intermediar', icon: '🌿' },
      'advanced': { label: 'Avansat', icon: '🌳' }
    };
    
    return difficulties[difficulty] || { label: difficulty, icon: '📊' };
  };

  // Convertește scorul în procentaj pentru afișare
  const getScorePercentage = (score) => {
    return Math.round(score * 100);
  };

  return (
    <Container>
      <SectionHeading>✨ Exerciții recomandate pentru tine</SectionHeading>
      
      {loading ? (
        <LoadingContainer>
          <div className="spinner"></div>
          <p>Se încarcă recomandările...</p>
        </LoadingContainer>
      ) : error ? (
        <ErrorContainer>
          <h4>⚠️ Eroare la încărcarea recomandărilor</h4>
          <p>{error.message}</p>
        </ErrorContainer>
      ) : data && data.getRecommendedExercises && data.getRecommendedExercises.length > 0 ? (
        <ExerciseList>
          {data.getRecommendedExercises.map(({ exercise, score }) => {
            const categoryInfo = getCategoryLabel(exercise.category);
            const difficultyInfo = exercise.difficulty ? getDifficultyLabel(exercise.difficulty) : null;
            
            return (
              <ExerciseCard key={exercise.id}>
                <ExerciseContent>
                  <ExerciseHeader>
                    <ExerciseTitle>{exercise.title}</ExerciseTitle>
                    <ExerciseScore score={score}>
                      {getScorePercentage(score)}% potrivire
                    </ExerciseScore>
                  </ExerciseHeader>
                  
                  <ExerciseDescription>
                    {exercise.description.length > 100
                      ? `${exercise.description.substring(0, 100)}...`
                      : exercise.description}
                  </ExerciseDescription>
                  
                  <ExerciseDetails>
                    <ExerciseCategory>
                      <span style={{ marginRight: '0.4rem' }}>{categoryInfo.icon}</span>
                      {categoryInfo.label}
                    </ExerciseCategory>
                    
                    {difficultyInfo && (
                      <ExerciseDifficulty difficulty={exercise.difficulty}>
                        <span style={{ marginRight: '0.4rem' }}>{difficultyInfo.icon}</span>
                        {difficultyInfo.label}
                      </ExerciseDifficulty>
                    )}
                    
                    <ExerciseDetail>
                      <span role="img" aria-label="time">⏱️</span>
                      {exercise.duration} min
                    </ExerciseDetail>
                  </ExerciseDetails>
                  
                  <ViewButton to={`/exercises/${exercise.id}`}>
                    Începe exercițiul →
                  </ViewButton>
                </ExerciseContent>
              </ExerciseCard>
            );
          })}
        </ExerciseList>
      ) : (
        <EmptyContainer>
          <div className="icon">🌱</div>
          <h4>Nu există recomandări disponibile</h4>
          <p>Adaugă mai multe înregistrări de dispoziție pentru a primi recomandări personalizate.</p>
          <p>Cu cât oferi mai multe detalii, cu atât recomandările vor fi mai precise!</p>
        </EmptyContainer>
      )}
    </Container>
  );
};

export default RecommendedExercises;