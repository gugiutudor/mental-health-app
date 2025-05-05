// server/src/models/__tests__/MoodEntry.test.js
const mongoose = require('mongoose');
const { MoodEntry, User } = require('../index');

describe('MoodEntry Model Test', () => {
  let testUser;

  beforeEach(async () => {
    // Creează un utilizator de test pentru a asocia înregistrările de dispoziție
    testUser = await createTestUser();
  });

  it('should create a new mood entry with valid data', async () => {
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
    const savedMoodEntry = await moodEntry.save();

    // Verifică salvarea corectă a înregistrării
    expect(savedMoodEntry._id).toBeDefined();
    expect(savedMoodEntry.userId.toString()).toBe(testUser._id.toString());
    expect(savedMoodEntry.mood).toBe(moodData.mood);
    expect(savedMoodEntry.notes).toBe(moodData.notes);
    expect(savedMoodEntry.factors.sleep).toBe(moodData.factors.sleep);
    expect(savedMoodEntry.tags).toEqual(expect.arrayContaining(moodData.tags));
    expect(savedMoodEntry.date).toBeDefined();
  });

  it('should fail to create a mood entry without required fields', async () => {
    // Înregistrare fără userId
    const moodWithoutUserId = {
      mood: 7,
      notes: 'Test note'
    };

    // Înregistrare fără nivelul dispoziției
    const moodWithoutMoodLevel = {
      userId: testUser._id,
      notes: 'Test note'
    };

    // Verifică că validarea eșuează pentru fiecare caz
    await expect(new MoodEntry(moodWithoutUserId).save()).rejects.toThrow();
    await expect(new MoodEntry(moodWithoutMoodLevel).save()).rejects.toThrow();
  });

  it('should enforce mood value range constraint (1-10)', async () => {
    // Verifică valoare prea mică
    const moodTooLow = {
      userId: testUser._id,
      mood: 0,
      notes: 'Invalid mood value'
    };

    // Verifică valoare prea mare
    const moodTooHigh = {
      userId: testUser._id,
      mood: 11,
      notes: 'Invalid mood value'
    };

    await expect(new MoodEntry(moodTooLow).save()).rejects.toThrow();
    await expect(new MoodEntry(moodTooHigh).save()).rejects.toThrow();
  });

  it('should enforce factor value range constraint (1-5)', async () => {
    // Verifică valoare prea mică pentru somn
    const sleepTooLow = {
      userId: testUser._id,
      mood: 5,
      factors: {
        sleep: 0
      }
    };

    // Verifică valoare prea mare pentru stres
    const stressTooHigh = {
      userId: testUser._id,
      mood: 5,
      factors: {
        stress: 6
      }
    };

    await expect(new MoodEntry(sleepTooLow).save()).rejects.toThrow();
    await expect(new MoodEntry(stressTooHigh).save()).rejects.toThrow();
  });

  it('should associate mood entries with correct user', async () => {
    // Creează două înregistrări pentru același utilizator
    const moodEntry1 = await new MoodEntry({
      userId: testUser._id,
      mood: 6,
      notes: 'First entry'
    }).save();

    const moodEntry2 = await new MoodEntry({
      userId: testUser._id,
      mood: 8,
      notes: 'Second entry'
    }).save();

    // Verifică că putem găsi ambele înregistrări pentru utilizator
    const userEntries = await MoodEntry.find({ userId: testUser._id });
    expect(userEntries).toHaveLength(2);
    
    // Verifică că ID-urile corespund
    const entryIds = userEntries.map(entry => entry._id.toString());
    expect(entryIds).toContain(moodEntry1._id.toString());
    expect(entryIds).toContain(moodEntry2._id.toString());
  });
});