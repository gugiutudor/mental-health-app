// Test pentru AuthContext
import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../../src/context/AuthContext';

// Componenta de test care utilizează hook-ul useAuth
const TestComponent = () => {
  const { currentUser, login, logout, loading, error } = useAuth();
  
  return (
    <div>
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      {currentUser ? (
        <>
          <p>User: {currentUser.name}</p>
          <button onClick={logout}>Logout</button>
        </>
      ) : (
        <button onClick={() => login({name: 'Test User', email: 'test@example.com'}, 'fake-token')}>
          Login
        </button>
      )}
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    // Curăță localStorage înainte de fiecare test
    localStorage.clear();
    jest.clearAllMocks();
  });
  
  it('should provide current user when token exists in localStorage', () => {
    // Pregătire localStorage cu un utilizator și token
    const userData = { name: 'Stored User', email: 'stored@example.com' };
    localStorage.setItem('token', 'stored-token');
    localStorage.setItem('user', JSON.stringify(userData));
    
    // Randează componenta cu AuthProvider
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    // Verifică dacă utilizatorul este afișat
    expect(screen.getByText(`User: ${userData.name}`)).toBeInTheDocument();
  });
  
  it('should allow login and store user data', () => {
    // Randează componenta
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    // Verifică că nu avem un utilizator inițial
    expect(screen.queryByText(/User:/)).not.toBeInTheDocument();
    
    // Apasă butonul de login
    fireEvent.click(screen.getByText('Login'));
    
    // Verifică dacă utilizatorul este afișat după login
    expect(screen.getByText('User: Test User')).toBeInTheDocument();
    
    // Verifică dacă datele au fost stocate în localStorage
    expect(localStorage.getItem('token')).toBe('fake-token');
    expect(localStorage.getItem('user')).toBe(JSON.stringify({name: 'Test User', email: 'test@example.com'}));
  });
  
  it('should allow logout and clear user data', () => {
    // Pregătire localStorage cu un utilizator și token
    const userData = { name: 'Stored User', email: 'stored@example.com' };
    localStorage.setItem('token', 'stored-token');
    localStorage.setItem('user', JSON.stringify(userData));
    
    // Randează componenta
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    // Verifică că avem un utilizator inițial
    expect(screen.getByText(`User: ${userData.name}`)).toBeInTheDocument();
    
    // Apasă butonul de logout
    fireEvent.click(screen.getByText('Logout'));
    
    // Verifică că utilizatorul nu mai este afișat după logout
    expect(screen.queryByText(/User:/)).not.toBeInTheDocument();
    
    // Verifică dacă datele au fost eliminate din localStorage
    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
  });
  
  it('should handle invalid user data in localStorage', () => {
    // Pregătire localStorage cu date invalide
    localStorage.setItem('token', 'stored-token');
    localStorage.setItem('user', 'invalid-json');
    
    // Spy pe console.error pentru a verifica logarea erorii
    jest.spyOn(console, 'error').mockImplementation(() => {});
    
    // Randează componenta
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    // Verifică că nu avem un utilizator (a fost făcut logout din cauza datelor invalide)
    expect(screen.queryByText(/User:/)).not.toBeInTheDocument();
    
    // Verifică că eroarea a fost logată
    expect(console.error).toHaveBeenCalled();
    
    // Restaurează console.error
    console.error.mockRestore();
  });
});