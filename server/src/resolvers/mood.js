// Resolver mood.js actualizat pentru a fi compatibil cu testele
const { AuthenticationError } = require('apollo-server-express');
const { MoodEntry } = require('../models');

const moodResolvers = {
  Query: {
    getMoodEntries: async (_, { limit = 10, offset = 0 }, { req }) => {
      // Verifică dacă utilizatorul este autentificat
      if (!req.user) {
        throw new AuthenticationError('Trebuie să fii autentificat');
      }
      
      try {
        const entries = await MoodEntry.find({ userId: req.user.id })
          .sort({ date: -1 })
          .skip(offset)
          .limit(limit);
        
        return entries;
      } catch (error) {
        throw new Error(`Eroare la obținerea înregistrărilor de dispoziție: ${error.message}`);
      }
    },
    
    getMoodEntry: async (_, { id }, { req }) => {
      // Verifică dacă utilizatorul este autentificat
      if (!req.user) {
        throw new AuthenticationError('Trebuie să fii autentificat');
      }
      
      try {
        const entry = await MoodEntry.findOne({ 
          _id: id,
          userId: req.user.id
        });
        
        if (!entry) {
          throw new Error('Înregistrare negăsită');
        }
        
        return entry;
      } catch (error) {
        throw new Error(`Eroare la obținerea înregistrării de dispoziție: ${error.message}`);
      }
    },
    
    getMoodStatistics: async (_, { startDate, endDate }, { req }) => {
      // Verifică dacă utilizatorul este autentificat
      if (!req.user) {
        throw new AuthenticationError('Trebuie să fii autentificat');
      }
      
      try {
        const query = { userId: req.user.id };
        
        if (startDate || endDate) {
          query.date = {};
          if (startDate) query.date.$gte = new Date(startDate);
          if (endDate) query.date.$lte = new Date(endDate);
        }
        
        // Modificare pentru a fi compatibil cu testele - nu mai folosim sort() după find()
        const entries = await MoodEntry.find(query);
        
        // Sortăm manual dacă avem nevoie
        const sortedEntries = entries.sort((a, b) => {
          return new Date(a.date) - new Date(b.date);
        });
        
        if (sortedEntries.length === 0) {
          return {
            averageMood: 0,
            moodTrend: [],
            factorCorrelations: []
          };
        }
        
        // Calculează media dispozițiilor
        const totalMood = sortedEntries.reduce((sum, entry) => sum + entry.mood, 0);
        const averageMood = totalMood / sortedEntries.length;
        
        // Creează tendința dispozițiilor (array de valori)
        const moodTrend = sortedEntries.map(entry => entry.mood);
        
        // Calculează corelațiile factorilor (simplificat)
        const factorCorrelations = [];
        const factorTypes = ['sleep', 'stress', 'activity', 'social'];
        
        factorTypes.forEach(factor => {
          const entriesWithFactor = sortedEntries.filter(entry => 
            entry.factors && entry.factors[factor]
          );
          
          if (entriesWithFactor.length > 0) {
            const correlation = calculateCorrelation(
              entriesWithFactor.map(e => e.factors[factor]),
              entriesWithFactor.map(e => e.mood)
            );
            
            factorCorrelations.push({
              factor,
              correlation
            });
          }
        });
        
        return {
          averageMood,
          moodTrend,
          factorCorrelations
        };
      } catch (error) {
        throw new Error(`Eroare la calcularea statisticilor: ${error.message}`);
      }
    }
  },
  
  Mutation: {
    createMoodEntry: async (_, { input }, { req }) => {
      // Verifică dacă utilizatorul este autentificat
      if (!req.user) {
        throw new AuthenticationError('Trebuie să fii autentificat');
      }
      
      try {
        // Creează o nouă înregistrare de dispoziție
        const moodEntry = new MoodEntry({
          userId: req.user.id,
          mood: input.mood,
          notes: input.notes,
          factors: input.factors,
          tags: input.tags
        });
        
        // Salvează în baza de date
        await moodEntry.save();
        
        return moodEntry;
      } catch (error) {
        throw new Error(`Eroare la crearea înregistrării de dispoziție: ${error.message}`);
      }
    },
    
    updateMoodEntry: async (_, { id, input }, { req }) => {
      // Verifică dacă utilizatorul este autentificat
      if (!req.user) {
        throw new AuthenticationError('Trebuie să fii autentificat');
      }
      
      try {
        // Caută înregistrarea și verifică dacă aparține utilizatorului
        const moodEntry = await MoodEntry.findOne({
          _id: id,
          userId: req.user.id
        });
        
        if (!moodEntry) {
          throw new Error('Înregistrare negăsită sau nu ai permisiunea să o modifici');
        }
        
        // Actualizează câmpurile
        moodEntry.mood = input.mood;
        if (input.notes !== undefined) moodEntry.notes = input.notes;
        if (input.factors !== undefined) moodEntry.factors = input.factors;
        if (input.tags !== undefined) moodEntry.tags = input.tags;
        
        // Salvează modificările
        await moodEntry.save();
        
        return moodEntry;
      } catch (error) {
        throw new Error(`Eroare la actualizarea înregistrării de dispoziție: ${error.message}`);
      }
    },
    
    deleteMoodEntry: async (_, { id }, { req }) => {
      // Verifică dacă utilizatorul este autentificat
      if (!req.user) {
        throw new AuthenticationError('Trebuie să fii autentificat');
      }
      
      try {
        // Caută și șterge înregistrarea
        const result = await MoodEntry.deleteOne({
          _id: id,
          userId: req.user.id
        });
        
        // Verifică dacă a fost ștearsă o înregistrare
        if (result.deletedCount === 0) {
          throw new Error('Înregistrare negăsită sau nu ai permisiunea să o ștergi');
        }
        
        return true;
      } catch (error) {
        throw new Error(`Eroare la ștergerea înregistrării de dispoziție: ${error.message}`);
      }
    }
  }
};

// Funcție simplă pentru calcularea corelației
function calculateCorrelation(array1, array2) {
  if (array1.length !== array2.length) {
    throw new Error('Arrayurile trebuie să aibă aceeași lungime');
  }
  
  const n = array1.length;
  
  // Calculează media
  const mean1 = array1.reduce((sum, val) => sum + val, 0) / n;
  const mean2 = array2.reduce((sum, val) => sum + val, 0) / n;
  
  // Calculează deviațiile și produsele
  let sum_xy = 0;
  let sum_x2 = 0;
  let sum_y2 = 0;
  
  for (let i = 0; i < n; i++) {
    const x_dev = array1[i] - mean1;
    const y_dev = array2[i] - mean2;
    
    sum_xy += x_dev * y_dev;
    sum_x2 += x_dev * x_dev;
    sum_y2 += y_dev * y_dev;
  }
  
  // Calculează coeficientul de corelație
  const r = sum_xy / Math.sqrt(sum_x2 * sum_y2);
  
  return r;
}

module.exports = moodResolvers;