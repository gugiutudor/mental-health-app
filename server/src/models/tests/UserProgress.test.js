// server/src/models/__tests__/UserProgress.test.js
const mongoose = require('mongoose');
const { UserProgress, User, Exercise } = require('../index');

describe('UserProgress Model Test', () => {
  let testUser, testExercise;

  beforeEach(async () => {
    // Creează un utilizator de test
    testUser = await createTestUser();
    
    // Creează un exercițiu de test
    testExercise = await new Exercise({
      title: 'Test Exercise',
      description: 'Exercise for testing',
      category: 'mindfulness',
      duration: 10,
      content: {
        steps: ['Step 1: Test step']
      }
    }).save();
  });

  it('should create a new user progress entry with valid data', async () => {
    const progressData = {
      userId: testUser._id,
      exerciseId: testExercise._id,
      completedAt: new Date(),
      duration: 600, // 10 minutes in seconds
      feelingBefore: 4,
      feelingAfter: 7,
      feedback: {
        rating: 5,
        comment: 'Great exercise!'
      }
    };

    const progress = new UserProgress(progressData);
    const savedProgress = await progress.save();

    // Verifică salvarea corectă a progresului
    expect(savedProgress._id).toBeDefined();
    expect(savedProgress.userId.toString()).toBe(testUser._id.toString());
    expect(savedProgress.exerciseId.toString()).toBe(testExercise._id.toString());
    expect(savedProgress.completedAt).toBeDefined();
    expect(savedProgress.duration).toBe(progressData.duration);
    expect(savedProgress.feelingBefore).toBe(progressData.feelingBefore);
    expect(savedProgress.feelingAfter).toBe(progressData.feelingAfter);
    expect(savedProgress.feedback.rating).toBe(progressData.feedback.rating);
    expect(savedProgress.feedback.comment).toBe(progressData.feedback.comment);
    expect(savedProgress.createdAt).toBeDefined();
  });

  it('should fail to create a progress entry without required fields', async () => {
    // Progres fără userId
    const progressWithoutUserId = {
      exerciseId: testExercise._id,
      completedAt: new Date()
    };

    // Progres fără exerciseId
    const progressWithoutExerciseId = {
      userId: testUser._id,
      completedAt: new Date()
    };

    // Verifică că validarea eșuează pentru fiecare caz
    await expect(new UserProgress(progressWithoutUserId).save()).rejects.toThrow();
    await expect(new UserProgress(progressWithoutExerciseId).save()).rejects.toThrow();
  });

  it('should enforce rating range constraint (1-5)', async () => {
    // Rating prea mic
    const ratingTooLow = {
      userId: testUser._id,
      exerciseId: testExercise._id,
      completedAt: new Date(),
      feedback: {
        rating: 0,
        comment: 'Test comment'
      }
    };

    // Rating prea mare
    const ratingTooHigh = {
      userId: testUser._id,
      exerciseId: testExercise._id,
      completedAt: new Date(),
      feedback: {
        rating: 6,
        comment: 'Test comment'
      }
    };

    await expect(new UserProgress(ratingTooLow).save()).rejects.toThrow();
    await expect(new UserProgress(ratingTooHigh).save()).rejects.toThrow();
  });

  it('should enforce feeling level range constraint (1-10)', async () => {
    // Nivel prea mic pentru feelingBefore
    const feelingBeforeTooLow = {
      userId: testUser._id,
      exerciseId: testExercise._id,
      completedAt: new Date(),
      feelingBefore: 0
    };

    // Nivel prea mare pentru feelingAfter
    const feelingAfterTooHigh = {
      userId: testUser._id,
      exerciseId: testExercise._id,
      completedAt: new Date(),
      feelingAfter: 11
    };

    await expect(new UserProgress(feelingBeforeTooLow).save()).rejects.toThrow();
    await expect(new UserProgress(feelingAfterTooHigh).save()).rejects.toThrow();
  });

  it('should create a progress entry with default completedAt to current time', async () => {
    const progressData = {
      userId: testUser._id,
      exerciseId: testExercise._id,
      duration: 300
    };

    const beforeSave = new Date();
    const progress = new UserProgress(progressData);
    const savedProgress = await progress.save();
    const afterSave = new Date();

    // Verifică că completedAt a fost setat la momentul actual
    expect(savedProgress.completedAt).toBeDefined();
    const completedTime = new Date(savedProgress.completedAt);
    expect(completedTime >= beforeSave && completedTime <= afterSave).toBe(true);
  });

  it('should retrieve all progress entries for a specific user and exercise', async () => {
    // Creează multiple intrări de progres pentru același utilizator și exercițiu
    await new UserProgress({
      userId: testUser._id,
      exerciseId: testExercise._id,
      duration: 300,
      feelingBefore: 3,
      feelingAfter: 5
    }).save();

    await new UserProgress({
      userId: testUser._id,
      exerciseId: testExercise._id,
      duration: 400,
      feelingBefore: 4,
      feelingAfter: 7
    }).save();

    // Verifică că ambele intrări pot fi găsite
    const userProgress = await UserProgress.find({
      userId: testUser._id,
      exerciseId: testExercise._id
    });

    expect(userProgress).toHaveLength(2);
    expect(userProgress[0].userId.toString()).toBe(testUser._id.toString());
    expect(userProgress[1].exerciseId.toString()).toBe(testExercise._id.toString());
  });
});