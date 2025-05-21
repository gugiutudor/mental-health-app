import React, { useState } from 'react';
import { useQuery } from '@apollo/client';
import { GET_RESOURCES } from '../graphql/queries';
import styled from 'styled-components';

const ResourcesContainer = styled.div`
  max-width: 1200px;
  margin: 2rem auto;
  padding: 0 1.5rem;
`;

const PageHeader = styled.div`
  margin-bottom: 2rem;
  
  h1 {
    color: var(--primary-color);
    font-size: 2rem;
    font-weight: 700;
    margin-bottom: 0.75rem;
  }
  
  p {
    color: #718096;
    font-size: 1.1rem;
    line-height: 1.5;
  }
`;

const FiltersSection = styled.div`
  margin-bottom: 2rem;
  background-color: var(--card-bg);
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  
  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const FilterGroup = styled.div`
  margin-bottom: 1.25rem;

  &:last-child {
    margin-bottom: 0;
  }
`;

const FilterLabel = styled.h3`
  margin-bottom: 0.75rem;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--primary-color);
`;

const TypeButtons = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
`;

const TypeButton = styled.button`
  padding: 0.6rem 1.2rem;
  border-radius: 9999px;
  border: 1px solid var(--primary-color);
  background-color: ${props => props.active ? 'var(--primary-color)' : 'transparent'};
  color: ${props => props.active ? 'white' : 'var(--primary-color)'};
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: ${props => props.active ? '0 2px 4px rgba(0, 0, 0, 0.1)' : 'none'};

  &:hover {
    background-color: ${props => props.active ? 'var(--primary-hover)' : 'rgba(79, 70, 229, 0.1)'};
    transform: translateY(-1px);
  }
`;

const TagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  margin-top: 0.75rem;
`;

const TagButton = styled.button`
  padding: 0.4rem 0.8rem;
  border-radius: 9999px;
  border: 1px solid var(--accent-color);
  background-color: ${props => props.active ? 'var(--accent-color)' : 'transparent'};
  color: ${props => props.active ? 'white' : 'var(--accent-color)'};
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: ${props => props.active ? 'var(--accent-hover)' : 'rgba(126, 87, 194, 0.1)'};
    transform: translateY(-1px);
  }
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.85rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  margin-top: 0.5rem;
  transition: all 0.2s;
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.2);
  }
`;

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.75rem;
`;

const ResourceCard = styled.div`
  background-color: var(--card-bg);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s, box-shadow 0.3s;
  height: 100%;
  display: flex;
  flex-direction: column;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
  }
`;

const ResourceCardContent = styled.div`
  padding: 1.5rem;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
`;

const ResourceHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
`;

const ResourceTypeIcon = styled.span`
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #e9d8fd;
  color: #6b46c1;
  border-radius: 50%;
  font-size: 1.25rem;
`;

const ResourceTitle = styled.h3`
  font-size: 1.25rem;
  color: var(--primary-color);
  margin: 0;
  font-weight: 700;
`;

const ResourceDescription = styled.p`
  font-size: 0.95rem;
  color: #4a5568;
  margin: 0.75rem 0;
  line-height: 1.6;
  flex-grow: 1;
`;

const ResourceTagContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  margin-top: 0.75rem;
`;

const ResourceTag = styled.span`
  background-color: #feebc8;
  color: #c05621;
  font-size: 0.85rem;
  padding: 0.35rem 0.7rem;
  border-radius: 9999px;
  font-weight: 500;
`;

const ViewButton = styled.a`
  display: block;
  text-align: center;
  background-color: var(--primary-color);
  color: white;
  font-size: 0.95rem;
  font-weight: 600;
  padding: 0.75rem;
  border-radius: 0 0 8px 8px;
  text-decoration: none;
  transition: all 0.2s;
  margin-top: auto;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  &:hover {
    background-color: var(--primary-hover);
    color: white;
    text-decoration: none;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.15);
  }
`;

const LoadingContainer = styled.div`
  text-align: center;
  padding: 3rem;
  font-size: 1.25rem;
  color: #4a5568;
  background-color: var(--card-bg);
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
`;

const ErrorContainer = styled.div`
  background-color: #fed7d7;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  color: #c53030;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
`;

const NoResultsContainer = styled.div`
  text-align: center;
  padding: 3rem 1.5rem;
  background-color: var(--card-bg);
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  
  h3 {
    color: var(--primary-color);
    font-size: 1.5rem;
    margin-bottom: 1rem;
  }
  
  p {
    color: #718096;
    font-size: 1.1rem;
  }
`;

const Resources = () => {
  // State pentru filtre
  const [selectedType, setSelectedType] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Tipuri de resurse disponibile
  const resourceTypes = [
    { value: '', label: 'Toate' },
    { value: 'article', label: 'Articole' },
    { value: 'video', label: 'Video' },
    { value: 'audio', label: 'Audio' },
    { value: 'book', label: 'Cărți' },
    { value: 'infographic', label: 'Infografice' },
    { value: 'other', label: 'Altele' }
  ];
  
  // Tag-uri comune pentru resurse
  const commonTags = [
    'anxietate', 'depresie', 'mindfulness', 'meditație', 'stres', 
    'somn', 'relații', 'self-care', 'motivație', 'trauma'
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

  return (
    <ResourcesContainer>
      <PageHeader>
        <h1>Resurse pentru sănătate mentală</h1>
        <p>Explorează resurse valoare care te ajută să înțelegi și să-ți îmbunătățești starea emoțională.</p>
      </PageHeader>
      
      <FiltersSection>
        <FilterGroup>
          <FilterLabel>Filtrează după tip</FilterLabel>
          <TypeButtons>
            {resourceTypes.map(type => (
              <TypeButton 
                key={type.value} 
                active={selectedType === type.value}
                onClick={() => handleTypeChange(type.value)}
              >
                {type.label}
              </TypeButton>
            ))}
          </TypeButtons>
        </FilterGroup>
        
        <FilterGroup>
          <FilterLabel>Filtrează după tag-uri</FilterLabel>
          <TagsContainer>
            {commonTags.map(tag => (
              <TagButton 
                key={tag} 
                active={selectedTags.includes(tag)}
                onClick={() => handleTagToggle(tag)}
              >
                {tag}
              </TagButton>
            ))}
          </TagsContainer>
        </FilterGroup>
        
        <FilterGroup>
          <FilterLabel htmlFor="searchResources">Caută în resurse</FilterLabel>
          <SearchInput
            id="searchResources"
            type="text"
            placeholder="Introdu cuvinte cheie..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </FilterGroup>
      </FiltersSection>
      
      {loading ? (
        <LoadingContainer>
          <p>Se încarcă resursele...</p>
        </LoadingContainer>
      ) : error ? (
        <ErrorContainer>
          <p>Eroare la încărcarea resurselor: {error.message}</p>
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
                  {resource.description && resource.description.length > 120
                    ? `${resource.description.substring(0, 120)}...`
                    : resource.description}
                </ResourceDescription>
                
                {resource.tags && resource.tags.length > 0 && (
                  <ResourceTagContainer>
                    {resource.tags.slice(0, 3).map((tag, index) => (
                      <ResourceTag key={index}>{tag}</ResourceTag>
                    ))}
                    {resource.tags.length > 3 && (
                      <ResourceTag>+{resource.tags.length - 3}</ResourceTag>
                    )}
                  </ResourceTagContainer>
                )}
              </ResourceCardContent>
              
              <ViewButton 
                href={resource.url} 
                target="_blank" 
                rel="noopener noreferrer"
              >
                Accesează resursa
              </ViewButton>
            </ResourceCard>
          ))}
        </GridContainer>
      ) : (
        <NoResultsContainer>
          <h3>Nu am găsit resurse</h3>
          <p>Nu există resurse disponibile pentru filtrele selectate.</p>
        </NoResultsContainer>
      )}
    </ResourcesContainer>
  );
};

export default Resources;