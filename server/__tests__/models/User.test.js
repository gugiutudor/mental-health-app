// Testare model User - Actualizat pentru firstName și lastName
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { User } = require('../../src/models');

let mongoServer;

beforeAll(async () => {
  // Configurează o instanță MongoDB în memorie pentru teste
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  
  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

afterAll(async () => {
  // Închide conexiunile după terminarea testelor
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('User Model', () => {
  it('should create a new user successfully with firstName and lastName', async () => {
    const userData = {
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      password: 'password123'
    };
    
    const user = new User(userData);
    const savedUser = await user.save();
    
    // Verifică dacă utilizatorul a fost salvat
    expect(savedUser._id).toBeDefined();
    expect(savedUser.firstName).toBe(userData.firstName);
    expect(savedUser.lastName).toBe(userData.lastName);
    expect(savedUser.email).toBe(userData.email);
    
    // Verifică dacă câmpul virtual name returnează firstName + lastName
    expect(savedUser.name).toBe(`${userData.firstName} ${userData.lastName}`);
    
    // Verifică dacă parola a fost hash-uită
    expect(savedUser.password).not.toBe(userData.password);
  });
  
  it('should fail to create user without firstName', async () => {
    const userData = {
      lastName: 'User',
      email: 'missing-firstname@example.com',
      password: 'password123'
    };
    
    const user = new User(userData);
    
    // Ar trebui să arunce o eroare pentru că firstName este obligatoriu
    await expect(user.save()).rejects.toThrow();
  });
  
  it('should fail to create user without lastName', async () => {
    const userData = {
      firstName: 'Test',
      email: 'missing-lastname@example.com',
      password: 'password123'
    };
    
    const user = new User(userData);
    
    // Ar trebui să arunce o eroare pentru că lastName este obligatoriu
    await expect(user.save()).rejects.toThrow();
  });
  
  it('should fail to create user with duplicate email', async () => {
    // Creează primul utilizator
    const userData = {
      firstName: 'First',
      lastName: 'User',
      email: 'duplicate@example.com',
      password: 'password123'
    };
    
    const user = new User(userData);
    await user.save();
    
    // Încearcă să creezi al doilea utilizator cu același email
    const duplicateUser = new User({
      firstName: 'Second',
      lastName: 'User',
      email: 'duplicate@example.com',
      password: 'anotherpassword'
    });
    
    // Ar trebui să arunce o eroare de duplicate key
    await expect(duplicateUser.save()).rejects.toThrow();
  });
  
  it('should compare password correctly', async () => {
    const userData = {
      firstName: 'Password',
      lastName: 'Test',
      email: 'password@example.com',
      password: 'correctpassword'
    };
    
    const user = new User(userData);
    await user.save();
    
    // Verifică compararea parolei - ar trebui să returneze true pentru parola corectă
    const isMatch = await user.comparePassword('correctpassword');
    expect(isMatch).toBe(true);
    
    // Verifică compararea parolei - ar trebui să returneze false pentru parola greșită
    const isWrongMatch = await user.comparePassword('wrongpassword');
    expect(isWrongMatch).toBe(false);
  });
});