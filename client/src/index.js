// client/src/index.js - modificat pentru a dezactiva adăugarea __typename
import React from 'react';
import ReactDOM from 'react-dom/client';
import { ApolloClient, InMemoryCache, ApolloProvider, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import App from './App';
import './index.css';

// Creează link-ul HTTP pentru Apollo Client
const httpLink = createHttpLink({
  uri: 'http://192.168.1.228:4000/graphql',
});

// Adaugă token-ul de autentificare la fiecare request
const authLink = setContext((_, { headers }) => {
  // Obține token-ul din localStorage
  const token = localStorage.getItem('token');
  
  // Returnează header-ul cu token dacă există
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    }
  };
});

// Configurează Apollo Client
const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      addTypename: false,  // Nu adăuga __typename în rezultate
    },
    query: {
      addTypename: false,  // Nu adăuga __typename în rezultate
    },
    mutate: {
      addTypename: false,  // Nu adăuga __typename în rezultate
    },
  }
});

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  </React.StrictMode>
);