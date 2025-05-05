// server/src/resolvers/__tests__/user.test.js
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User } = require('../../models');
const userResolvers = require('../user');
const { AuthenticationError, UserInputError } = require('apollo-server-express');

// Mock pentru funcțiile de token JWT
jest.mock('jsonwebtoken');
jwt.sign.mockReturnValue('mock-token');

describe('User Resolver Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  describe('Query', () => {
    describe('me', () => {
      it('should throw AuthenticationError if user is not authenticated', async () => {
        // Pregătire context fără utilizator autentificat
        const context = { req: { user: null } };
        
        // Execută query-ul me
        await expect(userResolvers.Query.me(null, {}, context))
          .rejects.toThrow(AuthenticationError);
      });
      
      it('should return user data if user is authenticated', async () => {
        // Pregătire utilizator de test
        const mockUser = {
          id: 'user123',
          name: 'Test User',
          email: 'test@example.com',
          preferences: { notifications: true }
        };
        
        // Mock pentru User.findById
        User.findById = jest.fn().mockResolvedValue(mockUser);
        
        // Pregătire context cu utilizator autentificat
        const context = { req: { user: { id: 'user123' } } };
        
        // Execută query-ul me
        const result = await userResolvers.Query.me(null, {}, context);
        
        // Verifică rezultatul
        expect(result).toEqual(mockUser);
        expect(User.findById).toHaveBeenCalledWith('user123');
      });
      
      it('should throw error if user is not found', async () => {
        // Mock pentru User.findById returnează null
        User.findById = jest.fn().mockResolvedValue(null);
        
        // Pregătire context cu utilizator autentificat
        const context = { req: { user: { id: 'user123' } } };
        
        // Execută query-ul me
        await expect(userResolvers.Query.me(null, {}, context))
          .rejects.toThrow('Utilizator negăsit');
      });
    });
  });
  
  describe('Mutation', () => {
    describe('register', () => {
      it('should create a new user and return token with user data', async () => {
        // Input pentru înregistrare
        const input = {
          name: 'New User',
          email: 'new@example.com',
          password: 'password123'
        };
        
        // Mock pentru User.findOne (verificare email existent)
        User.findOne = jest.fn().mockResolvedValue(null);
        
        // Mock pentru User constructor și save
        const mockSavedUser = {
          id: 'newuser123',
          name: input.name,
          email: input.email,
          save: jest.fn().mockResolvedValue(true)
        };
        
        User.mockImplementation(() => mockSavedUser);
        
        // Execută mutația register
        const result = await userResolvers.Mutation.register(null, { input }, {});
        
        // Verifică rezultatul
        expect(result).toEqual({
          token: 'mock-token',
          user: mockSavedUser
        });
        
        // Verifică că jwt.sign a fost apelat cu datele corecte
        expect(jwt.sign).toHaveBeenCalled();
        
        // Verifică că utilizatorul a fost salvat
        expect(mockSavedUser.save).toHaveBeenCalled();
      });
      
      it('should throw error if email already exists', async () => {
        // Input pentru înregistrare
        const input = {
          name: 'New User',
          email: 'existing@example.com',
          password: 'password123'
        };
        
        // Mock pentru User.findOne (găsește email existent)
        User.findOne = jest.fn().mockResolvedValue({ email: input.email });
        
        // Execută mutația register
        await expect(userResolvers.Mutation.register(null, { input }, {}))
          .rejects.toThrow(UserInputError);
      });
    });
    
    describe('login', () => {
      it('should return token and user data for valid credentials', async () => {
        // Input pentru login
        const input = {
          email: 'user@example.com',
          password: 'password123'
        };
        
        // Mock pentru User.findOne (găsește utilizatorul)
        const mockUser = {
          id: 'user123',
          email: input.email,
          comparePassword: jest.fn().mockResolvedValue(true),
          lastActive: null,
          save: jest.fn().mockResolvedValue(true)
        };
        
        User.findOne = jest.fn().mockResolvedValue(mockUser);
        
        // Execută mutația login
        const result = await userResolvers.Mutation.login(null, { input }, {});
        
        // Verifică rezultatul
        expect(result).toEqual({
          token: 'mock-token',
          user: mockUser
        });
        
        // Verifică că jwt.sign a fost apelat
        expect(jwt.sign).toHaveBeenCalled();
        
        // Verifică că lastActive a fost actualizat
        expect(mockUser.lastActive).toBeDefined();
        expect(mockUser.save).toHaveBeenCalled();
      });
      
      it('should throw error if user is not found', async () => {
        // Input pentru login
        const input = {
          email: 'nonexistent@example.com',
          password: 'password123'
        };
        
        // Mock pentru User.findOne (nu găsește utilizatorul)
        User.findOne = jest.fn().mockResolvedValue(null);
        
        // Execută mutația login
        await expect(userResolvers.Mutation.login(null, { input }, {}))
          .rejects.toThrow(UserInputError);
      });
      
      it('should throw error if password is incorrect', async () => {
        // Input pentru login
        const input = {
          email: 'user@example.com',
          password: 'wrongpassword'
        };
        
        // Mock pentru User.findOne (găsește utilizatorul)
        const mockUser = {
          email: input.email,
          comparePassword: jest.fn().mockResolvedValue(false)
        };
        
        User.findOne = jest.fn().mockResolvedValue(mockUser);
        
        // Execută mutația login
        await expect(userResolvers.Mutation.login(null, { input }, {}))
          .rejects.toThrow(UserInputError);
      });
    });
    
    describe('updateUser', () => {
      it('should update user profile and return updated data', async () => {
        // Input pentru actualizare
        const input = {
          name: 'Updated Name',
          email: 'updated@example.com',
          preferences: {
            notifications: false,
            theme: 'dark'
          }
        };
        
        // Pregătire utilizator existent
        const mockUser = {
          id: 'user123',
          name: 'Original Name',
          email: 'original@example.com',
          preferences: {
            notifications: true,
            theme: 'light'
          },
          save: jest.fn().mockResolvedValue(true)
        };
        
        // Mock pentru User.findById
        User.findById = jest.fn().mockResolvedValue(mockUser);
        
        // Pregătire context cu utilizator autentificat
        const context = { req: { user: { id: 'user123' } } };
        
        // Execută mutația updateUser
        const result = await userResolvers.Mutation.updateUser(null, { input }, context);
        
        // Verifică actualizarea câmpurilor
        expect(mockUser.name).toBe(input.name);
        expect(mockUser.email).toBe(input.email);
        expect(mockUser.preferences.notifications).toBe(input.preferences.notifications);
        expect(mockUser.preferences.theme).toBe(input.preferences.theme);
        
        // Verifică că metoda save a fost apelată
        expect(mockUser.save).toHaveBeenCalled();
        
        // Verifică rezultatul
        expect(result).toEqual(mockUser);
      });
      
      it('should throw AuthenticationError if user is not authenticated', async () => {
        // Input pentru actualizare
        const input = { name: 'Updated Name' };
        
        // Pregătire context fără utilizator autentificat
        const context = { req: { user: null } };
        
        // Execută mutația updateUser
        await expect(userResolvers.Mutation.updateUser(null, { input }, context))
          .rejects.toThrow(AuthenticationError);
      });
      
      it('should throw error if user is not found', async () => {
        // Input pentru actualizare
        const input = { name: 'Updated Name' };
        
        // Mock pentru User.findById returnează null
        User.findById = jest.fn().mockResolvedValue(null);
        
        // Pregătire context cu utilizator autentificat
        const context = { req: { user: { id: 'user123' } } };
        
        // Execută mutația updateUser
        await expect(userResolvers.Mutation.updateUser(null, { input }, context))
          .rejects.toThrow('Utilizator negăsit');
      });
    });
  });
});