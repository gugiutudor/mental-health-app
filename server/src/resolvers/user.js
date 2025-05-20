// În fișierul server/src/resolvers/user.js

const jwt = require('jsonwebtoken');
const { AuthenticationError, UserInputError } = require('apollo-server-express');
const { User } = require('../models');

// Funcție pentru generarea unui token JWT
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email 
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};

const userResolvers = {
  Query: {
    me: async (_, __, { req }) => {
      // Verifică dacă utilizatorul este autentificat
      if (!req.user) {
        throw new AuthenticationError('Trebuie să fii autentificat');
      }
      
      try {
        const user = await User.findById(req.user.id);
        if (!user) {
          throw new Error('Utilizator negăsit');
        }
        return user;
      } catch (error) {
        throw new Error(`Eroare la obținerea profilului: ${error.message}`);
      }
    }
  },
  
  Mutation: {
    register: async (_, { input }) => {
      const { email, password, firstName, lastName } = input;
      
      try {
        // Verifică dacă email-ul există deja
        const existingUser = await User.findOne({ email });
        if (existingUser) {
          throw new UserInputError('Email-ul este deja utilizat');
        }
        
        // Creează un nou utilizator
        const user = new User({
          email,
          password,
          firstName,
          lastName
        });
        
        // Salvează utilizatorul în baza de date
        await user.save();
        
        // Generează token-ul de autentificare
        const token = generateToken(user);
        
        return {
          token,
          user
        };
      } catch (error) {
        throw new Error(`Eroare la înregistrare: ${error.message}`);
      }
    },
    
    login: async (_, { input }) => {
      const { email, password } = input;
      
      try {
        // Verifică dacă utilizatorul există
        const user = await User.findOne({ email });
        if (!user) {
          throw new UserInputError('Email sau parolă incorectă');
        }
        
        // Verifică dacă parola este corectă
        const isPasswordCorrect = await user.comparePassword(password);
        if (!isPasswordCorrect) {
          throw new UserInputError('Email sau parolă incorectă');
        }
        
        // Generează token-ul de autentificare
        const token = generateToken(user);
        
        // Actualizează ultima activitate
        user.lastActive = new Date();
        await user.save();
        
        return {
          token,
          user
        };
      } catch (error) {
        throw new Error(`Eroare la autentificare: ${error.message}`);
      }
    },
    
    updateUser: async (_, { input }, { req }) => {
      // Verifică dacă utilizatorul este autentificat
      if (!req.user) {
        throw new AuthenticationError('Trebuie să fii autentificat');
      }
      
      try {
        const user = await User.findById(req.user.id);
        if (!user) {
          throw new Error('Utilizator negăsit');
        }
        
        // Actualizează câmpurile furnizate
        if (input.firstName) user.firstName = input.firstName;
        if (input.lastName) user.lastName = input.lastName;
        if (input.email) user.email = input.email;
        if (input.preferences) {
          user.preferences = {
            ...user.preferences,
            ...input.preferences
          };
        }
        
        // Salvează modificările
        await user.save();
        
        return user;
      } catch (error) {
        throw new Error(`Eroare la actualizarea profilului: ${error.message}`);
      }
    }
  }
};

module.exports = userResolvers;