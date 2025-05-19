// Testare mood resolver
const { AuthenticationError } = require('apollo-server-express');
const moodResolvers = require('../../src/resolvers/mood');
const { MoodEntry } = require('../../src/models');

// Mock pentru modelele Mongoose
jest.mock('../../src/models', () => ({
  MoodEntry: {
    find: jest.fn(),
    findOne: jest.fn(),
    deleteOne: jest.fn(),
    prototype: {
      save: jest.fn()
    }
  }
}));

describe('Mood Resolvers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Query', () => {
    describe('getMoodEntries', () => {
      it('should throw error when user is not authenticated', async () => {
        // Setup
        const req = { user: null };
        
        // Execute & Verify
        await expect(moodResolvers.Query.getMoodEntries(null, {}, { req }))
          .rejects.toThrow(AuthenticationError);
      });

      it('should return mood entries for the authenticated user', async () => {
        // Setup
        const req = { user: { id: '1' } };
        const mockEntries = [
          { id: '1', mood: 7, userId: '1' },
          { id: '2', mood: 5, userId: '1' }
        ];
        
        MoodEntry.find.mockReturnValue({
          sort: jest.fn().mockReturnValue({
            skip: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue(mockEntries)
            })
          })
        });
        
        // Execute
        const result = await moodResolvers.Query.getMoodEntries(null, { limit: 10, offset: 0 }, { req });
        
        // Verify
        expect(result).toEqual(mockEntries);
        expect(MoodEntry.find).toHaveBeenCalledWith({ userId: '1' });
      });
    });

    describe('getMoodEntry', () => {
      it('should throw error when user is not authenticated', async () => {
        // Setup
        const req = { user: null };
        
        // Execute & Verify
        await expect(moodResolvers.Query.getMoodEntry(null, { id: '1' }, { req }))
          .rejects.toThrow(AuthenticationError);
      });

      it('should return mood entry when found for the user', async () => {
        // Setup
        const req = { user: { id: '1' } };
        const mockEntry = { id: '1', mood: 7, userId: '1' };
        
        MoodEntry.findOne.mockResolvedValue(mockEntry);
        
        // Execute
        const result = await moodResolvers.Query.getMoodEntry(null, { id: '1' }, { req });
        
        // Verify
        expect(result).toEqual(mockEntry);
        expect(MoodEntry.findOne).toHaveBeenCalledWith({ 
          _id: '1',
          userId: '1'
        });
      });

      it('should throw error when entry not found', async () => {
        // Setup
        const req = { user: { id: '1' } };
        
        MoodEntry.findOne.mockResolvedValue(null);
        
        // Execute & Verify
        await expect(moodResolvers.Query.getMoodEntry(null, { id: '999' }, { req }))
          .rejects.toThrow('Înregistrare negăsită');
      });
    });

    describe('getMoodStatistics', () => {
      it('should throw error when user is not authenticated', async () => {
        // Setup
        const req = { user: null };
        
        // Execute & Verify
        await expect(moodResolvers.Query.getMoodStatistics(null, {}, { req }))
          .rejects.toThrow(AuthenticationError);
      });

      it('should return empty statistics when no entries found', async () => {
        // Setup
        const req = { user: { id: '1' } };
        
        MoodEntry.find.mockResolvedValue([]);
        
        // Execute
        const result = await moodResolvers.Query.getMoodStatistics(null, {}, { req });
        
        // Verify
        expect(result).toEqual({
          averageMood: 0,
          moodTrend: [],
          factorCorrelations: []
        });
      });

      it('should calculate statistics correctly', async () => {
        // Setup
        const req = { user: { id: '1' } };
        const mockEntries = [
          { 
            mood: 7, 
            factors: { 
              sleep: 4,
              stress: 2,
              activity: 3,
              social: 4
            } 
          },
          { 
            mood: 5, 
            factors: { 
              sleep: 2,
              stress: 4,
              activity: 2,
              social: 3
            } 
          }
        ];
        
        MoodEntry.find.mockResolvedValue(mockEntries);
        
        // Execute
        const result = await moodResolvers.Query.getMoodStatistics(null, {}, { req });
        
        // Verify
        expect(result.averageMood).toBe(6); // (7 + 5) / 2
        expect(result.moodTrend).toEqual([7, 5]);
        expect(result.factorCorrelations.length).toBeGreaterThan(0);
        
        // Verifică că factorii sunt prezenți în corelații
        const factorNames = result.factorCorrelations.map(fc => fc.factor);
        expect(factorNames).toContain('sleep');
        expect(factorNames).toContain('stress');
        expect(factorNames).toContain('activity');
        expect(factorNames).toContain('social');
      });

      it('should filter entries by date range when provided', async () => {
        // Setup
        const req = { user: { id: '1' } };
        const startDate = '2025-01-01';
        const endDate = '2025-01-31';
        
        const mockEntries = [
          { mood: 7, factors: { sleep: 4 } },
          { mood: 5, factors: { sleep: 2 } }
        ];
        
        MoodEntry.find.mockResolvedValue(mockEntries);
        
        // Execute
        await moodResolvers.Query.getMoodStatistics(null, { startDate, endDate }, { req });
        
        // Verify
        expect(MoodEntry.find).toHaveBeenCalledWith({
          userId: '1',
          date: {
            $gte: expect.any(Date),
            $lte: expect.any(Date)
          }
        });
      });
    });
  });

  describe('Mutation', () => {
    describe('createMoodEntry', () => {
      it('should throw error when user is not authenticated', async () => {
        // Setup
        const req = { user: null };
        const input = { mood: 7 };
        
        // Execute & Verify
        await expect(moodResolvers.Mutation.createMoodEntry(null, { input }, { req }))
          .rejects.toThrow(AuthenticationError);
      });

      it('should create a new mood entry', async () => {
        // Setup
        const req = { user: { id: '1' } };
        const input = { 
          mood: 7,
          notes: 'Feeling good',
          factors: {
            sleep: 4,
            stress: 2,
            activity: 3,
            social: 4
          },
          tags: ['relaxed', 'productive']
        };
        
        const mockEntry = {
          ...input,
          userId: '1',
          save: jest.fn().mockResolvedValue(true)
        };
        
        // Mock constructor
        const originalMoodEntry = MoodEntry;
        MoodEntry.mockImplementation(function() {
          return mockEntry;
        });
        
        // Execute
        const result = await moodResolvers.Mutation.createMoodEntry(null, { input }, { req });
        
        // Verify
        expect(result).toEqual(mockEntry);
        expect(mockEntry.save).toHaveBeenCalled();
        expect(mockEntry.userId).toBe('1');
        
        // Restore constructor
        MoodEntry = originalMoodEntry;
      });
    });

    describe('updateMoodEntry', () => {
      it('should throw error when user is not authenticated', async () => {
        // Setup
        const req = { user: null };
        const input = { mood: 7 };
        
        // Execute & Verify
        await expect(moodResolvers.Mutation.updateMoodEntry(null, { id: '1', input }, { req }))
          .rejects.toThrow(AuthenticationError);
      });

      it('should throw error when entry not found or not owned by user', async () => {
        // Setup
        const req = { user: { id: '1' } };
        const input = { mood: 7 };
        
        MoodEntry.findOne.mockResolvedValue(null);
        
        // Execute & Verify
        await expect(moodResolvers.Mutation.updateMoodEntry(null, { id: '999', input }, { req }))
          .rejects.toThrow('Înregistrare negăsită sau nu ai permisiunea să o modifici');
      });

      it('should update mood entry', async () => {
        // Setup
        const req = { user: { id: '1' } };
        const input = { 
          mood: 8,
          notes: 'Updated feeling',
          factors: {
            sleep: 5,
            stress: 1,
            activity: 4,
            social: 5
          },
          tags: ['energetic', 'happy']
        };
        
        const mockEntry = {
          id: '1',
          userId: '1',
          mood: 7,
          notes: 'Original feeling',
          factors: {
            sleep: 4,
            stress: 2,
            activity: 3,
            social: 4
          },
          tags: ['relaxed'],
          save: jest.fn().mockResolvedValue(true)
        };
        
        MoodEntry.findOne.mockResolvedValue(mockEntry);
        
        // Execute
        const result = await moodResolvers.Mutation.updateMoodEntry(null, { id: '1', input }, { req });
        
        // Verify
        expect(result.mood).toBe(8);
        expect(result.notes).toBe('Updated feeling');
        expect(result.factors).toEqual(input.factors);
        expect(result.tags).toEqual(input.tags);
        expect(mockEntry.save).toHaveBeenCalled();
      });
    });

    describe('deleteMoodEntry', () => {
      it('should throw error when user is not authenticated', async () => {
        // Setup
        const req = { user: null };
        
        // Execute & Verify
        await expect(moodResolvers.Mutation.deleteMoodEntry(null, { id: '1' }, { req }))
          .rejects.toThrow(AuthenticationError);
      });

      it('should throw error when entry not found or not owned by user', async () => {
        // Setup
        const req = { user: { id: '1' } };
        
        MoodEntry.deleteOne.mockResolvedValue({ deletedCount: 0 });
        
        // Execute & Verify
        await expect(moodResolvers.Mutation.deleteMoodEntry(null, { id: '999' }, { req }))
          .rejects.toThrow('Înregistrare negăsită sau nu ai permisiunea să o ștergi');
      });

      it('should delete mood entry', async () => {
        // Setup
        const req = { user: { id: '1' } };
        
        MoodEntry.deleteOne.mockResolvedValue({ deletedCount: 1 });
        
        // Execute
        const result = await moodResolvers.Mutation.deleteMoodEntry(null, { id: '1' }, { req });
        
        // Verify
        expect(result).toBe(true);
        expect(MoodEntry.deleteOne).toHaveBeenCalledWith({
          _id: '1',
          userId: '1'
        });
      });
    });
  });
});