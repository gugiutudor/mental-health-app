// server/src/tests/integration/setup.js
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { ApolloServer } = require('apollo-server-express');
const { createTestClient } = require('apollo-server-testing');
const typeDefs = require('../../schemas');
const resolvers = require('../../resolvers');
const { User, MoodEntry, Exercise, Resource, UserProgress } = require('../../models');

// Creează o instanță ApolloServer pentru testare
const createTestServer = (contextValue = {}) => {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: () => contextValue
  });
  
  return createTestClient(server);
};

// Creează un utilizator de test autentificat
const createAuthenticatedUser = async () => {
  const user = new User({
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123'
  });
  
  await user.save();
  
  // Context cu utilizator autentificat
  const context = {
    req: {
      user: {
        id: user._id,
        email: user.email
      }
    }
  };
  
  return { user, context };
};

// Creează exerciții de test
const createTestExercises = async (createdBy = null) => {
  const exercises = [
    {
      title: 'Breathing Exercise',
      description: 'A simple breathing exercise to reduce stress',
      category: 'breathing',
      duration: 10,
      content: {
        steps: ['Step 1: Inhale deeply', 'Step 2: Hold', 'Step 3: Exhale slowly']
      },
      difficulty: 'beginner',
      createdBy
    },
    {
      title: 'Mindfulness Meditation',
      description: 'A guided mindfulness exercise',
      category: 'mindfulness',
      duration: 15,
      content: {
        steps: ['Step 1: Find a quiet place', 'Step 2: Focus on your breath']
      },
      difficulty: 'intermediate',
      createdBy
    }
  ];
  
  return Promise.all(exercises.map(exercise => new Exercise(exercise).save()));
};

// Creează înregistrări de dispoziție de test
const createTestMoodEntries = async (userId) => {
  const entries = [
    {
      userId,
      mood: 7,
      notes: 'Feeling good today',
      factors: {
        sleep: 4,
        stress: 2,
        activity: 3,
        social: 4
      },
      tags: ['productive', 'relaxed'],
      date: new Date()
    },
    {
      userId,
      mood: 5,
      notes: 'Average day',
      factors: {
        sleep: 3,
        stress: 3,
        activity: 2,
        social: 3
      },
      tags: ['neutral'],
      date: new Date(Date.now() - 86400000) // yesterday
    }
  ];
  
  return Promise.all(entries.map(entry => new MoodEntry(entry).save()));
};

// Creează resurse de test
const createTestResources = async (createdBy = null) => {
  const resources = [
    {
      title: 'Understanding Anxiety',
      description: 'An article about anxiety management techniques',
      type: 'article',
      url: 'https://example.com/anxiety',
      tags: ['anxiety', 'stress'],
      createdBy
    },
    {
      title: 'Guided Sleep Meditation',
      description: 'A meditation audio to help with sleep',
      type: 'audio',
      url: 'https://example.com/sleep-audio',
      tags: ['sleep', 'relaxation'],
      createdBy
    }
  ];
  
  return Promise.all(resources.map(resource => new Resource(resource).save()));
};

// Creează progresul utilizatorului de test
const createTestUserProgress = async (userId, exerciseId) => {
  const progress = {
    userId,
    exerciseId,
    completedAt: new Date(),
    duration: 600, // 10 minutes
    feelingBefore: 5,
    feelingAfter: 7,
    feedback: {
      rating: 4,
      comment: 'Great exercise, felt more relaxed after'
    }
  };
  
  return new UserProgress(progress).save();
};

// Configurare pentru toate testele de integrare
let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  // Curăță baza de date după fiecare test
  const collections = mongoose.connection.collections;
  
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
});

module.exports = {
  createTestServer,
  createAuthenticatedUser,
  createTestExercises,
  createTestMoodEntries,
  createTestResources,
  createTestUserProgress
};