const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

// Configurare pentru a utiliza o instanță MongoDB în memorie pentru teste
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  await mongoose.connect(mongoUri);
});

// Curățare după fiecare test
afterEach(async () => {
  const collections = mongoose.connection.collections;
  
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
});

// Deconectare și închidere după toate testele
afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

// Suprimă avertismentele legate de ESM
jest.mock('graphql-subscriptions', () => ({
  PubSub: jest.fn().mockImplementation(() => ({
    publish: jest.fn(),
    subscribe: jest.fn(),
  })),
}));

// Adaugă un mock pentru JWT
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn().mockReturnValue('mock-token'),
  verify: jest.fn().mockImplementation((token) => {
    if (token === 'invalid-token') {
      throw new Error('Invalid token');
    }
    return { id: 'mock-user-id', email: 'test@example.com' };
  })
}));

// Utils pentru testare
global.createTestUser = async () => {
  const { User } = require('./src/models');
  const user = new User({
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123'
  });
  
  await user.save();
  return user;
};

global.createMockContext = (user = null) => ({
  req: {
    user: user
  }
});