// Import required modules
const express = require('express');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Initialize express app
const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key_change_in_production';

// Middleware
app.use(express.json());

// Hardcoded user credentials for demo purposes
const DEMO_USER = {
  id: 1,
  username: 'admin',
  password: 'password123',
  email: 'admin@example.com'
};

/**
 * JWT Verification Middleware
 * Extracts and verifies the JWT token from the Authorization header
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const verifyToken = (req, res, next) => {
  // Extract token from Authorization header
  const authHeader = req.headers.authorization;
  
  // Check if Authorization header exists
  if (!authHeader) {
    return res.status(401).json({ message: 'No token provided' });
  }
  
  // Extract Bearer token
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  
  if (!token) {
    return res.status(401).json({ message: 'Invalid token format. Use Bearer <token>' });
  }
  
  try {
    // Verify the token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Attach decoded token data to request object
    req.user = decoded;
    
    // Call next middleware
    next();
  } catch (error) {
    // Handle various JWT verification errors
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token has expired' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    return res.status(401).json({ message: 'Token verification failed' });
  }
};

/**
 * Health Check Endpoint
 * GET /
 * Public endpoint to verify server is running
 */
app.get('/', (req, res) => {
  res.json({
    message: 'Express JWT Protected Routes Server',
    version: '1.0.0',
    endpoints: [
      'POST /api/login - Get JWT token',
      'GET /api/profile - Get user profile (protected)',
      'GET /api/user-data - Get protected user data (protected)'
    ]
  });
});

/**
 * Login Endpoint
 * POST /api/login
 * Accepts username and password, returns JWT token if valid
 * 
 * Request body: { username: string, password: string }
 * Response: { message: string, token: string }
 */
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  
  // Validate input
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }
  
  // Check credentials against demo user
  if (username === DEMO_USER.username && password === DEMO_USER.password) {
    // Create JWT token
    const token = jwt.sign(
      {
        id: DEMO_USER.id,
        username: DEMO_USER.username,
        email: DEMO_USER.email
      },
      JWT_SECRET,
      { expiresIn: '1h' } // Token expires in 1 hour
    );
    
    return res.status(200).json({
      message: 'Login successful',
      token: token
    });
  }
  
  // Invalid credentials
  return res.status(401).json({ message: 'Invalid credentials' });
});

/**
 * Protected Route - Get User Profile
 * GET /api/profile
 * Requires valid JWT token in Authorization header
 * Returns user profile information
 */
app.get('/api/profile', verifyToken, (req, res) => {
  res.status(200).json({
    message: 'User profile data',
    user: {
      id: req.user.id,
      username: req.user.username,
      email: req.user.email
    }
  });
});

/**
 * Protected Route - Get User Data
 * GET /api/user-data
 * Requires valid JWT token in Authorization header
 * Returns additional protected user data
 */
app.get('/api/user-data', verifyToken, (req, res) => {
  res.status(200).json({
    message: 'This is protected user data',
    data: {
      userId: req.user.id,
      accessLevel: 'admin',
      lastAccessed: new Date().toISOString()
    }
  });
});

/**
 * Public Route - Info
 * GET /api/info
 * Public endpoint with general information
 */
app.get('/api/info', (req, res) => {
  res.status(200).json({
    message: 'Public information endpoint',
    info: {
      name: 'Express JWT Protected Routes',
      description: 'A demonstration of JWT-based authentication',
      documentation: 'Check README.md for full documentation'
    }
  });
});

/**
 * 404 Error Handler
 * Handles all undefined routes
 */
app.use((req, res) => {
  res.status(404).json({
    message: 'Endpoint not found',
    path: req.path,
    method: req.method
  });
});

/**
 * Global Error Handler
 * Catches all errors thrown by the application
 */
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Express JWT Protected Routes Server`);
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`JWT_SECRET: ${JWT_SECRET === 'your_secret_key_change_in_production' ? 'USING DEFAULT (CHANGE THIS!)' : 'Using environment variable'}`);
  console.log(`${'='.repeat(60)}\n`);
  console.log('Test Login:');
  console.log('  POST http://localhost:3000/api/login');
  console.log('  Body: { "username": "admin", "password": "password123" }');
  console.log('\nTest Protected Route:');
  console.log('  GET http://localhost:3000/api/profile');
  console.log('  Header: Authorization: Bearer <token>');
  console.log(`${'='.repeat(60)}\n`);
});

// Export app for testing purposes
module.exports = app;
