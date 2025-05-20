import React from 'react';
import { useQuery } from '@apollo/client';
import { GET_MOOD_ENTRIES, GET_RECOMMENDED_EXERCISES } from '../graphql/queries';
import MoodTracker from '../components/mood/MoodTracker';
import MoodHistory from '../components/mood/MoodHistory';
import RecommendedExercises from '../components/exercises/RecommendedExercises';
import RecommendedResources from '../components/resources/RecommendedResources';
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

const DailyTip = styled.div`
  background-color: #ebf8ff;
  border-left: 4px solid #4299e1;
  padding: 1rem;
  margin-top: 1rem;
  border-radius: 4px;
`;

const Dashboard = () => {
  const { loading: moodLoading, error: moodError, data: moodData } = useQuery(GET_MOOD_ENTRIES, {
    variables: { limit: 7 } // Ultimele 7 înregistrări
  });
  
  // Array de sfaturi zilnice
  const dailyTips = [
    "Acordă-ți 5 minute pentru a respira adânc și a te concentra pe momentul prezent.",
    "Încearcă să faci o plimbare scurtă în aer liber astăzi pentru a-ți stimula starea de spirit.",
    "Amintește-ți să bei suficientă apă pe parcursul zilei.",
    "Fă o pauză mică de la ecrane la fiecare oră de utilizare.",
    "Conectează-te cu o persoană dragă astăzi, fie și doar pentru un mesaj scurt.",
    "Notează 3 lucruri pentru care ești recunoscător astăzi.",
    "Încearcă să faci un gest de bunătate pentru cineva astăzi."
  ];
  
  // Alege un sfat aleator
  const randomTip = dailyTips[Math.floor(Math.random() * dailyTips.length)];

  return (
    <DashboardContainer>
      <WelcomeSection>
        <h1>Bun venit la aplicația de sănătate mentală</h1>
        <p>Monitorizează starea ta emoțională și descoperă resurse pentru îmbunătățirea sănătății mentale.</p>
      </WelcomeSection>
      
      <DashboardGrid>
        <LeftColumn>
          <Card>
            <SectionHeading>Istoricul dispoziției</SectionHeading>
            <MoodHistory />
          </Card>
          
          <Card>
            <SectionHeading>Adaugă dispoziția curentă</SectionHeading>
            <MoodTracker />
          </Card>
        </LeftColumn>
        
        <RightColumn>
          <Card>
            <RecommendedExercises limit={3} />
          </Card>
          
          <Card>
            <RecommendedResources limit={3} />
          </Card>
          
          <Card>
            <SectionHeading>Sfatul zilei</SectionHeading>
            <DailyTip>
              {randomTip}
            </DailyTip>
          </Card>
        </RightColumn>
      </DashboardGrid>
    </DashboardContainer>
  );
};

export default Dashboard;