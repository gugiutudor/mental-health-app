import '@testing-library/jest-dom';
import { server } from './__mocks__/server';

// Establecer manipuladores antes de todos los tests
beforeAll(() => server.listen());

// Resetar cualquier manipulador después de cada test
afterEach(() => server.resetHandlers());

// Limpiar después de todos los tests
afterAll(() => server.close());

// client/src/__mocks__/fileMock.js
module.exports = 'test-file-stub';