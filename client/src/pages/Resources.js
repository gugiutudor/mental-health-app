import React, { useState } from 'react';
import { useQuery } from '@apollo/client';
import { GET_RESOURCES } from '../graphql/queries';
import { useAuth } from '../context/AuthContext';
import styled from 'styled-components';

const ResourcesContainer = styled.div`
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
  margin-bottom: 2rem;

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

const TypeButtons = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const TypeButton = styled.button`
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

const TagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 1rem;
`;

const TagButton = styled.button`
  padding: 0.5rem 1rem;
  border-radius: 20px;
  border: 2px solid #9f7aea;
  background-color: ${props => props.active ? '#9f7aea' : 'transparent'};
  color: ${props => props.active ? 'white' : '#9f7aea'};
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: ${props => props.active ? '0 3px 8px rgba(159, 122, 234, 0.3)' : '0 2px 4px rgba(0, 0, 0, 0.05)'};

  &:hover {
    background-color: ${props => props.active ? '#805ad5' : 'rgba(159, 122, 234, 0.1)'};
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(159, 122, 234, 0.2);
  }
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 1rem 1.5rem;
  border: 2px solid var(--border-color);
  border-radius: 25px;
  font-size: 1rem;
  margin-top: 1rem;
  transition: all 0.3s ease;
  background-color: var(--card-bg);
  color: var(--text-color);
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.1);
    transform: translateY(-2px);
  }

  &::placeholder {
    color: #a0aec0;
  }
`;

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 2rem;
`;

const ResourceCard = styled.div`
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

const ResourceCardContent = styled.div`
  padding: 2rem;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
`;

const ResourceHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const ResourceTypeIcon = styled.span`
  width: 3rem;
  height: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #e9d8fd 0%, #f0e6ff 100%);
  color: #6b46c1;
  border-radius: 50%;
  font-size: 1.5rem;
  box-shadow: 0 4px 8px rgba(107, 70, 193, 0.2);
`;

const ResourceTitle = styled.h3`
  font-size: 1.4rem;
  color: var(--primary-color);
  margin: 0;
  font-weight: 700;
  line-height: 1.3;
`;

const ResourceDescription = styled.p`
  font-size: 1rem;
  color: var(--text-color);
  margin: 1rem 0;
  line-height: 1.6;
  flex-grow: 1;
  opacity: 0.8;
`;

const ResourceTagContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 1rem;
`;

const ResourceTag = styled.span`
  background: linear-gradient(135deg, #feebc8 0%, #fed7aa 100%);
  color: #c05621;
  font-size: 0.9rem;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: 600;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  ${props => props.highlight && `
    background: linear-gradient(135deg, #c6f6d5 0%, #9ae6b4 100%);
    color: #276749;
  `}
`;

const ViewButton = styled.a`
  display: block;
  text-align: center;
  background: linear-gradient(135deg, var(--primary-color) 0%, #5146e2 100%);
  color: white;
  font-size: 1rem;
  font-weight: 600;
  padding: 1rem 2rem;
  border-radius: 25px;
  text-decoration: none;
  transition: all 0.3s ease;
  margin-top: auto;
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
  border: none;
  cursor: pointer;

  &:hover {
    background: linear-gradient(135deg, var(--primary-hover) 0%, #4338ca 100%);
    color: white;
    text-decoration: none;
    box-shadow: 0 6px 16px rgba(79, 70, 229, 0.4);
    transform: translateY(-2px);
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

const Resources = () => {
  // State pentru filtre
  const [selectedType, setSelectedType] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const { currentUser } = useAuth();
  
  // Tipuri de resurse disponibile
  const resourceTypes = [
    { value: '', label: 'Toate', icon: '🌟' },
    { value: 'article', label: 'Articole', icon: '📄' },
    { value: 'video', label: 'Video', icon: '🎬' },
    { value: 'audio', label: 'Audio', icon: '🎧' },
    { value: 'book', label: 'Cărți', icon: '📚' },
    { value: 'infographic', label: 'Infografice', icon: '📊' },
    { value: 'other', label: 'Altele', icon: '📋' }
  ];
  
  // Tag-uri comune pentru resurse
  const commonTags = [
    { name: 'anxietate', icon: '😰' },
    { name: 'depresie', icon: '😔' },
    { name: 'mindfulness', icon: '🧘' },
    { name: 'meditație', icon: '🕯️' },
    { name: 'stres', icon: '😤' },
    { name: 'somn', icon: '😴' },
    { name: 'relații', icon: '💞' },
    { name: 'self-care', icon: '💆' },
    { name: 'motivație', icon: '💪' },
    { name: 'trauma', icon: '🩹' }
  ];
  
  // Obține resursele
  const { loading, error, data } = useQuery(GET_RESOURCES, {
    variables: { 
      type: selectedType || undefined,
      tags: selectedTags.length > 0 ? selectedTags : undefined,
      limit: 50
    }
  });

  // Toggle selectarea unui tip
  const handleTypeChange = (type) => {
    setSelectedType(type === selectedType ? '' : type);
  };

  // Toggle selectarea unui tag
  const handleTagToggle = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  // Filtrează resursele în funcție de căutare - cu verificări pentru null/undefined
  const filteredResources = React.useMemo(() => {
    // Verifică dacă data și getResources există
    if (!data || !data.getResources) return [];
    
    return data.getResources.filter(resource => {
      if (!resource) return false;
      if (!searchQuery) return true;
      
      const query = searchQuery.toLowerCase();
      return (
        (resource.title && resource.title.toLowerCase().includes(query)) ||
        (resource.description && resource.description.toLowerCase().includes(query)) ||
        (resource.tags && Array.isArray(resource.tags) && 
         resource.tags.some(tag => tag && tag.toLowerCase().includes(query)))
      );
    });
  }, [data, searchQuery]);
  
  // Obține icoanele pentru tipurile de resurse
  const getResourceIcon = (type) => {
    const typeObj = resourceTypes.find(t => t.value === type);
    return typeObj ? typeObj.icon : '📋';
  };

  // Obține eticheta tipului de resursă
  const getResourceTypeLabel = (type) => {
    const typeObj = resourceTypes.find(t => t.value === type);
    return typeObj ? typeObj.label : type;
  };

  // Calculează statistici
  const totalResources = filteredResources.length;
  const typeCount = selectedType ? 1 : resourceTypes.length - 1;
  const tagCount = selectedTags.length || commonTags.length;

  return (
    <ResourcesContainer>
      <PageHeader>
        <h1>Resurse pentru sănătate mentală</h1>
        <p>Explorează o colecție curată de resurse valoroase care te ajută să înțelegi și să-ți îmbunătățești starea emoțională prin conținut de calitate.</p>
      </PageHeader>

      {currentUser && (
        <WelcomeSection>
          <UserGreeting>Bine ai venit, {currentUser.firstName}! 📚</UserGreeting>
          <GreetingText>Descoperă resurse educaționale și de suport adaptate nevoilor tale de dezvoltare personală.</GreetingText>
        </WelcomeSection>
      )}

      <StatsContainer>
        <StatCard>
          <StatValue>{totalResources}</StatValue>
          <StatLabel>Resurse disponibile</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{typeCount}</StatValue>
          <StatLabel>Tipuri de conținut</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{tagCount}</StatValue>
          <StatLabel>Subiecte acoperite</StatLabel>
        </StatCard>
      </StatsContainer>
      
      <FiltersSection>
        <FilterGroup>
          <FilterLabel>Filtrează după tip de conținut</FilterLabel>
          <TypeButtons>
            {resourceTypes.map(type => (
              <TypeButton 
                key={type.value} 
                active={selectedType === type.value}
                onClick={() => handleTypeChange(type.value)}
              >
                <span style={{ marginRight: '0.5rem' }}>{type.icon}</span>
                {type.label}
              </TypeButton>
            ))}
          </TypeButtons>
        </FilterGroup>
        
        <FilterGroup>
          <FilterLabel>Filtrează după subiecte</FilterLabel>
          <TagsContainer>
            {commonTags.map(tag => (
              <TagButton 
                key={tag.name} 
                active={selectedTags.includes(tag.name)}
                onClick={() => handleTagToggle(tag.name)}
              >
                <span style={{ marginRight: '0.5rem' }}>{tag.icon}</span>
                {tag.name}
              </TagButton>
            ))}
          </TagsContainer>
        </FilterGroup>
        
        <FilterGroup>
          <FilterLabel htmlFor="searchResources">Caută în resurse</FilterLabel>
          <SearchInput
            id="searchResources"
            type="text"
            placeholder="🔍 Introdu cuvinte cheie pentru a găsi resurse relevante..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </FilterGroup>
      </FiltersSection>
      
      {loading ? (
        <LoadingContainer>
          <div className="spinner"></div>
          <p>Se încarcă resursele...</p>
        </LoadingContainer>
      ) : error ? (
        <ErrorContainer>
          <h3>⚠️ Eroare la încărcarea resurselor</h3>
          <p>{error.message}</p>
        </ErrorContainer>
      ) : filteredResources && filteredResources.length > 0 ? (
        <GridContainer>
          {filteredResources.map(resource => (
            <ResourceCard key={resource.id}>
              <ResourceCardContent>
                <ResourceHeader>
                  <ResourceTypeIcon>
                    {getResourceIcon(resource.type)}
                  </ResourceTypeIcon>
                  <ResourceTitle>{resource.title}</ResourceTitle>
                </ResourceHeader>
                
                <ResourceDescription>
                  {resource.description && resource.description.length > 140
                    ? `${resource.description.substring(0, 140)}...`
                    : resource.description}
                </ResourceDescription>
                
                {resource.tags && resource.tags.length > 0 && (
                  <ResourceTagContainer>
                    {resource.tags.slice(0, 3).map((tag, index) => {
                      const tagObj = commonTags.find(t => t.name === tag);
                      return (
                        <ResourceTag 
                          key={index}
                          highlight={selectedTags.includes(tag)}
                        >
                          {tagObj && <span style={{ marginRight: '0.5rem' }}>{tagObj.icon}</span>}
                          {tag}
                        </ResourceTag>
                      );
                    })}
                    {resource.tags.length > 3 && (
                      <ResourceTag>+{resource.tags.length - 3} mai multe</ResourceTag>
                    )}
                  </ResourceTagContainer>
                )}
              </ResourceCardContent>
              
              <ViewButton 
                href={resource.url} 
                target="_blank" 
                rel="noopener noreferrer"
              >
                Accesează {getResourceTypeLabel(resource.type).toLowerCase()} →
              </ViewButton>
            </ResourceCard>
          ))}
        </GridContainer>
      ) : (
        <NoResultsContainer>
          <div className="icon">🔍</div>
          <h3>Nu am găsit resurse</h3>
          <p>Nu există resurse disponibile pentru filtrele selectate. Încearcă să modifici criteriile de căutare sau să selectezi alte categorii.</p>
        </NoResultsContainer>
      )}
    </ResourcesContainer>
  );
};

export default Resources;