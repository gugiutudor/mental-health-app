// server/src/schemas/index.js
const { gql } = require('apollo-server-express');

const typeDefs = gql`
  type User {
    id: ID!
    email: String!
    firstName: String!
    lastName: String!
    dateJoined: String!
    preferences: UserPreferences
    streak: Int
    lastActive: String
    createdAt: String
    updatedAt: String
  }

  type UserPreferences {
    notifications: Boolean
    reminderTime: String
    theme: String
  }

  type MoodEntry {
    id: ID!
    userId: ID!
    date: String!
    mood: Int!
    notes: String
    factors: MoodFactors
    tags: [String]
    createdAt: String
    updatedAt: String
  }

  type MoodFactors {
    sleep: Int
    stress: Int
    activity: Int
    social: Int
  }

  type Exercise {
    id: ID!
    title: String!
    description: String!
    category: String!
    duration: Int!
    content: ExerciseContent
    recommendedFor: [MoodRecommendation]
    difficulty: String
    createdBy: ID
    createdAt: String
    updatedAt: String
  }

  type ExerciseContent {
    steps: [String]!
    audioUrl: String
    videoUrl: String
  }

  type MoodRecommendation {
    moodLevel: MoodLevel
    factors: String
  }

  type MoodLevel {
    min: Int
    max: Int
  }

  type Resource {
    id: ID!
    title: String!
    description: String!
    type: String!
    url: String!
    tags: [String]
    recommendedFor: [MoodRecommendation]
    createdBy: ID
    createdAt: String
    updatedAt: String
  }

  type UserProgress {
    id: ID!
    userId: ID!
    exerciseId: ID!
    completedAt: String!
    feedback: Feedback
    duration: Int
    feelingBefore: Int
    feelingAfter: Int
    createdAt: String
    updatedAt: String
  }

  type Feedback {
    rating: Int
    comment: String
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type MoodStatistics {
    averageMood: Float
    moodTrend: [Float]
    factorCorrelations: [FactorCorrelation]
  }

  type FactorCorrelation {
    factor: String!
    correlation: Float!
  }

  type ExerciseRecommendation {
    exercise: Exercise!
    score: Float!
  }

  input RegisterInput {
    email: String!
    password: String!
    firstName: String!
    lastName: String!
  }

  input LoginInput {
    email: String!
    password: String!
  }

  input UserPreferencesInput {
    notifications: Boolean
    reminderTime: String
    theme: String
  }

  input MoodFactorsInput {
    sleep: Int
    stress: Int
    activity: Int
    social: Int
  }

  input CreateMoodEntryInput {
    mood: Int!
    notes: String
    factors: MoodFactorsInput
    tags: [String]
  }

  input MoodLevelInput {
    min: Int
    max: Int
  }

  input MoodRecommendationInput {
    moodLevel: MoodLevelInput
    factors: String
  }

  input ExerciseContentInput {
    steps: [String]!
    audioUrl: String
    videoUrl: String
  }

  input CreateExerciseInput {
    title: String!
    description: String!
    category: String!
    duration: Int!
    content: ExerciseContentInput!
    recommendedFor: [MoodRecommendationInput]
    difficulty: String
  }

  input CreateResourceInput {
    title: String!
    description: String!
    type: String!
    url: String!
    tags: [String]
    recommendedFor: [MoodRecommendationInput]
  }

  input FeedbackInput {
    rating: Int
    comment: String
  }

  input CompleteExerciseInput {
    exerciseId: ID!
    duration: Int
    feedback: FeedbackInput
    feelingBefore: Int
    feelingAfter: Int
  }

  input UpdateUserInput {
    firstName: String
    lastName: String
    email: String
    preferences: UserPreferencesInput
  }

  type Query {
    # User queries
    me: User
    
    # Mood queries
    getMoodEntries(limit: Int, offset: Int): [MoodEntry!]!
    getMoodEntry(id: ID!): MoodEntry!
    getMoodStatistics(startDate: String, endDate: String): MoodStatistics
    
    # Exercise queries
    getExercises(category: String, limit: Int, offset: Int): [Exercise]
    getExercise(id: ID!): Exercise
    getRecommendedExercises(limit: Int): [ExerciseRecommendation]
    
    # Resource queries
    getResources(type: String, tags: [String], limit: Int, offset: Int): [Resource]
    getResource(id: ID!): Resource
    
    # Progress queries
    getUserProgress(exerciseId: ID): [UserProgress]
  }

  type Mutation {
    # Auth mutations
    register(input: RegisterInput!): AuthPayload
    login(input: LoginInput!): AuthPayload
    
    # User mutations
    updateUser(input: UpdateUserInput!): User
    
    # Mood mutations
    createMoodEntry(input: CreateMoodEntryInput!): MoodEntry!
    updateMoodEntry(id: ID!, input: CreateMoodEntryInput!): MoodEntry!
    deleteMoodEntry(id: ID!): Boolean
    
    # Exercise mutations
    createExercise(input: CreateExerciseInput!): Exercise
    updateExercise(id: ID!, input: CreateExerciseInput!): Exercise
    deleteExercise(id: ID!): Boolean
    
    # Resource mutations
    createResource(input: CreateResourceInput!): Resource
    updateResource(id: ID!, input: CreateResourceInput!): Resource
    deleteResource(id: ID!): Boolean
    
    # Progress mutations
    completeExercise(input: CompleteExerciseInput!): UserProgress
  }
`;

module.exports = typeDefs;