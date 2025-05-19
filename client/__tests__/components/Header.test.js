
// Test pentru componenta Header
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Header from '../../src/components/layout/Header';
import { AuthProvider } from '../../src/context/AuthContext';

// Mock pentru useNavigate
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn()
}));

const renderWithProviders = (ui) => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        {ui}
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('Header Component', () => {
  it('renders login and register links when user is not logged in', () => {
    // Asigură-te că localStorage este gol (utilizator neautentificat)
    localStorage.clear();
    
    renderWithProviders(<Header />);
    
    // Verifică dacă linkurile pentru autentificare și înregistrare sunt afișate
    expect(screen.getByText('Autentificare')).toBeInTheDocument();
    expect(screen.getByText('Înregistrare')).toBeInTheDocument();
    
    // Verifică că linkurile pentru utilizatori autentificați NU sunt afișate
    expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
    expect(screen.queryByText('Exerciții')).not.toBeInTheDocument();
    expect(screen.queryByText('Resurse')).not.toBeInTheDocument();
    expect(screen.queryByText('Profil')).not.toBeInTheDocument();
    expect(screen.queryByText('Deconectare')).not.toBeInTheDocument();
  });
  
  it('renders user navigation when user is logged in', () => {
    // Pregătim localStorage cu date de utilizator
    const userData = { name: 'Test User', email: 'test@example.com' };
    localStorage.setItem('token', 'fake-token');
    localStorage.setItem('user', JSON.stringify(userData));
    
    renderWithProviders(<Header />);
    
    // Verifică dacă linkurile pentru utilizatori autentificați sunt afișate
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Exerciții')).toBeInTheDocument();
    expect(screen.getByText('Resurse')).toBeInTheDocument();
    expect(screen.getByText('Profil')).toBeInTheDocument();
    expect(screen.getByText('Deconectare')).toBeInTheDocument();
    
    // Verifică că linkurile pentru utilizatori neautentificați NU sunt afișate
    expect(screen.queryByText('Autentificare')).not.toBeInTheDocument();
    expect(screen.queryByText('Înregistrare')).not.toBeInTheDocument();
  });
  
  it('displays the correct logo/brand name', () => {
    renderWithProviders(<Header />);
    
    // Verifică dacă logo-ul/numele aplicației este afișat corect
    expect(screen.getByText('Sănătate Mentală')).toBeInTheDocument();
  });
  
  it('logs out when clicking the logout button', () => {
    // Pregătim localStorage cu date de utilizator
    const userData = { name: 'Test User', email: 'test@example.com' };
    localStorage.setItem('token', 'fake-token');
    localStorage.setItem('user', JSON.stringify(userData));
    
    renderWithProviders(<Header />);
    
    // Verifică dacă butonul de logout este afișat
    const logoutButton = screen.getByText('Deconectare');
    expect(logoutButton).toBeInTheDocument();
    
    // Simulează click pe butonul de logout
    fireEvent.click(logoutButton);
    
    // Verifică dacă localStorage a fost curățat
    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
  });
});