const express = require('express');
const cors = require('cors');
require('dotenv').config(); // Load environment variables

const { initDb } = require('./db');
const authRoutes = require('./routes/authRoutes');
const reservationRoutes = require('./routes/reservationRoutes');

// Get PORT from env or fallback to 5000
const PORT = process.env.PORT || 5000;

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Initialize database
initDb().catch(err => {
  console.error('❌ Failed to initialize database:', err);
  process.exit(1);
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/reservation', reservationRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Train Seat Reservation API running on port ${PORT}`);
});
