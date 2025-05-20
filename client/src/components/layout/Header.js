import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styled from 'styled-components';

const HeaderContainer = styled.header`
  background-color: #4c51bf;
  color: white;
  padding: 1rem 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const Nav = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Logo = styled(Link)`
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
  text-decoration: none;
`;

const NavLinks = styled.div`
  display: flex;
  gap: 1.5rem;
`;

const NavLink = styled(Link)`
  color: white;
  text-decoration: none;
  font-weight: 500;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.8;
  }
`;

const LogoutButton = styled.button`
  background: none;
  border: none;
  color: white;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.8;
  }
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  margin-right: 1rem;
  
  span {
    color: white;
    font-size: 0.9rem;
    opacity: 0.9;
    margin-right: 0.5rem;
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
        <Logo to="/">Sănătate Mentală</Logo>
        
        <NavLinks>
          {currentUser ? (
            <>
              <NavLink to="/">Dashboard</NavLink>
              <NavLink to="/exercises">Exerciții</NavLink>
              <NavLink to="/resources">Resurse</NavLink>
              <UserInfo>
                <span>Salut, {currentUser.firstName || ''}!</span>
              </UserInfo>
              <NavLink to="/profile">Profil</NavLink>
              <LogoutButton onClick={handleLogout}>Deconectare</LogoutButton>
            </>
          ) : (
            <>
              <NavLink to="/login">Autentificare</NavLink>
              <NavLink to="/register">Înregistrare</NavLink>
            </>
          )}
        </NavLinks>
      </Nav>
    </HeaderContainer>
  );
};

export default Header;