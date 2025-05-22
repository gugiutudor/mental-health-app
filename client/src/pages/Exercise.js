import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import { GET_EXERCISE, GET_USER_PROGRESS } from '../graphql/queries';
import { COMPLETE_EXERCISE } from '../graphql/mutations';
import { useAuth } from '../context/AuthContext';
import styled from 'styled-components';

const ExerciseContainer = styled.div`
  padding: 2rem 1.5rem;
  max-width: 1000px;
  margin: 0 auto;
`;

const BackButton = styled.button`
  background: transparent;
  border: 2px solid var(--primary-color);
  color: var(--primary-color);
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 2rem;
  padding: 0.75rem 1.5rem;
  border-radius: 25px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(79, 70, 229, 0.2);

  &:hover {
    background-color: var(--primary-color);
    color: white;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
  }

  &:active {
    transform: translateY(0);
  }
`;

const Card = styled.div`
  background-color: var(--card-bg);
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  padding: 2rem;
  margin-bottom: 2rem;
  transition: all 0.3s ease;
  border: 1px solid var(--border-color);
  position: relative;
  
  &:hover {
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
    transform: translateY(-3px);
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(135deg, var(--primary-color) 0%, #5146e2 100%);
    border-radius: 16px 16px 0 0;
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &:hover::before {
    opacity: 1;
  }
`;

const ExerciseHeader = styled.div`
  margin-bottom: 2rem;
  text-align: center;
`;

const ExerciseTitle = styled.h1`
  font-size: 2.2rem;
  margin-bottom: 1rem;
  color: var(--primary-color);
  font-weight: 800;
  background: linear-gradient(135deg, var(--primary-color) 0%, #5146e2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1.2;
`;

const ExerciseTagContainer = styled.div`
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 1rem;
  margin: 1.5rem 0;
`;

const ExerciseTag = styled.span`
  background: linear-gradient(135deg, #e9d8fd 0%, #f0e6ff 100%);
  color: #6b46c1;
  font-size: 1rem;
  padding: 0.6rem 1.2rem;
  border-radius: 20px;
  font-weight: 600;
  box-shadow: 0 3px 6px rgba(107, 70, 193, 0.2);
  border: 1px solid #e9d8fd;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ExerciseDetails = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 2rem;
  margin: 1.5rem 0;
  flex-wrap: wrap;
`;

const ExerciseDetail = styled.span`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
  color: #718096;
  font-weight: 600;
  background-color: rgba(113, 128, 150, 0.1);
  padding: 0.6rem 1.2rem;
  border-radius: 20px;
`;

const ExerciseDescription = styled.p`
  font-size: 1.1rem;
  line-height: 1.7;
  margin-bottom: 2rem;
  color: var(--text-color);
  text-align: center;
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;
`;

const ExerciseStepsList = styled.ol`
  margin: 2rem 0;
  padding-left: 0;
  counter-reset: step-counter;
`;

const ExerciseStep = styled.li`
  font-size: 1.1rem;
  line-height: 1.6;
  margin-bottom: 1.5rem;
  color: var(--text-color);
  background-color: rgba(79, 70, 229, 0.05);
  padding: 1.5rem;
  border-radius: 12px;
  border-left: 4px solid var(--primary-color);
  list-style: none;
  counter-increment: step-counter;
  position: relative;

  &::before {
    content: counter(step-counter);
    position: absolute;
    left: -2px;
    top: -2px;
    background: linear-gradient(135deg, var(--primary-color) 0%, #5146e2 100%);
    color: white;
    width: 30px;
    height: 30px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 0.9rem;
    box-shadow: 0 2px 6px rgba(79, 70, 229, 0.3);
  }
`;

const StartButton = styled.button`
  background: linear-gradient(135deg, var(--primary-color) 0%, #5146e2 100%);
  color: white;
  padding: 1rem 2rem;
  border: none;
  border-radius: 25px;
  font-size: 1.2rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  display: block;
  width: 100%;
  max-width: 300px;
  margin: 2rem auto 0;
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);

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
`;

const TimerDisplay = styled.div`
  font-size: 4rem;
  font-weight: 800;
  text-align: center;
  margin: 3rem 0;
  color: var(--primary-color);
  background: linear-gradient(135deg, var(--primary-color) 0%, #5146e2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 4px 8px rgba(79, 70, 229, 0.2);
`;

const ControlButtons = styled.div`
  display: flex;
  gap: 1.5rem;
  margin-bottom: 2rem;
  justify-content: center;
  flex-wrap: wrap;
`;

const ControlButton = styled.button`
  flex: 1;
  min-width: 120px;
  max-width: 200px;
  padding: 1rem 1.5rem;
  border: none;
  border-radius: 25px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  background: ${props => props.primary 
    ? 'linear-gradient(135deg, var(--primary-color) 0%, #5146e2 100%)'
    : 'linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%)'
  };
  color: ${props => props.primary ? 'white' : '#4a5568'};
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.1);

  &:hover {
    background: ${props => props.primary 
      ? 'linear-gradient(135deg, var(--primary-hover) 0%, #4338ca 100%)'
      : 'linear-gradient(135deg, #edf2f7 0%, #e2e8f0 100%)'
    };
    transform: translateY(-2px);
    box-shadow: 0 5px 12px rgba(0, 0, 0, 0.15);
  }

  &:disabled {
    background: linear-gradient(135deg, #a0aec0 0%, #9ca3af 100%);
    cursor: not-allowed;
    transform: none;
  }

  &:active {
    transform: translateY(0);
  }
`;

const FeedbackForm = styled.div`
  margin-top: 2rem;
`;

const FormGroup = styled.div`
  margin-bottom: 2rem;
`;

const Label = styled.label`
  display: block;
  font-weight: 700;
  margin-bottom: 1rem;
  color: var(--primary-color);
  font-size: 1.1rem;
`;

const MoodSlider = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin: 1.5rem 0;
  background-color: rgba(79, 70, 229, 0.05);
  padding: 1.5rem;
  border-radius: 12px;
  border: 1px solid rgba(79, 70, 229, 0.1);
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
    width: 24px;
    height: 24px;
    background: linear-gradient(135deg, var(--primary-color) 0%, #5146e2 100%);
    border-radius: 50%;
    cursor: pointer;
    box-shadow: 0 3px 6px rgba(79, 70, 229, 0.3);
    transition: all 0.2s;
  }

  &::-webkit-slider-thumb:hover {
    transform: scale(1.2);
    box-shadow: 0 4px 8px rgba(79, 70, 229, 0.4);
  }

  &::-moz-range-thumb {
    width: 24px;
    height: 24px;
    background: linear-gradient(135deg, var(--primary-color) 0%, #5146e2 100%);
    border-radius: 50%;
    cursor: pointer;
    border: none;
    box-shadow: 0 3px 6px rgba(79, 70, 229, 0.3);
    transition: all 0.2s;
  }
`;

const SliderValue = styled.span`
  font-weight: 800;
  width: 3rem;
  height: 3rem;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--primary-color) 0%, #5146e2 100%);
  color: white;
  border-radius: 50%;
  font-size: 1.2rem;
  box-shadow: 0 3px 8px rgba(79, 70, 229, 0.3);
`;

const RatingContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin: 1.5rem 0;
  justify-content: center;
  flex-wrap: wrap;
`;

const RatingButton = styled.button`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  border: 2px solid ${props => props.selected ? 'var(--primary-color)' : '#e2e8f0'};
  background: ${props => props.selected 
    ? 'linear-gradient(135deg, var(--primary-color) 0%, #5146e2 100%)'
    : 'var(--card-bg)'
  };
  color: ${props => props.selected ? 'white' : 'var(--text-color)'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 1.2rem;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: ${props => props.selected 
    ? '0 3px 8px rgba(79, 70, 229, 0.3)'
    : '0 2px 4px rgba(0, 0, 0, 0.1)'
  };

  &:hover {
    background: ${props => props.selected 
      ? 'linear-gradient(135deg, var(--primary-hover) 0%, #4338ca 100%)'
      : 'rgba(79, 70, 229, 0.1)'
    };
    border-color: var(--primary-color);
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(79, 70, 229, 0.2);
  }

  &:active {
    transform: translateY(0);
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 1.5rem;
  border: 2px solid var(--border-color);
  border-radius: 12px;
  resize: vertical;
  min-height: 120px;
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

const SuccessMessage = styled.div`
  background: linear-gradient(135deg, #c6f6d5 0%, #9ae6b4 100%);
  color: #276749;
  padding: 2rem;
  border-radius: 16px;
  margin: 2rem 0;
  text-align: center;
  font-weight: 600;
  font-size: 1.1rem;
  box-shadow: 0 4px 12px rgba(39, 103, 73, 0.2);
  border: 1px solid #9ae6b4;
  
  h2 {
    margin-bottom: 1rem;
    font-size: 1.5rem;
    font-weight: 800;
  }
  
  .success-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
    display: block;
  }
`;

const ErrorMessage = styled.div`
  background: linear-gradient(135deg, #fed7d7 0%, #fecaca 100%);
  color: #c53030;
  padding: 1.5rem;
  border-radius: 12px;
  margin-bottom: 1.5rem;
  text-align: center;
  font-weight: 600;
  box-shadow: 0 4px 8px rgba(197, 48, 48, 0.2);
  border: 1px solid #fecaca;
`;

const ProgressCard = styled(Card)`
  background: linear-gradient(135deg, #f0fff4 0%, #e6fffa 100%);
  border: 1px solid rgba(72, 187, 120, 0.2);
  
  &::before {
    background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
  }
  
  h3 {
    color: #2f855a;
    margin-bottom: 1rem;
    font-weight: 700;
  }
  
  .progress-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 1rem;
    margin-top: 1rem;
  }
  
  .progress-stat {
    background-color: rgba(72, 187, 120, 0.1);
    padding: 1rem;
    border-radius: 8px;
    text-align: center;
    
    .stat-value {
      font-size: 1.5rem;
      font-weight: 800;
      color: #2f855a;
    }
    
    .stat-label {
      font-size: 0.9rem;
      color: #4a5568;
      font-weight: 600;
    }
  }
`;

const MediaSection = styled.div`
  margin: 2rem 0;
  
  h3 {
    color: var(--primary-color);
    margin-bottom: 1rem;
    font-weight: 700;
  }
  
  audio, iframe {
    width: 100%;
    border-radius: 12px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
  
  .video-container {
    position: relative;
    padding-bottom: 56.25%;
    height: 0;
    overflow: hidden;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`;

const Exercise = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
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
      'mindfulness': { label: 'Mindfulness', icon: '🧘' },
      'breathing': { label: 'Respirație', icon: '🌬️' },
      'cognitive': { label: 'Cognitiv', icon: '🧠' },
      'physical': { label: 'Fizic', icon: '💪' },
      'social': { label: 'Social', icon: '👥' },
      'creative': { label: 'Creativ', icon: '🎨' },
      'other': { label: 'Altele', icon: '📝' }
    };
    
    return categories[category] || { label: category, icon: '📝' };
  };
  
  // Obține eticheta dificultății
  const getDifficultyLabel = (difficulty) => {
    const difficulties = {
      'beginner': { label: 'Începător', icon: '🌱' },
      'intermediate': { label: 'Intermediar', icon: '🌿' },
      'advanced': { label: 'Avansat', icon: '🌳' }
    };
    
    return difficulties[difficulty] || { label: difficulty, icon: '📊' };
  };
  
  if (loading) return (
    <ExerciseContainer>
      <Card>
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ 
            width: '50px', 
            height: '50px', 
            border: '4px solid #e2e8f0', 
            borderTop: '4px solid var(--primary-color)', 
            borderRadius: '50%', 
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }}></div>
          <p style={{ fontSize: '1.2rem', color: 'var(--text-color)' }}>Se încarcă exercițiul...</p>
        </div>
      </Card>
    </ExerciseContainer>
  );
  
  if (exerciseError) return (
    <ExerciseContainer>
      <ErrorMessage>
        <h3>⚠️ Eroare la încărcarea exercițiului</h3>
        <p>{exerciseError.message}</p>
      </ErrorMessage>
    </ExerciseContainer>
  );
  
  // Dacă exercițiul a fost completat cu succes
  if (submitSuccess) {
    return (
      <ExerciseContainer>
        <Card>
          <SuccessMessage>
            <span className="success-icon">🎉</span>
            <h2>Felicitări!</h2>
            <p>Ai finalizat cu succes exercițiul. Progresul tău a fost salvat.</p>
            <p>Vei fi redirecționat către pagina de exerciții...</p>
          </SuccessMessage>
        </Card>
      </ExerciseContainer>
    );
  }
  
  if (!data || !data.getExercise) return (
    <ExerciseContainer>
      <ErrorMessage>
        <h3>❌ Exercițiul nu a fost găsit</h3>
        <p>Ne pare rău, dar exercițiul pe care îl cauți nu există sau a fost eliminat.</p>
      </ErrorMessage>
    </ExerciseContainer>
  );
  
  const exercise = data.getExercise;
  const categoryInfo = getCategoryLabel(exercise.category);
  const difficultyInfo = exercise.difficulty ? getDifficultyLabel(exercise.difficulty) : null;
  
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
                <ExerciseTag>
                  <span>{categoryInfo.icon}</span>
                  {categoryInfo.label}
                </ExerciseTag>
                {difficultyInfo && (
                  <ExerciseTag>
                    <span>{difficultyInfo.icon}</span>
                    {difficultyInfo.label}
                  </ExerciseTag>
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
            
            <FormGroup>
              <Label htmlFor="feelingBefore">🌟 Înainte de a începe, cum te simți? (1-10)</Label>
              <MoodSlider>
                <span>😔</span>
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
              </MoodSlider>
            </FormGroup>
            
            <StartButton onClick={startExercise}>
              🚀 Începe exercițiul
            </StartButton>
          </Card>
          
          {progressData && progressData.getUserProgress && progressData.getUserProgress.length > 0 && (
            <ProgressCard>
              <h3>📊 Istoricul tău pentru acest exercițiu</h3>
              <p>Ai completat acest exercițiu de <strong>{progressData.getUserProgress.length}</strong> ori.</p>
              
              <div className="progress-stats">
                <div className="progress-stat">
                  <div className="stat-value">{progressData.getUserProgress.length}</div>
                  <div className="stat-label">Sesiuni completate</div>
                </div>
                {progressData.getUserProgress[0] && (
                  <>
                    <div className="progress-stat">
                      <div className="stat-value">{Math.floor(progressData.getUserProgress[0].duration / 60)}</div>
                      <div className="stat-label">Minute ultima sesiune</div>
                    </div>
                    <div className="progress-stat">
                      <div className="stat-value">{progressData.getUserProgress[0].feedback?.rating || 'N/A'}/5</div>
                      <div className="stat-label">Ultima evaluare</div>
                    </div>
                  </>
                )}
              </div>
            </ProgressCard>
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
          
          <h3 style={{ color: 'var(--primary-color)', marginBottom: '1.5rem', fontWeight: '700' }}>📋 Pași de urmat:</h3>
          <ExerciseStepsList>
            {exercise.content && exercise.content.steps && exercise.content.steps.map((step, index) => (
              <ExerciseStep key={index}>{step}</ExerciseStep>
            ))}
          </ExerciseStepsList>
          
          {exercise.content && exercise.content.audioUrl && (
            <MediaSection>
              <h3>🎧 Audio ghid:</h3>
              <audio controls>
                <source src={exercise.content.audioUrl} type="audio/mpeg" />
                Browserul tău nu suportă elementul audio.
              </audio>
            </MediaSection>
          )}
          
          {exercise.content && exercise.content.videoUrl && (
            <MediaSection>
              <h3>🎬 Video ghid:</h3>
              <div className="video-container">
                <iframe
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                  src={exercise.content.videoUrl}
                  title="Video Exercise"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            </MediaSection>
          )}
          
          <ControlButtons>
            <ControlButton onClick={cancelExercise}>
              ❌ Anulează
            </ControlButton>
            <ControlButton primary onClick={finishExercise}>
              ✅ Finalizează
            </ControlButton>
          </ControlButtons>
        </Card>
      )}
      
      {exerciseStatus === 'completed' && (
        <Card>
          <ExerciseHeader>
            <h2 style={{ color: 'var(--primary-color)', fontSize: '2rem', fontWeight: '800' }}>
              🎉 Exercițiu finalizat!
            </h2>
            <p style={{ fontSize: '1.2rem', color: '#718096' }}>
              Durată: <strong>{formatTime(timer)}</strong>
            </p>
          </ExerciseHeader>
          
          <FeedbackForm>
            <FormGroup>
              <Label>😊 Cum te simți acum după exercițiu?</Label>
              <MoodSlider>
                <span>😔</span>
                <Slider
                  type="range"
                  min="1"
                  max="10"
                  value={feelingAfter}
                  onChange={(e) => setFeelingAfter(parseInt(e.target.value))}
                />
                <span>😄</span>
                <SliderValue>{feelingAfter}</SliderValue>
              </MoodSlider>
            </FormGroup>
            
            <FormGroup>
              <Label>⭐ Evaluează acest exercițiu:</Label>
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
              <Label htmlFor="feedbackComment">💭 Comentarii (opțional):</Label>
              <TextArea
                id="feedbackComment"
                value={feedbackComment}
                onChange={(e) => setFeedbackComment(e.target.value)}
                placeholder="Spune-ne cum te-a ajutat acest exercițiu sau cum ar putea fi îmbunătățit..."
              />
            </FormGroup>
            
            {error && <ErrorMessage>{error}</ErrorMessage>}
            
            <StartButton onClick={submitFeedback} disabled={submitting}>
              {submitting ? '⏳ Se trimite...' : '💾 Salvează progresul'}
            </StartButton>
          </FeedbackForm>
        </Card>
      )}
    </ExerciseContainer>
  );
};

export default Exercise;