// server/src/models/__tests__/Exercise.test.js
const mongoose = require('mongoose');
const { Exercise, User } = require('../index');

describe('Exercise Model Test', () => {
  let testUser;

  beforeEach(async () => {
    // Creează un utilizator de test
    testUser = await createTestUser();
  });

  it('should create a new exercise with valid data', async () => {
    const exerciseData = {
      title: 'Test Exercise',
      description: 'A exercise for testing',
      category: 'mindfulness',
      duration: 15,
      content: {
        steps: ['Step 1: Sit comfortably', 'Step 2: Close your eyes', 'Step 3: Breathe deeply']
      },
      difficulty: 'beginner',
      createdBy: testUser._id
    };

    const exercise = new Exercise(exerciseData);
    const savedExercise = await exercise.save();

    // Verifică salvarea corectă a exercițiului
    expect(savedExercise._id).toBeDefined();
    expect(savedExercise.title).toBe(exerciseData.title);
    expect(savedExercise.description).toBe(exerciseData.description);
    expect(savedExercise.category).toBe(exerciseData.category);
    expect(savedExercise.duration).toBe(exerciseData.duration);
    expect(savedExercise.content.steps).toEqual(expect.arrayContaining(exerciseData.content.steps));
    expect(savedExercise.difficulty).toBe(exerciseData.difficulty);
    expect(savedExercise.createdBy.toString()).toBe(testUser._id.toString());
    expect(savedExercise.createdAt).toBeDefined();
  });

  it('should fail to create an exercise without required fields', async () => {
    // Exercițiu fără titlu
    const exerciseWithoutTitle = {
      description: 'Test description',
      category: 'mindfulness',
      duration: 15,
      content: {
        steps: ['Step 1']
      }
    };

    // Exercițiu fără descriere
    const exerciseWithoutDescription = {
      title: 'Test Exercise',
      category: 'mindfulness',
      duration: 15,
      content: {
        steps: ['Step 1']
      }
    };

    // Exercițiu fără categorie
    const exerciseWithoutCategory = {
      title: 'Test Exercise',
      description: 'Test description',
      duration: 15,
      content: {
        steps: ['Step 1']
      }
    };

    // Exercițiu fără durată
    const exerciseWithoutDuration = {
      title: 'Test Exercise',
      description: 'Test description',
      category: 'mindfulness',
      content: {
        steps: ['Step 1']
      }
    };

    // Exercițiu fără pași în conținut
    const exerciseWithoutSteps = {
      title: 'Test Exercise',
      description: 'Test description',
      category: 'mindfulness',
      duration: 15,
      content: {}
    };

    // Verifică că validarea eșuează pentru fiecare caz
    await expect(new Exercise(exerciseWithoutTitle).save()).rejects.toThrow();
    await expect(new Exercise(exerciseWithoutDescription).save()).rejects.toThrow();
    await expect(new Exercise(exerciseWithoutCategory).save()).rejects.toThrow();
    await expect(new Exercise(exerciseWithoutDuration).save()).rejects.toThrow();
    await expect(new Exercise(exerciseWithoutSteps).save()).rejects.toThrow();
  });

  it('should enforce valid category values', async () => {
    const exerciseWithInvalidCategory = {
      title: 'Test Exercise',
      description: 'Test description',
      category: 'invalid-category', // categorie care nu există în enum
      duration: 15,
      content: {
        steps: ['Step 1']
      }
    };

    await expect(new Exercise(exerciseWithInvalidCategory).save()).rejects.toThrow();
  });

  it('should enforce valid difficulty values', async () => {
    const exerciseWithInvalidDifficulty = {
      title: 'Test Exercise',
      description: 'Test description',
      category: 'mindfulness',
      duration: 15,
      content: {
        steps: ['Step 1']
      },
      difficulty: 'invalid-difficulty' // dificultate care nu există în enum
    };

    await expect(new Exercise(exerciseWithInvalidDifficulty).save()).rejects.toThrow();
  });

  it('should create an exercise with mood recommendations', async () => {
    const exerciseWithRecommendations = {
      title: 'Test Exercise',
      description: 'Test description',
      category: 'mindfulness',
      duration: 15,
      content: {
        steps: ['Step 1: Breathe deeply']
      },
      recommendedFor: [
        {
          moodLevel: {
            min: 1,
            max: 5
          }
        },
        {
          moodLevel: {
            min: 8,
            max: 10
          }
        }
      ]
    };

    const exercise = new Exercise(exerciseWithRecommendations);
    const savedExercise = await exercise.save();

    // Verifică recomandările
    expect(savedExercise.recommendedFor).toHaveLength(2);
    expect(savedExercise.recommendedFor[0].moodLevel.min).toBe(1);
    expect(savedExercise.recommendedFor[0].moodLevel.max).toBe(5);
    expect(savedExercise.recommendedFor[1].moodLevel.min).toBe(8);
    expect(savedExercise.recommendedFor[1].moodLevel.max).toBe(10);
  });

  it('should create an exercise with audio and video content', async () => {
    const exerciseWithMedia = {
      title: 'Test Exercise with Media',
      description: 'Test description',
      category: 'mindfulness',
      duration: 15,
      content: {
        steps: ['Step 1: Follow along with the audio'],
        audioUrl: 'https://example.com/audio.mp3',
        videoUrl: 'https://example.com/video.mp4'
      }
    };

    const exercise = new Exercise(exerciseWithMedia);
    const savedExercise = await exercise.save();

    // Verifică conținutul media
    expect(savedExercise.content.audioUrl).toBe(exerciseWithMedia.content.audioUrl);
    expect(savedExercise.content.videoUrl).toBe(exerciseWithMedia.content.videoUrl);
  });
});