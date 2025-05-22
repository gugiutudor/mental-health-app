import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { CREATE_MOOD_ENTRY } from '../../graphql/mutations';
import { GET_MOOD_ENTRIES } from '../../graphql/queries';
import styled from 'styled-components';

const MoodTrackerContainer = styled.div`
  position: relative;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Label = styled.label`
  font-weight: 700;
  color: var(--primary-color);
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const MoodSection = styled.div`
  background: linear-gradient(135deg, rgba(79, 70, 229, 0.05) 0%, rgba(129, 140, 248, 0.05) 100%);
  border-radius: 16px;
  padding: 2rem;
  border: 1px solid rgba(79, 70, 229, 0.1);
  margin-bottom: 1rem;
`;

const MoodExpressionContainer = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 0 1rem;
  margin-bottom: 1.5rem;
`;

const MoodExpression = styled.span`
  font-size: 2rem;
  transition: all 0.3s ease;
  cursor: pointer;
  
  &:hover {
    transform: scale(1.2);
  }
`;

const SliderContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  background-color: var(--card-bg);
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border: 1px solid var(--border-color);
`;

const SliderLabel = styled.span`
  font-size: 1rem;
  font-weight: 600;
  color: #718096;
  min-width: 20px;
  text-align: center;
`;

const Slider = styled.input`
  flex-grow: 1;
  -webkit-appearance: none;
  appearance: none;
  height: 8px;
  background: linear-gradient(to right, #fed7d7 0%, #feebc8 25%, #e2e8f0 50%, #c6f6d5 75%, #9ae6b4 100%);
  border-radius: 4px;
  outline: none;
  transition: all 0.3s ease;

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 28px;
    height: 28px;
    background: linear-gradient(135deg, var(--primary-color) 0%, #5146e2 100%);
    border-radius: 50%;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(79, 70, 229, 0.4);
    transition: all 0.3s ease;
    border: 3px solid white;
  }

  &::-webkit-slider-thumb:hover {
    transform: scale(1.2);
    box-shadow: 0 6px 16px rgba(79, 70, 229, 0.5);
  }

  &::-moz-range-thumb {
    width: 28px;
    height: 28px;
    background: linear-gradient(135deg, var(--primary-color) 0%, #5146e2 100%);
    border-radius: 50%;
    cursor: pointer;
    border: 3px solid white;
    box-shadow: 0 4px 12px rgba(79, 70, 229, 0.4);
    transition: all 0.3s ease;
  }
  
  &::-moz-range-thumb:hover {
    transform: scale(1.2);
    box-shadow: 0 6px 16px rgba(79, 70, 229, 0.5);
  }
`;

const MoodValue = styled.span`
  font-weight: 800;
  width: 3.5rem;
  height: 3.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--primary-color) 0%, #5146e2 100%);
  color: white;
  border-radius: 50%;
  font-size: 1.4rem;
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
  transition: all 0.3s ease;
  
  &:hover {
    transform: scale(1.1);
    box-shadow: 0 6px 16px rgba(79, 70, 229, 0.4);
  }
`;

const TextArea = styled.textarea`
  padding: 1.5rem;
  border: 2px solid var(--border-color);
  border-radius: 12px;
  font-size: 1rem;
  min-height: 120px;
  resize: vertical;
  transition: all 0.3s ease;
  background-color: var(--card-bg);
  color: var(--text-color);
  font-family: inherit;
  
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

const FactorsSection = styled.div`
  background: linear-gradient(135deg, rgba(244, 244, 255, 0.3) 0%, rgba(228, 248, 255, 0.3) 100%);
  border-radius: 16px;
  padding: 2rem;
  border: 1px solid rgba(79, 70, 229, 0.1);
`;

const FactorsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-top: 1rem;
`;

const FactorGroup = styled.div`
  background-color: var(--card-bg);
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border: 1px solid var(--border-color);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const FactorLabel = styled.label`
  font-weight: 600;
  color: var(--primary-color);
  font-size: 1rem;
  margin-bottom: 1rem;
  display: block;
`;

const FactorSliderContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const FactorSliderLabel = styled.span`
  font-size: 0.9rem;
  font-weight: 500;
  color: #718096;
  min-width: 50px;
  text-align: center;
`;

const FactorSlider = styled.input`
  flex-grow: 1;
  -webkit-appearance: none;
  appearance: none;
  height: 6px;
  background: #e2e8f0;
  border-radius: 3px;
  outline: none;
  transition: all 0.3s ease;

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 20px;
    height: 20px;
    background: linear-gradient(135deg, var(--primary-color) 0%, #5146e2 100%);
    border-radius: 50%;
    cursor: pointer;
    box-shadow: 0 2px 6px rgba(79, 70, 229, 0.3);
    transition: all 0.2s;
  }

  &::-webkit-slider-thumb:hover {
    transform: scale(1.15);
    box-shadow: 0 3px 8px rgba(79, 70, 229, 0.4);
  }

  &::-moz-range-thumb {
    width: 20px;
    height: 20px;
    background: linear-gradient(135deg, var(--primary-color) 0%, #5146e2 100%);
    border-radius: 50%;
    cursor: pointer;
    border: none;
    box-shadow: 0 2px 6px rgba(79, 70, 229, 0.3);
    transition: all 0.2s;
  }
  
  &::-moz-range-thumb:hover {
    transform: scale(1.15);
    box-shadow: 0 3px 8px rgba(79, 70, 229, 0.4);
  }
`;

const FactorValue = styled.span`
  font-weight: 700;
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--primary-color) 0%, #5146e2 100%);
  color: white;
  border-radius: 50%;
  font-size: 1rem;
  box-shadow: 0 2px 6px rgba(79, 70, 229, 0.3);
`;

const TagsSection = styled.div`
  background: linear-gradient(135deg, rgba(156, 240, 224, 0.1) 0%, rgba(204, 251, 241, 0.1) 100%);
  border-radius: 16px;
  padding: 2rem;
  border: 1px solid rgba(16, 185, 129, 0.1);
`;

const TagInputContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
`;

const TagInput = styled.input`
  flex-grow: 1;
  padding: 1rem 1.5rem;
  border: 2px solid var(--border-color);
  border-radius: 25px;
  font-size: 1rem;
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

const TagButton = styled.button`
  background: linear-gradient(135deg, var(--primary-color) 0%, #5146e2 100%);
  color: white;
  padding: 1rem 2rem;
  border: none;
  border-radius: 25px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 3px 8px rgba(79, 70, 229, 0.3);
  white-space: nowrap;

  &:hover {
    background: linear-gradient(135deg, var(--primary-hover) 0%, #4338ca 100%);
    transform: translateY(-2px);
    box-shadow: 0 5px 12px rgba(79, 70, 229, 0.4);
  }

  &:active {
    transform: translateY(0);
  }
`;

const TagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-top: 1.5rem;
`;

const Tag = styled.span`
  background: linear-gradient(135deg, #e9d8fd 0%, #f0e6ff 100%);
  color: #6b46c1;
  font-size: 0.95rem;
  padding: 0.6rem 1.2rem;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 600;
  box-shadow: 0 2px 6px rgba(107, 70, 193, 0.2);
  border: 1px solid #e9d8fd;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(107, 70, 193, 0.3);
  }
`;

const RemoveTagButton = styled.button`
  background: none;
  border: none;
  color: #6b46c1;
  font-size: 1.2rem;
  padding: 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  transition: all 0.2s ease;

  &:hover {
    background-color: rgba(107, 70, 193, 0.2);
    color: #553c9a;
  }
`;

const SubmitButton = styled.button`
  background: linear-gradient(135deg, var(--primary-color) 0%, #5146e2 100%);
  color: white;
  padding: 1.2rem 2rem;
  border: none;
  border-radius: 25px;
  font-size: 1.2rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
  margin-top: 1rem;
  width: 100%;
  position: relative;
  overflow: hidden;

  &:hover {
    background: linear-gradient(135deg, var(--primary-hover) 0%, #4338ca 100%);
    transform: translateY(-3px);
    box-shadow: 0 6px 16px rgba(79, 70, 229, 0.4);
  }

  &:disabled {
    background: linear-gradient(135deg, #a0aec0 0%, #9ca3af 100%);
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }

  &:active {
    transform: translateY(-1px);
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.5s;
  }

  &:hover::before {
    left: 100%;
  }
`;

const ErrorText = styled.div`
  color: #e53e3e;
  font-size: 0.95rem;
  margin-top: 0.5rem;
  font-weight: 500;
`;

const SuccessMessage = styled.div`
  background: linear-gradient(135deg, #c6f6d5 0%, #9ae6b4 100%);
  color: #276749;
  padding: 1.5rem;
  border-radius: 16px;
  margin-bottom: 2rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 4px 12px rgba(39, 103, 73, 0.2);
  border: 1px solid #9ae6b4;
  
  .success-icon {
    font-size: 1.5rem;
  }
  
  .success-text {
    flex: 1;
  }
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
        
        // Ascunde mesajul de succes după 4 secunde
        setTimeout(() => {
          setSuccess(false);
        }, 4000);
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
    <MoodTrackerContainer data-testid="mood-tracker">
      {success && (
        <SuccessMessage>
          <span className="success-icon">🎉</span>
          <div className="success-text">
            <strong>Înregistrarea dispoziției a fost salvată cu succes!</strong>
            <br />
            Continuă să îți monitorizezi starea pentru o perspectivă completă.
          </div>
        </SuccessMessage>
      )}
      
      <Form onSubmit={formik.handleSubmit}>
        <MoodSection>
          <FormGroup>
            <Label htmlFor="mood">
              <span>😊</span>
              Cum te simți astăzi? (1-10)
            </Label>
            <MoodExpressionContainer>
              <MoodExpression>😣</MoodExpression>
              <MoodExpression>😟</MoodExpression>
              <MoodExpression>😐</MoodExpression>
              <MoodExpression>🙂</MoodExpression>
              <MoodExpression>😄</MoodExpression>
              <MoodExpression>😁</MoodExpression>
            </MoodExpressionContainer>
            <SliderContainer>
              <SliderLabel>1</SliderLabel>
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
              <SliderLabel>10</SliderLabel>
              <MoodValue>{formik.values.mood}</MoodValue>
            </SliderContainer>
            {formik.errors.mood && formik.touched.mood && (
              <ErrorText>{formik.errors.mood}</ErrorText>
            )}
          </FormGroup>
        </MoodSection>

        <FormGroup>
          <Label htmlFor="notes">
            <span>📝</span>
            Note (opțional)
          </Label>
          <TextArea
            id="notes"
            name="notes"
            onChange={formik.handleChange}
            value={formik.values.notes}
            placeholder="Adaugă detalii despre cum te simți, ce s-a întâmplat astăzi sau orice altceva relevant..."
          />
        </FormGroup>

        <FactorsSection>
          <Label>
            <span>📊</span>
            Factori de influență
          </Label>
          <FactorsGrid>
            <FactorGroup>
              <FactorLabel htmlFor="factors.sleep">😴 Calitatea somnului</FactorLabel>
              <FactorSliderContainer>
                <FactorSliderLabel>Slabă</FactorSliderLabel>
                <FactorSlider
                  id="factors.sleep"
                  name="factors.sleep"
                  type="range"
                  min="1"
                  max="5"
                  step="1"
                  onChange={formik.handleChange}
                  value={formik.values.factors.sleep}
                />
                <FactorSliderLabel>Bună</FactorSliderLabel>
                <FactorValue>{formik.values.factors.sleep}</FactorValue>
              </FactorSliderContainer>
            </FactorGroup>

            <FactorGroup>
              <FactorLabel htmlFor="factors.stress">😤 Nivelul de stres</FactorLabel>
              <FactorSliderContainer>
                <FactorSliderLabel>Ridicat</FactorSliderLabel>
                <FactorSlider
                  id="factors.stress"
                  name="factors.stress"
                  type="range"
                  min="1"
                  max="5"
                  step="1"
                  onChange={formik.handleChange}
                  value={formik.values.factors.stress}
                />
                <FactorSliderLabel>Scăzut</FactorSliderLabel>
                <FactorValue>{formik.values.factors.stress}</FactorValue>
              </FactorSliderContainer>
            </FactorGroup>

            <FactorGroup>
              <FactorLabel htmlFor="factors.activity">💪 Activitate fizică</FactorLabel>
              <FactorSliderContainer>
                <FactorSliderLabel>Puțină</FactorSliderLabel>
                <FactorSlider
                  id="factors.activity"
                  name="factors.activity"
                  type="range"
                  min="1"
                  max="5"
                  step="1"
                  onChange={formik.handleChange}
                  value={formik.values.factors.activity}
                />
                <FactorSliderLabel>Multă</FactorSliderLabel>
                <FactorValue>{formik.values.factors.activity}</FactorValue>
              </FactorSliderContainer>
            </FactorGroup>

            <FactorGroup>
              <FactorLabel htmlFor="factors.social">👥 Interacțiune socială</FactorLabel>
              <FactorSliderContainer>
                <FactorSliderLabel>Puțină</FactorSliderLabel>
                <FactorSlider
                  id="factors.social"
                  name="factors.social"
                  type="range"
                  min="1"
                  max="5"
                  step="1"
                  onChange={formik.handleChange}
                  value={formik.values.factors.social}
                />
                <FactorSliderLabel>Multă</FactorSliderLabel>
                <FactorValue>{formik.values.factors.social}</FactorValue>
              </FactorSliderContainer>
            </FactorGroup>
          </FactorsGrid>
        </FactorsSection>

        <TagsSection>
          <Label htmlFor="tags">
            <span>🏷️</span>
            Tag-uri (opțional)
          </Label>
          <TagInputContainer>
            <TagInput
              id="tagInput"
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={handleTagInputKeyPress}
              placeholder="Adaugă un tag (ex: relaxare, muncă, familie)"
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
        </TagsSection>

        {formik.errors.submit && (
          <ErrorText>{formik.errors.submit}</ErrorText>
        )}

        <SubmitButton type="submit" disabled={loading}>
          {loading ? '⏳ Se salvează...' : '💾 Salvează dispoziția'}
        </SubmitButton>
      </Form>
    </MoodTrackerContainer>
  );
};

export default MoodTracker;