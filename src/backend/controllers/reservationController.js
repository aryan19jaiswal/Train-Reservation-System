// reservationController.js
const { query, pool } = require('../db');
const { validateBooking, validateCancellation } = require('../utils/validation');

// Get all seats with their availability status
const getAllSeats = async (req, res) => {
  try {
    const result = await query(`
      SELECT s.id, s.seat_number, s.row_number, s.is_available, 
             CASE WHEN b.user_id = $1 THEN TRUE ELSE FALSE END as booked_by_me
      FROM seats s
      LEFT JOIN bookings b ON s.id = b.seat_id
      ORDER BY s.row_number, s.seat_number
    `, [req.user.id]);
    
    return res.status(200).json({
      seats: result.rows
    });
  } catch (error) {
    console.error('Error fetching seats:', error);
    return res.status(500).json({ error: 'Failed to fetch seats' });
  }
};

// Book seats with priority for same-row allocation
const bookSeats = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { numSeats } = req.body;
    const userId = req.user.id;
    
    const validationError = validateBooking(req.body);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }
    
    await client.query('BEGIN');
    await client.query('LOCK TABLE seats IN EXCLUSIVE MODE');
    
    const availableSeatsResult = await client.query(
      'SELECT COUNT(*) FROM seats WHERE is_available = TRUE'
    );
    const availableSeatsCount = parseInt(availableSeatsResult.rows[0].count);
    
    if (availableSeatsCount < numSeats) {
      await client.query('ROLLBACK');
      return res.status(400).json({ 
        error: 'Not enough seats available',
        availableSeats: availableSeatsCount
      });
    }
    
    let allocatedSeats = [];
    const rowsResult = await client.query(`
      SELECT row_number, COUNT(*) as available_count
      FROM seats
      WHERE is_available = TRUE
      GROUP BY row_number
      HAVING COUNT(*) >= $1
      ORDER BY COUNT(*) DESC
    `, [numSeats]);
    
    if (rowsResult.rows.length > 0) {
      const targetRow = rowsResult.rows[0].row_number;
      const seatsInRowResult = await client.query(`
        SELECT id, seat_number, row_number
        FROM seats
        WHERE row_number = $1 AND is_available = TRUE
        ORDER BY seat_number
        LIMIT $2
      `, [targetRow, numSeats]);
      
      allocatedSeats = seatsInRowResult.rows;
    } else {
      const availableSeatsResult = await client.query(`
        SELECT id, seat_number, row_number
        FROM seats
        WHERE is_available = TRUE
        ORDER BY row_number, seat_number
        LIMIT $1
      `, [numSeats]);
      
      allocatedSeats = availableSeatsResult.rows;
    }
    
    for (const seat of allocatedSeats) {
      await client.query(`
        UPDATE seats 
        SET is_available = FALSE
        WHERE id = $1
      `, [seat.id]);
      
      await client.query(`
        INSERT INTO bookings (user_id, seat_id)
        VALUES ($1, $2)
      `, [userId, seat.id]);
    }
    
    await client.query('COMMIT');
    
    return res.status(200).json({
      message: 'Seats booked successfully',
      bookedSeats: allocatedSeats
    });
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error booking seats:', error);
    return res.status(500).json({ error: 'Failed to book seats' });
  } finally {
    client.release();
  }
};

// Cancel bookings for specific seats
const cancelBooking = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { seatIds } = req.body;
    const userId = req.user.id;
    
    const validationError = validateCancellation(req.body);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }
    
    await client.query('BEGIN');
    
    const verificationResult = await client.query(`
      SELECT seat_id FROM bookings
      WHERE seat_id = ANY($1::int[]) AND user_id = $2
    `, [seatIds, userId]);
    
    if (verificationResult.rows.length !== seatIds.length) {
      await client.query('ROLLBACK');
      return res.status(403).json({ 
        error: 'Some seats are not booked by you or do not exist'
      });
    }
    
    await client.query(`
      UPDATE seats
      SET is_available = TRUE
      WHERE id = ANY($1::int[])
    `, [seatIds]);
    
    await client.query(`
      DELETE FROM bookings
      WHERE seat_id = ANY($1::int[]) AND user_id = $2
    `, [seatIds, userId]);
    
    await client.query('COMMIT');
    
    return res.status(200).json({
      message: 'Bookings cancelled successfully',
      cancelledSeats: seatIds
    });
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error cancelling bookings:', error);
    return res.status(500).json({ error: 'Failed to cancel bookings' });
  } finally {
    client.release();
  }
};

// Get all bookings for the current user
const getUserBookings = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const result = await query(`
      SELECT b.id as booking_id, s.id as seat_id, s.seat_number, s.row_number, b.booking_time
      FROM bookings b
      JOIN seats s ON b.seat_id = s.id
      WHERE b.user_id = $1
      ORDER BY b.booking_time DESC
    `, [userId]);
    
    return res.status(200).json({
      bookings: result.rows
    });
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    return res.status(500).json({ error: 'Failed to fetch bookings' });
  }
};

module.exports = {
  getAllSeats,
  bookSeats,
  cancelBooking,
  getUserBookings
};
