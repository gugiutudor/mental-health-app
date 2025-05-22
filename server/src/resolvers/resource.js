// server/src/resolvers/resource.js
const { AuthenticationError, ForbiddenError } = require('apollo-server-express');
const { Resource, MoodEntry } = require('../models');

const resourceResolvers = {
  Query: {
    getResources: async (_, { type, tags, limit = 10, offset = 0 }) => {
      try {
        const query = {};
        
        // Filtrare după tip
        if (type) {
          query.type = type;
        }
        
        // Filtrare după tag-uri
        if (tags && tags.length > 0) {
          query.tags = { $in: tags };
        }
        
        const resources = await Resource.find(query)
          .skip(offset)
          .limit(limit)
          .sort({ createdAt: -1 });
        
        return resources;
      } catch (error) {
        console.error('Eroare la obținerea resurselor:', error);
        throw new Error(`Eroare la obținerea resurselor: ${error.message}`);
      }
    },
    
    getResource: async (_, { id }) => {
      try {
        const resource = await Resource.findById(id);
        
        if (!resource) {
          throw new Error('Resursă negăsită');
        }
        
        return resource;
      } catch (error) {
        console.error('Eroare la obținerea resursei:', error);
        throw new Error(`Eroare la obținerea resursei: ${error.message}`);
      }
    },
    
    getRecommendedResources: async (_, { limit = 5 }, { req }) => {
      try {
        // Dacă utilizatorul nu este autentificat, returnează resurse generale
        if (!req.user) {
          const generalResources = await Resource.find()
            .limit(limit)
            .sort({ createdAt: -1 });
          
          return generalResources.map(resource => ({
            resource,
            score: 0.5 // Scor neutru
          }));
        }
        
        // Obține ultimele 5 înregistrări de dispoziție ale utilizatorului
        const recentMoods = await MoodEntry.find({ userId: req.user.id })
          .sort({ date: -1 })
          .limit(5);
        
        if (recentMoods.length === 0) {
          // Dacă nu există înregistrări, returnează resurse generale
          const generalResources = await Resource.find()
            .limit(limit)
            .sort({ createdAt: -1 });
          
          return generalResources.map(resource => ({
            resource,
            score: 0.5 // Scor neutru
          }));
        }
        
        // Calculează dispoziția medie
        const averageMood = recentMoods.reduce((sum, entry) => sum + entry.mood, 0) / recentMoods.length;
        
        // Extrage tag-urile frecvente din înregistrările de dispoziție
        const tagCounts = {};
        recentMoods.forEach(entry => {
          if (entry.tags && entry.tags.length > 0) {
            entry.tags.forEach(tag => {
              tagCounts[tag] = (tagCounts[tag] || 0) + 1;
            });
          }
        });
        
        const frequentTags = Object.entries(tagCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([tag]) => tag);
        
        // Obține toate resursele
        const allResources = await Resource.find();
        
        // Calculează scoruri de recomandare pentru fiecare resursă
        const scoredResources = allResources.map(resource => {
          let score = 0.3; // Scor de bază
          
          // Verifică recomandările pentru dispoziție
          if (resource.recommendedFor && resource.recommendedFor.length > 0) {
            for (const rec of resource.recommendedFor) {
              if (rec.moodLevel) {
                const { min, max } = rec.moodLevel;
                
                // Verifică dacă dispoziția medie se încadrează în intervalul recomandat
                if (min <= averageMood && averageMood <= max) {
                  score += 0.4; // Crește scorul pentru potrivirea cu dispoziția
                  break;
                }
              }
            }
          }
          
          // Verifică potrivirea cu tag-urile frecvente
          if (resource.tags && resource.tags.length > 0) {
            const matchingTags = resource.tags.filter(tag => frequentTags.includes(tag));
            score += matchingTags.length * 0.2; // Adaugă pentru fiecare tag potrivit
          }
          
          // Limitează scorul între 0 și 1
          score = Math.min(1, Math.max(0, score));
          
          return {
            resource,
            score
          };
        });
        
        // Sortează și limitează rezultatele
        scoredResources.sort((a, b) => b.score - a.score);
        return scoredResources.slice(0, limit);
      } catch (error) {
        console.error('Eroare la obținerea recomandărilor de resurse:', error);
        throw new Error(`Eroare la obținerea recomandărilor: ${error.message}`);
      }
    }
  },
  
  Mutation: {
    createResource: async (_, { input }, { req }) => {
      // Verifică dacă utilizatorul este autentificat
      if (!req.user) {
        throw new AuthenticationError('Trebuie să fii autentificat');
      }
      
      try {
        // Creează o nouă resursă
        const resource = new Resource({
          ...input,
          createdBy: req.user.id
        });
        
        // Salvează în baza de date
        await resource.save();
        
        return resource;
      } catch (error) {
        console.error('Eroare la crearea resursei:', error);
        throw new Error(`Eroare la crearea resursei: ${error.message}`);
      }
    },
    
    updateResource: async (_, { id, input }, { req }) => {
      // Verifică dacă utilizatorul este autentificat
      if (!req.user) {
        throw new AuthenticationError('Trebuie să fii autentificat');
      }
      
      try {
        // Caută resursa
        const resource = await Resource.findById(id);
        
        if (!resource) {
          throw new Error('Resursă negăsită');
        }
        
        // Verifică dacă utilizatorul este creatorul resursei
        if (resource.createdBy && resource.createdBy.toString() !== req.user.id) {
          throw new ForbiddenError('Nu ai permisiunea să modifici această resursă');
        }
        
        // Actualizează câmpurile
        Object.keys(input).forEach(key => {
          resource[key] = input[key];
        });
        
        // Salvează modificările
        await resource.save();
        
        return resource;
      } catch (error) {
        if (error instanceof ForbiddenError) {
          throw error;
        }
        console.error('Eroare la actualizarea resursei:', error);
        throw new Error(`Eroare la actualizarea resursei: ${error.message}`);
      }
    },
    
    deleteResource: async (_, { id }, { req }) => {
      // Verifică dacă utilizatorul este autentificat
      if (!req.user) {
        throw new AuthenticationError('Trebuie să fii autentificat');
      }
      
      try {
        // Caută resursa
        const resource = await Resource.findById(id);
        
        if (!resource) {
          throw new Error('Resursă negăsită');
        }
        
        // Verifică dacă utilizatorul este creatorul resursei
        if (resource.createdBy && resource.createdBy.toString() !== req.user.id) {
          throw new ForbiddenError('Nu ai permisiunea să ștergi această resursă');
        }
        
        // Șterge resursa
        await resource.deleteOne();
        
        return true;
      } catch (error) {
        if (error instanceof ForbiddenError) {
          throw error;
        }
        console.error('Eroare la ștergerea resursei:', error);
        throw new Error(`Eroare la ștergerea resursei: ${error.message}`);
      }
    }
  }
};

module.exports = resourceResolvers;