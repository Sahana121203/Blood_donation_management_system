# Blood Donation & Emergency Donor Management System

A comprehensive MEAN stack application for managing blood donations, donor registration, appointment scheduling, and emergency donor search with location-based features.

## 🩸 Features

### User Features
- **Donor Registration & Profile Management**
- **Appointment Scheduling** for blood donations
- **Donation History** tracking
- **Location-based Donor Search** with Google Maps integration
- **Emergency Mode** for urgent blood requests
- **Real-time Notifications**

### Admin Features
- **Donor Management** (CRUD operations)
- **Donation Request Management**
- **Blood Inventory Tracking**
- **Appointment Management**
- **Analytics Dashboard**

## 🛠️ Tech Stack

### Frontend
- **Angular** (Latest version)
- **TypeScript**
- **RxJS** for reactive programming
- **Google Maps API** for location features
- **Custom CSS** for styling

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **bcryptjs** for password hashing

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn
- Google Maps API key (optional, for map features)

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <repository-url>
cd dt
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Configure environment variables
# Update .env file with your MongoDB URI and JWT secret

# Seed the database with initial data
npm run seed

# Start the backend server
npm run dev
```

The backend will run on `http://localhost:5000`

### 3. Frontend Setup

```bash
# Navigate to project root (if in backend directory)
cd ..

# Install dependencies
npm install

# Start the Angular development server
npm start
```

The frontend will run on `http://localhost:4200`

## 🔐 Test Credentials

After seeding the database, use these credentials:

**Admin Account:**
- Email: `admin@blooddonation.com`
- Password: `admin123`

**User/Donor Account:**
- Email: `john@example.com`
- Password: `user123`

## 📁 Project Structure

```
dt/
├── backend/                 # Node.js/Express backend
│   ├── config/             # Database configuration
│   ├── middleware/         # Authentication middleware
│   ├── models/             # Mongoose models
│   ├── routes/             # API routes
│   ├── .env                # Environment variables
│   ├── server.js           # Main server file
│   ├── seed.js             # Database seeding script
│   └── README.md           # Backend documentation
│
├── src/                    # Angular frontend
│   ├── app/
│   │   ├── components/     # Angular components
│   │   │   ├── home/       # Home page
│   │   │   ├── login/      # Login page
│   │   │   ├── user/       # User dashboard
│   │   │   └── admin/      # Admin dashboard
│   │   ├── services/       # Angular services
│   │   │   ├── api.service.ts      # Backend API service
│   │   │   ├── auth.service.ts     # Authentication service
│   │   │   └── map.service.ts      # Google Maps service
│   │   ├── guards/         # Route guards
│   │   └── app.routes.ts   # Application routes
│   └── environments/       # Environment configurations
│
├── package.json            # Frontend dependencies
└── README.md               # This file
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Donors
- `GET /api/donors` - Get all donors (admin)
- `POST /api/donors` - Add donor (admin)
- `PUT /api/donors/:id` - Update donor
- `DELETE /api/donors/:id` - Delete donor (admin)
- `GET /api/donors/search/location` - Search by location

### Appointments
- `GET /api/appointments` - Get user appointments
- `POST /api/appointments` - Schedule appointment
- `DELETE /api/appointments/:id` - Cancel appointment

### Donation History
- `GET /api/donations` - Get donation history
- `POST /api/donations` - Add donation (admin)

### Requests
- `GET /api/requests` - Get donation requests (admin)
- `POST /api/requests` - Create request
- `PUT /api/requests/:id` - Update request status

### Inventory
- `GET /api/inventory` - Get blood inventory
- `PUT /api/inventory/:bloodType` - Update inventory

## 🗺️ Google Maps Setup (Optional)

To enable map features:

1. Get a Google Maps API key from [Google Cloud Console](https://console.cloud.google.com/)
2. Enable the following APIs:
   - Maps JavaScript API
   - Places API
   - Geocoding API
3. Update the API key in `src/index.html`

See `GOOGLE_MAPS_SETUP.md` for detailed instructions.

## 🔧 Configuration

### Backend (.env)
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/blood-donation
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
```

### Frontend (src/environments/environment.ts)
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:5000/api'
};
```

## 📝 Available Scripts

### Frontend
- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests

### Backend
- `npm start` - Start production server
- `npm run dev` - Start development server with auto-reload
- `npm run seed` - Seed database with initial data

## 🌟 Key Features Explained

### Location-Based Donor Search
- Uses Google Maps API for geocoding and mapping
- Calculates distance between donors and search location
- Filters donors by blood type and radius
- Displays results on an interactive map

### Authentication & Authorization
- JWT-based authentication
- Role-based access control (User/Admin)
- Protected routes with guards
- Secure password hashing

### Real-time Data Management
- RESTful API architecture
- Reactive programming with RxJS
- Optimistic UI updates
- Error handling and loading states

## 🐛 Troubleshooting

### Backend won't start
- Ensure MongoDB is running
- Check if port 5000 is available
- Verify .env configuration

### Frontend won't connect to backend
- Ensure backend is running on port 5000
- Check CORS configuration
- Verify API URL in environment.ts

### Map features not working
- Check Google Maps API key
- Ensure required APIs are enabled
- Check browser console for errors

## 📄 License

This project is for educational purposes.

## 👥 Support

For issues and questions, please check the documentation in:
- `backend/README.md` - Backend API documentation
- `GOOGLE_MAPS_SETUP.md` - Google Maps setup guide
- `HOW_TO_RUN.md` - Detailed running instructions

## 🎯 Future Enhancements

- Email notifications for appointments
- SMS alerts for emergency requests
- Mobile app version
- Advanced analytics dashboard
- Multi-language support
- Blood donation camps management
