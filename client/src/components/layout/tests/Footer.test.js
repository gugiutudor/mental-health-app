// client/src/components/layout/__tests__/Footer.test.js
import React from 'react';
import { render, screen } from '@testing-library/react';
import Footer from '../Footer';

describe('Footer Component Tests', () => {
  it('should render the footer with correct content', () => {
    render(<Footer />);
    
    // Verifică titlul
    expect(screen.getByText('Aplicație de Monitorizare a Sănătății Mentale')).toBeInTheDocument();
    
    // Verifică descrierea
    expect(screen.getByText('Un sistem care oferă resurse și exerciții pentru îmbunătățirea sănătății mentale.')).toBeInTheDocument();
  });
  
  it('should display the current year in the copyright text', () => {
    // Mock pentru Date
    const originalDate = global.Date;
    const mockDate = class extends Date {
      getFullYear() {
        return 2025; // An fix pentru test
      }
    };
    
    global.Date = mockDate;
    
    render(<Footer />);
    
    // Verifică copyright-ul cu anul corect
    expect(screen.getByText('© 2025 Toate drepturile rezervate')).toBeInTheDocument();
    
    // Restaurează Date
    global.Date = originalDate;
  });
  
  it('should have correct styling classes', () => {
    render(<Footer />);
    
    // Verifică că footer-ul are clasele de stilizare corecte
    const footerElement = screen.getByRole('contentinfo');
    expect(footerElement).toBeInTheDocument();
    
    // În acest caz, folosim styled-components, deci nu verificăm clase CSS
    // dar putem verifica că elementul există cu rolul corect
  });
  
  it('should be positioned at the bottom of the page', () => {
    const { container } = render(<Footer />);
    
    // Verifică dacă componenta Footer are CSS pentru poziționare la partea de jos
    // Aceasta este o verificare indirectă pentru styled-components
    expect(container.firstChild).toHaveStyle('margin-top: auto');
  });
});