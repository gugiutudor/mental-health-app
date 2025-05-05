// server/src/resolvers/__tests__/exercise.test.js
const mongoose = require('mongoose');
const { AuthenticationError, ForbiddenError } = require('apollo-server-express');
const { Exercise, MoodEntry } = require('../../models');
const exerciseResolvers = require('../exercise');

// Mock pentru modelele Mongoose
jest.mock('../../models/Exercise');
jest.mock('../../models/MoodEntry');

describe('Exercise Resolver Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  describe('Query', () => {
    describe('getExercises', () => {
      it('should return exercises with optional category filter', async () => {
        // Mock pentru exerciții
        const mockExercises = [
          { id: 'ex1', title: 'Exercise 1', category: 'mindfulness' },
          { id: 'ex2', title: 'Exercise 2', category: 'mindfulness' }
        ];
        
        // Mock pentru Exercise.find
        Exercise.find = jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({
              sort: jest.fn().mockResolvedValue(mockExercises)
            })
          })
        });
        
        // Execută query-ul cu filtru pentru categorie
        const result = await exerciseResolvers.Query.getExercises(
          null, 
          { category: 'mindfulness', limit: 10, offset: 0 },
          {}
        );
        
        // Verifică rezultatul
        expect(result).toEqual(mockExercises);
        
        // Verifică că find a fost apelat cu query corect
        expect(Exercise.find).toHaveBeenCalledWith({ category: 'mindfulness' });
      });
      
      it('should return all exercises without category filter', async () => {
        // Mock pentru exerciții
        const mockExercises = [
          { id: 'ex1', title: 'Exercise 1', category: 'mindfulness' },
          { id: 'ex2', title: 'Exercise 2', category: 'breathing' }
        ];
        
        // Mock pentru Exercise.find
        Exercise.find = jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({
              sort: jest.fn().mockResolvedValue(mockExercises)
            })
          })
        });
        
        // Execută query-ul fără filtru
        const result = await exerciseResolvers.Query.getExercises(
          null, 
          { limit: 10, offset: 0 },
          {}
        );
        
        // Verifică rezultatul
        expect(result).toEqual(mockExercises);
        
        // Verifică că find a fost apelat cu query gol
        expect(Exercise.find).toHaveBeenCalledWith({});
      });
    });
    
    describe('getExercise', () => {
      it('should return specific exercise by id', async () => {
        // Mock pentru exercițiu
        const mockExercise = { 
          id: 'ex1', 
          title: 'Exercise 1', 
          category: 'mindfulness' 
        };
        
        // Mock pentru Exercise.findById
        Exercise.findById = jest.fn().mockResolvedValue(mockExercise);
        
        // Execută query-ul
        const result = await exerciseResolvers.Query.getExercise(
          null, 
          { id: 'ex1' },
          {}
        );
        
        // Verifică rezultatul
        expect(result).toEqual(mockExercise);
        
        // Verifică că findById a fost apelat corect
        expect(Exercise.findById).toHaveBeenCalledWith('ex1');
      });
      
      it('should throw error if exercise is not found', async () => {
        // Mock pentru Exercise.findById returnează null
        Exercise.findById = jest.fn().mockResolvedValue(null);
        
        // Execută query-ul
        await expect(exerciseResolvers.Query.getExercise(
          null, 
          { id: 'nonexistent' },
          {}
        )).rejects.toThrow('Exercițiu negăsit');
      });
    });
    
    describe('getRecommendedExercises', () => {
      it('should throw AuthenticationError if user is not authenticated', async () => {
        // Context fără utilizator autentificat
        const context = { req: { user: null } };
        
        // Execută query-ul
        await expect(exerciseResolvers.Query.getRecommendedExercises(
          null,
          { limit: 5 },
          context
        )).rejects.toThrow(AuthenticationError);
      });
      
      it('should return general exercises if user has no mood entries', async () => {
        // Mock pentru MoodEntry.find returnează array gol
        MoodEntry.find = jest.fn().mockReturnValue({
          sort: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue([])
          })
        });
        
        // Mock pentru Exercise.find returnează exerciții generale
        const mockExercises = [
          { id: 'ex1', title: 'General Exercise 1' },
          { id: 'ex2', title: 'General Exercise 2' }
        ];
        
        Exercise.find = jest.fn().mockResolvedValue(mockExercises);
        
        // Context cu utilizator autentificat
        const context = { req: { user: { id: 'user123' } } };
        
        // Execută query-ul
        const result = await exerciseResolvers.Query.getRecommendedExercises(
          null,
          { limit: 2 },
          context
        );
        
        // Verifică rezultatul - fiecare exercițiu ar trebui să aibă un scor neutru
        expect(result).toHaveLength(2);
        expect(result[0].exercise).toEqual(mockExercises[0]);
        expect(result[0].score).toBe(0.5);
        expect(result[1].exercise).toEqual(mockExercises[1]);
        expect(result[1].score).toBe(0.5);
      });
      
      it('should calculate and sort recommendations based on mood levels', async () => {
        // Mock pentru intrările de dispoziție recente
        const mockMoodEntries = [
          { mood: 7 },
          { mood: 8 },
          { mood: 6 }
        ];
        
        // Calculează media așteptată: (7 + 8 + 6) / 3 = 7
        const expectedAverageMood = 7;
        
        // Mock pentru MoodEntry.find
        MoodEntry.find = jest.fn().mockReturnValue({
          sort: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue(mockMoodEntries)
          })
        });
        
        // Mock pentru exerciții cu recomandări diferite
        const mockExercises = [
          { 
            id: 'ex1', 
            title: 'Match Exercise', 
            recommendedFor: [{ moodLevel: { min: 6, max: 8 } }]
          },
          { 
            id: 'ex2', 
            title: 'No Match Exercise', 
            recommendedFor: [{ moodLevel: { min: 1, max: 4 } }]
          },
          { 
            id: 'ex3', 
            title: 'No Recommendation Exercise'
          }
        ];
        
        Exercise.find = jest.fn().mockResolvedValue(mockExercises);
        
        // Context cu utilizator autentificat
        const context = { req: { user: { id: 'user123' } } };
        
        // Execută query-ul
        const result = await exerciseResolvers.Query.getRecommendedExercises(
          null,
          { limit: 3 },
          context
        );
        
        // Verifică rezultatul - exercițiile ar trebui sortate după scor
        expect(result).toHaveLength(3);
        
        // Primul ar trebui să fie cel care se potrivește cu dispoziția
        expect(result[0].exercise.id).toBe('ex1');
        expect(result[0].score).toBeGreaterThan(0.5);
        
        // Ultimele două ar trebui să aibă scoruri mai mici
        expect(result[1].score).toBeLessThanOrEqual(result[0].score);
        expect(result[2].score).toBeLessThanOrEqual(result[0].score);
      });
    });
  });
  
  describe('Mutation', () => {
    describe('createExercise', () => {
      it('should throw AuthenticationError if user is not authenticated', async () => {
        // Context fără utilizator autentificat
        const context = { req: { user: null } };
        
        // Execută mutația
        await expect(exerciseResolvers.Mutation.createExercise(
          null,
          { input: { title: 'New Exercise' } },
          context
        )).rejects.toThrow(AuthenticationError);
      });
      
      it('should create and return a new exercise', async () => {
        // Input pentru creare
        const input = {
          title: 'New Mindfulness Exercise',
          description: 'A calming exercise',
          category: 'mindfulness',
          duration: 15,
          content: {
            steps: ['Step 1', 'Step 2', 'Step 3']
          },
          difficulty: 'beginner'
        };
        
        // Mock pentru exercițiul creat
        const mockCreatedExercise = {
          ...input,
          id: 'newex123',
          createdBy: 'user123',
          save: jest.fn().mockResolvedValue(true)
        };
        
        // Mock pentru constructorul Exercise
        Exercise.mockImplementation(() => mockCreatedExercise);
        
        // Context cu utilizator autentificat
        const context = { req: { user: { id: 'user123' } } };
        
        // Execută mutația
        const result = await exerciseResolvers.Mutation.createExercise(
          null,
          { input },
          context
        );
        
        // Verifică rezultatul
        expect(result).toEqual(mockCreatedExercise);
        
        // Verifică că save a fost apelat
        expect(mockCreatedExercise.save).toHaveBeenCalled();
        
        // Verifică că s-a creat cu createdBy corect
        expect(mockCreatedExercise.createdBy).toBe('user123');
      });
    });
    
    describe('updateExercise', () => {
      it('should throw AuthenticationError if user is not authenticated', async () => {
        // Context fără utilizator autentificat
        const context = { req: { user: null } };
        
        // Execută mutația
        await expect(exerciseResolvers.Mutation.updateExercise(
          null,
          { id: 'ex1', input: { title: 'Updated Title' } },
          context
        )).rejects.toThrow(AuthenticationError);
      });
      
      it('should update and return exercise if user is creator', async () => {
        // ID exercițiu și input pentru actualizare
        const exerciseId = 'ex123';
        const input = {
          title: 'Updated Exercise',
          description: 'Updated description',
          category: 'breathing',
          duration: 20
        };
        
        // Mock pentru exercițiul existent
        const mockExercise = {
          id: exerciseId,
          title: 'Original Exercise',
          description: 'Original description',
          category: 'mindfulness',
          duration: 15,
          createdBy: new mongoose.Types.ObjectId('user123'),
          save: jest.fn().mockResolvedValue(true)
        };
        
        // Convertește _id la string pentru test
        mockExercise.createdBy.toString = jest.fn().mockReturnValue('user123');
        
        // Mock pentru Exercise.findById
        Exercise.findById = jest.fn().mockResolvedValue(mockExercise);
        
        // Context cu utilizator autentificat
        const context = { req: { user: { id: 'user123' } } };
        
        // Execută mutația
        const result = await exerciseResolvers.Mutation.updateExercise(
          null,
          { id: exerciseId, input },
          context
        );
        
        // Verifică actualizarea câmpurilor
        expect(mockExercise.title).toBe(input.title);
        expect(mockExercise.description).toBe(input.description);
        expect(mockExercise.category).toBe(input.category);
        expect(mockExercise.duration).toBe(input.duration);
        
        // Verifică că save a fost apelat
        expect(mockExercise.save).toHaveBeenCalled();
        
        // Verifică rezultatul
        expect(result).toEqual(mockExercise);
      });
      
      it('should throw ForbiddenError if user is not creator', async () => {
        // Mock pentru exercițiul existent cu alt creator
        const mockExercise = {
          id: 'ex123',
          createdBy: new mongoose.Types.ObjectId('otheruser456')
        };
        
        // Convertește _id la string pentru test
        mockExercise.createdBy.toString = jest.fn().mockReturnValue('otheruser456');
        
        // Mock pentru Exercise.findById
        Exercise.findById = jest.fn().mockResolvedValue(mockExercise);
        
        // Context cu utilizator autentificat
        const context = { req: { user: { id: 'user123' } } };
        
        // Execută mutația
        await expect(exerciseResolvers.Mutation.updateExercise(
          null,
          { id: 'ex123', input: { title: 'Updated Title' } },
          context
        )).rejects.toThrow(ForbiddenError);
      });
      
      it('should throw error if exercise is not found', async () => {
        // Mock pentru Exercise.findById returnează null
        Exercise.findById = jest.fn().mockResolvedValue(null);
        
        // Context cu utilizator autentificat
        const context = { req: { user: { id: 'user123' } } };
        
        // Execută mutația
        await expect(exerciseResolvers.Mutation.updateExercise(
          null,
          { id: 'nonexistent', input: { title: 'Updated Title' } },
          context
        )).rejects.toThrow('Exercițiu negăsit');
      });
    });
    
    describe('deleteExercise', () => {
      it('should throw AuthenticationError if user is not authenticated', async () => {
        // Context fără utilizator autentificat
        const context = { req: { user: null } };
        
        // Execută mutația
        await expect(exerciseResolvers.Mutation.deleteExercise(
          null,
          { id: 'ex1' },
          context
        )).rejects.toThrow(AuthenticationError);
      });
      
      it('should delete exercise and return true if user is creator', async () => {
        // Mock pentru exercițiul existent
        const mockExercise = {
          id: 'ex123',
          createdBy: new mongoose.Types.ObjectId('user123'),
          deleteOne: jest.fn().mockResolvedValue(true)
        };
        
        // Convertește _id la string pentru test
        mockExercise.createdBy.toString = jest.fn().mockReturnValue('user123');
        
        // Mock pentru Exercise.findById
        Exercise.findById = jest.fn().mockResolvedValue(mockExercise);
        
        // Context cu utilizator autentificat
        const context = { req: { user: { id: 'user123' } } };
        
        // Execută mutația
        const result = await exerciseResolvers.Mutation.deleteExercise(
          null,
          { id: 'ex123' },
          context
        );
        
        // Verifică rezultatul
        expect(result).toBe(true);
        
        // Verifică că deleteOne a fost apelat
        expect(mockExercise.deleteOne).toHaveBeenCalled();
      });
      
      it('should throw ForbiddenError if user is not creator', async () => {
        // Mock pentru exercițiul existent cu alt creator
        const mockExercise = {
          id: 'ex123',
          createdBy: new mongoose.Types.ObjectId('otheruser456')
        };
        
        // Convertește _id la string pentru test
        mockExercise.createdBy.toString = jest.fn().mockReturnValue('otheruser456');
        
        // Mock pentru Exercise.findById
        Exercise.findById = jest.fn().mockResolvedValue(mockExercise);
        
        // Context cu utilizator autentificat
        const context = { req: { user: { id: 'user123' } } };
        
        // Execută mutația
        await expect(exerciseResolvers.Mutation.deleteExercise(
          null,
          { id: 'ex123' },
          context
        )).rejects.toThrow(ForbiddenError);
      });
      
      it('should throw error if exercise is not found', async () => {
        // Mock pentru Exercise.findById returnează null
        Exercise.findById = jest.fn().mockResolvedValue(null);
        
        // Context cu utilizator autentificat
        const context = { req: { user: { id: 'user123' } } };
        
        // Execută mutația
        await expect(exerciseResolvers.Mutation.deleteExercise(
          null,
          { id: 'nonexistent' },
          context
        )).rejects.toThrow('Exercițiu negăsit');
      });
    });
  });
});