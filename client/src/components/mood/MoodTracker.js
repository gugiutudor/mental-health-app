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

const MoodTracker = () => {
  const [success, setSuccess] = useState(false);
  const [createMoodEntry, { loading }] = useMutation(CREATE_MOOD_ENTRY, {
    refetchQueries: [{ query: GET_MOOD_ENTRIES, variables: { limit: 7 } }]
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
      }
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
      })
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
              }
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
        console.error('Eroare la salvarea înregistrării:', error);
      }
    }
  });

  return (
    <>
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

        <SubmitButton type="submit" disabled={loading}>
          {loading ? 'Se salvează...' : 'Salvează dispoziția'}
        </SubmitButton>
      </Form>
    </>
  );
};

export default MoodTracker;