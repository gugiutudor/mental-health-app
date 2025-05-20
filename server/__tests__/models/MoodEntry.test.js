// Testare MoodEntry model - Actualizat pentru firstName/lastName
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { MoodEntry, User } = require('../../src/models');

let mongoServer;
let testUser;

beforeAll(async () => {
  // Configurează o instanță MongoDB în memorie pentru teste
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  
  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  
  // Creează un utilizator de test pentru referință
  testUser = new User({
    firstName: 'Mood',
    lastName: 'Test User',
    email: 'mood@example.com',
    password: 'password123'
  });
  
  await testUser.save();
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('MoodEntry Model', () => {
  it('should create a mood entry successfully', async () => {
    const moodData = {
      userId: testUser._id,
      mood: 7,
      notes: 'Feeling good today',
      factors: {
        sleep: 4,
        stress: 2,
        activity: 3,
        social: 4
      },
      tags: ['relaxed', 'productive']
    };
    
    const moodEntry = new MoodEntry(moodData);
    const savedEntry = await moodEntry.save();
    
    // Verifică dacă înregistrarea a fost salvată
    expect(savedEntry._id).toBeDefined();
    expect(savedEntry.mood).toBe(moodData.mood);
    expect(savedEntry.notes).toBe(moodData.notes);
    expect(savedEntry.factors.sleep).toBe(moodData.factors.sleep);
    expect(savedEntry.tags).toEqual(expect.arrayContaining(moodData.tags));
    expect(savedEntry.userId.toString()).toBe(testUser._id.toString());
  });
  
  it('should validate mood range', async () => {
    // Mood prea mic
    const invalidLowMood = new MoodEntry({
      userId: testUser._id,
      mood: 0,  // Mood minim este 1
      notes: 'Test'
    });
    
    await expect(invalidLowMood.save()).rejects.toThrow();
    
    // Mood prea mare
    const invalidHighMood = new MoodEntry({
      userId: testUser._id,
      mood: 11,  // Mood maxim este 10
      notes: 'Test'
    });
    
    await expect(invalidHighMood.save()).rejects.toThrow();
  });
  
  it('should require userId field', async () => {
    const moodWithoutUser = new MoodEntry({
      mood: 5,
      notes: 'Test without user'
    });
    
    await expect(moodWithoutUser.save()).rejects.toThrow();
  });
  
  it('should require mood field', async () => {
    const moodWithoutMoodValue = new MoodEntry({
      userId: testUser._id,
      notes: 'Test without mood value'
    });
    
    await expect(moodWithoutMoodValue.save()).rejects.toThrow();
  });
});