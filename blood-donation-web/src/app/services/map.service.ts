import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';

export interface Location {
  address: string;
  latitude: number;
  longitude: number;
  city?: string;
  state?: string;
  zipCode?: string;
}

@Injectable({
  providedIn: 'root'
})
export class MapService {
  private apiKey = 'YOUR_GOOGLE_MAPS_API_KEY'; // Empty or placeholder - app works without API key
  private geocoder: any = null;
  private mapsLoaded: boolean = false;

  constructor() {
    // Check if Google Maps is already loaded
    if (typeof (window as any).google !== 'undefined' && (window as any).google.maps) {
      this.mapsLoaded = true;
      this.geocoder = new (window as any).google.maps.Geocoder();
    }
  }

  initGoogleMaps(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.mapsLoaded && typeof (window as any).google !== 'undefined' && (window as any).google.maps) {
        this.geocoder = new (window as any).google.maps.Geocoder();
        resolve();
        return;
      }

      // If no API key, just resolve (maps won't work but app won't crash)
      if (!this.apiKey || this.apiKey === 'YOUR_GOOGLE_MAPS_API_KEY') {
        console.warn('Google Maps API key not configured. Map features will be limited.');
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${this.apiKey}&libraries=places,geometry`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        this.mapsLoaded = true;
        this.geocoder = new (window as any).google.maps.Geocoder();
        resolve();
      };
      script.onerror = () => {
        console.warn('Failed to load Google Maps. Continuing without map features.');
        resolve(); // Resolve anyway so app doesn't crash
      };
      document.head.appendChild(script);
    });
  }

  geocodeAddress(address: string): Observable<Location> {
    return new Observable(observer => {
      // If Google Maps is not available, create a mock location
      if (!this.apiKey || this.apiKey === 'YOUR_GOOGLE_MAPS_API_KEY' || !this.mapsLoaded) {
        // Mock geocoding - use demo coordinates
        const mockLocation: Location = {
          address: address,
          latitude: 40.7128 + (Math.random() - 0.5) * 0.1, // Random coordinates around NYC
          longitude: -74.0060 + (Math.random() - 0.5) * 0.1,
          city: address.split(',')[1]?.trim() || '',
          state: address.split(',')[2]?.trim() || ''
        };
        observer.next(mockLocation);
        observer.complete();
        return;
      }

      if (!this.geocoder) {
        this.initGoogleMaps().then(() => {
          this.geocodeAddress(address).subscribe(observer);
        });
        return;
      }

      this.geocoder.geocode({ address }, (results: any, status: string) => {
        if (status === 'OK' && results && results[0]) {
          const location = results[0].geometry.location;
          const locationData: Location = {
            address: results[0].formatted_address,
            latitude: location.lat(),
            longitude: location.lng(),
          };

          // Extract city, state, zip
          results[0].address_components.forEach((component: any) => {
            if (component.types.includes('locality')) {
              locationData.city = component.long_name;
            }
            if (component.types.includes('administrative_area_level_1')) {
              locationData.state = component.long_name;
            }
            if (component.types.includes('postal_code')) {
              locationData.zipCode = component.long_name;
            }
          });

          observer.next(locationData);
          observer.complete();
        } else {
          // Fallback to mock location if geocoding fails
          const mockLocation: Location = {
            address: address,
            latitude: 40.7128,
            longitude: -74.0060,
            city: address.split(',')[1]?.trim() || '',
            state: address.split(',')[2]?.trim() || ''
          };
          observer.next(mockLocation);
          observer.complete();
        }
      });
    });
  }

  getCurrentLocation(): Observable<Location> {
    return new Observable(observer => {
      if (!navigator.geolocation) {
        observer.error(new Error('Geolocation is not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          this.reverseGeocode(lat, lng).subscribe({
            next: (location) => observer.next(location),
            error: () => {
              // Fallback to coordinates if reverse geocoding fails
              const location: Location = {
                address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
                latitude: lat,
                longitude: lng,
                city: 'Current Location',
                state: ''
              };
              observer.next(location);
              observer.complete();
            }
          });
        },
        (error) => observer.error(error)
      );
    });
  }

  reverseGeocode(lat: number, lng: number): Observable<Location> {
    return new Observable(observer => {
      // If Google Maps is not available, create a mock location
      if (!this.apiKey || this.apiKey === 'YOUR_GOOGLE_MAPS_API_KEY' || !this.mapsLoaded) {
        const mockLocation: Location = {
          address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
          latitude: lat,
          longitude: lng,
          city: 'Unknown',
          state: 'Unknown'
        };
        observer.next(mockLocation);
        observer.complete();
        return;
      }

      if (!this.geocoder) {
        observer.error(new Error('Geocoder not initialized'));
        return;
      }

      this.geocoder.geocode({ location: { lat, lng } }, (results: any, status: string) => {
        if (status === 'OK' && results && results[0]) {
          const locationData: Location = {
            address: results[0].formatted_address,
            latitude: lat,
            longitude: lng,
          };

          results[0].address_components.forEach((component: any) => {
            if (component.types.includes('locality')) {
              locationData.city = component.long_name;
            }
            if (component.types.includes('administrative_area_level_1')) {
              locationData.state = component.long_name;
            }
            if (component.types.includes('postal_code')) {
              locationData.zipCode = component.long_name;
            }
          });

          observer.next(locationData);
          observer.complete();
        } else {
          // Fallback to coordinates as address
          const mockLocation: Location = {
            address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
            latitude: lat,
            longitude: lng,
            city: 'Unknown',
            state: 'Unknown'
          };
          observer.next(mockLocation);
          observer.complete();
        }
      });
    });
  }

  calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Radius of the earth in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}

