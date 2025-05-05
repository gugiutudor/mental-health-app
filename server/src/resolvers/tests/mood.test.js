// server/src/resolvers/__tests__/mood.test.js
const mongoose = require('mongoose');
const { AuthenticationError } = require('apollo-server-express');
const { MoodEntry } = require('../../models');
const moodResolvers = require('../mood');

// Mock pentru modelele Mongoose
jest.mock('../../models/MoodEntry');

describe('Mood Resolver Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  // Mock pentru funcția de calcul a corelației
  const originalCalculateCorrelation = global.calculateCorrelation;
  beforeAll(() => {
    global.calculateCorrelation = jest.fn().mockReturnValue(0.5);
  });
  
  afterAll(() => {
    global.calculateCorrelation = originalCalculateCorrelation;
  });
  
  describe('Query', () => {
    describe('getMoodEntries', () => {
      it('should throw AuthenticationError if user is not authenticated', async () => {
        // Context fără utilizator autentificat
        const context = { req: { user: null } };
        
        // Execută query-ul
        await expect(moodResolvers.Query.getMoodEntries(null, {}, context))
          .rejects.toThrow(AuthenticationError);
      });
      
      it('should return mood entries for authenticated user', async () => {
        // Mock pentru intrările de dispoziție
        const mockEntries = [
          { id: 'entry1', mood: 7, date: new Date() },
          { id: 'entry2', mood: 5, date: new Date() }
        ];
        
        // Mock pentru MoodEntry.find
        MoodEntry.find = jest.fn().mockReturnValue({
          sort: jest.fn().mockReturnValue({
            skip: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue(mockEntries)
            })
          })
        });
        
        // Context cu utilizator autentificat
        const context = { req: { user: { id: 'user123' } } };
        
        // Execută query-ul cu parametri opționali
        const result = await moodResolvers.Query.getMoodEntries(
          null, 
          { limit: 5, offset: 0 }, 
          context
        );
        
        // Verifică rezultatul
        expect(result).toEqual(mockEntries);
        
        // Verifică că find a fost apelat cu userId corect
        expect(MoodEntry.find).toHaveBeenCalledWith({ userId: 'user123' });
      });
    });
    
    describe('getMoodEntry', () => {
      it('should throw AuthenticationError if user is not authenticated', async () => {
        // Context fără utilizator autentificat
        const context = { req: { user: null } };
        
        // Execută query-ul
        await expect(moodResolvers.Query.getMoodEntry(null, { id: 'entry1' }, context))
          .rejects.toThrow(AuthenticationError);
      });
      
      it('should return specific mood entry for authenticated user', async () => {
        // Mock pentru intrarea de dispoziție
        const mockEntry = { id: 'entry1', mood: 7, userId: 'user123' };
        
        // Mock pentru MoodEntry.findOne
        MoodEntry.findOne = jest.fn().mockResolvedValue(mockEntry);
        
        // Context cu utilizator autentificat
        const context = { req: { user: { id: 'user123' } } };
        
        // Execută query-ul
        const result = await moodResolvers.Query.getMoodEntry(
          null, 
          { id: 'entry1' }, 
          context
        );
        
        // Verifică rezultatul
        expect(result).toEqual(mockEntry);
        
        // Verifică că findOne a fost apelat cu parametrii corecți
        expect(MoodEntry.findOne).toHaveBeenCalledWith({ 
          _id: 'entry1',
          userId: 'user123'
        });
      });
      
      it('should throw error if mood entry is not found', async () => {
        // Mock pentru MoodEntry.findOne returnează null
        MoodEntry.findOne = jest.fn().mockResolvedValue(null);
        
        // Context cu utilizator autentificat
        const context = { req: { user: { id: 'user123' } } };
        
        // Execută query-ul
        await expect(moodResolvers.Query.getMoodEntry(
          null, 
          { id: 'nonexistent' }, 
          context
        )).rejects.toThrow('Înregistrare negăsită');
      });
    });
    
    describe('getMoodStatistics', () => {
      it('should throw AuthenticationError if user is not authenticated', async () => {
        // Context fără utilizator autentificat
        const context = { req: { user: null } };
        
        // Execută query-ul
        await expect(moodResolvers.Query.getMoodStatistics(null, {}, context))
          .rejects.toThrow(AuthenticationError);
      });
      
      it('should return default statistics if no entries exist', async () => {
        // Mock pentru MoodEntry.find returnează array gol
        MoodEntry.find = jest.fn().mockReturnValue({
          sort: jest.fn().mockResolvedValue([])
        });
        
        // Context cu utilizator autentificat
        const context = { req: { user: { id: 'user123' } } };
        
        // Execută query-ul
        const result = await moodResolvers.Query.getMoodStatistics(null, {}, context);
        
        // Verifică rezultatul
        expect(result).toEqual({
          averageMood: 0,
          moodTrend: [],
          factorCorrelations: []
        });
      });
      
      it('should calculate statistics correctly with date range', async () => {
        // Mock pentru intrările de dispoziție
        const mockEntries = [
          { 
            mood: 7, 
            factors: { sleep: 4, stress: 2 }
          },
          { 
            mood: 5, 
            factors: { sleep: 3, stress: 4 }
          }
        ];
        
        // Mock pentru MoodEntry.find
        MoodEntry.find = jest.fn().mockReturnValue({
          sort: jest.fn().mockResolvedValue(mockEntries)
        });
        
        // Context cu utilizator autentificat
        const context = { req: { user: { id: 'user123' } } };
        
        // Parametri pentru interval de date
        const params = {
          startDate: '2023-01-01',
          endDate: '2023-01-31'
        };
        
        // Execută query-ul
        const result = await moodResolvers.Query.getMoodStatistics(null, params, context);
        
        // Verifică rezultatul
        expect(result.averageMood).toBe(6); // (7 + 5) / 2
        expect(result.moodTrend).toEqual([7, 5]);
        expect(result.factorCorrelations.length).toBeGreaterThan(0);
        
        // Verifică că find a fost apelat cu query corect pentru date
        expect(MoodEntry.find).toHaveBeenCalledWith({
          userId: 'user123',
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
      it('should throw AuthenticationError if user is not authenticated', async () => {
        // Context fără utilizator autentificat
        const context = { req: { user: null } };
        
        // Execută mutația
        await expect(moodResolvers.Mutation.createMoodEntry(
          null, 
          { input: { mood: 7 } }, 
          context
        )).rejects.toThrow(AuthenticationError);
      });
      
      it('should create and return a new mood entry', async () => {
        // Input pentru creare
        const input = {
          mood: 8,
          notes: 'Feeling great today',
          factors: {
            sleep: 4,
            stress: 2
          },
          tags: ['productive', 'energetic']
        };
        
        // Mock pentru intrarea de dispoziție creată
        const mockCreatedEntry = {
          ...input,
          userId: 'user123',
          id: 'newentry123',
          save: jest.fn().mockResolvedValue(true)
        };
        
        // Mock pentru constructorul MoodEntry
        MoodEntry.mockImplementation(() => mockCreatedEntry);
        
        // Context cu utilizator autentificat
        const context = { req: { user: { id: 'user123' } } };
        
        // Execută mutația
        const result = await moodResolvers.Mutation.createMoodEntry(
          null, 
          { input }, 
          context
        );
        
        // Verifică rezultatul
        expect(result).toEqual(mockCreatedEntry);
        
        // Verifică că save a fost apelat
        expect(mockCreatedEntry.save).toHaveBeenCalled();
        
        // Verifică că s-a creat cu userId corect
        expect(mockCreatedEntry.userId).toBe('user123');
      });
    });
    
    describe('updateMoodEntry', () => {
      it('should throw AuthenticationError if user is not authenticated', async () => {
        // Context fără utilizator autentificat
        const context = { req: { user: null } };
        
        // Execută mutația
        await expect(moodResolvers.Mutation.updateMoodEntry(
          null, 
          { id: 'entry1', input: { mood: 7 } }, 
          context
        )).rejects.toThrow(AuthenticationError);
      });
      
      it('should update and return mood entry', async () => {
        // ID intrare și input pentru actualizare
        const entryId = 'entry123';
        const input = {
          mood: 9,
          notes: 'Updated notes',
          factors: {
            sleep: 5,
            stress: 1
          },
          tags: ['relaxed']
        };
        
        // Mock pentru intrarea existentă
        const mockEntry = {
          id: entryId,
          userId: 'user123',
          mood: 7,
          notes: 'Original notes',
          factors: {
            sleep: 3,
            stress: 3
          },
          tags: ['stressed'],
          save: jest.fn().mockResolvedValue(true)
        };
        
        // Mock pentru MoodEntry.findOne
        MoodEntry.findOne = jest.fn().mockResolvedValue(mockEntry);
        
        // Context cu utilizator autentificat
        const context = { req: { user: { id: 'user123' } } };
        
        // Execută mutația
        const result = await moodResolvers.Mutation.updateMoodEntry(
          null, 
          { id: entryId, input }, 
          context
        );
        
        // Verifică actualizarea câmpurilor
        expect(mockEntry.mood).toBe(input.mood);
        expect(mockEntry.notes).toBe(input.notes);
        expect(mockEntry.factors).toEqual(input.factors);
        expect(mockEntry.tags).toEqual(input.tags);
        
        // Verifică că save a fost apelat
        expect(mockEntry.save).toHaveBeenCalled();
        
        // Verifică rezultatul
        expect(result).toEqual(mockEntry);
      });
      
      it('should throw error if entry does not belong to user', async () => {
        // Mock pentru MoodEntry.findOne returnează null
        MoodEntry.findOne = jest.fn().mockResolvedValue(null);
        
        // Context cu utilizator autentificat
        const context = { req: { user: { id: 'user123' } } };
        
        // Execută mutația
        await expect(moodResolvers.Mutation.updateMoodEntry(
          null, 
          { id: 'entry1', input: { mood: 7 } }, 
          context
        )).rejects.toThrow('Înregistrare negăsită sau nu ai permisiunea să o modifici');
      });
    });
    
    describe('deleteMoodEntry', () => {
      it('should throw AuthenticationError if user is not authenticated', async () => {
        // Context fără utilizator autentificat
        const context = { req: { user: null } };
        
        // Execută mutația
        await expect(moodResolvers.Mutation.deleteMoodEntry(
          null, 
          { id: 'entry1' }, 
          context
        )).rejects.toThrow(AuthenticationError);
      });
      
      it('should delete mood entry and return true', async () => {
        // Mock pentru MoodEntry.deleteOne cu rezultat de succes
        MoodEntry.deleteOne = jest.fn().mockResolvedValue({ deletedCount: 1 });
        
        // Context cu utilizator autentificat
        const context = { req: { user: { id: 'user123' } } };
        
        // Execută mutația
        const result = await moodResolvers.Mutation.deleteMoodEntry(
          null, 
          { id: 'entry1' }, 
          context
        );
        
        // Verifică rezultatul
        expect(result).toBe(true);
        
        // Verifică că deleteOne a fost apelat cu parametrii corecți
        expect(MoodEntry.deleteOne).toHaveBeenCalledWith({
          _id: 'entry1',
          userId: 'user123'
        });
      });
      
      it('should throw error if entry does not exist or belong to user', async () => {
        // Mock pentru MoodEntry.deleteOne cu niciun rezultat
        MoodEntry.deleteOne = jest.fn().mockResolvedValue({ deletedCount: 0 });
        
        // Context cu utilizator autentificat
        const context = { req: { user: { id: 'user123' } } };
        
        // Execută mutația
        await expect(moodResolvers.Mutation.deleteMoodEntry(
          null, 
          { id: 'entry1' }, 
          context
        )).rejects.toThrow('Înregistrare negăsită sau nu ai permisiunea să o ștergi');
      });
    });
  });
});