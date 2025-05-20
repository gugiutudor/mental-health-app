// server/src/resolvers/mood.js (implementare completă)
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
        
        // Asigură formatarea corectă a datelor și include întotdeauna ID-ul
        return entries.map(entry => {
          try {
            // Încearcă să folosească toObject dacă este disponibil
            if (typeof entry.toObject === 'function') {
              return entry.toObject();
            }
            
            // Altfel, creează un obiect simplu cu proprietățile necesare
            return {
              id: entry._id ? entry._id.toString() : entry.id,
              date: entry.date ? new Date(entry.date).toISOString() : new Date().toISOString(),
              mood: typeof entry.mood === 'number' ? entry.mood : (parseInt(entry.mood) || 5),
              notes: entry.notes || '',
              factors: entry.factors || {},
              tags: Array.isArray(entry.tags) ? entry.tags : [],
              userId: entry.userId,
              createdAt: entry.createdAt || new Date().toISOString(),
              updatedAt: entry.updatedAt || new Date().toISOString()
            };
          } catch (error) {
            console.error('Eroare la procesarea datelor:', error);
            // Returnează o versiune minimă a înregistrării în caz de eroare
            return {
              id: entry._id ? entry._id.toString() : (entry.id || 'unknown'),
              mood: entry.mood || 5
            };
          }
        });
      } catch (error) {
        console.error('Eroare la obținerea înregistrărilor de dispoziție:', error);
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
        
        try {
          // Încearcă să folosească toObject dacă este disponibil
          if (typeof entry.toObject === 'function') {
            return entry.toObject();
          }
          
          // Altfel, creează un obiect simplu cu proprietățile necesare
          return {
            id: entry._id ? entry._id.toString() : entry.id,
            date: entry.date ? new Date(entry.date).toISOString() : new Date().toISOString(),
            mood: typeof entry.mood === 'number' ? entry.mood : (parseInt(entry.mood) || 5),
            notes: entry.notes || '',
            factors: entry.factors || {},
            tags: Array.isArray(entry.tags) ? entry.tags : [],
            userId: entry.userId,
            createdAt: entry.createdAt || new Date().toISOString(),
            updatedAt: entry.updatedAt || new Date().toISOString()
          };
        } catch (error) {
          console.error('Eroare la procesarea datelor:', error);
          // Returnează o versiune minimă a înregistrării în caz de eroare
          return {
            id: entry._id ? entry._id.toString() : (entry.id || 'unknown'),
            mood: entry.mood || 5
          };
        }
      } catch (error) {
        console.error('Eroare la obținerea înregistrării de dispoziție:', error);
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
        
        // Adaugă filtrarea după interval de date
        if (startDate || endDate) {
          query.date = {};
          if (startDate) {
            const startDateObj = new Date(startDate);
            startDateObj.setHours(0, 0, 0, 0);
            query.date.$gte = startDateObj;
          }
          if (endDate) {
            const endDateObj = new Date(endDate);
            endDateObj.setHours(23, 59, 59, 999);
            query.date.$lte = endDateObj;
          }
        }
        
        // Obține toate intrările care corespund interogării, sortate cronologic
        const entries = await MoodEntry.find(query).sort({ date: 1 });
        
        if (!entries || entries.length === 0) {
          return {
            averageMood: 0,
            moodTrend: [],
            factorCorrelations: []
          };
        }
        
        // Calculează media dispozițiilor
        const validMoods = entries.map(entry => Number(entry.mood)).filter(mood => !isNaN(mood));
        const averageMood = validMoods.length > 0 ? validMoods.reduce((sum, mood) => sum + mood, 0) / validMoods.length : 0;
        
        // Creează tendința dispozițiilor (array de valori)
        const moodTrend = entries.map(entry => {
          const mood = Number(entry.mood);
          return isNaN(mood) ? 5 : mood;
        });
        
        // Calculează corelațiile factorilor
        const factorCorrelations = [];
        const factorTypes = ['sleep', 'stress', 'activity', 'social'];
        
        for (const factor of factorTypes) {
          // Filtrează entrările care au acest factor definit
          const entriesWithFactor = entries.filter(entry => 
            entry.factors && 
            entry.factors[factor] !== undefined && 
            entry.factors[factor] !== null
          );
          
          if (entriesWithFactor.length >= 3) {
            const factorValues = entriesWithFactor.map(e => Number(e.factors[factor]));
            const moodValues = entriesWithFactor.map(e => Number(e.mood));
            
            const correlation = calculateCorrelation(factorValues, moodValues);
            
            if (!isNaN(correlation)) {
              factorCorrelations.push({
                factor,
                correlation
              });
            }
          }
        }
        
        return {
          averageMood,
          moodTrend,
          factorCorrelations
        };
      } catch (error) {
        console.error('Eroare la calcularea statisticilor:', error);
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
        // Validăm și procesăm datele de intrare
        const moodValue = Number(input.mood);
        if (isNaN(moodValue) || moodValue < 1 || moodValue > 10) {
          throw new Error('Nivelul dispoziției trebuie să fie între 1 și 10');
        }
        
        // Validăm și procesăm factorii
        const factors = {};
        if (input.factors) {
          ['sleep', 'stress', 'activity', 'social'].forEach(factor => {
            if (input.factors[factor] !== undefined && input.factors[factor] !== null) {
              const value = Number(input.factors[factor]);
              if (!isNaN(value) && value >= 1 && value <= 5) {
                factors[factor] = value;
              }
            }
          });
        }
        
        // Verificăm și procesăm tag-urile
        const tags = Array.isArray(input.tags) ? input.tags.filter(tag => tag && typeof tag === 'string') : [];
        
        // Creează o nouă înregistrare de dispoziție
        const moodEntry = new MoodEntry({
          userId: req.user.id,
          date: new Date(),
          mood: moodValue,
          notes: input.notes || '',
          factors,
          tags
        });
        
        // Salvează în baza de date
        const savedEntry = await moodEntry.save();
        
        try {
          // Încearcă să folosească toObject dacă este disponibil
          if (typeof savedEntry.toObject === 'function') {
            return savedEntry.toObject();
          }
          
          // Altfel, creează un obiect simplu cu proprietățile necesare
          return {
            id: savedEntry._id ? savedEntry._id.toString() : savedEntry.id,
            date: savedEntry.date ? new Date(savedEntry.date).toISOString() : new Date().toISOString(),
            mood: moodValue,
            notes: input.notes || '',
            factors,
            tags,
            userId: req.user.id,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
        } catch (error) {
          console.error('Eroare la procesarea datelor:', error);
          // Returnează o versiune minimă a înregistrării în caz de eroare
          return {
            id: savedEntry._id ? savedEntry._id.toString() : (savedEntry.id || 'unknown'),
            mood: moodValue,
            userId: req.user.id
          };
        }
      } catch (error) {
        console.error('Eroare la crearea înregistrării de dispoziție:', error);
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
        
        // Validăm datele de intrare
        if (input.mood !== undefined) {
          const moodValue = Number(input.mood);
          if (isNaN(moodValue) || moodValue < 1 || moodValue > 10) {
            throw new Error('Nivelul dispoziției trebuie să fie între 1 și 10');
          }
          moodEntry.mood = moodValue;
        }
        
        // Actualizează notele dacă sunt furnizate
        if (input.notes !== undefined) {
          moodEntry.notes = input.notes;
        }
        
        // Actualizează factorii dacă sunt furnizați
        if (input.factors) {
          if (!moodEntry.factors) moodEntry.factors = {};
          
          ['sleep', 'stress', 'activity', 'social'].forEach(factor => {
            if (input.factors[factor] !== undefined && input.factors[factor] !== null) {
              const value = Number(input.factors[factor]);
              if (!isNaN(value) && value >= 1 && value <= 5) {
                moodEntry.factors[factor] = value;
              }
            }
          });
        }
        
        // Actualizează tag-urile dacă sunt furnizate
        if (input.tags !== undefined) {
          moodEntry.tags = Array.isArray(input.tags) 
            ? input.tags.filter(tag => tag && typeof tag === 'string') 
            : [];
        }
        
        // Salvează modificările
        await moodEntry.save();
        
        try {
          // Încearcă să folosească toObject dacă este disponibil
          if (typeof moodEntry.toObject === 'function') {
            return moodEntry.toObject();
          }
          
          // Altfel, creează un obiect simplu cu proprietățile necesare
          return {
            id: moodEntry._id ? moodEntry._id.toString() : moodEntry.id,
            date: moodEntry.date ? new Date(moodEntry.date).toISOString() : new Date().toISOString(),
            mood: moodEntry.mood,
            notes: moodEntry.notes || '',
            factors: moodEntry.factors || {},
            tags: Array.isArray(moodEntry.tags) ? moodEntry.tags : [],
            userId: req.user.id,
            createdAt: moodEntry.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
        } catch (error) {
          console.error('Eroare la procesarea datelor:', error);
          // Returnează o versiune minimă a înregistrării în caz de eroare
          return {
            id: moodEntry._id ? moodEntry._id.toString() : (moodEntry.id || 'unknown'),
            mood: moodEntry.mood,
            userId: req.user.id
          };
        }
      } catch (error) {
        console.error('Eroare la actualizarea înregistrării de dispoziție:', error);
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
        console.error('Eroare la ștergerea înregistrării de dispoziție:', error);
        throw new Error(`Eroare la ștergerea înregistrării de dispoziție: ${error.message}`);
      }
    }
  }
};

// Funcție pentru calcularea corelației între două array-uri de valori
// Coeficientul de corelație Pearson
function calculateCorrelation(array1, array2) {
  if (!array1 || !array2 || array1.length !== array2.length || array1.length === 0) {
    return 0;
  }
  
  try {
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
    
    // Verifică pentru a evita împărțirea la zero
    if (sum_x2 === 0 || sum_y2 === 0) {
      return 0;
    }
    
    // Calculează coeficientul de corelație
    const r = sum_xy / Math.sqrt(sum_x2 * sum_y2);
    
    // Verifică pentru NaN și limitează la intervalul [-1, 1]
    if (isNaN(r)) return 0;
    return Math.max(-1, Math.min(1, r));
  } catch (error) {
    console.error('Eroare la calcularea corelației:', error);
    return 0;
  }
}

module.exports = moodResolvers;