// client/src/components/layout/__tests__/Header.test.js
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../../context/AuthContext';
import Header from '../Header';

// Mock pentru useNavigate
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn()
}));

// Helper pentru a înfășura componenta cu providerii necesari
const renderWithProviders = (ui) => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        {ui}
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('Header Component Tests', () => {
  beforeEach(() => {
    // Resetează localStorage înainte de fiecare test
    localStorage.clear();
  });
  
  it('should render login and register links when user is not logged in', () => {
    renderWithProviders(<Header />);
    
    // Verifică existența link-urilor pentru utilizator neautentificat
    expect(screen.getByText('Autentificare')).toBeInTheDocument();
    expect(screen.getByText('Înregistrare')).toBeInTheDocument();
    
    // Verifică că link-urile pentru utilizator autentificat nu există
    expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
    expect(screen.queryByText('Exerciții')).not.toBeInTheDocument();
    expect(screen.queryByText('Resurse')).not.toBeInTheDocument();
    expect(screen.queryByText('Profil')).not.toBeInTheDocument();
    expect(screen.queryByText('Deconectare')).not.toBeInTheDocument();
  });
  
  it('should render navigation links and logout button when user is logged in', () => {
    // Simulează un utilizator autentificat
    localStorage.setItem('token', 'test-token');
    localStorage.setItem('user', JSON.stringify({ id: '123', name: 'Test User' }));
    
    renderWithProviders(<Header />);
    
    // Verifică existența link-urilor pentru utilizator autentificat
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Exerciții')).toBeInTheDocument();
    expect(screen.getByText('Resurse')).toBeInTheDocument();
    expect(screen.getByText('Profil')).toBeInTheDocument();
    expect(screen.getByText('Deconectare')).toBeInTheDocument();
    
    // Verifică că link-urile pentru utilizator neautentificat nu există
    expect(screen.queryByText('Autentificare')).not.toBeInTheDocument();
    expect(screen.queryByText('Înregistrare')).not.toBeInTheDocument();
  });
  
  it('should handle logout correctly', async () => {
    const user = userEvent.setup();
    
    // Simulează un utilizator autentificat
    localStorage.setItem('token', 'test-token');
    localStorage.setItem('user', JSON.stringify({ id: '123', name: 'Test User' }));
    
    renderWithProviders(<Header />);
    
    // Verifică starea inițială
    expect(screen.getByText('Deconectare')).toBeInTheDocument();
    
    // Apasă butonul de deconectare
    await user.click(screen.getByText('Deconectare'));
    
    // După delogare, AR TREBUI să vedem link-urile pentru autentificare
    // Dar pentru că useNavigate este un mock, ne bazăm pe verificarea localStorage
    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
  });
  
  it('should display the app name correctly', () => {
    renderWithProviders(<Header />);
    
    expect(screen.getByText('Sănătate Mentală')).toBeInTheDocument();
  });
  
  it('should have correct navigation links for authenticated users', () => {
    // Simulează un utilizator autentificat
    localStorage.setItem('token', 'test-token');
    localStorage.setItem('user', JSON.stringify({ id: '123', name: 'Test User' }));
    
    renderWithProviders(<Header />);
    
    // Verifică că link-urile au href-urile corecte
    expect(screen.getByText('Dashboard').closest('a')).toHaveAttribute('href', '/');
    expect(screen.getByText('Exerciții').closest('a')).toHaveAttribute('href', '/exercises');
    expect(screen.getByText('Resurse').closest('a')).toHaveAttribute('href', '/resources');
    expect(screen.getByText('Profil').closest('a')).toHaveAttribute('href', '/profile');
  });
  
  it('should have correct navigation links for unauthenticated users', () => {
    renderWithProviders(<Header />);
    
    // Verifică că link-urile au href-urile corecte
    expect(screen.getByText('Autentificare').closest('a')).toHaveAttribute('href', '/login');
    expect(screen.getByText('Înregistrare').closest('a')).toHaveAttribute('href', '/register');
  });
});