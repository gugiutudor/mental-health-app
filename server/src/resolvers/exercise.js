const { AuthenticationError, ForbiddenError } = require('apollo-server-express');
const { Exercise, MoodEntry } = require('../models');

const exerciseResolvers = {
  Query: {
    getExercises: async (_, { category, limit = 10, offset = 0 }) => {
      try {
        const query = {};
        if (category) query.category = category;
        
        const exercises = await Exercise.find(query)
          .skip(offset)
          .limit(limit)
          .sort({ createdAt: -1 });
        
        return exercises;
      } catch (error) {
        throw new Error(`Eroare la obținerea exercițiilor: ${error.message}`);
      }
    },
    
    getExercise: async (_, { id }) => {
      try {
        const exercise = await Exercise.findById(id);
        
        if (!exercise) {
          throw new Error('Exercițiu negăsit');
        }
        
        return exercise;
      } catch (error) {
        throw new Error(`Eroare la obținerea exercițiului: ${error.message}`);
      }
    },
    
    getRecommendedExercises: async (_, { limit = 5 }, { req }) => {

      if (!req.user) {
        throw new AuthenticationError('Trebuie să fii autentificat');
      }
      
      try {

        const recentMoods = await MoodEntry.find({ userId: req.user.id })
          .sort({ date: -1 })
          .limit(5);
        
        if (recentMoods.length === 0) {
          const allExercises = await Exercise.find();
          const generalExercises = allExercises.slice(0, limit);
            
          return generalExercises.map(exercise => ({
            exercise,
            score: 0.5 
          }));
        }
        
        const averageMood = recentMoods.reduce((sum, entry) => sum + entry.mood, 0) / recentMoods.length;
        
        const allExercises = await Exercise.find();

        const scoredExercises = allExercises.map(exercise => {
          let score = 0.5; 

          if (exercise.recommendedFor && exercise.recommendedFor.length > 0) {
            for (const rec of exercise.recommendedFor) {
              if (rec.moodLevel) {
                const { min, max } = rec.moodLevel;
                if (min <= averageMood && averageMood <= max) {
                  score += 0.3; 
                  break;
                }
              }
            }
          }
          
          return {
            exercise,
            score
          };
        });

        scoredExercises.sort((a, b) => b.score - a.score);
        return scoredExercises.slice(0, limit);
      } catch (error) {
        throw new Error(`Eroare la obținerea recomandărilor: ${error.message}`);
      }
    }
  },
  
  Mutation: {
    createExercise: async (_, { input }, { req }) => {
      if (!req.user) {
        throw new AuthenticationError('Trebuie să fii autentificat');
      }
      
      try {
        const exercise = new Exercise({
          ...input,
          createdBy: req.user.id
        });

        await exercise.save();
        
        return exercise;
      } catch (error) {
        throw new Error(`Eroare la crearea exercițiului: ${error.message}`);
      }
    },
    
    updateExercise: async (_, { id, input }, { req }) => {
      if (!req.user) {
        throw new AuthenticationError('Trebuie să fii autentificat');
      }
      
      try {
        const exercise = await Exercise.findById(id);
        
        if (!exercise) {
          throw new Error('Exercițiu negăsit');
        }

        if (exercise.createdBy && exercise.createdBy.toString() !== req.user.id) {
          throw new ForbiddenError('Nu ai permisiunea să modifici acest exercițiu');
        }

        Object.keys(input).forEach(key => {
          exercise[key] = input[key];
        });
        
        await exercise.save();
        
        return exercise;
      } catch (error) {
        if (error instanceof ForbiddenError) {
          throw error;
        }
        throw new Error(`Eroare la actualizarea exercițiului: ${error.message}`);
      }
    },
    
    deleteExercise: async (_, { id }, { req }) => {
      if (!req.user) {
        throw new AuthenticationError('Trebuie să fii autentificat');
      }
      
      try {
        const exercise = await Exercise.findById(id);
        
        if (!exercise) {
          throw new Error('Exercițiu negăsit');
        }

        if (exercise.createdBy && exercise.createdBy.toString() !== req.user.id) {
          throw new ForbiddenError('Nu ai permisiunea să ștergi acest exercițiu');
        }
        
        await exercise.deleteOne();
        
        return true;
      } catch (error) {
        if (error instanceof ForbiddenError) {
          throw error;
        }
        throw new Error(`Eroare la ștergerea exercițiului: ${error.message}`);
      }
    }
  }
};

module.exports = exerciseResolvers;