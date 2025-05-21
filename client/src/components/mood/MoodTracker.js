import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { CREATE_MOOD_ENTRY } from '../../graphql/mutations';
import { GET_MOOD_ENTRIES } from '../../graphql/queries';
import styled from 'styled-components';

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
`;

const Label = styled.label`
  font-weight: 600;
  color: #4a5568;
  font-size: 1rem;
`;

const MoodSlider = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const SliderContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const Slider = styled.input`
  flex-grow: 1;
  -webkit-appearance: none;
  appearance: none;
  height: 8px;
  background: #e2e8f0;
  border-radius: 4px;
  outline: none;

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 22px;
    height: 22px;
    background: var(--primary-color);
    border-radius: 50%;
    cursor: pointer;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    transition: all 0.2s;
  }

  &::-webkit-slider-thumb:hover {
    transform: scale(1.15);
    background: var(--primary-hover);
  }

  &::-moz-range-thumb {
    width: 22px;
    height: 22px;
    background: var(--primary-color);
    border-radius: 50%;
    cursor: pointer;
    border: none;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    transition: all 0.2s;
  }
  
  &::-moz-range-thumb:hover {
    transform: scale(1.15);
    background: var(--primary-hover);
  }
`;

const MoodValue = styled.span`
  font-weight: 600;
  color: var(--primary-color);
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(79, 70, 229, 0.1);
  border-radius: 50%;
  font-size: 1.125rem;
`;

const TextArea = styled.textarea`
  padding: 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  min-height: 120px;
  resize: vertical;
  transition: all 0.2s;
  background-color: var(--card-bg);
  color: var(--text-color);
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.2);
  }
`;

const FactorsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
  
  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const FactorGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const SubmitButton = styled.button`
  background-color: var(--primary-color);
  color: white;
  padding: 0.85rem;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  &:hover {
    background-color: var(--primary-hover);
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }

  &:disabled {
    background-color: #a0aec0;
    cursor: not-allowed;
  }
`;

const ErrorText = styled.div`
  color: #e53e3e;
  font-size: 0.9rem;
`;

const SuccessMessage = styled.div`
  background-color: #c6f6d5;
  color: #276749;
  padding: 1.25rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &::before {
    content: '✓';
    font-size: 1.25rem;
    font-weight: 700;
  }
`;

const TagsInput = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const TagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  margin-top: 0.5rem;
`;

const TagInputContainer = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const TagInput = styled.input`
  flex-grow: 1;
  padding: 0.85rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.2s;
  background-color: var(--card-bg);
  color: var(--text-color);
  
  &:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.2);
  }
`;

const TagButton = styled.button`
  background-color: var(--primary-color);
  color: white;
  padding: 0 1.25rem;
  border: none;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  &:hover {
    background-color: var(--primary-hover);
    transform: translateY(-1px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.15);
  }
`;

const Tag = styled.span`
  background-color: #e9d8fd;
  color: #6b46c1;
  font-size: 0.9rem;
  padding: 0.4rem 0.85rem;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  transition: all 0.2s;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
`;

const RemoveTagButton = styled.button`
  background: none;
  border: none;
  color: #6b46c1;
  font-size: 1.1rem;
  padding: 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;

  &:hover {
    color: #553c9a;
  }
`;

const MoodExpressionContainer = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 0 0.5rem;
  margin-bottom: 0.5rem;
`;

const MoodExpression = styled.span`
  font-size: 1.5rem;
`;

const MoodTracker = () => {
  const [success, setSuccess] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [createMoodEntry, { loading }] = useMutation(CREATE_MOOD_ENTRY, {
    refetchQueries: [
      { query: GET_MOOD_ENTRIES, variables: { limit: 7 } },
      { query: GET_MOOD_ENTRIES, variables: { limit: 30 } }
    ],
    onError: (error) => {
      console.error('Eroare la salvarea înregistrării:', error);
      formik.setFieldError('submit', error.message || 'A apărut o eroare la salvarea înregistrării');
    }
  });

  const formik = useFormik({
    initialValues: {
      mood: 5,
      notes: '',
      factors: {
        sleep: 3,
        stress: 3,
        activity: 3,
        social: 3
      },
      tags: []
    },
    validationSchema: Yup.object({
      mood: Yup.number()
        .required('Nivelul dispoziției este obligatoriu')
        .min(1, 'Minim 1')
        .max(10, 'Maxim 10'),
      notes: Yup.string(),
      factors: Yup.object({
        sleep: Yup.number().min(1).max(5),
        stress: Yup.number().min(1).max(5),
        activity: Yup.number().min(1).max(5),
        social: Yup.number().min(1).max(5)
      }),
      tags: Yup.array().of(Yup.string())
    }),
    onSubmit: async (values, { resetForm }) => {
      try {
        await createMoodEntry({
          variables: {
            input: {
              mood: parseInt(values.mood),
              notes: values.notes,
              factors: {
                sleep: parseInt(values.factors.sleep),
                stress: parseInt(values.factors.stress),
                activity: parseInt(values.factors.activity),
                social: parseInt(values.factors.social)
              },
              tags: values.tags
            }
          }
        });
        
        setSuccess(true);
        resetForm();
        setTagInput('');
        
        // Ascunde mesajul de succes după 3 secunde
        setTimeout(() => {
          setSuccess(false);
        }, 3000);
      } catch (error) {
        // Eroarea este gestionată în onError de la mutation
      }
    }
  });

  // Adaugă un tag nou
  const handleAddTag = () => {
    if (tagInput.trim() && !formik.values.tags.includes(tagInput.trim())) {
      formik.setFieldValue('tags', [...formik.values.tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  // Șterge un tag
  const handleRemoveTag = (tagToRemove) => {
    formik.setFieldValue(
      'tags',
      formik.values.tags.filter(tag => tag !== tagToRemove)
    );
  };

  // Handler pentru apăsarea tastei Enter în câmpul de tag
  const handleTagInputKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  // Funcție pentru a afișa emoji-ul potrivit pentru nivelul de dispoziție
  const getMoodEmoji = (mood) => {
    const moodValue = Number(mood);
    if (moodValue <= 2) return '😣';
    if (moodValue <= 4) return '😟';
    if (moodValue <= 5) return '😐';
    if (moodValue <= 7) return '🙂';
    if (moodValue <= 9) return '😄';
    return '😁';
  };

  return (
    <div data-testid="mood-tracker">
      {success && (
        <SuccessMessage>
          Înregistrarea dispoziției a fost salvată cu succes!
        </SuccessMessage>
      )}
      
      <Form onSubmit={formik.handleSubmit}>
        <FormGroup>
          <MoodSlider>
            <Label htmlFor="mood">Cum te simți astăzi? (1-10)</Label>
            <MoodExpressionContainer>
              <MoodExpression>😣</MoodExpression>
              <MoodExpression>😟</MoodExpression>
              <MoodExpression>😐</MoodExpression>
              <MoodExpression>🙂</MoodExpression>
              <MoodExpression>😄</MoodExpression>
              <MoodExpression>😁</MoodExpression>
            </MoodExpressionContainer>
            <SliderContainer>
              <span>1</span>
              <Slider
                id="mood"
                name="mood"
                type="range"
                min="1"
                max="10"
                step="1"
                onChange={formik.handleChange}
                value={formik.values.mood}
              />
              <span>10</span>
              <MoodValue>{formik.values.mood}</MoodValue>
            </SliderContainer>
          </MoodSlider>
          {formik.errors.mood && formik.touched.mood && (
            <ErrorText>{formik.errors.mood}</ErrorText>
          )}
        </FormGroup>

        <FormGroup>
          <Label htmlFor="notes">Note (opțional)</Label>
          <TextArea
            id="notes"
            name="notes"
            onChange={formik.handleChange}
            value={formik.values.notes}
            placeholder="Adaugă detalii despre cum te simți..."
          />
        </FormGroup>

        <FormGroup>
          <Label>Factori de influență</Label>
          <FactorsGrid>
            <FactorGroup>
              <Label htmlFor="factors.sleep">Calitatea somnului</Label>
              <SliderContainer>
                <span>Slabă</span>
                <Slider
                  id="factors.sleep"
                  name="factors.sleep"
                  type="range"
                  min="1"
                  max="5"
                  step="1"
                  onChange={formik.handleChange}
                  value={formik.values.factors.sleep}
                />
                <span>Bună</span>
                <MoodValue>{formik.values.factors.sleep}</MoodValue>
              </SliderContainer>
            </FactorGroup>

            <FactorGroup>
              <Label htmlFor="factors.stress">Nivelul de stres</Label>
              <SliderContainer>
                <span>Ridicat</span>
                <Slider
                  id="factors.stress"
                  name="factors.stress"
                  type="range"
                  min="1"
                  max="5"
                  step="1"
                  onChange={formik.handleChange}
                  value={formik.values.factors.stress}
                />
                <span>Scăzut</span>
                <MoodValue>{formik.values.factors.stress}</MoodValue>
              </SliderContainer>
            </FactorGroup>

            <FactorGroup>
              <Label htmlFor="factors.activity">Activitate fizică</Label>
              <SliderContainer>
                <span>Puțină</span>
                <Slider
                  id="factors.activity"
                  name="factors.activity"
                  type="range"
                  min="1"
                  max="5"
                  step="1"
                  onChange={formik.handleChange}
                  value={formik.values.factors.activity}
                />
                <span>Multă</span>
                <MoodValue>{formik.values.factors.activity}</MoodValue>
              </SliderContainer>
            </FactorGroup>

            <FactorGroup>
              <Label htmlFor="factors.social">Interacțiune socială</Label>
              <SliderContainer>
                <span>Puțină</span>
                <Slider
                  id="factors.social"
                  name="factors.social"
                  type="range"
                  min="1"
                  max="5"
                  step="1"
                  onChange={formik.handleChange}
                  value={formik.values.factors.social}
                />
                <span>Multă</span>
                <MoodValue>{formik.values.factors.social}</MoodValue>
              </SliderContainer>
            </FactorGroup>
          </FactorsGrid>
        </FormGroup>

        <FormGroup>
          <TagsInput>
            <Label htmlFor="tags">Tag-uri (opțional)</Label>
            <TagInputContainer>
              <TagInput
                id="tagInput"
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={handleTagInputKeyPress}
                placeholder="Adaugă un tag (ex: relaxare, muncă)"
              />
              <TagButton type="button" onClick={handleAddTag}>
                Adaugă
              </TagButton>
            </TagInputContainer>
            {formik.values.tags.length > 0 && (
              <TagsContainer>
                {formik.values.tags.map((tag, index) => (
                  <Tag key={index}>
                    {tag}
                    <RemoveTagButton
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                    >
                      ×
                    </RemoveTagButton>
                  </Tag>
                ))}
              </TagsContainer>
            )}
          </TagsInput>
        </FormGroup>

        {formik.errors.submit && (
          <ErrorText>{formik.errors.submit}</ErrorText>
        )}

        <SubmitButton type="submit" disabled={loading}>
          {loading ? 'Se salvează...' : 'Salvează dispoziția'}
        </SubmitButton>
      </Form>
    </div>
  );
};

export default MoodTracker;