// client/src/pages/__tests__/Login.test.js
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { MockedProvider } from '@apollo/client/testing';
import { AuthProvider } from '../../context/AuthContext';
import Login from '../Login';
import { LOGIN_USER } from '../../graphql/mutations';

// Mock pentru useNavigate
const mockedNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedNavigate
}));

const renderLoginPage = (mocks = []) => {
  return render(
    <BrowserRouter>
      <MockedProvider mocks={mocks} addTypename={false}>
        <AuthProvider>
          <Login />
        </AuthProvider>
      </MockedProvider>
    </BrowserRouter>
  );
};

describe('Login Page Tests', () => {
  beforeEach(() => {
    mockedNavigate.mockReset();
    localStorage.clear();
  });
  
  it('should render the login form', () => {
    renderLoginPage();
    
    // Verifică titlul paginii
    expect(screen.getByText('Autentificare')).toBeInTheDocument();
    
    // Verifică câmpurile formularului
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Parolă')).toBeInTheDocument();
    
    // Verifică butonul de autentificare
    expect(screen.getByRole('button', { name: 'Autentificare' })).toBeInTheDocument();
    
    // Verifică link-ul de înregistrare
    expect(screen.getByText('Nu ai cont?')).toBeInTheDocument();
    expect(screen.getByText('Înregistrează-te')).toBeInTheDocument();
  });
  
  it('should show validation errors for invalid inputs', async () => {
    const user = userEvent.setup();
    renderLoginPage();
    
    // Apasă butonul de autentificare fără a completa câmpurile
    const submitButton = screen.getByRole('button', { name: 'Autentificare' });
    await user.click(submitButton);
    
    // Așteptăm afișarea mesajelor de eroare
    await waitFor(() => {
      expect(screen.getByText('Adresa de email este obligatorie')).toBeInTheDocument();
      expect(screen.getByText('Parola este obligatorie')).toBeInTheDocument();
    });
    
    // Completează email invalid
    const emailInput = screen.getByLabelText('Email');
    await user.type(emailInput, 'invalid-email');
    
    // Verifică mesajul de eroare pentru email
    await waitFor(() => {
      expect(screen.getByText('Adresa de email invalidă')).toBeInTheDocument();
    });
  });
  
  it('should submit the form and redirect on successful login', async () => {
    const user = userEvent.setup();
    
    // Mock pentru mutația LOGIN_USER
    const loginMock = {
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
            token: 'test-token',
            user: {
              id: 'user123',
              name: 'Test User',
              email: 'test@example.com',
              dateJoined: '2023-01-01T00:00:00.000Z',
              preferences: {
                notifications: true,
                reminderTime: '20:00',
                theme: 'auto'
              },
              streak: 5
            }
          }
        }
      }
    };
    
    renderLoginPage([loginMock]);
    
    // Completează formularul
    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Parolă');
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    
    // Trimite formularul
    const submitButton = screen.getByRole('button', { name: 'Autentificare' });
    await user.click(submitButton);
    
    // Verifică că mutația a fost executată și redirecționarea a avut loc
    await waitFor(() => {
      // Verifică că datele au fost salvate în localStorage
      expect(localStorage.getItem('token')).toBe('test-token');
      expect(JSON.parse(localStorage.getItem('user'))).toEqual(loginMock.result.data.login.user);
      
      // Verifică că navigate a fost apelat cu ruta corectă
      expect(mockedNavigate).toHaveBeenCalledWith('/');
    });
  });
  
  it('should show error message on failed login', async () => {
    const user = userEvent.setup();
    
    // Mock pentru mutația LOGIN_USER cu eroare
    const loginErrorMock = {
      request: {
        query: LOGIN_USER,
        variables: {
          input: {
            email: 'wrong@example.com',
            password: 'wrongpassword'
          }
        }
      },
      error: new Error('Email sau parolă incorectă')
    };
    
    renderLoginPage([loginErrorMock]);
    
    // Completează formularul
    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Parolă');
    await user.type(emailInput, 'wrong@example.com');
    await user.type(passwordInput, 'wrongpassword');
    
    // Trimite formularul
    const submitButton = screen.getByRole('button', { name: 'Autentificare' });
    await user.click(submitButton);
    
    // Verifică afișarea mesajului de eroare
    await waitFor(() => {
      expect(screen.getByText('Email sau parolă incorectă')).toBeInTheDocument();
    });
    
    // Verifică că nu a avut loc redirecționarea
    expect(mockedNavigate).not.toHaveBeenCalled();
  });
  
  it('should navigate to register page when clicking on register link', async () => {
    const user = userEvent.setup();
    renderLoginPage();
    
    // Apasă link-ul de înregistrare
    const registerLink = screen.getByText('Înregistrează-te');
    await user.click(registerLink);
    
    // Verifică că redirecționarea se face prin BrowserRouter (nu prin mockedNavigate)
    // În acest caz nu putem testa direct navigarea, dar putem verifica că link-ul are href-ul corect
    expect(registerLink.closest('a')).toHaveAttribute('href', '/register');
  });
  
  it('should show loading state while submitting', async () => {
    const user = userEvent.setup();
    
    // Mock pentru mutația LOGIN_USER cu întârziere
    const loginMock = {
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
            token: 'test-token',
            user: {
              id: 'user123',
              name: 'Test User',
              email: 'test@example.com',
              dateJoined: '2023-01-01T00:00:00.000Z',
              preferences: {
                notifications: true,
                reminderTime: '20:00',
                theme: 'auto'
              },
              streak: 5
            }
          }
        }
      },
      delay: 100 // Întârziere de 100ms
    };
    
    renderLoginPage([loginMock]);
    
    // Completează formularul
    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Parolă');
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    
    // Trimite formularul
    const submitButton = screen.getByRole('button', { name: 'Autentificare' });
    await user.click(submitButton);
    
    // Verifică starea de loading
    expect(screen.getByText('Se procesează...')).toBeInTheDocument();
    
    // Așteptăm terminarea mutației
    await waitFor(() => {
      expect(mockedNavigate).toHaveBeenCalledWith('/');
    });
  });
});