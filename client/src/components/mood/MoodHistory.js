// client/src/components/mood/MoodHistory.js - versiunea corectată
import React, { useState, useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { GET_MOOD_ENTRIES, GET_MOOD_STATISTICS } from '../../graphql/queries';
import { format, isValid, parseISO } from 'date-fns';
import { ro } from 'date-fns/locale';
import MoodChart from './MoodChart';
import styled from 'styled-components';

const MoodHistoryContainer = styled.div`
  margin-bottom: 1rem;
`;

const TabsContainer = styled.div`
  display: flex;
  margin-bottom: 1rem;
  border-bottom: 1px solid #e2e8f0;
`;

const TabButton = styled.button`
  padding: 0.5rem 1rem;
  background: none;
  border: none;
  border-bottom: 2px solid ${props => props.active ? '#4c51bf' : 'transparent'};
  color: ${props => props.active ? '#4c51bf' : '#4a5568'};
  font-weight: ${props => props.active ? '600' : '400'};
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    color: #4c51bf;
  }
`;

const LoadingContainer = styled.div`
  text-align: center;
  padding: 1rem;
  color: #4a5568;
`;

const ErrorContainer = styled.div`
  background-color: #fed7d7;
  border-radius: 8px;
  padding: 0.75rem;
  margin-bottom: 1rem;
  color: #c53030;
  font-size: 0.9rem;
`;

const EntryList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-height: 400px;
  overflow-y: auto;
`;

const EntryCard = styled.div`
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 0.75rem;
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
`;

const EntryHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
`;

const EntryDate = styled.span`
  font-size: 0.875rem;
  color: #718096;
`;

const MoodValue = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: #4c51bf;
`;

const EntryNotes = styled.p`
  font-size: 0.875rem;
  margin: 0.5rem 0;
  color: #2d3748;
`;

const EntryFactors = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;
  margin-top: 0.5rem;
  font-size: 0.75rem;
`;

const EntryFactor = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const FactorLabel = styled.span`
  color: #718096;
`;

const FactorValue = styled.span`
  font-weight: 600;
  color: #4a5568;
`;

const TagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
`;

const Tag = styled.span`
  background-color: #e9d8fd;
  color: #6b46c1;
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
`;

const StatisticsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 1rem;
`;

const StatCard = styled.div`
  text-align: center;
  padding: 0.75rem;
  border-radius: 8px;
  background-color: #ebf4ff;
`;

const StatValue = styled.div`
  font-size: 1.25rem;
  font-weight: 700;
  color: #4c51bf;
`;

const StatLabel = styled.div`
  font-size: 0.8rem;
  color: #4a5568;
  margin-top: 0.25rem;
`;

const CorrelationContainer = styled.div`
  margin-top: 1rem;
`;

const CorrelationItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid #e2e8f0;

  &:last-child {
    border-bottom: none;
  }
`;

const CorrelationFactor = styled.span`
  font-weight: 500;
  font-size: 0.875rem;
`;

const CorrelationBar = styled.div`
  height: 8px;
  width: 60%;
  background-color: #e2e8f0;
  border-radius: 4px;
  overflow: hidden;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 50%;
    height: 100%;
    width: ${props => Math.abs(props.value * 50)}%;
    background-color: ${props => props.value >= 0 ? '#48bb78' : '#f56565'};
    transform: ${props => props.value >= 0 ? 'translateX(0)' : 'translateX(-100%)'};
  }
`;

const CorrelationValue = styled.span`
  font-size: 0.8rem;
  font-weight: 600;
  color: ${props => props.value >= 0 ? '#48bb78' : '#f56565'};
`;

const DateRangeContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  align-items: center;
`;

const DateInput = styled.input`
  padding: 0.4rem;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  font-size: 0.85rem;
  width: 125px;
`;

const NoDataMessage = styled.div`
  text-align: center;
  padding: 1.5rem;
  color: #718096;
  background-color: #f7fafc;
  border-radius: 8px;
  font-size: 0.9rem;
`;

// Funcție îmbunătățită pentru formatarea datei
function formatDate(dateString) {
  if (!dateString) return 'Data necunoscută';
  
  try {
    // Încearcă să formateze dacă este deja un obiect Date
    if (dateString instanceof Date) {
      if (isValid(dateString)) {
        return format(dateString, 'EEEE, d MMMM yyyy', { locale: ro });
      }
      return 'Data necunoscută';
    }
    
    // Încearcă cu parseISO pentru string-uri ISO 8601
    const parsedDate = parseISO(dateString);
    if (isValid(parsedDate)) {
      return format(parsedDate, 'EEEE, d MMMM yyyy', { locale: ro });
    }
    
    // Încearcă cu constructorul Date pentru alte formate
    const date = new Date(dateString);
    if (isValid(date) && !isNaN(date.getTime())) {
      return format(date, 'EEEE, d MMMM yyyy', { locale: ro });
    }
    
    // Dacă toate metodele eșuează, returnează un mesaj
    return dateString.toString().substring(0, 10);
  } catch (error) {
    console.error('Eroare la formatarea datei:', error);
    return 'Data necunoscută';
  }
}

const MoodHistory = () => {
  const [activeTab, setActiveTab] = useState('chart');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 zile în urmă
    endDate: new Date().toISOString().split('T')[0] // data curentă
  });
  
  // Obține înregistrările de dispoziție
  const { loading: entriesLoading, error: entriesError, data: entriesData, refetch: refetchEntries } = useQuery(GET_MOOD_ENTRIES, {
    variables: { limit: 30 },
    fetchPolicy: 'network-only' // Forțează refresh-ul datelor
  });
  
  // Obține statisticile de dispoziție
  const { 
    loading: statsLoading, 
    error: statsError, 
    data: statsData, 
    refetch: refetchStats 
  } = useQuery(GET_MOOD_STATISTICS, {
    variables: { 
      startDate: dateRange.startDate,
      endDate: dateRange.endDate
    },
    fetchPolicy: 'network-only'
  });

  // Reîncarcă datele când se schimbă intervalul de date
  useEffect(() => {
    if (dateRange.startDate && dateRange.endDate) {
      refetchStats({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      });
      
      // Refetch entries with same date range
      refetchEntries();
    }
  }, [dateRange.startDate, dateRange.endDate, refetchStats, refetchEntries]);
  
  // Obține eticheta factorului
  const getFactorLabel = (factor) => {
    const factors = {
      'sleep': 'Somn',
      'stress': 'Stres',
      'activity': 'Activitate',
      'social': 'Social'
    };
    
    return factors[factor] || factor;
  };
  
  // Obține emoji pentru nivelul de dispoziție
  const getMoodEmoji = (mood) => {
    const moodValue = Number(mood);
    if (isNaN(moodValue)) return '😐';
    if (moodValue <= 3) return '😞';
    if (moodValue <= 5) return '😐';
    if (moodValue <= 7) return '🙂';
    return '😄';
  };
  
  // Handler pentru schimbarea datei de start
  const handleStartDateChange = (e) => {
    setDateRange({ ...dateRange, startDate: e.target.value });
  };
  
  // Handler pentru schimbarea datei de sfârșit
  const handleEndDateChange = (e) => {
    setDateRange({ ...dateRange, endDate: e.target.value });
  };

  // Filtreză înregistrările în funcție de intervalul de date selectat
  const filteredEntries = React.useMemo(() => {
    if (!entriesData || !entriesData.getMoodEntries) return [];

    return entriesData.getMoodEntries.filter(entry => {
      if (!entry || !entry.date) return false;
      
      // Convertește data înregistrării la un obiect Date
      const entryDate = new Date(entry.date);
      if (!isValid(entryDate)) return false;
      
      // Convertește limitele intervalului la obiecte Date
      const startDateObj = new Date(dateRange.startDate);
      const endDateObj = new Date(dateRange.endDate);
      
      // Ajustează data de sfârșit pentru a include întreaga zi
      endDateObj.setHours(23, 59, 59, 999);
      
      // Verifică dacă data înregistrării este în interval
      return entryDate >= startDateObj && entryDate <= endDateObj;
    });
  }, [entriesData, dateRange.startDate, dateRange.endDate]);

  return (
    <MoodHistoryContainer data-testid="mood-history">
      <TabsContainer>
        <TabButton 
          active={activeTab === 'chart'} 
          onClick={() => setActiveTab('chart')}
        >
          Grafic
        </TabButton>
        <TabButton 
          active={activeTab === 'entries'} 
          onClick={() => setActiveTab('entries')}
        >
          Înregistrări
        </TabButton>
        <TabButton 
          active={activeTab === 'statistics'} 
          onClick={() => setActiveTab('statistics')}
        >
          Statistici
        </TabButton>
      </TabsContainer>
      
      <DateRangeContainer>
        <div>
          <label htmlFor="startDate">De la: </label>
          <DateInput 
            id="startDate" 
            type="date" 
            value={dateRange.startDate}
            onChange={handleStartDateChange}
          />
        </div>
        <div>
          <label htmlFor="endDate">Până la: </label>
          <DateInput 
            id="endDate" 
            type="date" 
            value={dateRange.endDate}
            onChange={handleEndDateChange}
          />
        </div>
      </DateRangeContainer>
      
      {activeTab === 'chart' && (
        <>
          {entriesLoading ? (
            <LoadingContainer>
              <p>Se încarcă datele...</p>
            </LoadingContainer>
          ) : entriesError ? (
            <ErrorContainer>
              <p>Eroare la încărcarea datelor: {entriesError.message}</p>
            </ErrorContainer>
          ) : filteredEntries.length > 0 ? (
            <MoodChart entries={filteredEntries} />
          ) : (
            <NoDataMessage>
              <p>Nu există înregistrări de dispoziție în acest interval.</p>
              <p>Adaugă prima înregistrare folosind formularul de monitorizare a dispoziției.</p>
            </NoDataMessage>
          )}
        </>
      )}
      
      {activeTab === 'entries' && (
        <>
          {entriesLoading ? (
            <LoadingContainer>
              <p>Se încarcă datele...</p>
            </LoadingContainer>
          ) : entriesError ? (
            <ErrorContainer>
              <p>Eroare la încărcarea datelor: {entriesError.message}</p>
            </ErrorContainer>
          ) : filteredEntries.length > 0 ? (
            <EntryList>
              {filteredEntries.map(entry => (
                <EntryCard key={entry.id}>
                  <EntryHeader>
                    <EntryDate>{formatDate(entry.date)}</EntryDate>
                    <MoodValue>
                      {getMoodEmoji(entry.mood)}
                      <span>{entry.mood}/10</span>
                    </MoodValue>
                  </EntryHeader>
                  
                  {entry.notes && (
                    <EntryNotes>{entry.notes}</EntryNotes>
                  )}
                  
                  {entry.factors && (
                    <EntryFactors>
                      {Object.entries(entry.factors)
                        .filter(([key, value]) => key && value !== null && value !== undefined)
                        .map(([factor, value]) => (
                          <EntryFactor key={factor}>
                            <FactorLabel>{getFactorLabel(factor)}:</FactorLabel>
                            <FactorValue>{value}/5</FactorValue>
                          </EntryFactor>
                        ))}
                    </EntryFactors>
                  )}
                  
                  {entry.tags && entry.tags.length > 0 && (
                    <TagsContainer>
                      {entry.tags.map((tag, index) => (
                        <Tag key={index}>{tag}</Tag>
                      ))}
                    </TagsContainer>
                  )}
                </EntryCard>
              ))}
            </EntryList>
          ) : (
            <NoDataMessage>
              <p>Nu există înregistrări de dispoziție în acest interval.</p>
              <p>Adaugă prima înregistrare folosind formularul de monitorizare a dispoziției.</p>
            </NoDataMessage>
          )}
        </>
      )}
      
      {activeTab === 'statistics' && (
        <>
          {statsLoading ? (
            <LoadingContainer>
              <p>Se calculează statisticile...</p>
            </LoadingContainer>
          ) : statsError ? (
            <ErrorContainer>
              <p>Eroare la calcularea statisticilor: {statsError.message}</p>
            </ErrorContainer>
          ) : statsData && statsData.getMoodStatistics ? (
            <>
              <StatisticsGrid>
                <StatCard>
                  <StatValue>{(statsData.getMoodStatistics.averageMood || 0).toFixed(1)}</StatValue>
                  <StatLabel>Dispoziție medie</StatLabel>
                </StatCard>
                <StatCard>
                  <StatValue>
                    {filteredEntries.length}
                  </StatValue>
                  <StatLabel>Înregistrări</StatLabel>
                </StatCard>
                <StatCard>
                  <StatValue>
                    {statsData.getMoodStatistics.moodTrend && statsData.getMoodStatistics.moodTrend.length > 1 
                      ? ((statsData.getMoodStatistics.moodTrend[statsData.getMoodStatistics.moodTrend.length - 1] || 0) - 
                        (statsData.getMoodStatistics.moodTrend[0] || 0)).toFixed(1)
                      : '0.0'}
                  </StatValue>
                  <StatLabel>Tendință</StatLabel>
                </StatCard>
              </StatisticsGrid>
              
              {statsData.getMoodStatistics.factorCorrelations && statsData.getMoodStatistics.factorCorrelations.length > 0 && (
                <CorrelationContainer>
                  <h4>Corelații între factori și dispoziție</h4>
                  
                  {statsData.getMoodStatistics.factorCorrelations.map(correlation => (
                    <CorrelationItem key={correlation.factor}>
                      <CorrelationFactor>{getFactorLabel(correlation.factor)}</CorrelationFactor>
                      <CorrelationBar value={correlation.correlation || 0} />
                      <CorrelationValue value={correlation.correlation || 0}>
                        {(correlation.correlation || 0).toFixed(2)}
                      </CorrelationValue>
                    </CorrelationItem>
                  ))}
                  
                  <p style={{ fontSize: '0.875rem', marginTop: '1rem', color: '#718096' }}>
                    * Valorile pozitive indică o corelație pozitivă (factorul îmbunătățește dispoziția),
                    valorile negative indică o corelație negativă (factorul înrăutățește dispoziția).
                  </p>
                </CorrelationContainer>
              )}
            </>
          ) : (
            <NoDataMessage>
              <p>Nu există date suficiente pentru calcularea statisticilor.</p>
              <p>Adaugă mai multe înregistrări pentru a vedea tendințe și corelații.</p>
            </NoDataMessage>
          )}
        </>
      )}
    </MoodHistoryContainer>
  );
};

export default MoodHistory;