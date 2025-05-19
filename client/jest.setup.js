// Jest setup extins pentru a include TextEncoder/TextDecoder
require('@testing-library/jest-dom');

// Mock pentru TextEncoder/TextDecoder care lipsesc în JSDOM
class TextEncoderMock {
  encode(text) {
    return Buffer.from(text);
  }
}

class TextDecoderMock {
  decode(buffer) {
    return buffer.toString();
  }
}

global.TextEncoder = TextEncoderMock;
global.TextDecoder = TextDecoderMock;

// Mock pentru localStorage
const localStorageMock = (function() {
  let store = {};
  return {
    getItem: function(key) {
      return store[key] || null;
    },
    setItem: function(key, value) {
      store[key] = value.toString();
    },
    removeItem: function(key) {
      delete store[key];
    },
    clear: function() {
      store = {};
    }
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock pentru matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Suprimă avertismentele de la React act()
const originalError = console.error;
console.error = (...args) => {
  if (/Warning.*not wrapped in act/.test(args[0])) {
    return;
  }
  originalError.call(console, ...args);
};