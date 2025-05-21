import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styled from 'styled-components';

const HeaderContainer = styled.header`
  background: linear-gradient(135deg, var(--primary-color) 0%, #5146e2 100%);
  color: white;
  padding: 1rem 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const Nav = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Logo = styled(Link)`
  font-size: 1.75rem;
  font-weight: 800;
  color: white;
  text-decoration: none;
  display: flex;
  align-items: center;
  
  span {
    color: #9cf0e0;
  }
`;

const NavLinks = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
`;

const NavLink = styled(Link)`
  color: rgba(255, 255, 255, 0.9);
  text-decoration: none;
  font-weight: 500;
  transition: all 0.2s;

  &:hover {
    color: white;
    text-decoration: underline;
  }
`;

const LogoutButton = styled.button`
  background-color: transparent;
  color: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
    color: white;
    border-color: rgba(255, 255, 255, 0.5);
  }
`;

const AuthButton = styled(Link)`
  background-color: rgba(255, 255, 255, 0.15);
  color: white;
  padding: 0.5rem 1.25rem;
  border-radius: 6px;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.2s;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.25);
    color: white;
    transform: translateY(-1px);
  }
`;

const Header = () => {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <HeaderContainer>
      <Nav>
        <Logo to="/">Zen<span>Path</span></Logo>
        
        <NavLinks>
          {currentUser ? (
            <>
              <NavLink to="/">Acasă</NavLink>
              <NavLink to="/exercises">Exerciții</NavLink>
              <NavLink to="/resources">Resurse</NavLink>
              <NavLink to="/profile">Profil</NavLink>
              <LogoutButton onClick={handleLogout}>Deconectare</LogoutButton>
            </>
          ) : (
            <>
              <AuthButton to="/login">Autentificare</AuthButton>
              <AuthButton to="/register" style={{ marginLeft: '0.5rem' }}>Înregistrare</AuthButton>
            </>
          )}
        </NavLinks>
      </Nav>
    </HeaderContainer>
  );
};

export default Header;