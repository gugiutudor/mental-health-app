// server/src/resolvers/mood.js
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
          // Convertim la obiect pentru a putea manipula datele
          const entryObject = entry.toObject();
          
          // Ne asigurăm că ID-ul există și este corect formatat
          // MongoDB folosește _id, dar GraphQL se așteaptă la id
          entryObject.id = entryObject._id.toString();
          
          // Asigură formatul corect pentru dată
          if (entryObject.date) {
            try {
              entryObject.date = new Date(entryObject.date).toISOString();
            } catch (e) {
              entryObject.date = new Date().toISOString();
            }
          } else {
            // Dacă nu există data, setăm una implicită
            entryObject.date = new Date().toISOString();
          }
          
          // Ne asigurăm că mood este un număr
          if (entryObject.mood !== undefined && entryObject.mood !== null) {
            entryObject.mood = Number(entryObject.mood);
          } else {
            // Dacă nu există mood, setăm una implicită
            entryObject.mood = 5;
          }
          
          // Ne asigurăm că factorii există
          if (!entryObject.factors) {
            entryObject.factors = {};
          }
          
          // Ne asigurăm că tags există ca array
          if (!Array.isArray(entryObject.tags)) {
            entryObject.tags = [];
          }
          
          return entryObject;
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
        
        // Convertim la obiect pentru a putea manipula datele
        const entryObject = entry.toObject();
        
        // Ne asigurăm că ID-ul există și este corect formatat
        entryObject.id = entryObject._id.toString();
        
        // Asigură formatul corect pentru dată
        if (entryObject.date) {
          try {
            entryObject.date = new Date(entryObject.date).toISOString();
          } catch (e) {
            entryObject.date = new Date().toISOString();
          }
        } else {
          // Dacă nu există data, setăm una implicită
          entryObject.date = new Date().toISOString();
        }
        
        // Ne asigurăm că mood este un număr
        if (entryObject.mood !== undefined && entryObject.mood !== null) {
          entryObject.mood = Number(entryObject.mood);
        } else {
          // Dacă nu există mood, setăm una implicită
          entryObject.mood = 5;
        }
        
        // Ne asigurăm că factorii există
        if (!entryObject.factors) {
          entryObject.factors = {};
        }
        
        // Ne asigurăm că tags există ca array
        if (!Array.isArray(entryObject.tags)) {
          entryObject.tags = [];
        }
        
        return entryObject;
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
        
        if (startDate || endDate) {
          query.date = {};
          if (startDate) query.date.$gte = new Date(startDate);
          if (endDate) query.date.$lte = new Date(endDate);
        }
        
        // Obține toate intrările care corespund interogării
        const entries = await MoodEntry.find(query).sort({ date: 1 });
        
        if (entries.length === 0) {
          return {
            averageMood: 0,
            moodTrend: [],
            factorCorrelations: []
          };
        }
        
        // Calculează media dispozițiilor, asigurând că avem numere valide
        const validMoods = entries
          .map(entry => Number(entry.mood))
          .filter(mood => !isNaN(mood));
        
        const totalMood = validMoods.reduce((sum, mood) => sum + mood, 0);
        const averageMood = validMoods.length > 0 ? totalMood / validMoods.length : 0;
        
        // Creează tendința dispozițiilor (array de valori)
        const moodTrend = entries.map(entry => {
          const mood = Number(entry.mood);
          return isNaN(mood) ? 5 : mood;  // Folosește 5 ca valoare implicită
        });
        
        // Calculează corelațiile factorilor
        const factorCorrelations = [];
        const factorTypes = ['sleep', 'stress', 'activity', 'social'];
        
        factorTypes.forEach(factor => {
          // Filtrează entrările care au acest factor definit
          const entriesWithFactor = entries.filter(entry => 
            entry.factors && 
            entry.factors[factor] !== undefined && 
            entry.factors[factor] !== null
          );
          
          if (entriesWithFactor.length >= 3) { // Avem nevoie de minim 3 intrări pentru o corelație semnificativă
            // Convertește valorile la numere
            const factorValues = entriesWithFactor.map(e => Number(e.factors[factor]));
            const moodValues = entriesWithFactor.map(e => Number(e.mood));
            
            // Calculează corelația doar dacă avem valori valide
            const validFactorValues = factorValues.filter(val => !isNaN(val));
            const validMoodValues = moodValues.filter(val => !isNaN(val));
            
            if (validFactorValues.length === validMoodValues.length && validFactorValues.length >= 3) {
              const correlation = calculateCorrelation(validFactorValues, validMoodValues);
              
              // Verificăm că avem o valoare validă de corelație
              if (!isNaN(correlation)) {
                factorCorrelations.push({
                  factor,
                  correlation
                });
              }
            }
          }
        });
        
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
        
        // Asigură-te că ai un obiect cu id inclus
        const result = savedEntry.toObject();
        
        // Verifică dacă id-ul există, dacă nu, adaugă-l explicit
        if (!result.id) {
          result.id = savedEntry._id.toString();
        }
        
        // Verifică formatarea tuturor câmpurilor importante
        if (!result.date || !(result.date instanceof Date)) {
          result.date = new Date().toISOString();
        } else if (typeof result.date !== 'string') {
          result.date = result.date.toISOString();
        }
        
        // Log pentru debugging
        console.log('Înregistrare de dispoziție creată:', {
          id: result.id,
          _id: result._id,
          date: result.date,
          mood: result.mood
        });
        
        return result;
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
        
        // Convertim la obiect și asigurăm formatarea corectă
        const result = moodEntry.toObject();
        
        // Asigură-te că id-ul există
        if (!result.id) {
          result.id = result._id.toString();
        }
        
        // Asigură formatul corect pentru dată
        if (result.date) {
          result.date = new Date(result.date).toISOString();
        }
        
        return result;
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