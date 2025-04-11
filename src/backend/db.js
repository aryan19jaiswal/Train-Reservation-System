// db.js
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Query helper function
const query = async (text, params) => {
  return pool.query(text, params);
};

// Database initialization function
const initDb = async () => {
  try {
    // Test database connection
    await pool.connect();
    console.log('✅ Database connected');

    // Create tables
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(100) NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS seats (
        id SERIAL PRIMARY KEY,
        seat_number INTEGER NOT NULL UNIQUE,
        row_number INTEGER NOT NULL,
        is_available BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS bookings (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        seat_id INTEGER REFERENCES seats(id) ON DELETE CASCADE,
        booking_time TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(seat_id)
      );
    `);

    // Initialize seats if empty
    const seatCount = await query('SELECT COUNT(*) FROM seats');
    if (parseInt(seatCount.rows[0].count) === 0) {
      for (let row = 1; row <= 12; row++) {
        const seatsInRow = row === 12 ? 3 : 7;
        for (let seat = 1; seat <= seatsInRow; seat++) {
          const seatNumber = (row - 1) * 7 + seat;
          await query(
            'INSERT INTO seats (seat_number, row_number, is_available) VALUES ($1, $2, $3)',
            [seatNumber, row, true]
          );
        }
      }
      console.log('🪑 Seats initialized');
    }

    console.log('✅ Database initialized');
  } catch (err) {
    console.error('❌ Database error:', err.message);
    throw err;
  }
};

module.exports = {
  query,
  initDb,
  pool // added this for direct access in reservationController
};
