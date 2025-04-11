const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config');

// Middleware to verify JWT token
const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const token = authHeader.split(' ')[1]; // Extract token from "Bearer TOKEN"
    
    if (!token) {
      return res.status(401).json({ error: 'Authentication token missing' });
    }
    
    // Verify the token
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = {
      id: decoded.userId,
      username: decoded.username
    };
    
    next();
  } catch (error) {
    console.error('Authentication error:', error.message);
    return res.status(401).json({ error: 'Invalid authentication token' });
  }
};

module.exports = { authenticate };
