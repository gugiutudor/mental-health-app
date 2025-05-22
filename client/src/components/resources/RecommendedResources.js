import React from 'react';
import { useQuery } from '@apollo/client';
import { GET_RECOMMENDED_RESOURCES } from '../../graphql/queries';
import { GET_MOOD_ENTRIES } from '../../graphql/queries';
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

const ResourceList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const ResourceCard = styled.div`
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

const ResourceContent = styled.div`
  padding: 1.5rem;
`;

const ResourceHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const ResourceTypeIcon = styled.span`
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #e9d8fd 0%, #f0e6ff 100%);
  color: #6b46c1;
  border-radius: 50%;
  font-size: 1.2rem;
  box-shadow: 0 3px 6px rgba(107, 70, 193, 0.2);
  border: 1px solid #e9d8fd;
`;

const ResourceTitle = styled.h3`
  font-size: 1.1rem;
  color: var(--primary-color);
  margin: 0;
  font-weight: 700;
  line-height: 1.3;
  flex: 1;
`;

const ResourceScore = styled.div`
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

const ResourceDescription = styled.p`
  font-size: 0.95rem;
  color: var(--text-color);
  margin: 0.75rem 0;
  line-height: 1.5;
  opacity: 0.8;
`;

const ResourceTagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 1rem;
`;

const ResourceTag = styled.span`
  background: ${props => props.highlight 
    ? 'linear-gradient(135deg, #c6f6d5 0%, #9ae6b4 100%)'
    : 'linear-gradient(135deg, #feebc8 0%, #fed7aa 100%)'
  };
  color: ${props => props.highlight ? '#276749' : '#c05621'};
  font-size: 0.85rem;
  padding: 0.4rem 0.8rem;
  border-radius: 15px;
  font-weight: 600;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border: 1px solid ${props => props.highlight ? '#9ae6b4' : '#fed7aa'};
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.15);
  }
`;

const ViewButton = styled.a`
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

const RecommendedResources = ({ limit = 3 }) => {
  // Obține ultimele înregistrări de dispoziție pentru a determina tag-urile relevante
  const { data: moodData } = useQuery(GET_MOOD_ENTRIES, {
    variables: { limit: 5 }
  });
  
  // Obține resursele recomandate direct din backend
  const { loading, error, data } = useQuery(GET_RECOMMENDED_RESOURCES, {
    variables: { limit }
  });
  
  // Extrage tag-uri din înregistrările de dispoziție pentru highlighting
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

  // Obține icoanele pentru tipurile de resurse
  const getResourceIcon = (type) => {
    const icons = {
      'article': '📄',
      'video': '🎬',
      'audio': '🎧',
      'book': '📚',
      'infographic': '📊',
      'other': '📋'
    };
    return icons[type] || '📋';
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

  // Convertește scorul în procentaj pentru afișare
  const getScorePercentage = (score) => {
    return Math.round(score * 100);
  };

  return (
    <Container>
      <SectionHeading>📚 Resurse recomandate pentru tine</SectionHeading>
      
      {loading ? (
        <LoadingContainer>
          <div className="spinner"></div>
          <p>Se încarcă resursele...</p>
        </LoadingContainer>
      ) : error ? (
        <ErrorContainer>
          <h4>⚠️ Eroare la încărcarea resurselor</h4>
          <p>{error.message}</p>
        </ErrorContainer>
      ) : data && data.getRecommendedResources && data.getRecommendedResources.length > 0 ? (
        <ResourceList>
          {data.getRecommendedResources.map(({ resource, score }) => (
            <ResourceCard key={resource.id}>
              <ResourceContent>
                <ResourceHeader>
                  <ResourceTypeIcon>
                    {getResourceIcon(resource.type)}
                  </ResourceTypeIcon>
                  <ResourceTitle>{resource.title}</ResourceTitle>
                  <ResourceScore score={score}>
                    {getScorePercentage(score)}% potrivire
                  </ResourceScore>
                </ResourceHeader>
                
                <ResourceDescription>
                  {resource.description.length > 100
                    ? `${resource.description.substring(0, 100)}...`
                    : resource.description}
                </ResourceDescription>
                
                {resource.tags && resource.tags.length > 0 && (
                  <ResourceTagsContainer>
                    {resource.tags.slice(0, 3).map((tag, index) => (
                      <ResourceTag key={index} highlight={relevantTags.includes(tag)}>
                        {tag}
                      </ResourceTag>
                    ))}
                    {resource.tags.length > 3 && (
                      <ResourceTag>
                        +{resource.tags.length - 3} mai multe
                      </ResourceTag>
                    )}
                  </ResourceTagsContainer>
                )}
                
                <ViewButton href={resource.url} target="_blank" rel="noopener noreferrer">
                  Accesează {getResourceTypeLabel(resource.type).toLowerCase()} →
                </ViewButton>
              </ResourceContent>
            </ResourceCard>
          ))}
        </ResourceList>
      ) : (
        <EmptyContainer>
          <div className="icon">📖</div>
          <h4>Nu există resurse recomandate</h4>
          <p>Adaugă mai multe înregistrări de dispoziție pentru a primi recomandări personalizate.</p>
          <p>Cu mai multe detalii despre starea ta, vom putea sugera resurse mai relevante!</p>
        </EmptyContainer>
      )}
    </Container>
  );
};

export default RecommendedResources;