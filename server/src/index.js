const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Importare schema și resolvers GraphQL
const typeDefs = require('./schemas');
const resolvers = require('./resolvers');

// Importare middleware de autentificare
const authMiddleware = require('./middleware/auth');

// Configurare variabile de mediu - specifică calea către .env în directorul principal
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Verifică și afișează URL-ul MongoDB pentru debugging
const mongoURI = process.env.MONGODB_URI;
console.log('MongoDB URI:', mongoURI);

// Dacă MongoDB URI nu este disponibil, setează-l direct (ca soluție temporară)
if (!mongoURI) {
  console.warn('MONGODB_URI nu a fost găsit în variabilele de mediu. Se folosește valoarea hardcodată.');
  process.env.MONGODB_URI = 'mongodb+srv://gugiutudor:huC2a9ZV0OF5pH3k@mental-health-app.4lau2n6.mongodb.net/?retryWrites=true&w=majority&appName=mental-health-app';
}

// Inițializare aplicație Express
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(authMiddleware);

// Conectare la MongoDB cu gestionarea erorilor și opțiuni îmbunătățite
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Conexiune reușită la MongoDB'))
  .catch(err => console.error('Eroare la conectarea cu MongoDB:', err));

// Adaugă handler pentru închiderea corectă a conexiunii
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('Conexiune MongoDB închisă prin întreruperea aplicației');
  process.exit(0);
});

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