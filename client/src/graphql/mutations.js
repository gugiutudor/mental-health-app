import { gql } from '@apollo/client';

// Auth mutations
export const REGISTER_USER = gql`
  mutation RegisterUser($input: RegisterInput!) {
    register(input: $input) {
      token
      user {
        id
        firstName
        lastName
        email
        dateJoined
      }
    }
  }
`;

export const LOGIN_USER = gql`
  mutation LoginUser($input: LoginInput!) {
    login(input: $input) {
      token
      user {
        id
        firstName
        lastName
        email
        dateJoined
        preferences {
          notifications
          reminderTime
          theme
        }
        streak
      }
    }
  }
`;

// User mutations
export const UPDATE_USER = gql`
  mutation UpdateUser($input: UpdateUserInput!) {
    updateUser(input: $input) {
      id
      firstName
      lastName
      email
      preferences {
        notifications
        reminderTime
        theme
      }
    }
  }
`;

// Celelalte mutații rămân neschimbate
export const CREATE_MOOD_ENTRY = gql`
  mutation CreateMoodEntry($input: CreateMoodEntryInput!) {
    createMoodEntry(input: $input) {
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
    }
  }
`;

export const UPDATE_MOOD_ENTRY = gql`
  mutation UpdateMoodEntry($id: ID!, $input: CreateMoodEntryInput!) {
    updateMoodEntry(id: $id, input: $input) {
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
    }
  }
`;

export const DELETE_MOOD_ENTRY = gql`
  mutation DeleteMoodEntry($id: ID!) {
    deleteMoodEntry(id: $id)
  }
`;

export const COMPLETE_EXERCISE = gql`
  mutation CompleteExercise($input: CompleteExerciseInput!) {
    completeExercise(input: $input) {
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

export const CREATE_RESOURCE = gql`
  mutation CreateResource($input: CreateResourceInput!) {
    createResource(input: $input) {
      id
      title
      description
      type
      url
      tags
    }
  }
`;

export const UPDATE_RESOURCE = gql`
  mutation UpdateResource($id: ID!, $input: CreateResourceInput!) {
    updateResource(id: $id, input: $input) {
      id
      title
      description
      type
      url
      tags
    }
  }
`;