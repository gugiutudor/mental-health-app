const userResolvers = require('./user');
const moodResolvers = require('./mood');
const exerciseResolvers = require('./exercise');

let resourceResolvers;
try {
  resourceResolvers = require('./resource');
} catch (error) {
  console.warn('Resolver-ul pentru resurse nu a fost găsit. Se va crea unul implicit.');
  resourceResolvers = {
    Query: {
      getResources: async () => [],
      getResource: async () => null,
      getRecommendedResources: async () => []
    },
    Mutation: {
      createResource: async () => null,
      updateResource: async () => null,
      deleteResource: async () => false
    }
  };
}

const resolvers = {
  Query: {
    ...userResolvers.Query,
    ...moodResolvers.Query,
    ...exerciseResolvers.Query,
    ...resourceResolvers.Query,
  },
  Mutation: {
    ...userResolvers.Mutation,
    ...moodResolvers.Mutation,
    ...exerciseResolvers.Mutation,
    ...resourceResolvers.Mutation,
  }
};

module.exports = resolvers;