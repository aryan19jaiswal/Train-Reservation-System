const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { query } = require('../db');
const { JWT_SECRET, JWT_EXPIRY, SALT_ROUNDS } = require('../config');
const { validateSignup, validateLogin } = require('../utils/validation');

// User signup controller
const signup = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // Validate input data
    const validationError = validateSignup(req.body);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }
    
    // Check if user already exists
    const existingUser = await query(
      'SELECT * FROM users WHERE username = $1 OR email = $2',
      [username, email]
    );
    
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Username or email already exists' });
    }
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    
    // Insert new user into database
    const result = await query(
      'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email',
      [username, email, hashedPassword]
    );
    
    return res.status(201).json({
      message: 'User registered successfully',
      user: result.rows[0]
    });
    
  } catch (error) {
    console.error('Signup error:', error);
    return res.status(500).json({ error: 'Server error during signup' });
  }
};

// User login controller
const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Validate input data
    const validationError = validateLogin(req.body);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }
    
    // Find user in database
    const result = await query(
      'SELECT * FROM users WHERE username = $1',
      [username]
    );
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }
    
    const user = result.rows[0];
    
    // Compare passwords
    const passwordMatch = await bcrypt.compare(password, user.password);
    
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRY }
    );
    
    return res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    });
    
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Server error during login' });
  }
};

module.exports = {
  signup,
  login
};
