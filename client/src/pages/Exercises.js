import React, { useState } from 'react';
import { useQuery } from '@apollo/client';
import { GET_EXERCISES } from '../graphql/queries';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styled from 'styled-components';

const ExercisesContainer = styled.div`
  padding: 2rem 1.5rem;
  max-width: 1400px;
  margin: 0 auto;
`;

const PageHeader = styled.div`
  text-align: center;
  margin-bottom: 3rem;
  
  h1 {
    color: var(--text-color);
    font-size: 2.5rem;
    font-weight: 800;
    margin-bottom: 1rem;
    background: linear-gradient(135deg, var(--primary-color) 0%, #5146e2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  
  p {
    color: #718096;
    font-size: 1.2rem;
    line-height: 1.6;
    max-width: 600px;
    margin: 0 auto;
  }
`;

const WelcomeSection = styled.div`
  background: linear-gradient(135deg, rgba(244, 244, 255, 0.5) 0%, rgba(228, 248, 255, 0.5) 100%);
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 3rem;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(79, 70, 229, 0.1);
`;

const UserGreeting = styled.h2`
  color: var(--primary-color);
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
`;

const GreetingText = styled.p`
  color: #4a5568;
  font-size: 1.1rem;
  margin: 0;
`;

const FiltersSection = styled.div`
  margin-bottom: 3rem;
  background-color: var(--card-bg);
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  border: 1px solid var(--border-color);
  
  &:hover {
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
    transform: translateY(-3px);
  }
`;

const FilterGroup = styled.div`
  margin-bottom: 1.5rem;

  &:last-child {
    margin-bottom: 0;
  }
`;

const FilterLabel = styled.h3`
  margin-bottom: 1rem;
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--primary-color);
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

const CategoryButtons = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
`;

const CategoryButton = styled.button`
  padding: 0.75rem 1.5rem;
  border-radius: 25px;
  border: 2px solid var(--primary-color);
  background-color: ${props => props.active ? 'var(--primary-color)' : 'transparent'};
  color: ${props => props.active ? 'white' : 'var(--primary-color)'};
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: ${props => props.active ? '0 4px 12px rgba(79, 70, 229, 0.3)' : '0 2px 8px rgba(0, 0, 0, 0.05)'};
  transform: ${props => props.active ? 'translateY(-2px)' : 'none'};

  &:hover {
    background-color: ${props => props.active ? 'var(--primary-hover)' : 'rgba(79, 70, 229, 0.1)'};
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(79, 70, 229, 0.2);
  }

  &:active {
    transform: translateY(0);
  }
`;

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 2rem;
`;

const ExerciseCard = styled.div`
  background-color: var(--card-bg);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.4s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
  border: 1px solid var(--border-color);
  position: relative;

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
    border-color: var(--primary-color);
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(135deg, var(--primary-color) 0%, #5146e2 100%);
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &:hover::before {
    opacity: 1;
  }
`;

const ExerciseCardContent = styled.div`
  padding: 2rem;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
`;

const ExerciseTitle = styled.h3`
  font-size: 1.4rem;
  margin-bottom: 1rem;
  color: var(--primary-color);
  font-weight: 700;
  line-height: 1.3;
`;

const ExerciseDescription = styled.p`
  font-size: 1rem;
  color: var(--text-color);
  margin-bottom: 1.5rem;
  line-height: 1.6;
  flex-grow: 1;
  opacity: 0.8;
`;

const ExerciseDetails = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-top: 1rem;
`;

const ExerciseDetail = styled.span`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.95rem;
  color: #718096;
  font-weight: 500;
`;

const ExerciseTagContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 1rem;
`;

const ExerciseTag = styled.span`
  background: linear-gradient(135deg, #e9d8fd 0%, #f0e6ff 100%);
  color: #6b46c1;
  font-size: 0.9rem;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: 600;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const ViewButton = styled(Link)`
  display: inline-block;
  background: linear-gradient(135deg, var(--primary-color) 0%, #5146e2 100%);
  color: white;
  font-size: 1rem;
  font-weight: 600;
  padding: 1rem 2rem;
  border-radius: 25px;
  text-decoration: none;
  margin-top: 1.5rem;
  transition: all 0.3s ease;
  text-align: center;
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
  border: none;
  cursor: pointer;

  &:hover {
    background: linear-gradient(135deg, var(--primary-hover) 0%, #4338ca 100%);
    box-shadow: 0 6px 16px rgba(79, 70, 229, 0.4);
    transform: translateY(-2px);
    text-decoration: none;
    color: white;
  }

  &:active {
    transform: translateY(0);
  }
`;

const LoadingContainer = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  background-color: var(--card-bg);
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid var(--border-color);
  
  .spinner {
    width: 50px;
    height: 50px;
    border: 4px solid #e2e8f0;
    border-top: 4px solid var(--primary-color);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 1rem;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  p {
    font-size: 1.2rem;
    color: var(--text-color);
    font-weight: 500;
  }
`;

const ErrorContainer = styled.div`
  background: linear-gradient(135deg, #fed7d7 0%, #fecaca 100%);
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
  color: #c53030;
  box-shadow: 0 4px 12px rgba(197, 48, 48, 0.2);
  border: 1px solid #f56565;
  text-align: center;
  
  h3 {
    margin-bottom: 1rem;
    font-size: 1.3rem;
    font-weight: 700;
  }
  
  p {
    font-size: 1rem;
    margin: 0;
  }
`;

const NoResultsContainer = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  background-color: var(--card-bg);
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid var(--border-color);
  
  .icon {
    font-size: 4rem;
    margin-bottom: 1.5rem;
    opacity: 0.5;
  }
  
  h3 {
    color: var(--primary-color);
    font-size: 1.8rem;
    margin-bottom: 1rem;
    font-weight: 700;
  }
  
  p {
    color: #718096;
    font-size: 1.1rem;
    line-height: 1.6;
    max-width: 400px;
    margin: 0 auto;
  }
`;

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
`;

const StatCard = styled.div`
  background: linear-gradient(135deg, var(--card-bg) 0%, rgba(244, 244, 255, 0.5) 100%);
  border-radius: 16px;
  padding: 2rem;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid var(--border-color);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
  }
`;

const StatValue = styled.div`
  font-size: 2.5rem;
  font-weight: 800;
  color: var(--primary-color);
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  font-size: 1rem;
  color: #718096;
  font-weight: 600;
`;

const Exercises = () => {
  const [selectedCategory, setSelectedCategory] = useState('');
  const { currentUser } = useAuth();
  
  // Obține exercițiile
  const { loading, error, data } = useQuery(GET_EXERCISES, {
    variables: { 
      category: selectedCategory || undefined,
      limit: 50
    }
  });

  // Categorii de exerciții disponibile
  const categories = [
    { value: '', label: 'Toate', icon: '🌟' },
    { value: 'mindfulness', label: 'Mindfulness', icon: '🧘' },
    { value: 'breathing', label: 'Respirație', icon: '🌬️' },
    { value: 'cognitive', label: 'Cognitiv', icon: '🧠' },
    { value: 'physical', label: 'Fizic', icon: '💪' },
    { value: 'social', label: 'Social', icon: '👥' },
    { value: 'creative', label: 'Creativ', icon: '🎨' },
    { value: 'other', label: 'Altele', icon: '📝' }
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

  // Calculează statistici
  const totalExercises = data?.getExercises?.length || 0;
  const categoryCount = selectedCategory ? totalExercises : categories.length - 1;
  const avgDuration = data?.getExercises?.length > 0 
    ? Math.round(data.getExercises.reduce((sum, ex) => sum + ex.duration, 0) / data.getExercises.length)
    : 0;

  return (
    <ExercisesContainer>
      <PageHeader>
        <h1>Exerciții pentru sănătate mentală</h1>
        <p>Descoperă exerciții personalizate care te ajută să-ți îmbunătățești starea de spirit și echilibrul mental prin practici dovedite științific.</p>
      </PageHeader>

      {currentUser && (
        <WelcomeSection>
          <UserGreeting>Salut, {currentUser.firstName}! 👋</UserGreeting>
          <GreetingText>Află exercițiile potrivite pentru tine și începe călătoria către o sănătate mentală mai bună.</GreetingText>
        </WelcomeSection>
      )}

      <StatsContainer>
        <StatCard>
          <StatValue>{totalExercises}</StatValue>
          <StatLabel>Exerciții disponibile</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{categoryCount}</StatValue>
          <StatLabel>Categorii</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{avgDuration}</StatValue>
          <StatLabel>Minute în medie</StatLabel>
        </StatCard>
      </StatsContainer>
      
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
                <span style={{ marginRight: '0.5rem' }}>{category.icon}</span>
                {category.label}
              </CategoryButton>
            ))}
          </CategoryButtons>
        </FilterGroup>
      </FiltersSection>
      
      {loading ? (
        <LoadingContainer>
          <div className="spinner"></div>
          <p>Se încarcă exercițiile...</p>
        </LoadingContainer>
      ) : error ? (
        <ErrorContainer>
          <h3>⚠️ Eroare la încărcarea exercițiilor</h3>
          <p>{error.message}</p>
        </ErrorContainer>
      ) : data && data.getExercises && data.getExercises.length > 0 ? (
        <GridContainer>
          {data.getExercises.map(exercise => (
            <ExerciseCard key={exercise.id}>
              <ExerciseCardContent>
                <ExerciseTitle>{exercise.title}</ExerciseTitle>
                <ExerciseDescription>
                  {exercise.description.length > 140
                    ? `${exercise.description.substring(0, 140)}...`
                    : exercise.description}
                </ExerciseDescription>
                
                <ExerciseTagContainer>
                  <ExerciseTag>
                    {categories.find(c => c.value === exercise.category)?.icon} {categories.find(c => c.value === exercise.category)?.label || exercise.category}
                  </ExerciseTag>
                  {exercise.difficulty && (
                    <ExerciseTag>
                      📊 {getDifficultyLabel(exercise.difficulty)}
                    </ExerciseTag>
                  )}
                </ExerciseTagContainer>
                
                <ExerciseDetails>
                  <ExerciseDetail>
                    <span role="img" aria-label="time">⏱️</span>
                    {exercise.duration} minute
                  </ExerciseDetail>
                </ExerciseDetails>
                
                <ViewButton to={`/exercises/${exercise.id}`}>
                  Începe exercițiul →
                </ViewButton>
              </ExerciseCardContent>
            </ExerciseCard>
          ))}
        </GridContainer>
      ) : (
        <NoResultsContainer>
          <div className="icon">🔍</div>
          <h3>Nu am găsit exerciții</h3>
          <p>Nu există exerciții disponibile pentru categoria selectată. Încearcă să selectezi o altă categorie sau revino mai târziu.</p>
        </NoResultsContainer>
      )}
    </ExercisesContainer>
  );
};

export default Exercises;