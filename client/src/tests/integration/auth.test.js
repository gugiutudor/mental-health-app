// server/src/tests/integration/auth.test.js
const {
    createTestServer,
    createAuthenticatedUser
  } = require('./setup');
  const { User } = require('../../models');
  const { gql } = require('apollo-server-express');
  
  // Query-uri și mutații pentru teste
  const REGISTER_USER = gql`
    mutation RegisterUser($input: RegisterInput!) {
      register(input: $input) {
        token
        user {
          id
          name
          email
          dateJoined
        }
      }
    }
  `;
  
  const LOGIN_USER = gql`
    mutation LoginUser($input: LoginInput!) {
      login(input: $input) {
        token
        user {
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
        }
      }
    }
  `;
  
  const GET_USER_PROFILE = gql`
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
  
  const UPDATE_USER = gql`
    mutation UpdateUser($input: UpdateUserInput!) {
      updateUser(input: $input) {
        id
        name
        email
        preferences {
          notifications
          reminderTime
          theme
        }
      }
    }
  `;
  
  describe('Authentication Integration Tests', () => {
    it('should register a new user', async () => {
      // Creează un server de test
      const { mutate } = createTestServer();
      
      // Input pentru înregistrare
      const input = {
        name: 'New User',
        email: 'new@example.com',
        password: 'password123'
      };
      
      // Execută mutația de înregistrare
      const res = await mutate({
        mutation: REGISTER_USER,
        variables: { input }
      });
      
      // Verifică răspunsul
      expect(res.data.register).toBeDefined();
      expect(res.data.register.token).toBeDefined();
      expect(res.data.register.user).toBeDefined();
      expect(res.data.register.user.name).toBe(input.name);
      expect(res.data.register.user.email).toBe(input.email);
      
      // Verifică și în baza de date
      const user = await User.findOne({ email: input.email });
      expect(user).toBeDefined();
      expect(user.name).toBe(input.name);
    });
    
    it('should not register a user with an existing email', async () => {
      // Creează un server de test
      const { mutate } = createTestServer();
      
      // Creează mai întâi un utilizator în baza de date
      const existingUser = new User({
        name: 'Existing User',
        email: 'existing@example.com',
        password: 'password123'
      });
      await existingUser.save();
      
      // Încearcă să înregistrezi un utilizator cu același email
      const input = {
        name: 'New User',
        email: 'existing@example.com', // Email folosit deja
        password: 'password123'
      };
      
      // Execută mutația de înregistrare
      const res = await mutate({
        mutation: REGISTER_USER,
        variables: { input }
      });
      
      // Verifică că există o eroare
      expect(res.errors).toBeDefined();
      expect(res.errors[0].message).toContain('Email-ul este deja utilizat');
    });
    
    it('should login a user with correct credentials', async () => {
      // Creează un server de test
      const { mutate } = createTestServer();
      
      // Creează mai întâi un utilizator în baza de date
      const user = new User({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      });
      await user.save();
      
      // Input pentru autentificare
      const input = {
        email: 'test@example.com',
        password: 'password123'
      };
      
      // Execută mutația de autentificare
      const res = await mutate({
        mutation: LOGIN_USER,
        variables: { input }
      });
      
      // Verifică răspunsul
      expect(res.data.login).toBeDefined();
      expect(res.data.login.token).toBeDefined();
      expect(res.data.login.user).toBeDefined();
      expect(res.data.login.user.name).toBe(user.name);
      expect(res.data.login.user.email).toBe(user.email);
      
      // Verifică că lastActive a fost actualizat
      const updatedUser = await User.findById(user._id);
      expect(updatedUser.lastActive).toBeDefined();
      expect(new Date(updatedUser.lastActive) > new Date(user.dateJoined)).toBe(true);
    });
    
    it('should not login with incorrect password', async () => {
      // Creează un server de test
      const { mutate } = createTestServer();
      
      // Creează mai întâi un utilizator în baza de date
      const user = new User({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      });
      await user.save();
      
      // Input pentru autentificare cu parolă greșită
      const input = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };
      
      // Execută mutația de autentificare
      const res = await mutate({
        mutation: LOGIN_USER,
        variables: { input }
      });
      
      // Verifică că există o eroare
      expect(res.errors).toBeDefined();
      expect(res.errors[0].message).toContain('Email sau parolă incorectă');
    });
    
    it('should not login with non-existent email', async () => {
      // Creează un server de test
      const { mutate } = createTestServer();
      
      // Input pentru autentificare cu email care nu există
      const input = {
        email: 'nonexistent@example.com',
        password: 'password123'
      };
      
      // Execută mutația de autentificare
      const res = await mutate({
        mutation: LOGIN_USER,
        variables: { input }
      });
      
      // Verifică că există o eroare
      expect(res.errors).toBeDefined();
      expect(res.errors[0].message).toContain('Email sau parolă incorectă');
    });
    
    it('should fetch authenticated user profile', async () => {
      // Creează un utilizator autentificat pentru test
      const { user, context } = await createAuthenticatedUser();
      
      // Creează un server de test cu contextul utilizatorului autentificat
      const { query } = createTestServer(context);
      
      // Execută query-ul pentru profilul utilizatorului
      const res = await query({
        query: GET_USER_PROFILE
      });
      
      // Verifică răspunsul
      expect(res.data.me).toBeDefined();
      expect(res.data.me.id).toBe(user._id.toString());
      expect(res.data.me.name).toBe(user.name);
      expect(res.data.me.email).toBe(user.email);
    });
    
    it('should not fetch profile when not authenticated', async () => {
      // Creează un server de test fără context de autentificare
      const { query } = createTestServer();
      
      // Execută query-ul pentru profilul utilizatorului
      const res = await query({
        query: GET_USER_PROFILE
      });
      
      // Verifică că există o eroare
      expect(res.errors).toBeDefined();
      expect(res.errors[0].message).toContain('Trebuie să fii autentificat');
    });
    
    it('should update user profile when authenticated', async () => {
      // Creează un utilizator autentificat pentru test
      const { user, context } = await createAuthenticatedUser();
      
      // Creează un server de test cu contextul utilizatorului autentificat
      const { mutate } = createTestServer(context);
      
      // Input pentru actualizare profil
      const input = {
        name: 'Updated Name',
        email: 'updated@example.com',
        preferences: {
          notifications: false,
          theme: 'dark'
        }
      };
      
      // Execută mutația de actualizare profil
      const res = await mutate({
        mutation: UPDATE_USER,
        variables: { input }
      });
      
      // Verifică răspunsul
      expect(res.data.updateUser).toBeDefined();
      expect(res.data.updateUser.name).toBe(input.name);
      expect(res.data.updateUser.email).toBe(input.email);
      expect(res.data.updateUser.preferences.notifications).toBe(input.preferences.notifications);
      expect(res.data.updateUser.preferences.theme).toBe(input.preferences.theme);
      
      // Verifică și în baza de date
      const updatedUser = await User.findById(user._id);
      expect(updatedUser.name).toBe(input.name);
      expect(updatedUser.email).toBe(input.email);
      expect(updatedUser.preferences.notifications).toBe(input.preferences.notifications);
      expect(updatedUser.preferences.theme).toBe(input.preferences.theme);
    });
    
    it('should not update user profile when not authenticated', async () => {
      // Creează un server de test fără context de autentificare
      const { mutate } = createTestServer();
      
      // Input pentru actualizare profil
      const input = {
        name: 'Updated Name',
        email: 'updated@example.com'
      };
      
      // Execută mutația de actualizare profil
      const res = await mutate({
        mutation: UPDATE_USER,
        variables: { input }
      });
      
      // Verifică că există o eroare
      expect(res.errors).toBeDefined();
      expect(res.errors[0].message).toContain('Trebuie să fii autentificat');
    });
  });