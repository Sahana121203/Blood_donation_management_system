# Setup and Running Instructions

This guide provides step-by-step instructions to set up and run the Blood Donation Management System.

## Prerequisites Installation

### 1. Install Node.js
- Download from [nodejs.org](https://nodejs.org/)
- Recommended version: v14 or higher
- Verify installation:
  ```bash
  node --version
  npm --version
  ```

### 2. Install MongoDB
- Download from [mongodb.com](https://www.mongodb.com/try/download/community)
- Follow installation instructions for your OS
- Start MongoDB service:
  - **Windows**: MongoDB should start automatically as a service
  - **Mac**: `brew services start mongodb-community`
  - **Linux**: `sudo systemctl start mongod`

### 3. Verify MongoDB is Running
```bash
# Connect to MongoDB shell
mongosh
# or
mongo
```

## Project Setup

### Step 1: Install Backend Dependencies

```bash
# Navigate to backend directory
cd backend

# Install all dependencies
npm install
```

### Step 2: Configure Backend Environment

1. The `.env` file is already created in the backend directory
2. Update if needed:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/blood-donation
   JWT_SECRET=your_jwt_secret_key_change_this_in_production
   NODE_ENV=development
   ```

### Step 3: Seed the Database

```bash
# Still in backend directory
npm run seed
```

This will create:
- Admin user (admin@blooddonation.com / admin123)
- Sample donors (john@example.com / user123)
- Blood inventory
- Sample appointments and requests

### Step 4: Start the Backend Server

```bash
# Development mode with auto-reload
npm run dev

# OR production mode
npm start
```

You should see:
```
MongoDB connected successfully
Server is running on port 5000
```

### Step 5: Install Frontend Dependencies

```bash
# Open a new terminal
# Navigate to project root
cd ..

# Install Angular dependencies
npm install
```

### Step 6: Start the Frontend

```bash
npm start
```

The application will open at `http://localhost:4200`

## Testing the Application

### 1. Login as Admin
- Navigate to `http://localhost:4200`
- Click "Login"
- Select role: "Admin"
- Email: `admin@blooddonation.com`
- Password: `admin123`

### 2. Login as User/Donor
- Select role: "User"
- Email: `john@example.com`
- Password: `user123`

## Common Issues and Solutions

### Issue: MongoDB Connection Error
**Solution:**
- Ensure MongoDB service is running
- Check if MongoDB is listening on port 27017
- Verify MONGODB_URI in .env file

### Issue: Port 5000 Already in Use
**Solution:**
- Change PORT in backend/.env to another port (e.g., 5001)
- Update apiUrl in src/environments/environment.ts accordingly

### Issue: Backend API Not Responding
**Solution:**
- Check if backend server is running
- Verify no firewall is blocking port 5000
- Check backend terminal for error messages

### Issue: Frontend Can't Connect to Backend
**Solution:**
- Ensure backend is running on port 5000
- Check src/environments/environment.ts has correct apiUrl
- Clear browser cache and reload

### Issue: Google Maps Not Working
**Solution:**
- This is optional - the app works without it
- See GOOGLE_MAPS_SETUP.md for configuration
- Map features will show a placeholder if not configured

## Development Workflow

### Running Both Servers Simultaneously

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
npm start
```

### Making Changes

**Backend Changes:**
- Edit files in `backend/` directory
- Server auto-reloads with nodemon
- Check terminal for errors

**Frontend Changes:**
- Edit files in `src/` directory
- Angular auto-reloads in browser
- Check browser console for errors

## Stopping the Servers

- Press `Ctrl + C` in each terminal to stop the servers
- MongoDB service can keep running in the background

## Resetting the Database

To start fresh:

```bash
cd backend
npm run seed
```

This will clear all data and re-seed with initial data.

## Production Deployment

### Backend
```bash
cd backend
npm start
```

### Frontend
```bash
npm run build
# Deploy the dist/ folder to your web server
```

## Additional Resources

- Backend API Documentation: `backend/README.md`
- Google Maps Setup: `GOOGLE_MAPS_SETUP.md`
- Main README: `README.md`

## Support

If you encounter any issues:
1. Check the error messages in terminal/console
2. Verify all prerequisites are installed
3. Ensure MongoDB is running
4. Check that both servers are running
5. Review the configuration files

## Quick Reference

**Backend URL:** `http://localhost:5000`
**Frontend URL:** `http://localhost:4200`
**MongoDB URL:** `mongodb://localhost:27017`

**Admin Credentials:**
- Email: admin@blooddonation.com
- Password: admin123

**User Credentials:**
- Email: john@example.com
- Password: user123
