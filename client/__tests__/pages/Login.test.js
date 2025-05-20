// Test actualizat pentru Login.test.js cu firstName/lastName
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { MockedProvider } from '@apollo/client/testing';
import Login from '../../src/pages/Login';
import { LOGIN_USER } from '../../src/graphql/mutations';
import { AuthProvider } from '../../src/context/AuthContext';

// Mock pentru useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => {
  const originalModule = jest.requireActual('react-router-dom');
  return {
    ...originalModule,
    useNavigate: () => mockNavigate,
  };
});

describe('Login Page', () => {
  const mockUserData = {
    id: '1',
    firstName: 'Test',
    lastName: 'User',
    email: 'test@example.com',
    dateJoined: new Date().toISOString(),
    preferences: {
      notifications: true,
      reminderTime: '20:00',
      theme: 'auto'
    },
    streak: 0
  };

  const mocks = [
    {
      request: {
        query: LOGIN_USER,
        variables: {
          input: {
            email: 'test@example.com',
            password: 'password123'
          }
        }
      },
      result: {
        data: {
          login: {
            token: 'fake-token',
            user: mockUserData
          }
        }
      }
    },
    {
      request: {
        query: LOGIN_USER,
        variables: {
          input: {
            email: 'invalid@example.com',
            password: 'wrongpassword'
          }
        }
      },
      error: new Error('Email sau parolă incorectă')
    }
  ];

  const renderLoginPage = () => {
    return render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <MemoryRouter initialEntries={['/login']}>
          <AuthProvider>
            <Login />
          </AuthProvider>
        </MemoryRouter>
      </MockedProvider>
    );
  };

  beforeEach(() => {
    localStorage.clear();
    mockNavigate.mockClear();
    jest.clearAllMocks();
  });

  it('renders the login form', () => {
    renderLoginPage();
    
    // Verifică dacă elementele formularului sunt prezente
    expect(screen.getByRole('heading', { name: /autentificare/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/parolă/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /autentificare/i })).toBeInTheDocument();
    expect(screen.getByText(/nu ai cont/i)).toBeInTheDocument();
    expect(screen.getByText(/înregistrează-te/i)).toBeInTheDocument();
  });

  it('allows entering email and password', () => {
    renderLoginPage();
    
    // Găsește câmpurile de email și parolă
    const emailField = screen.getByLabelText(/email/i);
    const passwordField = screen.getByLabelText(/parolă/i);
    
    // Introduce valori
    fireEvent.change(emailField, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordField, { target: { value: 'password123' } });
    
    // Verifică dacă valorile au fost actualizate
    expect(emailField.value).toBe('test@example.com');
    expect(passwordField.value).toBe('password123');
  });

  it('submits the form and navigates to dashboard on successful login', async () => {
    renderLoginPage();
    
    // Completează formularul
    const emailField = screen.getByLabelText(/email/i);
    const passwordField = screen.getByLabelText(/parolă/i);
    fireEvent.change(emailField, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordField, { target: { value: 'password123' } });
    
    // Trimite formularul
    fireEvent.click(screen.getByRole('button', { name: /autentificare/i }));
    
    // Așteaptă finalizarea procesului de login
    await waitFor(() => {
      // Verifică dacă navigarea a fost apelată cu ruta corectă
      expect(mockNavigate).toHaveBeenCalledWith('/');
      
      // Verifică dacă datele utilizatorului au fost salvate în localStorage
      expect(localStorage.getItem('token')).toBe('fake-token');
      const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
      expect(savedUser.firstName).toBe(mockUserData.firstName);
      expect(savedUser.lastName).toBe(mockUserData.lastName);
      expect(savedUser.email).toBe(mockUserData.email);
    });
  });

  it('shows an error message on login failure', async () => {
    // Override MockedProvider cu un mock care eșuează
    const errorMock = [
      {
        request: {
          query: LOGIN_USER,
          variables: {
            input: {
              email: 'invalid@example.com',
              password: 'wrongpassword'
            }
          }
        },
        error: new Error('Email sau parolă incorectă')
      }
    ];

    render(
      <MockedProvider mocks={errorMock} addTypename={false}>
        <MemoryRouter initialEntries={['/login']}>
          <AuthProvider>
            <Login />
          </AuthProvider>
        </MemoryRouter>
      </MockedProvider>
    );
    
    // Completează formularul cu credențiale invalide
    const emailField = screen.getByLabelText(/email/i);
    const passwordField = screen.getByLabelText(/parolă/i);
    fireEvent.change(emailField, { target: { value: 'invalid@example.com' } });
    fireEvent.change(passwordField, { target: { value: 'wrongpassword' } });
    
    // Trimite formularul
    fireEvent.click(screen.getByRole('button', { name: /autentificare/i }));
    
    // Așteaptă afișarea mesajului de eroare
    await waitFor(() => {
      // Verificăm mesajul de eroare
      const errorMessage = screen.getByText(/email sau parolă incorectă/i);
      expect(errorMessage).toBeInTheDocument();
    });
    
    // Verifică că navigarea nu a fost apelată și că localStorage nu a fost actualizat
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
  });

  it('validates email format', async () => {
    renderLoginPage();
    
    // Completează formularul cu email invalid
    const emailField = screen.getByLabelText(/email/i);
    const passwordField = screen.getByLabelText(/parolă/i);
    fireEvent.change(emailField, { target: { value: 'invalid-email' } });
    fireEvent.change(passwordField, { target: { value: 'password123' } });
    
    // Apasă în afara câmpului pentru a declanșa validarea
    fireEvent.blur(emailField);
    
    // Verifică mesajul de eroare
    await waitFor(() => {
      expect(screen.getByText(/adresa de email invalidă/i)).toBeInTheDocument();
    });
  });
});