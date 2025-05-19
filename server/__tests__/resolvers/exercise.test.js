// Testare exercise resolver
const { AuthenticationError, ForbiddenError } = require('apollo-server-express');
const exerciseResolvers = require('../../src/resolvers/exercise');
const { Exercise, MoodEntry } = require('../../src/models');

// Mock pentru modelele Mongoose
jest.mock('../../src/models', () => ({
  Exercise: {
    find: jest.fn(),
    findById: jest.fn(),
    deleteOne: jest.fn(),
    prototype: {
      save: jest.fn()
    }
  },
  MoodEntry: {
    find: jest.fn()
  }
}));

describe('Exercise Resolvers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Query', () => {
    describe('getExercises', () => {
      it('should return all exercises when no category is provided', async () => {
        // Setup
        const mockExercises = [
          { id: '1', title: 'Exercise 1', category: 'mindfulness' },
          { id: '2', title: 'Exercise 2', category: 'breathing' }
        ];
        Exercise.find.mockReturnValue({
          skip: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({
              sort: jest.fn().mockResolvedValue(mockExercises)
            })
          })
        });
        
        // Execute
        const result = await exerciseResolvers.Query.getExercises(null, {});
        
        // Verify
        expect(result).toEqual(mockExercises);
        expect(Exercise.find).toHaveBeenCalledWith({});
      });

      it('should filter exercises by category when provided', async () => {
        // Setup
        const mockExercises = [
          { id: '1', title: 'Exercise 1', category: 'mindfulness' }
        ];
        Exercise.find.mockReturnValue({
          skip: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({
              sort: jest.fn().mockResolvedValue(mockExercises)
            })
          })
        });
        
        // Execute
        const result = await exerciseResolvers.Query.getExercises(null, { category: 'mindfulness' });
        
        // Verify
        expect(result).toEqual(mockExercises);
        expect(Exercise.find).toHaveBeenCalledWith({ category: 'mindfulness' });
      });

      it('should apply pagination with limit and offset', async () => {
        // Setup
        const mockExercises = [
          { id: '1', title: 'Exercise 1', category: 'mindfulness' }
        ];
        
        const mockSkip = jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            sort: jest.fn().mockResolvedValue(mockExercises)
          })
        });
        
        const mockLimit = jest.fn().mockReturnValue({
          sort: jest.fn().mockResolvedValue(mockExercises)
        });
        
        Exercise.find.mockReturnValue({
          skip: mockSkip,
          limit: mockLimit
        });
        
        // Execute
        const result = await exerciseResolvers.Query.getExercises(null, { limit: 5, offset: 10 });
        
        // Verify
        expect(result).toEqual(mockExercises);
        expect(mockSkip).toHaveBeenCalledWith(10);
        expect(mockLimit).toHaveBeenCalledWith(5);
      });
    });

    describe('getExercise', () => {
      it('should return an exercise when found', async () => {
        // Setup
        const mockExercise = { id: '1', title: 'Exercise 1', category: 'mindfulness' };
        Exercise.findById.mockResolvedValue(mockExercise);
        
        // Execute
        const result = await exerciseResolvers.Query.getExercise(null, { id: '1' });
        
        // Verify
        expect(result).toEqual(mockExercise);
        expect(Exercise.findById).toHaveBeenCalledWith('1');
      });

      it('should throw error when exercise not found', async () => {
        // Setup
        Exercise.findById.mockResolvedValue(null);
        
        // Execute & Verify
        await expect(exerciseResolvers.Query.getExercise(null, { id: '999' }))
          .rejects.toThrow('Exercițiu negăsit');
        expect(Exercise.findById).toHaveBeenCalledWith('999');
      });
    });

    describe('getRecommendedExercises', () => {
      it('should throw error when user is not authenticated', async () => {
        // Setup
        const req = { user: null };
        
        // Execute & Verify
        await expect(exerciseResolvers.Query.getRecommendedExercises(null, {}, { req }))
          .rejects.toThrow(AuthenticationError);
      });

      it('should return general exercises when user has no mood entries', async () => {
        // Setup
        const req = { user: { id: '1' } };
        MoodEntry.find.mockReturnValue({
          sort: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([])
          })
        });
        
        const mockExercises = [
          { id: '1', title: 'Exercise 1', category: 'mindfulness' },
          { id: '2', title: 'Exercise 2', category: 'breathing' }
        ];
        Exercise.find.mockResolvedValue(mockExercises);
        
        // Execute
        const result = await exerciseResolvers.Query.getRecommendedExercises(null, { limit: 2 }, { req });
        
        // Verify
        expect(result.length).toBe(2);
        expect(result[0].exercise).toEqual(mockExercises[0]);
        expect(result[0].score).toBe(0.5); // Scor neutru
        expect(MoodEntry.find).toHaveBeenCalledWith({ userId: '1' });
      });

      it('should recommend exercises based on user mood entries', async () => {
        // Setup
        const req = { user: { id: '1' } };
        const mockMoodEntries = [
          { mood: 7 },
          { mood: 3 }
        ];
        MoodEntry.find.mockReturnValue({
          sort: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue(mockMoodEntries)
          })
        });
        
        const mockExercises = [
          { 
            id: '1', 
            title: 'Exercise 1', 
            category: 'mindfulness',
            recommendedFor: [
              { moodLevel: { min: 1, max: 5 } }
            ]
          },
          { 
            id: '2', 
            title: 'Exercise 2', 
            category: 'breathing',
            recommendedFor: [
              { moodLevel: { min: 6, max: 10 } }
            ]
          }
        ];
        Exercise.find.mockResolvedValue(mockExercises);
        
        // Execute
        const result = await exerciseResolvers.Query.getRecommendedExercises(null, { limit: 2 }, { req });
        
        // Verify
        expect(result.length).toBe(2);
        // Verifică că exercițiul cu moodLevel potrivit are un scor mai mare
        const ex1Score = result.find(r => r.exercise.id === '1').score;
        const ex2Score = result.find(r => r.exercise.id === '2').score;
        
        // Exercițiul 1 ar trebui să aibă un scor mai mare pentru că media dispozițiilor este 5
        // care se încadrează în intervalul recomandat (1-5)
        expect(ex1Score).toBeGreaterThan(ex2Score);
      });
    });
  });

  describe('Mutation', () => {
    describe('createExercise', () => {
      it('should throw error when user is not authenticated', async () => {
        // Setup
        const req = { user: null };
        const input = { title: 'New Exercise', category: 'mindfulness' };
        
        // Execute & Verify
        await expect(exerciseResolvers.Mutation.createExercise(null, { input }, { req }))
          .rejects.toThrow(AuthenticationError);
      });

      it('should create a new exercise when authenticated', async () => {
        // Setup
        const req = { user: { id: '1' } };
        const input = { 
          title: 'New Exercise', 
          category: 'mindfulness',
          description: 'Description',
          duration: 10,
          content: { steps: ['Step 1', 'Step 2'] }
        };
        
        const mockExercise = {
          ...input,
          createdBy: '1',
          save: jest.fn().mockResolvedValue(true)
        };
        
        // Mock constructor
        const originalExercise = Exercise;
        Exercise.mockImplementation(function() {
          return mockExercise;
        });
        
        // Execute
        const result = await exerciseResolvers.Mutation.createExercise(null, { input }, { req });
        
        // Verify
        expect(result).toEqual(mockExercise);
        expect(mockExercise.save).toHaveBeenCalled();
        expect(mockExercise.createdBy).toBe('1');
        
        // Restore constructor
        Exercise = originalExercise;
      });
    });

    describe('deleteExercise', () => {
      it('should throw error when user is not authenticated', async () => {
        // Setup
        const req = { user: null };
        
        // Execute & Verify
        await expect(exerciseResolvers.Mutation.deleteExercise(null, { id: '1' }, { req }))
          .rejects.toThrow(AuthenticationError);
      });

      it('should throw error when exercise not found', async () => {
        // Setup
        const req = { user: { id: '1' } };
        Exercise.findById.mockResolvedValue(null);
        
        // Execute & Verify
        await expect(exerciseResolvers.Mutation.deleteExercise(null, { id: '999' }, { req }))
          .rejects.toThrow('Exercițiu negăsit');
      });

      it('should throw error when user is not the creator', async () => {
        // Setup
        const req = { user: { id: '1' } };
        const mockExercise = {
          id: '2',
          title: 'Exercise',
          createdBy: '2', // ID diferit de cel al utilizatorului
          toString: () => '2'
        };
        Exercise.findById.mockResolvedValue(mockExercise);
        
        // Execute & Verify
        await expect(exerciseResolvers.Mutation.deleteExercise(null, { id: '2' }, { req }))
          .rejects.toThrow(ForbiddenError);
      });

      it('should delete exercise when user is the creator', async () => {
        // Setup
        const req = { user: { id: '1' } };
        const mockExercise = {
          id: '2',
          title: 'Exercise',
          createdBy: '1', // ID identic cu cel al utilizatorului
          toString: () => '1',
          deleteOne: jest.fn().mockResolvedValue({ deletedCount: 1 })
        };
        Exercise.findById.mockResolvedValue(mockExercise);
        
        // Execute
        const result = await exerciseResolvers.Mutation.deleteExercise(null, { id: '2' }, { req });
        
        // Verify
        expect(result).toBe(true);
        expect(mockExercise.deleteOne).toHaveBeenCalled();
      });
    });
  });
});