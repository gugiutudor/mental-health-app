// server/src/resolvers/resource.js
const { AuthenticationError, ForbiddenError } = require('apollo-server-express');
const { Resource, MoodEntry } = require('../models');

const resourceResolvers = {
 Query: {
   getResources: async (_, { type, tags, limit = 10, offset = 0 }) => {
     try {
       const query = {};
       
       if (type) {
         query.type = type;
       }
       
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
       if (!req.user) {
         const generalResources = await Resource.find()
           .limit(limit)
           .sort({ createdAt: -1 });
         
         return generalResources.map(resource => ({
           resource,
           score: 0.5
         }));
       }
       
       const recentMoods = await MoodEntry.find({ userId: req.user.id })
         .sort({ date: -1 })
         .limit(5);
       
       if (recentMoods.length === 0) {
         const generalResources = await Resource.find()
           .limit(limit)
           .sort({ createdAt: -1 });
         
         return generalResources.map(resource => ({
           resource,
           score: 0.5
         }));
       }
       
       const averageMood = recentMoods.reduce((sum, entry) => sum + entry.mood, 0) / recentMoods.length;
       
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
       
       const allResources = await Resource.find();
       
       const scoredResources = allResources.map(resource => {
         let score = 0.3;
         
         if (resource.recommendedFor && resource.recommendedFor.length > 0) {
           for (const rec of resource.recommendedFor) {
             if (rec.moodLevel) {
               const { min, max } = rec.moodLevel;
               
               if (min <= averageMood && averageMood <= max) {
                 score += 0.4;
                 break;
               }
             }
           }
         }
         
         if (resource.tags && resource.tags.length > 0) {
           const matchingTags = resource.tags.filter(tag => frequentTags.includes(tag));
           score += matchingTags.length * 0.2;
         }
         
         score = Math.min(1, Math.max(0, score));
         
         return {
           resource,
           score
         };
       });
       
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
     if (!req.user) {
       throw new AuthenticationError('Trebuie să fii autentificat');
     }
     
     try {
       const resource = new Resource({
         ...input,
         createdBy: req.user.id
       });
       
       await resource.save();
       
       return resource;
     } catch (error) {
       console.error('Eroare la crearea resursei:', error);
       throw new Error(`Eroare la crearea resursei: ${error.message}`);
     }
   },
   
   updateResource: async (_, { id, input }, { req }) => {
     if (!req.user) {
       throw new AuthenticationError('Trebuie să fii autentificat');
     }
     
     try {
       const resource = await Resource.findById(id);
       
       if (!resource) {
         throw new Error('Resursă negăsită');
       }
       
       if (resource.createdBy && resource.createdBy.toString() !== req.user.id) {
         throw new ForbiddenError('Nu ai permisiunea să modifici această resursă');
       }
       
       Object.keys(input).forEach(key => {
         resource[key] = input[key];
       });
       
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
     if (!req.user) {
       throw new AuthenticationError('Trebuie să fii autentificat');
     }
     
     try {
       const resource = await Resource.findById(id);
       
       if (!resource) {
         throw new Error('Resursă negăsită');
       }
       
       if (resource.createdBy && resource.createdBy.toString() !== req.user.id) {
         throw new ForbiddenError('Nu ai permisiunea să ștergi această resursă');
       }
       
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