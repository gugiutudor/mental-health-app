import React, { useState } from 'react';
import { useQuery } from '@apollo/client';
import { GET_RESOURCES } from '../graphql/queries';
import styled from 'styled-components';

const ResourcesContainer = styled.div`
  max-width: 1200px;
  margin: 2rem auto;
  padding: 0 1rem;
`;

const FiltersSection = styled.div`
  margin-bottom: 2rem;
  background-color: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const FilterGroup = styled.div`
  margin-bottom: 1rem;

  &:last-child {
    margin-bottom: 0;
  }
`;

const FilterLabel = styled.h3`
  margin-bottom: 0.5rem;
  font-size: 1rem;
`;

const TypeButtons = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const TypeButton = styled.button`
  padding: 0.5rem 1rem;
  border-radius: 9999px;
  border: 1px solid #4c51bf;
  background-color: ${props => props.active ? '#4c51bf' : 'transparent'};
  color: ${props => props.active ? 'white' : '#4c51bf'};
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: ${props => props.active ? '#434190' : '#edf2f7'};
  }
`;

const TagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
`;

const TagButton = styled.button`
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  border: 1px solid #805ad5;
  background-color: ${props => props.active ? '#805ad5' : 'transparent'};
  color: ${props => props.active ? 'white' : '#805ad5'};
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: ${props => props.active ? '#6b46c1' : '#f7fafc'};
  }
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  font-size: 1rem;
  margin-top: 0.5rem;
`;

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
`;

const ResourceCard = styled.div`
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
  height: 100%;
  display: flex;
  flex-direction: column;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
  }
`;

const ResourceCardContent = styled.div`
  padding: 1.5rem;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
`;

const ResourceTitle = styled.h3`
  font-size: 1.25rem;
  margin-bottom: 0.5rem;
  color: #2d3748;
`;

const ResourceDescription = styled.p`
  font-size: 0.875rem;
  color: #4a5568;
  margin-bottom: 1rem;
  line-height: 1.5;
  flex-grow: 1;
`;

const ResourceTagContainer = styled.div`
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

const ResourceTypeTag = styled.span`
  background-color: #e9d8fd;
  color: #6b46c1;
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 9999px;
  margin-right: 0.5rem;
`;

const ViewButton = styled.a`
  display: inline-block;
  background-color: #4c51bf;
  color: white;
  font-size: 0.875rem;
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  text-decoration: none;
  margin-top: 1rem;
  transition: background-color 0.2s;
  text-align: center;

  &:hover {
    background-color: #434190;
    color: white;
    text-decoration: none;
  }
`;

const LoadingContainer = styled.div`
  text-align: center;
  padding: 2rem;
  font-size: 1.125rem;
  color: #4a5568;
`;

const ErrorContainer = styled.div`
  background-color: #fed7d7;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1.5rem;
  color: #c53030;
`;

const NoResultsContainer = styled.div`
  text-align: center;
  padding: 2rem;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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

  // Filtrează resursele în funcție de căutare
  const filteredResources = data?.getResources.filter(resource => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      resource.title.toLowerCase().includes(query) ||
      resource.description.toLowerCase().includes(query) ||
      resource.tags.some(tag => tag.toLowerCase().includes(query))
    );
  });

  return (
    <ResourcesContainer>
      <h1 style={{ marginBottom: '1.5rem' }}>Resurse pentru sănătate mentală</h1>
      
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
                <ResourceTitle>{resource.title}</ResourceTitle>
                <ResourceDescription>
                  {resource.description.length > 120
                    ? `${resource.description.substring(0, 120)}...`
                    : resource.description}
                </ResourceDescription>
                
                <div>
                  <ResourceTypeTag>
                    {resourceTypes.find(t => t.value === resource.type)?.label || resource.type}
                  </ResourceTypeTag>
                  
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
                  
                  <ViewButton href={resource.url} target="_blank" rel="noopener noreferrer">
                    Accesează resursa
                  </ViewButton>
                </div>
              </ResourceCardContent>
            </ResourceCard>
          ))}
        </GridContainer>
      ) : (
        <NoResultsContainer>
          <p>Nu există resurse disponibile pentru filtrele selectate.</p>
        </NoResultsContainer>
      )}
    </ResourcesContainer>
  );
};

export default Resources;