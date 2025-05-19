import React from 'react';
import styled from 'styled-components';

const FooterContainer = styled.footer`
  background-color: #2d3748;
  color: white;
  padding: 2rem;
  text-align: center;
  margin-top: auto;
`;

const FooterContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const Copyright = styled.p`
  margin-top: 1rem;
  font-size: 0.875rem;
  opacity: 0.8;
`;

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <FooterContainer>
      <FooterContent>
        <h3>Aplicație de Monitorizare a Sănătății Mentale</h3>
        <p>Un sistem care oferă resurse și exerciții pentru îmbunătățirea sănătății mentale.</p>
        <Copyright>© {currentYear} Toate drepturile rezervate</Copyright>
      </FooterContent>
    </FooterContainer>
  );
};

export default Footer;