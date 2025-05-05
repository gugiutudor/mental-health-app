// client/src/context/__tests__/AuthContext.test.js
import React from 'react';
import { render, act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider, useAuth } from '../AuthContext';

// Mock pentru localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn(key => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn(key => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    })
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Componentă de test pentru a accesa contextul
const TestComponent = () => {
  const { currentUser, login, logout, updateUser, error, setError } = useAuth();
  
  return (
    <div>
      {currentUser ? (
        <>
          <div data-testid="user-name">{currentUser.name}</div>
          <button onClick={logout} data-testid="logout-button">Logout</button>
          <button 
            onClick={() => updateUser({ ...currentUser, name: 'Updated Name' })}
            data-testid="update-button"
          >
            Update
          </button>
        </>
      ) : (
        <>
          <div data-testid="no-user">No user logged in</div>
          <button 
            onClick={() => login({ id: '123', name: 'Test User' }, 'test-token')}
            data-testid="login-button"
          >
            Login
          </button>
        </>
      )}
      
      {error && <div data-testid="error-message">{error}</div>}
      <button 
        onClick={() => setError('Test error')}
        data-testid="set-error-button"
      >
        Set Error
      </button>
    </div>
  );
};

describe('AuthContext Tests', () => {
  beforeEach(() => {
    // Resetează localStorage înainte de fiecare test
    localStorageMock.clear();
    jest.clearAllMocks();
  });
  
  it('should initialize without user when localStorage is empty', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    expect(screen.getByTestId('no-user')).toBeInTheDocument();
    expect(screen.queryByTestId('user-name')).not.toBeInTheDocument();
  });
  
  it('should load user from localStorage on initialization', () => {
    // Setează date în localStorage
    localStorageMock.getItem.mockImplementation(key => {
      if (key === 'token') return 'saved-token';
      if (key === 'user') return JSON.stringify({ id: '123', name: 'Saved User' });
      return null;
    });
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    expect(screen.getByTestId('user-name')).toHaveTextContent('Saved User');
    expect(screen.queryByTestId('no-user')).not.toBeInTheDocument();
  });
  
  it('should handle login correctly', async () => {
    const user = userEvent.setup();
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    // Verifică starea inițială
    expect(screen.getByTestId('no-user')).toBeInTheDocument();
    
    // Apasă butonul de login
    await user.click(screen.getByTestId('login-button'));
    
    // Verifică că utilizatorul este acum logat
    expect(screen.getByTestId('user-name')).toHaveTextContent('Test User');
    expect(screen.queryByTestId('no-user')).not.toBeInTheDocument();
    
    // Verifică că localStorage a fost actualizat
    expect(localStorageMock.setItem).toHaveBeenCalledWith('token', 'test-token');
    expect(localStorageMock.setItem).toHaveBeenCalledWith('user', JSON.stringify({ id: '123', name: 'Test User' }));
  });
  
  it('should handle logout correctly', async () => {
    const user = userEvent.setup();
    
    // Pregătește starea cu utilizator logat
    localStorageMock.getItem.mockImplementation(key => {
      if (key === 'token') return 'saved-token';
      if (key === 'user') return JSON.stringify({ id: '123', name: 'Saved User' });
      return null;
    });
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    // Verifică starea inițială
    expect(screen.getByTestId('user-name')).toHaveTextContent('Saved User');
    
    // Apasă butonul de logout
    await user.click(screen.getByTestId('logout-button'));
    
    // Verifică că utilizatorul este acum delogat
    expect(screen.getByTestId('no-user')).toBeInTheDocument();
    expect(screen.queryByTestId('user-name')).not.toBeInTheDocument();
    
    // Verifică că localStorage a fost curățat
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('token');
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('user');
  });
  
  it('should handle user update correctly', async () => {
    const user = userEvent.setup();
    
    // Pregătește starea cu utilizator logat
    localStorageMock.getItem.mockImplementation(key => {
      if (key === 'token') return 'saved-token';
      if (key === 'user') return JSON.stringify({ id: '123', name: 'Original Name' });
      return null;
    });
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    // Verifică starea inițială
    expect(screen.getByTestId('user-name')).toHaveTextContent('Original Name');
    
    // Apasă butonul de actualizare
    await user.click(screen.getByTestId('update-button'));
    
    // Verifică că numele utilizatorului a fost actualizat
    expect(screen.getByTestId('user-name')).toHaveTextContent('Updated Name');
    
    // Verifică că localStorage a fost actualizat
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'user', 
      JSON.stringify({ id: '123', name: 'Updated Name' })
    );
  });
  
  it('should handle error state correctly', async () => {
    const user = userEvent.setup();
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    // Verifică că nu există mesaj de eroare inițial
    expect(screen.queryByTestId('error-message')).not.toBeInTheDocument();
    
    // Setează o eroare
    await user.click(screen.getByTestId('set-error-button'));
    
    // Verifică că mesajul de eroare este afișat
    expect(screen.getByTestId('error-message')).toHaveTextContent('Test error');
  });
  
  it('should handle malformed JSON in localStorage', () => {
    // Setează date invalide în localStorage
    localStorageMock.getItem.mockImplementation(key => {
      if (key === 'token') return 'saved-token';
      if (key === 'user') return 'invalid-json';
      return null;
    });
    
    // Spionează console.error
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    // Verifică că utilizatorul nu este logat (a fost delogat din cauza JSON invalid)
    expect(screen.getByTestId('no-user')).toBeInTheDocument();
    
    // Verifică că a fost logată o eroare
    expect(consoleSpy).toHaveBeenCalled();
    
    // Verifică că localStorage a fost curățat
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('token');
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('user');
    
    // Restaurează console.error
    consoleSpy.mockRestore();
  });
});