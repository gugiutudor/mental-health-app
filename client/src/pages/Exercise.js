import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import { GET_EXERCISE, GET_USER_PROGRESS } from '../graphql/queries';
import { COMPLETE_EXERCISE } from '../graphql/mutations';
import styled from 'styled-components';

const ExerciseContainer = styled.div`
  max-width: 800px;
  margin: 2rem auto;
  padding: 0 1rem;
`;

const Card = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  margin-bottom: 2rem;
`;

const BackButton = styled.button`
  background: none;
  border: none;
  color: #4c51bf;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  margin-bottom: 1rem;

  &:hover {
    text-decoration: underline;
  }
`;

const ExerciseHeader = styled.div`
  margin-bottom: 1.5rem;
`;

const ExerciseTitle = styled.h1`
  font-size: 1.875rem;
  margin-bottom: 0.5rem;
  color: #2d3748;
`;

const ExerciseTagContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 1rem;
`;

const ExerciseTag = styled.span`
  background-color: #e9d8fd;
  color: #6b46c1;
  font-size: 0.875rem;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
`;

const ExerciseDetails = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-top: 1rem;
`;

const ExerciseDetail = styled.span`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #718096;
`;

const ExerciseDescription = styled.p`
  font-size: 1rem;
  line-height: 1.6;
  margin-bottom: 2rem;
  color: #4a5568;
`;

const ExerciseStepsList = styled.ol`
  margin-left: 1.5rem;
  margin-bottom: 2rem;
`;

const ExerciseStep = styled.li`
  font-size: 1rem;
  line-height: 1.6;
  margin-bottom: 1rem;
  color: #2d3748;
`;

const StartButton = styled.button`
  background-color: #4c51bf;
  color: white;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-size: 1.125rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
  display: block;
  width: 100%;

  &:hover {
    background-color: #434190;
  }

  &:disabled {
    background-color: #a0aec0;
    cursor: not-allowed;
  }
`;

const TimerDisplay = styled.div`
  font-size: 3rem;
  font-weight: 700;
  text-align: center;
  margin: 2rem 0;
  color: #4c51bf;
`;

const ControlButtons = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
`;

const ControlButton = styled.button`
  flex: 1;
  padding: 0.75rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
  background-color: ${props => props.primary ? '#4c51bf' : '#edf2f7'};
  color: ${props => props.primary ? 'white' : '#4a5568'};

  &:hover {
    background-color: ${props => props.primary ? '#434190' : '#e2e8f0'};
  }

  &:disabled {
    background-color: #a0aec0;
    cursor: not-allowed;
  }
`;

const FeedbackForm = styled.div`
  margin-top: 2rem;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  font-weight: 600;
  margin-bottom: 0.5rem;
`;

const MoodSlider = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin: 1rem 0;
`;

const Slider = styled.input`
  flex-grow: 1;
`;

const SliderValue = styled.span`
  font-weight: 600;
  width: 2rem;
  text-align: center;
`;

const RatingContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  margin: 1rem 0;
`;

const RatingButton = styled.button`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid ${props => props.selected ? '#4c51bf' : '#e2e8f0'};
  background-color: ${props => props.selected ? '#ebf4ff' : 'white'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: #ebf4ff;
    border-color: #4c51bf;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  resize: vertical;
  min-height: 100px;
  font-size: 1rem;
`;

const SuccessMessage = styled.div`
  background-color: #c6f6d5;
  color: #276749;
  padding: 1.5rem;
  border-radius: 4px;
  margin: 2rem 0;
  text-align: center;
`;

const ErrorMessage = styled.div`
  background-color: #fed7d7;
  color: #c53030;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
`;

const Exercise = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // State pentru timer și progresul exercițiului
  const [exerciseStatus, setExerciseStatus] = useState('notStarted'); // notStarted, inProgress, completed
  const [timer, setTimer] = useState(0);
  const [timerInterval, setTimerInterval] = useState(null);
  const [feelingBefore, setFeelingBefore] = useState(5);
  const [feelingAfter, setFeelingAfter] = useState(5);
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [error, setError] = useState('');
  
  // Obține detaliile exercițiului
  const { loading, error: exerciseError, data } = useQuery(GET_EXERCISE, {
    variables: { id }
  });
  
  // Obține progresul anterior al utilizatorului pentru acest exercițiu
  const { data: progressData } = useQuery(GET_USER_PROGRESS, {
    variables: { exerciseId: id }
  });
  
  // Mutația pentru completarea exercițiului
  const [completeExercise, { loading: submitting }] = useMutation(COMPLETE_EXERCISE, {
    onCompleted: () => {
      setSubmitSuccess(true);
      setTimeout(() => {
        navigate('/exercises');
      }, 3000);
    },
    onError: (error) => {
      setError(error.message);
    }
  });
  
  // Pornește exercițiul
  const startExercise = () => {
    setExerciseStatus('inProgress');
    // Pornește timerul
    const interval = setInterval(() => {
      setTimer(prevTimer => prevTimer + 1);
    }, 1000);
    setTimerInterval(interval);
  };
  
  // Termină exercițiul
  const finishExercise = () => {
    // Oprește timerul
    clearInterval(timerInterval);
    setExerciseStatus('completed');
  };
  
  // Anulează exercițiul
  const cancelExercise = () => {
    clearInterval(timerInterval);
    setExerciseStatus('notStarted');
    setTimer(0);
  };
  
  // Trimite feedback-ul și marchează exercițiul ca fiind completat
  const submitFeedback = () => {
    completeExercise({
      variables: {
        input: {
          exerciseId: id,
          duration: timer,
          feelingBefore,
          feelingAfter,
          feedback: {
            rating: feedbackRating,
            comment: feedbackComment
          }
        }
      }
    });
  };
  
  // Formatează timpul
  const formatTime = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  
  // Obține eticheta categoriei
  const getCategoryLabel = (category) => {
    const categories = {
      'mindfulness': 'Mindfulness',
      'breathing': 'Respirație',
      'cognitive': 'Cognitiv',
      'physical': 'Fizic',
      'social': 'Social',
      'creative': 'Creativ',
      'other': 'Altele'
    };
    
    return categories[category] || category;
  };
  
  // Obține eticheta dificultății
  const getDifficultyLabel = (difficulty) => {
    const difficulties = {
      'beginner': 'Începător',
      'intermediate': 'Intermediar',
      'advanced': 'Avansat'
    };
    
    return difficulties[difficulty] || difficulty;
  };
  
  if (loading) return <ExerciseContainer><p>Se încarcă exercițiul...</p></ExerciseContainer>;
  if (exerciseError) return <ExerciseContainer><ErrorMessage>Eroare la încărcarea exercițiului: {exerciseError.message}</ErrorMessage></ExerciseContainer>;
  
  // Dacă exercițiul a fost completat cu succes
  if (submitSuccess) {
    return (
      <ExerciseContainer>
        <Card>
          <SuccessMessage>
            <h2>Felicitări!</h2>
            <p>Ai finalizat cu succes exercițiul. Progresul tău a fost salvat.</p>
            <p>Vei fi redirecționat către pagina de exerciții...</p>
          </SuccessMessage>
        </Card>
      </ExerciseContainer>
    );
  }
  
  if (!data || !data.getExercise) return <ExerciseContainer><p>Nu s-a găsit exercițiul.</p></ExerciseContainer>;
  
  const exercise = data.getExercise;
  
  return (
    <ExerciseContainer>
      <BackButton onClick={() => navigate('/exercises')}>
        ← Înapoi la exerciții
      </BackButton>
      
      {exerciseStatus === 'notStarted' && (
        <>
          <Card>
            <ExerciseHeader>
              <ExerciseTitle>{exercise.title}</ExerciseTitle>
              
              <ExerciseTagContainer>
                <ExerciseTag>{getCategoryLabel(exercise.category)}</ExerciseTag>
                {exercise.difficulty && (
                  <ExerciseTag>{getDifficultyLabel(exercise.difficulty)}</ExerciseTag>
                )}
              </ExerciseTagContainer>
              
              <ExerciseDetails>
                <ExerciseDetail>
                  <span role="img" aria-label="time">⏱️</span>
                  {exercise.duration} minute
                </ExerciseDetail>
              </ExerciseDetails>
            </ExerciseHeader>
            
            <ExerciseDescription>{exercise.description}</ExerciseDescription>
            
            <h3>Înainte de a începe:</h3>
            <MoodSlider>
              <Label htmlFor="feelingBefore">Cum te simți acum? (1-10)</Label>
              <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                <span>😞</span>
                <Slider
                  id="feelingBefore"
                  type="range"
                  min="1"
                  max="10"
                  value={feelingBefore}
                  onChange={(e) => setFeelingBefore(parseInt(e.target.value))}
                />
                <span>😄</span>
                <SliderValue>{feelingBefore}</SliderValue>
              </div>
            </MoodSlider>
            
            <StartButton onClick={startExercise}>
              Începe exercițiul
            </StartButton>
          </Card>
          
          {progressData && progressData.getUserProgress && progressData.getUserProgress.length > 0 && (
            <Card>
              <h3>Istoricul tău pentru acest exercițiu</h3>
              <p>Ai completat acest exercițiu de {progressData.getUserProgress.length} ori.</p>
              
              <h4>Ultima ta sesiune:</h4>
              {progressData.getUserProgress[0] && (
                <div>
                  <p>Data: {new Date(progressData.getUserProgress[0].completedAt).toLocaleDateString('ro-RO')}</p>
                  <p>Durată: {Math.floor(progressData.getUserProgress[0].duration / 60)} minute</p>
                  <p>Evaluare: {progressData.getUserProgress[0].feedback?.rating || 'N/A'}/5</p>
                  <p>Îmbunătățirea dispoziției: de la {progressData.getUserProgress[0].feelingBefore} la {progressData.getUserProgress[0].feelingAfter}</p>
                </div>
              )}
            </Card>
          )}
        </>
      )}
      
      {exerciseStatus === 'inProgress' && (
        <Card>
          <ExerciseHeader>
            <ExerciseTitle>{exercise.title}</ExerciseTitle>
          </ExerciseHeader>
          
          <TimerDisplay>
            {formatTime(timer)}
          </TimerDisplay>
          
          <h3>Pași:</h3>
          <ExerciseStepsList>
            {exercise.content && exercise.content.steps && exercise.content.steps.map((step, index) => (
              <ExerciseStep key={index}>{step}</ExerciseStep>
            ))}
          </ExerciseStepsList>
          
          {exercise.content && exercise.content.audioUrl && (
            <div style={{ marginBottom: '1.5rem' }}>
              <h3>Audio:</h3>
              <audio controls style={{ width: '100%' }}>
                <source src={exercise.content.audioUrl} type="audio/mpeg" />
                Browserul tău nu suportă elementul audio.
              </audio>
            </div>
          )}
          
          {exercise.content && exercise.content.videoUrl && (
            <div style={{ marginBottom: '1.5rem' }}>
              <h3>Video:</h3>
              <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden' }}>
                <iframe
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                  src={exercise.content.videoUrl}
                  title="Video Exercise"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          )}
          
          <ControlButtons>
            <ControlButton onClick={cancelExercise}>
              Anulează
            </ControlButton>
            <ControlButton primary onClick={finishExercise}>
              Finalizează
            </ControlButton>
          </ControlButtons>
        </Card>
      )}
      
      {exerciseStatus === 'completed' && (
        <Card>
          <h2>Exercițiu finalizat!</h2>
          <p>Durată: {formatTime(timer)}</p>
          
          <FeedbackForm>
            <h3>Cum te simți acum după exercițiu?</h3>
            
            <MoodSlider>
              <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                <span>😞</span>
                <Slider
                  type="range"
                  min="1"
                  max="10"
                  value={feelingAfter}
                  onChange={(e) => setFeelingAfter(parseInt(e.target.value))}
                />
                <span>😄</span>
                <SliderValue>{feelingAfter}</SliderValue>
              </div>
            </MoodSlider>
            
            <FormGroup>
              <Label>Evaluează acest exercițiu:</Label>
              <RatingContainer>
                {[1, 2, 3, 4, 5].map(rating => (
                  <RatingButton
                    key={rating}
                    selected={feedbackRating === rating}
                    onClick={() => setFeedbackRating(rating)}
                  >
                    {rating}
                  </RatingButton>
                ))}
              </RatingContainer>
            </FormGroup>
            
            <FormGroup>
              <Label htmlFor="feedbackComment">Comentarii (opțional):</Label>
              <TextArea
                id="feedbackComment"
                value={feedbackComment}
                onChange={(e) => setFeedbackComment(e.target.value)}
                placeholder="Spune-ne cum te-a ajutat acest exercițiu sau cum ar putea fi îmbunătățit..."
              />
            </FormGroup>
            
            {error && <ErrorMessage>{error}</ErrorMessage>}
            
            <StartButton onClick={submitFeedback} disabled={submitting}>
              {submitting ? 'Se trimite...' : 'Salvează progresul'}
            </StartButton>
          </FeedbackForm>
        </Card>
      )}
    </ExerciseContainer>
  );
};

export default Exercise;