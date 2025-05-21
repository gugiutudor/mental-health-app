import React from 'react';
import { useQuery } from '@apollo/client';
import { GET_MOOD_ENTRIES, GET_RECOMMENDED_EXERCISES } from '../graphql/queries';
import MoodTracker from '../components/mood/MoodTracker';
import MoodHistory from '../components/mood/MoodHistory';
import RecommendedExercises from '../components/exercises/RecommendedExercises';
import RecommendedResources from '../components/resources/RecommendedResources';
import styled from 'styled-components';

const DashboardContainer = styled.div`
  padding: 2rem 1.5rem;
  max-width: 1400px;
  margin: 0 auto;
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
  background-color: var(--card-bg);
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  padding: 1.75rem;
  transition: all 0.3s ease;
  
  &:hover {
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
    transform: translateY(-3px);
  }
`;

const SectionHeading = styled.h2`
  margin-bottom: 1.25rem;
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

const DailyTip = styled.div`
  background: linear-gradient(135deg, #ebf4ff 0%, #e6fffa 100%);
  border-left: 4px solid var(--primary-color);
  padding: 1.25rem;
  margin-top: 1rem;
  border-radius: 8px;
  font-size: 1rem;
  line-height: 1.6;
  position: relative;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  
  &::before {
    content: '"';
    font-size: 3rem;
    color: var(--primary-color);
    opacity: 0.2;
    position: absolute;
    top: -10px;
    left: 10px;
  }
`;

const Dashboard = () => {
  const { loading: moodLoading, error: moodError, data: moodData } = useQuery(GET_MOOD_ENTRIES, {
    variables: { limit: 7 } // Ultimele 7 înregistrări
  });
  
  // Array de sfaturi zilnice
  const dailyTips = [
    "Acordă-ți 5 minute pentru respirație conștientă. Respiră adânc și concentrează-te doar pe senzația aerului care intră și iese din plămâni.",
    "Mișcarea fizică eliberează endorfine. Chiar și o scurtă plimbare de 10 minute poate îmbunătăți semnificativ starea de spirit.",
    "Hidratarea corectă influențează și starea psihică. Asigură-te că bei suficientă apă pe parcursul zilei.",
    "Privitul îndelungat în ecrane poate obosi mintea. Încearcă regula 20-20-20: la fiecare 20 de minute, privește timp de 20 de secunde la ceva aflat la 20 de picioare distanță.",
    "Conectează-te cu o persoană dragă astăzi, fie și doar pentru un mesaj scurt. Relațiile sociale sunt esențiale pentru sănătatea mentală.",
    "Practică recunoștința zilnic. Notează 3 lucruri pentru care ești recunoscător astăzi, oricât de mici ar fi ele.",
    "Fă un gest de bunătate pentru cineva astăzi. Oferind, primim la rândul nostru.",
    "O odihnă adecvată este fundamentală pentru echilibrul mental. Încearcă să menții un program constant de somn.",
    "Meditația regulată reduce stresul și anxietatea. Dedică măcar 2 minute pe zi pentru a fi prezent în momentul actual."
  ];
  
  // Alege un sfat aleator
  const randomTip = dailyTips[Math.floor(Math.random() * dailyTips.length)];

  return (
    <DashboardContainer>
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