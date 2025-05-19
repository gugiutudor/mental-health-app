// Testare middleware auth
const jwt = require('jsonwebtoken');
const authMiddleware = require('../../src/middleware/auth');

// Mock pentru jwt
jest.mock('jsonwebtoken');

describe('Auth Middleware', () => {
  let req;
  let res;
  let next;
  
  beforeEach(() => {
    // Reset mocks
    jwt.verify.mockReset();
    
    // Setup mock pentru request, response și next
    req = {
      headers: {}
    };
    res = {};
    next = jest.fn();
  });
  
  it('should set req.user to null when no authorization header', async () => {
    // Execute
    await authMiddleware(req, res, next);
    
    // Verify
    expect(req.user).toBeUndefined();
    expect(next).toHaveBeenCalled();
  });
  
  it('should set req.user to null when authorization header does not have Bearer prefix', async () => {
    // Setup
    req.headers.authorization = 'Basic sometoken';
    
    // Execute
    await authMiddleware(req, res, next);
    
    // Verify
    expect(req.user).toBeUndefined();
    expect(next).toHaveBeenCalled();
  });
  
  it('should set req.user to decoded token when valid token', async () => {
    // Setup
    const mockUser = { id: '123', email: 'test@example.com' };
    jwt.verify.mockReturnValue(mockUser);
    req.headers.authorization = 'Bearer validtoken';
    
    // Execute
    await authMiddleware(req, res, next);
    
    // Verify
    expect(req.user).toEqual(mockUser);
    expect(jwt.verify).toHaveBeenCalledWith('validtoken', process.env.JWT_SECRET);
    expect(next).toHaveBeenCalled();
  });
  
  it('should set req.user to null when token is invalid', async () => {
    // Setup
    jwt.verify.mockImplementation(() => {
      throw new Error('Invalid token');
    });
    req.headers.authorization = 'Bearer invalidtoken';
    
    // Execute
    await authMiddleware(req, res, next);
    
    // Verify
    expect(req.user).toBeNull();
    expect(jwt.verify).toHaveBeenCalledWith('invalidtoken', process.env.JWT_SECRET);
    expect(next).toHaveBeenCalled();
  });
});