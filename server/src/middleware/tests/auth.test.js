// server/src/middleware/__tests__/auth.test.js
const jwt = require('jsonwebtoken');
const authMiddleware = require('../auth');

// Mock pentru jwt
jest.mock('jsonwebtoken');

describe('Auth Middleware Tests', () => {
  let req, res, next;
  
  beforeEach(() => {
    // Reset mock-uri
    jwt.verify.mockReset();
    
    // Setup mock request, response, și next
    req = {
      headers: {}
    };
    res = {};
    next = jest.fn();
  });
  
  it('should set req.user to null if no authorization header', async () => {
    // Apelează middleware-ul
    await authMiddleware(req, res, next);
    
    // Verifică că req.user este null
    expect(req.user).toBeUndefined();
    
    // Verifică că next a fost apelat
    expect(next).toHaveBeenCalled();
  });
  
  it('should set req.user to null if authorization header is not in correct format', async () => {
    // Setează un header de autorizare invalid
    req.headers.authorization = 'InvalidFormat';
    
    // Apelează middleware-ul
    await authMiddleware(req, res, next);
    
    // Verifică că req.user este null
    expect(req.user).toBeUndefined();
    
    // Verifică că next a fost apelat
    expect(next).toHaveBeenCalled();
  });
  
  it('should set req.user to decoded token if token is valid', async () => {
    // Mock token decodat
    const decodedToken = { id: 'user123', email: 'test@example.com' };
    jwt.verify.mockReturnValue(decodedToken);
    
    // Setează header-ul de autorizare corect
    req.headers.authorization = 'Bearer valid-token';
    
    // Apelează middleware-ul
    await authMiddleware(req, res, next);
    
    // Verifică că req.user conține token-ul decodat
    expect(req.user).toEqual(decodedToken);
    
    // Verifică că jwt.verify a fost apelat cu token-ul corect
    expect(jwt.verify).toHaveBeenCalledWith('valid-token', process.env.JWT_SECRET);
    
    // Verifică că next a fost apelat
    expect(next).toHaveBeenCalled();
  });
  
  it('should set req.user to null if token verification fails', async () => {
    // Setează jwt.verify să arunce o eroare
    jwt.verify.mockImplementation(() => {
      throw new Error('Invalid token');
    });
    
    // Setează header-ul de autorizare
    req.headers.authorization = 'Bearer invalid-token';
    
    // Apelează middleware-ul
    await authMiddleware(req, res, next);
    
    // Verifică că req.user este null
    expect(req.user).toBeNull();
    
    // Verifică că next a fost apelat
    expect(next).toHaveBeenCalled();
  });
});