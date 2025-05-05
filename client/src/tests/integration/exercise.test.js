// server/src/tests/integration/exercise.test.js
const mongoose = require('mongoose');
const {
  createTestServer,
  createAuthenticatedUser,
  createTestExercises,
  createTestMoodEntries
} = require('./setup');
const { Exercise, MoodEntry } = require('../../models');
const { gql } = require('apollo-server-express');

// Query-uri și mutații pentru teste
const GET_EXERCISES = gql`
  query GetExercises($category: String, $limit: Int, $offset: Int) {
    getExercises(category: $category, limit: $limit, offset: $offset) {
      id
      title
      description
      category
      duration
      content {
        steps
      }
      difficulty
      createdAt
    }
  }
`;

const GET_EXERCISE = gql`
  query GetExercise($id: ID!) {
    getExercise(id: $id) {
      id
      title
      description
      category
      duration
      content {
        steps
      }
      difficulty
      createdAt
    }
  }
`;

const GET_RECOMMENDED_EXERCISES = gql`
  query GetRecommendedExercises($limit: Int) {
    getRecommendedExercises(limit: $limit) {
      exercise {
        id
        title
        description
        category
        duration
        difficulty
      }
      score
    }
  }
`;

const CREATE_EXERCISE = gql`
  mutation CreateExercise($input: CreateExerciseInput!) {
    createExercise(input: $input) {
      id
      title
      description
      category
      duration
      content {
        steps
      }
      difficulty
      createdBy
    }
  }
`;

const UPDATE_EXERCISE = gql`
  mutation UpdateExercise($id: ID!, $input: CreateExerciseInput!) {
    updateExercise(id: $id, input: $input) {
      id
      title
      description
      category
      duration
      content {
        steps
      }
      difficulty
    }
  }
`;

const DELETE_EXERCISE = gql`
  mutation DeleteExercise($id: ID!) {
    deleteExercise(id: $id)
  }
`;

const COMPLETE_EXERCISE = gql`
  mutation CompleteExercise($input: CompleteExerciseInput!) {
    completeExercise(input: $input) {
      id
      exerciseId
      completedAt
      feedback {
        rating
        comment
      }
      duration
      feelingBefore
      feelingAfter
    }
  }
`;

describe('Exercise Integration Tests', () => {
  it('should fetch all exercises', async () => {
    // Creează exerciții de test
    const testExercises = await createTestExercises();
    
    // Creează un server de test
    const { query } = createTestServer();
    
    // Execută query-ul pentru exerciții
    const res = await query({
      query: GET_EXERCISES
    });
    
    // Verifică răspunsul
    expect(res.data.getExercises).toBeDefined();
    expect(res.data.getExercises).toHaveLength(testExercises.length);
    expect(res.data.getExercises[0].title).toBe(testExercises[0].title);
    expect(res.data.getExercises[1].title).toBe(testExercises[1].title);
  });
  
  it('should fetch exercises filtered by category', async () => {
    // Creează exerciții de test
    const testExercises = await createTestExercises();
    
    // Creează un server de test
    const { query } = createTestServer();
    
    // Execută query-ul pentru exerciții filtrate
    const res = await query({
      query: GET_EXERCISES,
      variables: { category: 'breathing' }
    });
    
    // Verifică răspunsul
    expect(res.data.getExercises).toBeDefined();
    expect(res.data.getExercises).toHaveLength(1);
    expect(res.data.getExercises[0].title).toBe(testExercises[0].title);
    expect(res.data.getExercises[0].category).toBe('breathing');
  });
  
  it('should fetch a specific exercise by id', async () => {
    // Creează exerciții de test
    const testExercises = await createTestExercises();
    const exerciseId = testExercises[0]._id.toString();
    
    // Creează un server de test
    const { query } = createTestServer();
    
    // Execută query-ul pentru un exercițiu specific
    const res = await query({
      query: GET_EXERCISE,
      variables: { id: exerciseId }
    });
    
    // Verifică răspunsul
    expect(res.data.getExercise).toBeDefined();
    expect(res.data.getExercise.id).toBe(exerciseId);
    expect(res.data.getExercise.title).toBe(testExercises[0].title);
    expect(res.data.getExercise.category).toBe(testExercises[0].category);
  });
  
  it('should return error for non-existent exercise id', async () => {
    // Creează un server de test
    const { query } = createTestServer();
    
    // Execută query-ul cu un ID care nu există
    const res = await query({
      query: GET_EXERCISE,
      variables: { id: new mongoose.Types.ObjectId().toString() }
    });
    
    // Verifică că există o eroare
    expect(res.errors).toBeDefined();
    expect(res.errors[0].message).toContain('Exercițiu negăsit');
  });
  
  it('should fetch recommended exercises based on mood entries', async () => {
    // Creează un utilizator autentificat
    const { user, context } = await createAuthenticatedUser();
    
    // Creează exerciții de test
    const testExercises = await createTestExercises();
    
    // Creează înregistrări de dispoziție pentru utilizator
    await createTestMoodEntries(user._id);
    
    // Adaugă recomandări la exerciții (pentru a putea testa scorul)
    await Exercise.findByIdAndUpdate(testExercises[0]._id, {
      recommendedFor: [
        {
          moodLevel: {
            min: 6,
            max: 8
          }
        }
      ]
    });
    
    // Creează un server de test cu contextul utilizatorului
    const { query } = createTestServer(context);
    
    // Execută query-ul pentru exerciții recomandate
    const res = await query({
      query: GET_RECOMMENDED_EXERCISES,
      variables: { limit: 2 }
    });
    
    // Verifică răspunsul
    expect(res.data.getRecommendedExercises).toBeDefined();
    expect(res.data.getRecommendedExercises).toHaveLength(2);
    
    // Verifică că fiecare recomandare are un exercițiu și un scor
    expect(res.data.getRecommendedExercises[0].exercise).toBeDefined();
    expect(res.data.getRecommendedExercises[0].score).toBeDefined();
    expect(res.data.getRecommendedExercises[1].exercise).toBeDefined();
    expect(res.data.getRecommendedExercises[1].score).toBeDefined();
  });
  
  it('should create a new exercise when authenticated', async () => {
    // Creează un utilizator autentificat
    const { user, context } = await createAuthenticatedUser();
    
    // Creează un server de test cu contextul utilizatorului
    const { mutate } = createTestServer(context);
    
    // Input pentru crearea unui exercițiu
    const input = {
      title: 'New Exercise',
      description: 'A new test exercise',
      category: 'cognitive',
      duration: 20,
      content: {
        steps: ['Step 1: Think about...', 'Step 2: Reflect on...']
      },
      difficulty: 'intermediate'
    };
    
    // Execută mutația pentru crearea exercițiului
    const res = await mutate({
      mutation: CREATE_EXERCISE,
      variables: { input }
    });
    
    // Verifică răspunsul
    expect(res.data.createExercise).toBeDefined();
    expect(res.data.createExercise.title).toBe(input.title);
    expect(res.data.createExercise.description).toBe(input.description);
    expect(res.data.createExercise.category).toBe(input.category);
    expect(res.data.createExercise.duration).toBe(input.duration);
    expect(res.data.createExercise.content.steps).toEqual(input.content.steps);
    expect(res.data.createExercise.difficulty).toBe(input.difficulty);
    expect(res.data.createExercise.createdBy).toBe(user._id.toString());
    
    // Verifică și în baza de date
    const savedExercise = await Exercise.findById(res.data.createExercise.id);
    expect(savedExercise).toBeDefined();
    expect(savedExercise.title).toBe(input.title);
  });
  
  it('should not create exercise when not authenticated', async () => {
    // Creează un server de test fără context de autentificare
    const { mutate } = createTestServer();
    
    // Input pentru crearea unui exercițiu
    const input = {
      title: 'New Exercise',
      description: 'A new test exercise',
      category: 'cognitive',
      duration: 20,
      content: {
        steps: ['Step 1: Think about...', 'Step 2: Reflect on...']
      }
    };
    
    // Execută mutația pentru crearea exercițiului
    const res = await mutate({
      mutation: CREATE_EXERCISE,
      variables: { input }
    });
    
    // Verifică că există o eroare
    expect(res.errors).toBeDefined();
    expect(res.errors[0].message).toContain('Trebuie să fii autentificat');
  });
  
  it('should update an exercise created by the user', async () => {
    // Creează un utilizator autentificat
    const { user, context } = await createAuthenticatedUser();
    
    // Creează un exercițiu de test creat de utilizator
    const exercise = new Exercise({
      title: 'Original Exercise',
      description: 'Original description',
      category: 'mindfulness',
      duration: 15,
      content: {
        steps: ['Original step 1', 'Original step 2']
      },
      difficulty: 'beginner',
      createdBy: user._id
    });
    await exercise.save();
    
    // Creează un server de test cu contextul utilizatorului
    const { mutate } = createTestServer(context);
    
    // Input pentru actualizarea exercițiului
    const input = {
      title: 'Updated Exercise',
      description: 'Updated description',
      category: 'breathing',
      duration: 10,
      content: {
        steps: ['Updated step 1', 'Updated step 2']
      },
      difficulty: 'intermediate'
    };
    
    // Execută mutația pentru actualizarea exercițiului
    const res = await mutate({
      mutation: UPDATE_EXERCISE,
      variables: { 
        id: exercise._id.toString(),
        input 
      }
    });
    
    // Verifică răspunsul
    expect(res.data.updateExercise).toBeDefined();
    expect(res.data.updateExercise.title).toBe(input.title);
    expect(res.data.updateExercise.description).toBe(input.description);
    expect(res.data.updateExercise.category).toBe(input.category);
    expect(res.data.updateExercise.duration).toBe(input.duration);
    expect(res.data.updateExercise.content.steps).toEqual(input.content.steps);
    expect(res.data.updateExercise.difficulty).toBe(input.difficulty);
    
    // Verifică și în baza de date
    const updatedExercise = await Exercise.findById(exercise._id);
    expect(updatedExercise.title).toBe(input.title);
  });
  
  it('should not update an exercise created by another user', async () => {
    // Creează un prim utilizator care creează exercițiul
    const creator = new User({
      name: 'Creator User',
      email: 'creator@example.com',
      password: 'password123'
    });
    await creator.save();
    
    // Creează un exercițiu de test creat de primul utilizator
    const exercise = new Exercise({
      title: 'Original Exercise',
      description: 'Original description',
      category: 'mindfulness',
      duration: 15,
      content: {
        steps: ['Original step 1', 'Original step 2']
      },
      createdBy: creator._id
    });
    await exercise.save();
    
    // Creează un al doilea utilizator autentificat
    const { context } = await createAuthenticatedUser();
    
    // Creează un server de test cu contextul celui de-al doilea utilizator
    const { mutate } = createTestServer(context);
    
    // Input pentru actualizarea exercițiului
    const input = {
      title: 'Updated Exercise',
      description: 'Updated description',
      category: 'breathing',
      duration: 10,
      content: {
        steps: ['Updated step 1', 'Updated step 2']
      }
    };
    
    // Execută mutația pentru actualizarea exercițiului
    const res = await mutate({
      mutation: UPDATE_EXERCISE,
      variables: { 
        id: exercise._id.toString(),
        input 
      }
    });
    
    // Verifică că există o eroare
    expect(res.errors).toBeDefined();
    expect(res.errors[0].message).toContain('Nu ai permisiunea să modifici acest exercițiu');
  });
  
  it('should delete an exercise created by the user', async () => {
    // Creează un utilizator autentificat
    const { user, context } = await createAuthenticatedUser();
    
    // Creează un exercițiu de test creat de utilizator
    const exercise = new Exercise({
      title: 'Exercise to Delete',
      description: 'Will be deleted',
      category: 'mindfulness',
      duration: 15,
      content: {
        steps: ['Step 1', 'Step 2']
      },
      createdBy: user._id
    });
    await exercise.save();
    
    // Creează un server de test cu contextul utilizatorului
    const { mutate } = createTestServer(context);
    
    // Execută mutația pentru ștergerea exercițiului
    const res = await mutate({
      mutation: DELETE_EXERCISE,
      variables: { id: exercise._id.toString() }
    });
    
    // Verifică răspunsul
    expect(res.data.deleteExercise).toBe(true);
    
    // Verifică că exercițiul a fost șters din baza de date
    const deletedExercise = await Exercise.findById(exercise._id);
    expect(deletedExercise).toBeNull();
  });
  
  it('should complete an exercise and save progress', async () => {
    // Creează un utilizator autentificat
    const { user, context } = await createAuthenticatedUser();
    
    // Creează exerciții de test
    const testExercises = await createTestExercises();
    const exerciseId = testExercises[0]._id.toString();
    
    // Creează un server de test cu contextul utilizatorului
    const { mutate } = createTestServer(context);
    
    // Input pentru completarea exercițiului
    const input = {
      exerciseId,
      duration: 300,
      feelingBefore: 4,
      feelingAfter: 7,
      feedback: {
        rating: 5,
        comment: 'Great exercise!'
      }
    };
    
    // Execută mutația pentru completarea exercițiului
    const res = await mutate({
      mutation: COMPLETE_EXERCISE,
      variables: { input }
    });
    
    // Verifică răspunsul
    expect(res.data.completeExercise).toBeDefined();
    expect(res.data.completeExercise.exerciseId).toBe(exerciseId);
    expect(res.data.completeExercise.duration).toBe(input.duration);
    expect(res.data.completeExercise.feelingBefore).toBe(input.feelingBefore);
    expect(res.data.completeExercise.feelingAfter).toBe(input.feelingAfter);
    expect(res.data.completeExercise.feedback.rating).toBe(input.feedback.rating);
    expect(res.data.completeExercise.feedback.comment).toBe(input.feedback.comment);
    
    // Verifică și în baza de date
    const progress = await UserProgress.findById(res.data.completeExercise.id);
    expect(progress).toBeDefined();
    expect(progress.userId.toString()).toBe(user._id.toString());
    expect(progress.exerciseId.toString()).toBe(exerciseId);
  });
});