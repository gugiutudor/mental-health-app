// Test pentru GraphQL queries și mutations - actualizat pentru firstName/lastName
import { GET_USER_PROFILE, GET_MOOD_ENTRIES, GET_RECOMMENDED_EXERCISES } from '../../src/graphql/queries';
import { LOGIN_USER, REGISTER_USER, CREATE_MOOD_ENTRY } from '../../src/graphql/mutations';

describe('GraphQL Queries', () => {
  it('should have the correct structure for GET_USER_PROFILE', () => {
    // Verifică dacă query-ul include câmpurile necesare
    expect(GET_USER_PROFILE.loc.source.body).toContain('query GetUserProfile');
    expect(GET_USER_PROFILE.loc.source.body).toContain('me {');
    expect(GET_USER_PROFILE.loc.source.body).toContain('id');
    expect(GET_USER_PROFILE.loc.source.body).toContain('firstName');
    expect(GET_USER_PROFILE.loc.source.body).toContain('lastName');
    expect(GET_USER_PROFILE.loc.source.body).toContain('email');
    expect(GET_USER_PROFILE.loc.source.body).toContain('dateJoined');
    expect(GET_USER_PROFILE.loc.source.body).toContain('preferences {');
  });

  it('should have the correct structure for GET_MOOD_ENTRIES', () => {
    // Verifică dacă query-ul include parametrii și câmpurile necesare
    expect(GET_MOOD_ENTRIES.loc.source.body).toContain('query GetMoodEntries($limit: Int, $offset: Int)');
    expect(GET_MOOD_ENTRIES.loc.source.body).toContain('getMoodEntries(limit: $limit, offset: $offset)');
    expect(GET_MOOD_ENTRIES.loc.source.body).toContain('id');
    expect(GET_MOOD_ENTRIES.loc.source.body).toContain('date');
    expect(GET_MOOD_ENTRIES.loc.source.body).toContain('mood');
    expect(GET_MOOD_ENTRIES.loc.source.body).toContain('factors {');
  });

  it('should have the correct structure for GET_RECOMMENDED_EXERCISES', () => {
    // Verifică structura query-ului pentru exerciții recomandate
    expect(GET_RECOMMENDED_EXERCISES.loc.source.body).toContain('query GetRecommendedExercises($limit: Int)');
    expect(GET_RECOMMENDED_EXERCISES.loc.source.body).toContain('getRecommendedExercises(limit: $limit)');
    expect(GET_RECOMMENDED_EXERCISES.loc.source.body).toContain('exercise {');
    expect(GET_RECOMMENDED_EXERCISES.loc.source.body).toContain('score');
  });
});

describe('GraphQL Mutations', () => {
  it('should have the correct structure for LOGIN_USER', () => {
    // Verifică structura mutației de login
    expect(LOGIN_USER.loc.source.body).toContain('mutation LoginUser($input: LoginInput!)');
    expect(LOGIN_USER.loc.source.body).toContain('login(input: $input)');
    expect(LOGIN_USER.loc.source.body).toContain('token');
    expect(LOGIN_USER.loc.source.body).toContain('user {');
    expect(LOGIN_USER.loc.source.body).toContain('firstName');
    expect(LOGIN_USER.loc.source.body).toContain('lastName');
  });

  it('should have the correct structure for REGISTER_USER', () => {
    // Verifică structura mutației de înregistrare
    expect(REGISTER_USER.loc.source.body).toContain('mutation RegisterUser($input: RegisterInput!)');
    expect(REGISTER_USER.loc.source.body).toContain('register(input: $input)');
    expect(REGISTER_USER.loc.source.body).toContain('token');
    expect(REGISTER_USER.loc.source.body).toContain('user {');
    expect(REGISTER_USER.loc.source.body).toContain('firstName');
    expect(REGISTER_USER.loc.source.body).toContain('lastName');
  });

  it('should have the correct structure for CREATE_MOOD_ENTRY', () => {
    // Verifică structura mutației pentru crearea unei înregistrări de dispoziție
    expect(CREATE_MOOD_ENTRY.loc.source.body).toContain('mutation CreateMoodEntry($input: CreateMoodEntryInput!)');
    expect(CREATE_MOOD_ENTRY.loc.source.body).toContain('createMoodEntry(input: $input)');
    expect(CREATE_MOOD_ENTRY.loc.source.body).toContain('id');
    expect(CREATE_MOOD_ENTRY.loc.source.body).toContain('mood');
    expect(CREATE_MOOD_ENTRY.loc.source.body).toContain('factors {');
  });
});