
# Train Seat Reservation System API

A backend API for managing train seat reservations with intelligent seat allocation algorithms.

## Features

- **User Authentication**
  - Signup and login with JWT token generation
  - Password hashing for security
  - Protected routes with authentication middleware

- **Train Seat Reservation System**
  - 80 seats: 11 rows of 7 seats and 1 row of 3 seats
  - Booking up to 7 seats per request
  - Priority seating algorithm (same row when possible)
  - Seat cancellation feature
  - Concurrency handling to prevent double bookings

- **PostgreSQL Database**
  - Users, seats, and bookings tables
  - Proper constraints and relationships
  - Transactions for data integrity

## API Endpoints

### Authentication

- `POST /api/auth/signup` - Register a new user
  ```
  {
    "username": "user1",
    "email": "user1@example.com",
    "password": "password123"
  }
  ```

- `POST /api/auth/login` - Login and get JWT token
  ```
  {
    "username": "user1",
    "password": "password123"
  }
  ```

### Reservation (Protected Routes)

- `GET /api/reservation/seats` - Get all seats with availability status

- `POST /api/reservation/book` - Book seats
  ```
  {
    "numSeats": 3
  }
  ```

- `POST /api/reservation/cancel` - Cancel bookings
  ```
  {
    "seatIds": [1, 2, 3]
  }
  ```

- `GET /api/reservation/my-bookings` - Get all bookings for current user

## Setup Instructions

1. Install dependencies
   ```
   npm install
   ```

2. Configure PostgreSQL
   - Create a database named `train_reservation`
   - Update database connection details in `config.js` if needed

3. Run the application
   ```
   npm run dev
   ```

## Technical Details

- **Database Design**
  - `users` table: id, username, email, password, created_at
  - `seats` table: id, seat_number, row_number, is_available
  - `bookings` table: id, user_id, seat_id, booking_time

- **Concurrency Control**
  - Database locking to prevent race conditions
  - Transactions to ensure data consistency

## Security Measures

- Password hashing with bcrypt
- JWT for secure authentication
- Input validation and sanitization
- Proper error handling and status codes
