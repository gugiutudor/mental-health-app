import React from 'react';
import { useQuery } from '@apollo/client';
import { GET_RESOURCES } from '../../graphql/queries';
import { GET_MOOD_ENTRIES } from '../../graphql/queries';
import styled from 'styled-components';

const Container = styled.div`
  margin-bottom: 2rem;
`;

const Title = styled.h2`
  margin-bottom: 1rem;
  color: #2d3748;
  font-size: 1.5rem;
`;

const ResourceList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ResourceCard = styled.div`
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

const ResourceContent = styled.div`
  padding: 1rem;
`;

const ResourceHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
`;

const ResourceTypeIcon = styled.span`
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #e9d8fd;
  color: #6b46c1;
  border-radius: 50%;
  font-size: 1rem;
`;

const ResourceTitle = styled.h3`
  font-size: 1.125rem;
  color: #2d3748;
  margin: 0;
`;

const ResourceDescription = styled.p`
  font-size: 0.875rem;
  color: #4a5568;
  margin: 0.5rem 0;
`;

const ResourceTagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
`;

const ResourceTag = styled.span`
  background-color: #feebc8;
  color: #c05621;
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
`;

const ViewButton = styled.a`
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

const RecommendedResources = ({ limit = 3 }) => {
  // Obține ultimele înregistrări de dispoziție pentru a determina tag-urile relevante
  const { data: moodData } = useQuery(GET_MOOD_ENTRIES, {
    variables: { limit: 5 }
  });
  
  // Extrage tag-uri din înregistrările de dispoziție
  const relevantTags = React.useMemo(() => {
    if (!moodData || !moodData.getMoodEntries || moodData.getMoodEntries.length === 0) {
      return [];
    }
    
    // Extrage toate tag-urile și numără frecvența lor
    const tagCounts = {};
    moodData.getMoodEntries.forEach(entry => {
      if (entry.tags && entry.tags.length > 0) {
        entry.tags.forEach(tag => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      }
    });
    
    // Sortează tag-urile după frecvență și ia primele 3
    return Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([tag]) => tag);
  }, [moodData]);
  
  // Obține media dispozițiilor recente
  const recentMoodAverage = React.useMemo(() => {
    if (!moodData || !moodData.getMoodEntries || moodData.getMoodEntries.length === 0) {
      return 5; // Valoare implicită
    }
    
    const sum = moodData.getMoodEntries.reduce((acc, entry) => acc + entry.mood, 0);
    return sum / moodData.getMoodEntries.length;
  }, [moodData]);
  
  // Obține resursele
  const { loading, error, data } = useQuery(GET_RESOURCES, {
    variables: { 
      tags: relevantTags.length > 0 ? relevantTags : undefined,
      limit
    }
  });

  // Obține icoanele pentru tipurile de resurse
  const getResourceIcon = (type) => {
    switch (type) {
      case 'article':
        return '📄';
      case 'video':
        return '🎬';
      case 'audio':
        return '🎧';
      case 'book':
        return '📚';
      case 'infographic':
        return '📊';
      default:
        return '📋';
    }
  };
  
  // Obține eticheta tipului de resursă
  const getResourceTypeLabel = (type) => {
    const types = {
      'article': 'Articol',
      'video': 'Video',
      'audio': 'Audio',
      'book': 'Carte',
      'infographic': 'Infografic',
      'other': 'Altele'
    };
    
    return types[type] || type;
  };
  
  // Filtrează resursele în funcție de dispoziția curentă
  const filteredResources = React.useMemo(() => {
    if (!data || !data.getResources) return [];
    
    return data.getResources
      .filter(resource => {
        // Verifică dacă resursa este recomandată pentru nivelul de dispoziție curent
        if (!resource.recommendedFor || resource.recommendedFor.length === 0) {
          return true; // Include toate resursele care nu au recomandări specifice
        }
        
        return resource.recommendedFor.some(rec => {
          if (!rec.moodLevel) return true;
          const { min, max } = rec.moodLevel;
          return min <= recentMoodAverage && recentMoodAverage <= max;
        });
      })
      .sort((a, b) => {
        // Sortează după cât de multe tag-uri relevante are fiecare resursă
        const aRelevantTags = a.tags ? a.tags.filter(tag => relevantTags.includes(tag)).length : 0;
        const bRelevantTags = b.tags ? b.tags.filter(tag => relevantTags.includes(tag)).length : 0;
        return bRelevantTags - aRelevantTags;
      })
      .slice(0, limit);
  }, [data, recentMoodAverage, relevantTags]);

  return (
    <Container>
      <Title>Resurse recomandate</Title>
      
      {loading ? (
        <LoadingContainer>
          <p>Se încarcă resursele...</p>
        </LoadingContainer>
      ) : error ? (
        <ErrorContainer>
          <p>Eroare la încărcarea resurselor: {error.message}</p>
        </ErrorContainer>
      ) : filteredResources && filteredResources.length > 0 ? (
        <ResourceList>
          {filteredResources.map(resource => (
            <ResourceCard key={resource.id}>
              <ResourceContent>
                <ResourceHeader>
                  <ResourceTypeIcon>
                    {getResourceIcon(resource.type)}
                  </ResourceTypeIcon>
                  <ResourceTitle>{resource.title}</ResourceTitle>
                </ResourceHeader>
                
                <ResourceDescription>
                  {resource.description.length > 80
                    ? `${resource.description.substring(0, 80)}...`
                    : resource.description}
                </ResourceDescription>
                
                {resource.tags && resource.tags.length > 0 && (
                  <ResourceTagsContainer>
                    {resource.tags.slice(0, 3).map((tag, index) => (
                      <ResourceTag key={index} highlight={relevantTags.includes(tag)}>
                        {tag}
                      </ResourceTag>
                    ))}
                  </ResourceTagsContainer>
                )}
              </ResourceContent>
              
              <ViewButton href={resource.url} target="_blank" rel="noopener noreferrer">
                Accesează {getResourceTypeLabel(resource.type).toLowerCase()}
              </ViewButton>
            </ResourceCard>
          ))}
        </ResourceList>
      ) : (
        <EmptyContainer>
          <p>Nu există resurse recomandate disponibile momentan.</p>
          <p>Adaugă mai multe înregistrări de dispoziție pentru a primi recomandări personalizate.</p>
        </EmptyContainer>
      )}
    </Container>
  );
};

export default RecommendedResources;