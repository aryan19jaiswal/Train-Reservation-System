
// Validation functions for various API endpoints

// Validate signup data
const validateSignup = (data) => {
  const { username, email, password } = data;
  
  if (!username || !email || !password) {
    return 'Username, email and password are required';
  }
  
  if (username.length < 3 || username.length > 50) {
    return 'Username must be between 3 and 50 characters';
  }
  
  if (!isValidEmail(email)) {
    return 'Invalid email format';
  }
  
  if (password.length < 6) {
    return 'Password must be at least 6 characters long';
  }
  
  return null;
};

// Validate login data
const validateLogin = (data) => {
  const { username, password } = data;
  
  if (!username || !password) {
    return 'Username and password are required';
  }
  
  return null;
};

// Validate booking data
const validateBooking = (data) => {
  const { numSeats } = data;
  
  if (!numSeats || typeof numSeats !== 'number') {
    return 'Number of seats must be provided as a number';
  }
  
  if (numSeats < 1 || numSeats > 7) {
    return 'You can book between 1 and 7 seats per request';
  }
  
  return null;
};

// Validate cancellation data
const validateCancellation = (data) => {
  const { seatIds } = data;
  
  if (!Array.isArray(seatIds) || seatIds.length === 0) {
    return 'Seat IDs must be provided as a non-empty array';
  }
  
  if (seatIds.some(id => typeof id !== 'number')) {
    return 'All seat IDs must be numbers';
  }
  
  return null;
};

// Helper to validate email format
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

module.exports = {
  validateSignup,
  validateLogin,
  validateBooking,
  validateCancellation
};
