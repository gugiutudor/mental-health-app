import React from 'react';
import { useQuery } from '@apollo/client';
import { GET_MOOD_ENTRIES, GET_RECOMMENDED_EXERCISES } from '../graphql/queries';
import MoodChart from '../components/mood/MoodChart';
import MoodTracker from '../components/mood/MoodTracker';
import ExerciseList from '../components/exercises/ExerciseList';
import styled from 'styled-components';

const DashboardContainer = styled.div`
  padding: 1.5rem;
`;

const WelcomeSection = styled.section`
  margin-bottom: 2rem;
`;

const SectionHeading = styled.h2`
  margin-bottom: 1rem;
  color: #2d3748;
`;

const DashboardGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  
  @media (min-width: 768px) {
    grid-template-columns: 2fr 1fr;
  }
`;

const LeftColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const RightColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const Card = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
`;

const Dashboard = () => {
  const { loading: moodLoading, error: moodError, data: moodData } = useQuery(GET_MOOD_ENTRIES, {
    variables: { limit: 7 } // Ultimele 7 înregistrări
  });
  
  const { loading: exercisesLoading, error: exercisesError, data: exercisesData } = useQuery(GET_RECOMMENDED_EXERCISES, {
    variables: { limit: 3 } // Top 3 exerciții recomandate
  });

  return (
    <DashboardContainer>
      <WelcomeSection>
        <h1>Bun venit la aplicația de sănătate mentală</h1>
        <p>Monitorizează starea ta emoțională și descoperă resurse pentru îmbunătățirea sănătății mentale.</p>
      </WelcomeSection>
      
      <DashboardGrid>
        <LeftColumn>
          <Card>
            <SectionHeading>Dispoziția ta</SectionHeading>
            {moodLoading ? (
              <p>Se încarcă datele...</p>
            ) : moodError ? (
              <p>Eroare la încărcarea datelor: {moodError.message}</p>
            ) : moodData && moodData.getMoodEntries.length > 0 ? (
              <MoodChart entries={moodData.getMoodEntries} />
            ) : (
              <p>Nu există înregistrări de dispoziție. Adaugă prima ta înregistrare folosind formularul de mai jos.</p>
            )}
          </Card>
          
          <Card>
            <SectionHeading>Adaugă dispoziția curentă</SectionHeading>
            <MoodTracker />
          </Card>
        </LeftColumn>
        
        <RightColumn>
          <Card>
            <SectionHeading>Exerciții recomandate</SectionHeading>
            {exercisesLoading ? (
              <p>Se încarcă exercițiile...</p>
            ) : exercisesError ? (
              <p>Eroare la încărcarea exercițiilor: {exercisesError.message}</p>
            ) : exercisesData && exercisesData.getRecommendedExercises.length > 0 ? (
              <ExerciseList exercises={exercisesData.getRecommendedExercises} />
            ) : (
              <p>Nu există exerciții recomandate disponibile.</p>
            )}
          </Card>
          
          <Card>
            <SectionHeading>Sfatul zilei</SectionHeading>
            <p>Acordă-ți câteva minute în fiecare zi pentru a respira adânc și a te conecta cu tine însuți.</p>
          </Card>
        </RightColumn>
      </DashboardGrid>
    </DashboardContainer>
  );
};

export default Dashboard;