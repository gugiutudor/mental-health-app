// server/src/tests/integration/mood.test.js
const mongoose = require('mongoose');
const {
  createTestServer,
  createAuthenticatedUser,
  createTestMoodEntries
} = require('./setup');
const { MoodEntry, User } = require('../../models');
const { gql } = require('apollo-server-express');

// Query-uri și mutații pentru teste
const GET_MOOD_ENTRIES = gql`
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

const GET_MOOD_ENTRY = gql`
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
    }
  }
`;

const GET_MOOD_STATISTICS = gql`
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

const CREATE_MOOD_ENTRY = gql`
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

const UPDATE_MOOD_ENTRY = gql`
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

const DELETE_MOOD_ENTRY = gql`
  mutation DeleteMoodEntry($id: ID!) {
    deleteMoodEntry(id: $id)
  }
`;

describe('Mood Entry Integration Tests', () => {
  it('should fetch mood entries for authenticated user', async () => {
    // Creează un utilizator autentificat
    const { user, context } = await createAuthenticatedUser();
    
    // Creează înregistrări de dispoziție pentru utilizator
    const testEntries = await createTestMoodEntries(user._id);
    
    // Creează un server de test cu contextul utilizatorului
    const { query } = createTestServer(context);
    
    // Execută query-ul pentru înregistrările de dispoziție
    const res = await query({
      query: GET_MOOD_ENTRIES,
      variables: { limit: 10, offset: 0 }
    });
    
    // Verifică răspunsul
    expect(res.data.getMoodEntries).toBeDefined();
    expect(res.data.getMoodEntries).toHaveLength(testEntries.length);
    expect(res.data.getMoodEntries[0].mood).toBe(testEntries[0].mood);
    expect(res.data.getMoodEntries[1].mood).toBe(testEntries[1].mood);
  });
  
  it('should not fetch mood entries when not authenticated', async () => {
    // Creează un server de test fără context de autentificare
    const { query } = createTestServer();
    
    // Execută query-ul pentru înregistrările de dispoziție
    const res = await query({
      query: GET_MOOD_ENTRIES
    });
    
    // Verifică că există o eroare
    expect(res.errors).toBeDefined();
    expect(res.errors[0].message).toContain('Trebuie să fii autentificat');
  });
  
  it('should fetch a specific mood entry by id', async () => {
    // Creează un utilizator autentificat
    const { user, context } = await createAuthenticatedUser();
    
    // Creează înregistrări de dispoziție pentru utilizator
    const testEntries = await createTestMoodEntries(user._id);
    const entryId = testEntries[0]._id.toString();
    
    // Creează un server de test cu contextul utilizatorului
    const { query } = createTestServer(context);
    
    // Execută query-ul pentru o înregistrare specifică
    const res = await query({
      query: GET_MOOD_ENTRY,
      variables: { id: entryId }
    });
    
    // Verifică răspunsul
    expect(res.data.getMoodEntry).toBeDefined();
    expect(res.data.getMoodEntry.id).toBe(entryId);
    expect(res.data.getMoodEntry.mood).toBe(testEntries[0].mood);
    expect(res.data.getMoodEntry.notes).toBe(testEntries[0].notes);
  });
  
  it('should not fetch mood entry that does not belong to user', async () => {
    // Creează un prim utilizator pentru a crea înregistrare
    const firstUser = new User({
      name: 'First User',
      email: 'first@example.com',
      password: 'password123'
    });
    await firstUser.save();
    
    // Creează o înregistrare pentru primul utilizator
    const moodEntry = new MoodEntry({
      userId: firstUser._id,
      mood: 6,
      notes: 'First user entry'
    });
    await moodEntry.save();
    
    // Creează un al doilea utilizator autentificat
    const { context } = await createAuthenticatedUser();
    
    // Creează un server de test cu contextul celui de-al doilea utilizator
    const { query } = createTestServer(context);
    
    // Execută query-ul pentru înregistrarea primului utilizator
    const res = await query({
      query: GET_MOOD_ENTRY,
      variables: { id: moodEntry._id.toString() }
    });
    
    // Verifică că există o eroare
    expect(res.errors).toBeDefined();
    expect(res.errors[0].message).toContain('Înregistrare negăsită');
  });
  
  it('should fetch mood statistics for authenticated user', async () => {
    // Creează un utilizator autentificat
    const { user, context } = await createAuthenticatedUser();
    
    // Creează înregistrări de dispoziție pentru utilizator
    await createTestMoodEntries(user._id);
    
    // Creează un server de test cu contextul utilizatorului
    const { query } = createTestServer(context);
    
    // Execută query-ul pentru statistici
    const res = await query({
      query: GET_MOOD_STATISTICS,
      variables: { 
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date().toISOString()
      }
    });
    
    // Verifică răspunsul
    expect(res.data.getMoodStatistics).toBeDefined();
    expect(res.data.getMoodStatistics.averageMood).toBeDefined();
    expect(res.data.getMoodStatistics.moodTrend).toBeDefined();
    expect(res.data.getMoodStatistics.factorCorrelations).toBeDefined();
    
    // Verifică că media dispoziției este calculată corect
    expect(res.data.getMoodStatistics.averageMood).toBe(6); // (7 + 5) / 2 = 6
    
    // Verifică că trendul dispoziției conține valorile corecte
    expect(res.data.getMoodStatistics.moodTrend).toEqual([7, 5]);
    
    // Verifică că există corelații pentru factorii incluși
    expect(res.data.getMoodStatistics.factorCorrelations.length).toBeGreaterThan(0);
  });
  
  it('should return default statistics when no mood entries exist', async () => {
    // Creează un utilizator autentificat (fără înregistrări de dispoziție)
    const { context } = await createAuthenticatedUser();
    
    // Creează un server de test cu contextul utilizatorului
    const { query } = createTestServer(context);
    
    // Execută query-ul pentru statistici
    const res = await query({
      query: GET_MOOD_STATISTICS
    });
    
    // Verifică răspunsul
    expect(res.data.getMoodStatistics).toBeDefined();
    expect(res.data.getMoodStatistics.averageMood).toBe(0);
    expect(res.data.getMoodStatistics.moodTrend).toEqual([]);
    expect(res.data.getMoodStatistics.factorCorrelations).toEqual([]);
  });
  
  it('should create a new mood entry', async () => {
    // Creează un utilizator autentificat
    const { user, context } = await createAuthenticatedUser();
    
    // Creează un server de test cu contextul utilizatorului
    const { mutate } = createTestServer(context);
    
    // Input pentru crearea unei înregistrări
    const input = {
      mood: 8,
      notes: 'Feeling great today',
      factors: {
        sleep: 5,
        stress: 1,
        activity: 4,
        social: 5
      },
      tags: ['happy', 'productive']
    };
    
    // Execută mutația pentru crearea înregistrării
    const res = await mutate({
      mutation: CREATE_MOOD_ENTRY,
      variables: { input }
    });
    
    // Verifică răspunsul
    expect(res.data.createMoodEntry).toBeDefined();
    expect(res.data.createMoodEntry.mood).toBe(input.mood);
    expect(res.data.createMoodEntry.notes).toBe(input.notes);
    expect(res.data.createMoodEntry.factors.sleep).toBe(input.factors.sleep);
    expect(res.data.createMoodEntry.factors.stress).toBe(input.factors.stress);
    expect(res.data.createMoodEntry.factors.activity).toBe(input.factors.activity);
    expect(res.data.createMoodEntry.factors.social).toBe(input.factors.social);
    expect(res.data.createMoodEntry.tags).toEqual(input.tags);
    
    // Verifică și în baza de date
    const savedEntry = await MoodEntry.findById(res.data.createMoodEntry.id);
    expect(savedEntry).toBeDefined();
    expect(savedEntry.userId.toString()).toBe(user._id.toString());
    expect(savedEntry.mood).toBe(input.mood);
  });
  
  it('should update an existing mood entry', async () => {
    // Creează un utilizator autentificat
    const { user, context } = await createAuthenticatedUser();
    
    // Creează o înregistrare pentru utilizator
    const moodEntry = new MoodEntry({
      userId: user._id,
      mood: 6,
      notes: 'Original notes',
      factors: {
        sleep: 3,
        stress: 3,
        activity: 3,
        social: 3
      },
      tags: ['original']
    });
    await moodEntry.save();
    
    // Creează un server de test cu contextul utilizatorului
    const { mutate } = createTestServer(context);
    
    // Input pentru actualizarea înregistrării
    const input = {
      mood: 9,
      notes: 'Updated notes',
      factors: {
        sleep: 5,
        stress: 1,
        activity: 4,
        social: 5
      },
      tags: ['updated', 'happy']
    };
    
    // Execută mutația pentru actualizarea înregistrării
    const res = await mutate({
      mutation: UPDATE_MOOD_ENTRY,
      variables: { 
        id: moodEntry._id.toString(),
        input 
      }
    });
    
    // Verifică răspunsul
    expect(res.data.updateMoodEntry).toBeDefined();
    expect(res.data.updateMoodEntry.mood).toBe(input.mood);
    expect(res.data.updateMoodEntry.notes).toBe(input.notes);
    expect(res.data.updateMoodEntry.factors.sleep).toBe(input.factors.sleep);
    expect(res.data.updateMoodEntry.factors.stress).toBe(input.factors.stress);
    expect(res.data.updateMoodEntry.factors.activity).toBe(input.factors.activity);
    expect(res.data.updateMoodEntry.factors.social).toBe(input.factors.social);
    expect(res.data.updateMoodEntry.tags).toEqual(input.tags);
    
    // Verifică și în baza de date
    const updatedEntry = await MoodEntry.findById(moodEntry._id);
    expect(updatedEntry.mood).toBe(input.mood);
  });
  
  it('should not update mood entry that does not belong to user', async () => {
    // Creează un prim utilizator pentru a crea înregistrare
    const firstUser = new User({
      name: 'First User',
      email: 'first@example.com',
      password: 'password123'
    });
    await firstUser.save();
    
    // Creează o înregistrare pentru primul utilizator
    const moodEntry = new MoodEntry({
      userId: firstUser._id,
      mood: 6,
      notes: 'First user entry'
    });
    await moodEntry.save();
    
    // Creează un al doilea utilizator autentificat
    const { context } = await createAuthenticatedUser();
    
    // Creează un server de test cu contextul celui de-al doilea utilizator
    const { mutate } = createTestServer(context);
    
    // Input pentru actualizarea înregistrării
    const input = {
      mood: 8,
      notes: 'Trying to update another user entry'
    };
    
    // Execută mutația pentru actualizarea înregistrării
    const res = await mutate({
      mutation: UPDATE_MOOD_ENTRY,
      variables: { 
        id: moodEntry._id.toString(),
        input 
      }
    });
    
    // Verifică că există o eroare
    expect(res.errors).toBeDefined();
    expect(res.errors[0].message).toContain('Înregistrare negăsită sau nu ai permisiunea să o modifici');
  });
  
  it('should delete a mood entry', async () => {
    // Creează un utilizator autentificat
    const { user, context } = await createAuthenticatedUser();
    
    // Creează o înregistrare pentru utilizator
    const moodEntry = new MoodEntry({
      userId: user._id,
      mood: 6,
      notes: 'Entry to delete'
    });
    await moodEntry.save();
    
    // Creează un server de test cu contextul utilizatorului
    const { mutate } = createTestServer(context);
    
    // Execută mutația pentru ștergerea înregistrării
    const res = await mutate({
      mutation: DELETE_MOOD_ENTRY,
      variables: { id: moodEntry._id.toString() }
    });
    
    // Verifică răspunsul
    expect(res.data.deleteMoodEntry).toBe(true);
    
    // Verifică că înregistrarea a fost ștearsă din baza de date
    const deletedEntry = await MoodEntry.findById(moodEntry._id);
    expect(deletedEntry).toBeNull();
  });
  
  it('should not delete mood entry that does not belong to user', async () => {
    // Creează un prim utilizator pentru a crea înregistrare
    const firstUser = new User({
      name: 'First User',
      email: 'first@example.com',
      password: 'password123'
    });
    await firstUser.save();
    
    // Creează o înregistrare pentru primul utilizator
    const moodEntry = new MoodEntry({
      userId: firstUser._id,
      mood: 6,
      notes: 'First user entry'
    });
    await moodEntry.save();
    
    // Creează un al doilea utilizator autentificat
    const { context } = await createAuthenticatedUser();
    
    // Creează un server de test cu contextul celui de-al doilea utilizator
    const { mutate } = createTestServer(context);
    
    // Execută mutația pentru ștergerea înregistrării
    const res = await mutate({
      mutation: DELETE_MOOD_ENTRY,
      variables: { id: moodEntry._id.toString() }
    });
    
    // Verifică că există o eroare
    expect(res.errors).toBeDefined();
    expect(res.errors[0].message).toContain('Înregistrare negăsită sau nu ai permisiunea să o ștergi');
    
    // Verifică că înregistrarea nu a fost ștearsă din baza de date
    const entry = await MoodEntry.findById(moodEntry._id);
    expect(entry).toBeDefined();
  });
});