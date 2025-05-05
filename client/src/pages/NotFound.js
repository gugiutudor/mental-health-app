import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const NotFoundContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 4rem 1rem;
  max-width: 800px;
  margin: 0 auto;
`;

const Title = styled.h1`
  font-size: 6rem;
  margin: 0;
  color: #4c51bf;
  line-height: 1;
`;

const Subtitle = styled.h2`
  font-size: 2rem;
  margin: 1rem 0 2rem;
  color: #2d3748;
`;

const Description = styled.p`
  font-size: 1.125rem;
  margin-bottom: 2rem;
  color: #4a5568;
  line-height: 1.6;
`;

const HomeButton = styled(Link)`
  display: inline-block;
  background-color: #4c51bf;
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  font-size: 1.125rem;
  font-weight: 600;
  text-decoration: none;
  transition: background-color 0.2s;

  &:hover {
    background-color: #434190;
    text-decoration: none;
    color: white;
  }
`;

const NotFound = () => {
  return (
    <NotFoundContainer>
      <Title>404</Title>
      <Subtitle>Pagină negăsită</Subtitle>
      <Description>
        Ne pare rău, dar pagina pe care o cauți nu există. Este posibil să fi fost mutată, ștearsă sau să nu fi existat niciodată.
      </Description>
      <HomeButton to="/">
        Înapoi la pagina principală
      </HomeButton>
    </NotFoundContainer>
  );
};

export default NotFound;