
const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { 
  getAllSeats, 
  bookSeats, 
  cancelBooking, 
  getUserBookings 
} = require('../controllers/reservationController');

// Seat and booking routes - all protected by authentication
router.get('/seats', authenticate, getAllSeats);
router.post('/book', authenticate, bookSeats);
router.post('/cancel', authenticate, cancelBooking);
router.get('/my-bookings', authenticate, getUserBookings);

module.exports = router;
