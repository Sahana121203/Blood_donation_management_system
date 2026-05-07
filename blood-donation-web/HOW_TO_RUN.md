# How to Run the Blood Donation Management System

## Prerequisites

1. **Node.js** (version 18 or higher)
   - Download from: https://nodejs.org/
   - Verify installation: `node --version`
   - Verify npm: `npm --version`

2. **npm** (comes with Node.js)

## Installation Steps

### Step 1: Install Dependencies

Open your terminal/command prompt in the project directory and run:

```bash
npm install
```

This will install all required dependencies including Angular CLI and other packages.

### Step 2: Start the Development Server

Run the following command:

```bash
npm start
```

Or alternatively:

```bash
ng serve
```

The application will compile and start a development server.

### Step 3: Access the Application

Once the server starts, you should see output like:

```
** Angular Live Development Server is listening on localhost:4200 **
```

Open your web browser and navigate to:

```
http://localhost:4200
```

## Running Without Google Maps API

The application is configured to run **without** Google Maps API key. Here's what works:

✅ **Fully Functional:**
- Home page
- Login page (Admin/User)
- Admin dashboard
- User dashboard
- Adding donors with location (address will be stored)
- Searching for donors by location (shows list of nearby donors)
- All other features

⚠️ **Limited Functionality:**
- Map visualization won't display (shows a placeholder message)
- Geocoding will use mock coordinates (addresses still work for storage)
- Reverse geocoding will show coordinates instead of formatted addresses

The app will run normally, but the map view will show a message indicating that Google Maps API key needs to be configured.

## Troubleshooting

### Port Already in Use

If port 4200 is already in use, you can specify a different port:

```bash
ng serve --port 4300
```

Then access at: `http://localhost:4300`

### Module Not Found Errors

If you get module errors, try:

```bash
rm -rf node_modules package-lock.json
npm install
```

(On Windows, use `rmdir /s /q node_modules` and `del package-lock.json`)

### Angular CLI Not Found

If `ng` command is not found:

```bash
npm install -g @angular/cli
```

## Available Scripts

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm run watch` - Build and watch for changes
- `npm test` - Run tests (if configured)

## Development Tips

1. The app uses demo/localStorage for authentication - no backend needed for testing
2. Sample donor data is included in the components
3. Changes to files will automatically reload the browser (hot reload)
4. Check browser console for any errors or warnings

## Next Steps (Optional)

To enable full map functionality later:

1. Get a Google Maps API key from Google Cloud Console
2. Follow instructions in `GOOGLE_MAPS_SETUP.md`
3. Uncomment the script tag in `src/index.html`
4. Update the API key in `src/app/services/map.service.ts`

The app works perfectly fine without it for development and testing!




