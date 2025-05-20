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
  gap: 1rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-weight: 600;
`;

const MoodSlider = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
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
    width: 18px;
    height: 18px;
    background: #4c51bf;
    border-radius: 50%;
    cursor: pointer;
  }

  &::-moz-range-thumb {
    width: 18px;
    height: 18px;
    background: #4c51bf;
    border-radius: 50%;
    cursor: pointer;
    border: none;
  }
`;

const MoodValue = styled.span`
  font-weight: 600;
  width: 2rem;
  text-align: center;
`;

const TextArea = styled.textarea`
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  min-height: 100px;
  resize: vertical;
`;

const FactorsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
`;

const FactorGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const SubmitButton = styled.button`
  background-color: #4c51bf;
  color: white;
  padding: 0.75rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #434190;
  }

  &:disabled {
    background-color: #a0aec0;
    cursor: not-allowed;
  }
`;

const ErrorText = styled.div`
  color: #e53e3e;
  font-size: 0.875rem;
`;

const SuccessMessage = styled.div`
  background-color: #c6f6d5;
  color: #276749;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
`;

const TagsInput = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const TagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
`;

const TagInput = styled.input`
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
`;

const TagButton = styled.button`
  background-color: #4c51bf;
  color: white;
  padding: 0.5rem 0.75rem;
  border: none;
  border-radius: 4px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  margin-left: 0.5rem;
  transition: background-color 0.2s;

  &:hover {
    background-color: #434190;
  }
`;

const Tag = styled.span`
  background-color: #e9d8fd;
  color: #6b46c1;
  font-size: 0.875rem;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const RemoveTagButton = styled.button`
  background: none;
  border: none;
  color: #6b46c1;
  font-size: 1rem;
  padding: 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;

  &:hover {
    color: #553c9a;
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
            <SliderContainer>
              <span>😞</span>
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
              <span>😄</span>
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
            <div style={{ display: 'flex' }}>
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
            </div>
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