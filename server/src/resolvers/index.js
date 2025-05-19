const userResolvers = require('./user');
const moodResolvers = require('./mood');
const exerciseResolvers = require('./exercise');

// Combină toți resolver-ii
const resolvers = {
  Query: {
    ...userResolvers.Query,
    ...moodResolvers.Query,
    ...exerciseResolvers.Query,
  },
  Mutation: {
    ...userResolvers.Mutation,
    ...moodResolvers.Mutation,
    ...exerciseResolvers.Mutation,
  }
};

module.exports = resolvers;