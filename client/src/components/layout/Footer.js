import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const FooterContainer = styled.footer`
  background: linear-gradient(135deg, var(--primary-color) 0%, #5146e2 100%);
  color: white;
  padding: 2.5rem 2rem 1.5rem;
  text-align: center;
  margin-top: auto;
`;

const FooterContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const FooterLogo = styled.div`
  font-size: 1.5rem;
  font-weight: 800;
  margin-bottom: 1rem;
  
  span {
    color: #9cf0e0;
  }
`;

const FooterDescription = styled.p`
  margin-bottom: 1.5rem;
  max-width: 600px;
  opacity: 0.9;
  line-height: 1.6;
`;

const FooterLinks = styled.div`
  display: flex;
  gap: 2rem;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 0.5rem;
  }
`;

const FooterLink = styled(Link)`
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  transition: color 0.2s;
  
  &:hover {
    color: white;
    text-decoration: underline;
  }
`;

const Copyright = styled.p`
  margin-top: 1rem;
  font-size: 0.875rem;
  opacity: 0.7;
`;

const Divider = styled.div`
  width: 60px;
  height: 4px;
  background-color: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
  margin: 0 auto 1.5rem;
`;

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <FooterContainer>
      <FooterContent>
        <FooterLogo>Zen<span>Path</span></FooterLogo>
        <Divider />
        <FooterDescription>
          Aplicație dedicată monitorizării și îmbunătățirii sănătății tale mentale, oferind resurse și exerciții personalizate.
        </FooterDescription>
        
        <FooterLinks>
          <FooterLink to="/about">Despre noi</FooterLink>
          <FooterLink to="/privacy">Politica de confidențialitate</FooterLink>
          <FooterLink to="/terms">Termeni și condiții</FooterLink>
          <FooterLink to="/contact">Contact</FooterLink>
        </FooterLinks>
        
        <Copyright>© {currentYear} ZenPath. Toate drepturile rezervate.</Copyright>
      </FooterContent>
    </FooterContainer>
  );
};

export default Footer;