const jwt = require('jsonwebtoken');

const authMiddleware = async (req, res, next) => {
  // Obține header-ul de autorizare
  const authHeader = req.headers.authorization;
  
  if (authHeader) {
    // Verifică dacă header-ul are formatul Bearer [token]
    const token = authHeader.split(' ')[1];
    
    if (token) {
      try {
        // Verifică și decodifică token-ul
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decodedToken;
      } catch (error) {
        // Token invalid sau expirat
        req.user = null;
      }
    }
  }
  
  next();
};

module.exports = authMiddleware;