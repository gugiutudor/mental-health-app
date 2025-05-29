const jwt = require('jsonwebtoken');

const authMiddleware = async (req, res, next) => {

  const authHeader = req.headers.authorization;
  
  if (authHeader) {

    const token = authHeader.split(' ')[1];
    
    if (token) {
      try {
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decodedToken;
      } catch (error) {
        req.user = null;
      }
    }
  }
  
  next();
};

module.exports = authMiddleware;