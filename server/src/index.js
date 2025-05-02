const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Importare schema și resolvers GraphQL
const typeDefs = require('./schemas');
const resolvers = require('./resolvers');

// Importare middleware de autentificare
const authMiddleware = require('./middleware/auth');

// Configurare variabile de mediu
dotenv.config();

// Inițializare aplicație Express
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(authMiddleware);

// Conectare la MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Conexiune reușită la MongoDB'))
  .catch(err => console.error('Eroare la conectarea cu MongoDB:', err));

// Configurare Apollo Server
async function startApolloServer() {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => {
      return { req };
    },
  });

  await server.start();
  server.applyMiddleware({ app });

  // Definire rută pentru verificarea stării serverului
  app.get('/health', (req, res) => {
    res.status(200).send('Server funcțional');
  });

  // Definire PORT
  const PORT = process.env.PORT || 4000;

  // Pornire server
  app.listen(PORT, () => {
    console.log(`Server pornit la http://localhost:${PORT}`);
    console.log(`GraphQL disponibil la http://localhost:${PORT}${server.graphqlPath}`);
  });
}

startApolloServer();