// server/src/models/__tests__/User.test.js
const mongoose = require('mongoose');
const { User } = require('../index');

describe('User Model Test', () => {
  it('should create a new user with valid data', async () => {
    const userData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123'
    };

    const user = new User(userData);
    const savedUser = await user.save();

    // Verifică salvarea corectă a utilizatorului
    expect(savedUser._id).toBeDefined();
    expect(savedUser.name).toBe(userData.name);
    expect(savedUser.email).toBe(userData.email);
    
    // Verifică că parola a fost hașată
    expect(savedUser.password).not.toBe(userData.password);
    
    // Verifică că valorile implicite au fost setate
    expect(savedUser.dateJoined).toBeDefined();
    expect(savedUser.preferences.notifications).toBe(true);
    expect(savedUser.preferences.theme).toBe('auto');
    expect(savedUser.streak).toBe(0);
  });

  it('should fail to create a user with invalid email format', async () => {
    const userData = {
      name: 'Test User',
      email: 'invalid-email',
      password: 'password123'
    };

    const user = new User(userData);
    
    // Verifică că validarea eșuează
    await expect(user.save()).rejects.toThrow();
  });

  it('should fail to create a user without required fields', async () => {
    const userWithoutName = {
      email: 'test@example.com',
      password: 'password123'
    };

    const userWithoutEmail = {
      name: 'Test User',
      password: 'password123'
    };

    const userWithoutPassword = {
      name: 'Test User',
      email: 'test@example.com'
    };

    // Verifică că validarea eșuează pentru fiecare caz
    await expect(new User(userWithoutName).save()).rejects.toThrow();
    await expect(new User(userWithoutEmail).save()).rejects.toThrow();
    await expect(new User(userWithoutPassword).save()).rejects.toThrow();
  });

  it('should compare password correctly', async () => {
    const userData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123'
    };

    const user = new User(userData);
    await user.save();
    
    // Verifică metoda comparePassword
    const correctPasswordResult = await user.comparePassword('password123');
    const wrongPasswordResult = await user.comparePassword('wrongpassword');
    
    expect(correctPasswordResult).toBe(true);
    expect(wrongPasswordResult).toBe(false);
  });

  it('should update user preferences correctly', async () => {
    const userData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123'
    };

    const user = new User(userData);
    await user.save();
    
    // Actualizează preferințele
    user.preferences.notifications = false;
    user.preferences.theme = 'dark';
    user.preferences.reminderTime = '21:00';
    
    await user.save();
    
    // Verifică actualizarea
    const updatedUser = await User.findById(user._id);
    expect(updatedUser.preferences.notifications).toBe(false);
    expect(updatedUser.preferences.theme).toBe('dark');
    expect(updatedUser.preferences.reminderTime).toBe('21:00');
  });
});