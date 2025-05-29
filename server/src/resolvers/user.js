const jwt = require('jsonwebtoken');
const { AuthenticationError, UserInputError } = require('apollo-server-express');
const { User } = require('../models');

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
        const existingUser = await User.findOne({ email });
        if (existingUser) {
          throw new UserInputError('Email-ul este deja utilizat');
        }
        
        const user = new User({
          email,
          password,
          firstName,
          lastName
        });

        await user.save();

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
        const user = await User.findOne({ email });
        if (!user) {
          throw new UserInputError('Email sau parolă incorectă');
        }

        const isPasswordCorrect = await user.comparePassword(password);
        if (!isPasswordCorrect) {
          throw new UserInputError('Email sau parolă incorectă');
        }

        const token = generateToken(user);

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
      if (!req.user) {
        throw new AuthenticationError('Trebuie să fii autentificat');
      }
      
      try {
        const user = await User.findById(req.user.id);
        if (!user) {
          throw new Error('Utilizator negăsit');
        }

        if (input.firstName) user.firstName = input.firstName;
        if (input.lastName) user.lastName = input.lastName;
        if (input.email) user.email = input.email;
        if (input.preferences) {
          user.preferences = {
            ...user.preferences,
            ...input.preferences
          };
        }

        await user.save();
        
        return user;
      } catch (error) {
        throw new Error(`Eroare la actualizarea profilului: ${error.message}`);
      }
    }
  }
};

module.exports = userResolvers;