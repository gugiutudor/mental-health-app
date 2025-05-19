import { gql } from '@apollo/client';

// User queries
export const GET_USER_PROFILE = gql`
  query GetUserProfile {
    me {
      id
      name
      email
      dateJoined
      preferences {
        notifications
        reminderTime
        theme
      }
      streak
      lastActive
    }
  }
`;

// Mood queries
export const GET_MOOD_ENTRIES = gql`
  query GetMoodEntries($limit: Int, $offset: Int) {
    getMoodEntries(limit: $limit, offset: $offset) {
      id
      date
      mood
      notes
      factors {
        sleep
        stress
        activity
        social
      }
      tags
      createdAt
    }
  }
`;

export const GET_MOOD_ENTRY = gql`
  query GetMoodEntry($id: ID!) {
    getMoodEntry(id: $id) {
      id
      date
      mood
      notes
      factors {
        sleep
        stress
        activity
        social
      }
      tags
      createdAt
    }
  }
`;

export const GET_MOOD_STATISTICS = gql`
  query GetMoodStatistics($startDate: String, $endDate: String) {
    getMoodStatistics(startDate: $startDate, endDate: $endDate) {
      averageMood
      moodTrend
      factorCorrelations {
        factor
        correlation
      }
    }
  }
`;

// Exercise queries
export const GET_EXERCISES = gql`
  query GetExercises($category: String, $limit: Int, $offset: Int) {
    getExercises(category: $category, limit: $limit, offset: $offset) {
      id
      title
      description
      category
      duration
      content {
        steps
        audioUrl
        videoUrl
      }
      recommendedFor {
        moodLevel {
          min
          max
        }
      }
      difficulty
      createdAt
    }
  }
`;

export const GET_EXERCISE = gql`
  query GetExercise($id: ID!) {
    getExercise(id: $id) {
      id
      title
      description
      category
      duration
      content {
        steps
        audioUrl
        videoUrl
      }
      recommendedFor {
        moodLevel {
          min
          max
        }
      }
      difficulty
      createdAt
    }
  }
`;

export const GET_RECOMMENDED_EXERCISES = gql`
  query GetRecommendedExercises($limit: Int) {
    getRecommendedExercises(limit: $limit) {
      exercise {
        id
        title
        description
        category
        duration
        difficulty
      }
      score
    }
  }
`;

// Resource queries
export const GET_RESOURCES = gql`
  query GetResources($type: String, $tags: [String], $limit: Int, $offset: Int) {
    getResources(type: $type, tags: $tags, limit: $limit, offset: $offset) {
      id
      title
      description
      type
      url
      tags
      createdAt
    }
  }
`;

export const GET_RESOURCE = gql`
  query GetResource($id: ID!) {
    getResource(id: $id) {
      id
      title
      description
      type
      url
      tags
      createdAt
    }
  }
`;

// Progress queries
export const GET_USER_PROGRESS = gql`
  query GetUserProgress($exerciseId: ID) {
    getUserProgress(exerciseId: $exerciseId) {
      id
      exerciseId
      completedAt
      feedback {
        rating
        comment
      }
      duration
      feelingBefore
      feelingAfter
    }
  }
`;