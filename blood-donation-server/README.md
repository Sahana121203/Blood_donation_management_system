# Blood Donation System - Backend API

Node.js/Express/MongoDB backend for the Blood Donation Management System.

## Features

- **Authentication**: JWT-based authentication for users and admins
- **Donor Management**: CRUD operations for donor profiles
- **Appointments**: Schedule and manage donation appointments
- **Donation History**: Track past donations
- **Donation Requests**: Manage blood donation requests from hospitals
- **Inventory Management**: Track blood inventory by type
- **Location-based Search**: Find donors by location and blood type

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

## Installation

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
   - Copy `.env` file and update the values:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/blood-donation
   JWT_SECRET=your_jwt_secret_key_change_this_in_production
   NODE_ENV=development
   ```

4. Make sure MongoDB is running on your system

## Database Setup

Seed the database with initial data:
```bash
node seed.js
```

This will create:
- Admin user
- Sample donors/users
- Blood inventory
- Sample donation requests
- Sample appointments
- Sample donation history

## Running the Server

Development mode (with auto-reload):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The server will start on `http://localhost:5000`

## Test Credentials

After seeding the database, you can use these credentials:

**Admin:**
- Email: admin@blooddonation.com
- Password: admin123

**User/Donor:**
- Email: john@example.com
- Password: user123

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user/admin
- `GET /api/auth/me` - Get current user (requires auth)

### Donors
- `GET /api/donors` - Get all donors (admin only)
- `GET /api/donors/:id` - Get donor by ID
- `POST /api/donors` - Add new donor (admin only)
- `PUT /api/donors/:id` - Update donor
- `DELETE /api/donors/:id` - Delete donor (admin only)
- `GET /api/donors/search/location` - Search donors by location & blood type

### Appointments
- `GET /api/appointments` - Get user appointments
- `GET /api/appointments/all` - Get all appointments (admin only)
- `POST /api/appointments` - Schedule appointment
- `PUT /api/appointments/:id` - Update appointment status
- `DELETE /api/appointments/:id` - Cancel appointment

### Donation History
- `GET /api/donations` - Get user donation history
- `GET /api/donations/all` - Get all donations (admin only)
- `POST /api/donations` - Add donation record (admin only)

### Donation Requests
- `GET /api/requests` - Get all donation requests (admin only)
- `POST /api/requests` - Create donation request
- `PUT /api/requests/:id` - Update request status
- `DELETE /api/requests/:id` - Delete request

### Inventory
- `GET /api/inventory` - Get blood inventory
- `PUT /api/inventory/:bloodType` - Update inventory units (admin only)
- `POST /api/inventory/initialize` - Initialize inventory (admin only)

## Project Structure

```
backend/
├── config/
│   └── db.js              # Database configuration
├── middleware/
│   └── auth.js            # Authentication middleware
├── models/
│   ├── User.js            # User/Donor model
│   ├── Appointment.js     # Appointment model
│   ├── DonationHistory.js # Donation history model
│   ├── DonationRequest.js # Donation request model
│   └── Inventory.js       # Blood inventory model
├── routes/
│   ├── auth.js            # Authentication routes
│   ├── donors.js          # Donor routes
│   ├── appointments.js    # Appointment routes
│   ├── donations.js       # Donation history routes
│   ├── requests.js        # Donation request routes
│   └── inventory.js       # Inventory routes
├── .env                   # Environment variables
├── server.js              # Main server file
├── seed.js                # Database seeding script
└── package.json           # Dependencies
```

## Technologies Used

- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment variable management

## Security

- Passwords are hashed using bcryptjs
- JWT tokens for authentication
- Protected routes with middleware
- Role-based access control (admin/user)

## Error Handling

The API returns appropriate HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Server Error

## Notes

- Make sure MongoDB is running before starting the server
- Update the JWT_SECRET in production
- The seed script will clear existing data before seeding
- All protected routes require a valid JWT token in the Authorization header
