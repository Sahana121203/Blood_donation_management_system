# Google Maps API Setup Guide

## Step 1: Get a Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable billing (Google Maps requires a billing account, but offers free credits)

## Step 2: Enable Required APIs

Enable the following APIs in your Google Cloud project:

1. **Maps JavaScript API** - For displaying maps
2. **Geocoding API** - For converting addresses to coordinates
3. **Places API** - For location autocomplete (optional but recommended)

To enable:
- Go to "APIs & Services" > "Library"
- Search for each API and click "Enable"

## Step 3: Create API Key

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "API Key"
3. Copy your API key

## Step 4: Configure API Key in Project

Replace `YOUR_GOOGLE_MAPS_API_KEY` in the following files:

1. **src/index.html** (line 9):
```html
<script src="https://maps.googleapis.com/maps/api/js?key=YOUR_GOOGLE_MAPS_API_KEY&libraries=places,geometry&loading=async" async defer></script>
```

2. **src/app/services/map.service.ts** (line 17):
```typescript
private apiKey = 'YOUR_GOOGLE_MAPS_API_KEY'; // Replace with your API key
```

## Step 5: Restrict API Key (Recommended for Production)

1. Go to "APIs & Services" > "Credentials"
2. Click on your API key
3. Under "API restrictions", select "Restrict key"
4. Choose the APIs you want to allow (Maps JavaScript API, Geocoding API, Places API)
5. Under "Application restrictions", you can:
   - Restrict by HTTP referrer (for web apps)
   - Restrict by IP address (for server-side usage)

## Pricing

Google Maps Platform offers $200 free credits per month. This typically covers:
- Up to 28,000 map loads
- Up to 40,000 geocoding requests
- Check current pricing at: https://mapsplatform.google.com/pricing/

## Testing

After configuration:
1. Run `npm start`
2. Login as a user
3. Navigate to "Find Donors by Location" tab
4. Try searching for a location
5. The map should display with markers for nearby donors

If you see errors:
- Check browser console for API key errors
- Verify APIs are enabled in Google Cloud Console
- Ensure API key is not restricted incorrectly




