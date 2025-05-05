module.exports = {
  testEnvironment: 'node',
  roots: ['src'],
  testMatch: ['**/__tests__/**/*.js', '**/?(*.)+(spec|test).js'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/index.js',
    '!**/node_modules/**',
    '!**/vendor/**'
  ],
  coverageDirectory: './coverage',
  coverageReporters: ['text', 'lcov'],
  testPathIgnorePatterns: ['/node_modules/', '/client/'],
  verbose: true,
  setupFilesAfterEnv: ['./jest.setup.js']
};
