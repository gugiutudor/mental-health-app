const { AuthenticationError } = require('apollo-server-express');
const { MoodEntry } = require('../models');

const moodResolvers = {
  Query: {
    getMoodEntries: async (_, { limit = 10, offset = 0 }, { req }) => {
      if (!req.user) {
        throw new AuthenticationError('Trebuie să fii autentificat');
      }
      
      try {
        const entries = await MoodEntry.find({ userId: req.user.id })
          .sort({ date: -1 })
          .skip(offset)
          .limit(limit);

        return entries.map(entry => {
          try {
            if (typeof entry.toObject === 'function') {
              return entry.toObject();
            }

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
          if (typeof entry.toObject === 'function') {
            return entry.toObject();
          }

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
      if (!req.user) {
        throw new AuthenticationError('Trebuie să fii autentificat');
      }
      
      try {
        const query = { userId: req.user.id };

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

        const entries = await MoodEntry.find(query).sort({ date: 1 });
        
        if (!entries || entries.length === 0) {
          return {
            averageMood: 0,
            moodTrend: [],
            factorCorrelations: []
          };
        }

        const validMoods = entries.map(entry => Number(entry.mood)).filter(mood => !isNaN(mood));
        const averageMood = validMoods.length > 0 ? validMoods.reduce((sum, mood) => sum + mood, 0) / validMoods.length : 0;

        const moodTrend = entries.map(entry => {
          const mood = Number(entry.mood);
          return isNaN(mood) ? 5 : mood;
        });
        
        const factorCorrelations = [];
        const factorTypes = ['sleep', 'stress', 'activity', 'social'];
        
        for (const factor of factorTypes) {
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
      if (!req.user) {
        throw new AuthenticationError('Trebuie să fii autentificat');
      }
      
      try {
        const moodValue = Number(input.mood);
        if (isNaN(moodValue) || moodValue < 1 || moodValue > 10) {
          throw new Error('Nivelul dispoziției trebuie să fie între 1 și 10');
        }

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

        const tags = Array.isArray(input.tags) ? input.tags.filter(tag => tag && typeof tag === 'string') : [];

        const moodEntry = new MoodEntry({
          userId: req.user.id,
          date: new Date(),
          mood: moodValue,
          notes: input.notes || '',
          factors,
          tags
        });

        const savedEntry = await moodEntry.save();
        
        try {
          if (typeof savedEntry.toObject === 'function') {
            return savedEntry.toObject();
          }

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
      if (!req.user) {
        throw new AuthenticationError('Trebuie să fii autentificat');
      }
      
      try {
        const moodEntry = await MoodEntry.findOne({
          _id: id,
          userId: req.user.id
        });
        
        if (!moodEntry) {
          throw new Error('Înregistrare negăsită sau nu ai permisiunea să o modifici');
        }

        if (input.mood !== undefined) {
          const moodValue = Number(input.mood);
          if (isNaN(moodValue) || moodValue < 1 || moodValue > 10) {
            throw new Error('Nivelul dispoziției trebuie să fie între 1 și 10');
          }
          moodEntry.mood = moodValue;
        }

        if (input.notes !== undefined) {
          moodEntry.notes = input.notes;
        }

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

        if (input.tags !== undefined) {
          moodEntry.tags = Array.isArray(input.tags) 
            ? input.tags.filter(tag => tag && typeof tag === 'string') 
            : [];
        }

        await moodEntry.save();
        
        try {
          if (typeof moodEntry.toObject === 'function') {
            return moodEntry.toObject();
          }

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
      if (!req.user) {
        throw new AuthenticationError('Trebuie să fii autentificat');
      }
      
      try {
        const result = await MoodEntry.deleteOne({
          _id: id,
          userId: req.user.id
        });

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

function calculateCorrelation(array1, array2) {
  if (!array1 || !array2 || array1.length !== array2.length || array1.length === 0) {
    return 0;
  }
  
  try {
    const n = array1.length;

    const mean1 = array1.reduce((sum, val) => sum + val, 0) / n;
    const mean2 = array2.reduce((sum, val) => sum + val, 0) / n;

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

    if (sum_x2 === 0 || sum_y2 === 0) {
      return 0;
    }

    const r = sum_xy / Math.sqrt(sum_x2 * sum_y2);
    
    if (isNaN(r)) return 0;
    return Math.max(-1, Math.min(1, r));
  } catch (error) {
    console.error('Eroare la calcularea corelației:', error);
    return 0;
  }
}

module.exports = moodResolvers;