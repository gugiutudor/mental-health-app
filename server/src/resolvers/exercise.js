// Resolver exercise.js actualizat pentru a fi compatibil cu testele
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
      // Verifică dacă utilizatorul este autentificat
      if (!req.user) {
        throw new AuthenticationError('Trebuie să fii autentificat');
      }
      
      try {
        // Obține ultimele 5 înregistrări de dispoziție ale utilizatorului
        const recentMoods = await MoodEntry.find({ userId: req.user.id })
          .sort({ date: -1 })
          .limit(5);
        
        if (recentMoods.length === 0) {
          // Dacă nu există înregistrări, returnează exerciții generale
          // Modificare pentru a fi compatibil cu testele - nu mai folosim limit() după find()
          const allExercises = await Exercise.find();
          const generalExercises = allExercises.slice(0, limit);
            
          return generalExercises.map(exercise => ({
            exercise,
            score: 0.5 // Scor neutru pentru toate exercițiile
          }));
        }
        
        // Calculează dispoziția medie
        const averageMood = recentMoods.reduce((sum, entry) => sum + entry.mood, 0) / recentMoods.length;
        
        // Obține toate exercițiile
        const allExercises = await Exercise.find();
        
        // Calculează scoruri de recomandare pentru fiecare exercițiu
        const scoredExercises = allExercises.map(exercise => {
          let score = 0.5; // Scor de bază
          
          // Verifică recomandările pentru dispoziție
          if (exercise.recommendedFor && exercise.recommendedFor.length > 0) {
            for (const rec of exercise.recommendedFor) {
              if (rec.moodLevel) {
                const { min, max } = rec.moodLevel;
                
                // Verifică dacă dispoziția medie se încadrează în intervalul recomandat
                if (min <= averageMood && averageMood <= max) {
                  score += 0.3; // Crește scorul pentru potrivirea cu dispoziția
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
        
        // Sortează și limitează rezultatele
        scoredExercises.sort((a, b) => b.score - a.score);
        return scoredExercises.slice(0, limit);
      } catch (error) {
        throw new Error(`Eroare la obținerea recomandărilor: ${error.message}`);
      }
    }
  },
  
  Mutation: {
    createExercise: async (_, { input }, { req }) => {
      // Verifică dacă utilizatorul este autentificat
      if (!req.user) {
        throw new AuthenticationError('Trebuie să fii autentificat');
      }
      
      try {
        // Creează un nou exercițiu
        const exercise = new Exercise({
          ...input,
          createdBy: req.user.id
        });
        
        // Salvează în baza de date
        await exercise.save();
        
        return exercise;
      } catch (error) {
        throw new Error(`Eroare la crearea exercițiului: ${error.message}`);
      }
    },
    
    updateExercise: async (_, { id, input }, { req }) => {
      // Verifică dacă utilizatorul este autentificat
      if (!req.user) {
        throw new AuthenticationError('Trebuie să fii autentificat');
      }
      
      try {
        // Caută exercițiul
        const exercise = await Exercise.findById(id);
        
        if (!exercise) {
          throw new Error('Exercițiu negăsit');
        }
        
        // Verifică dacă utilizatorul este creatorul exercițiului
        if (exercise.createdBy && exercise.createdBy.toString() !== req.user.id) {
          throw new ForbiddenError('Nu ai permisiunea să modifici acest exercițiu');
        }
        
        // Actualizează câmpurile
        Object.keys(input).forEach(key => {
          exercise[key] = input[key];
        });
        
        // Salvează modificările
        await exercise.save();
        
        return exercise;
      } catch (error) {
        // Verificăm dacă eroarea este deja un ForbiddenError și o retransmitem
        if (error instanceof ForbiddenError) {
          throw error;
        }
        throw new Error(`Eroare la actualizarea exercițiului: ${error.message}`);
      }
    },
    
    deleteExercise: async (_, { id }, { req }) => {
      // Verifică dacă utilizatorul este autentificat
      if (!req.user) {
        throw new AuthenticationError('Trebuie să fii autentificat');
      }
      
      try {
        // Caută exercițiul
        const exercise = await Exercise.findById(id);
        
        if (!exercise) {
          throw new Error('Exercițiu negăsit');
        }
        
        // Verifică dacă utilizatorul este creatorul exercițiului
        if (exercise.createdBy && exercise.createdBy.toString() !== req.user.id) {
          // Schimbăm aici să aruncăm ForbiddenError direct
          throw new ForbiddenError('Nu ai permisiunea să ștergi acest exercițiu');
        }
        
        // Șterge exercițiul
        await exercise.deleteOne();
        
        return true;
      } catch (error) {
        // Verificăm dacă eroarea este deja un ForbiddenError și o retransmitem
        if (error instanceof ForbiddenError) {
          throw error;
        }
        throw new Error(`Eroare la ștergerea exercițiului: ${error.message}`);
      }
    }
  }
};

module.exports = exerciseResolvers;