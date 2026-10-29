import * as Location from 'expo-location';

export class LocationService {
  private locationSubscription: Location.LocationSubscription | null = null;

  async requestPermissions(): Promise<boolean> {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === 'granted';
  }

  async getCurrentLocation(): Promise<Location.LocationObject | null> {
    try {
      const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      return location;
    } catch (e) {
      console.warn('Failed to get location', e);
      return null;
    }
  }

  async startTracking(callback: (loc: Location.LocationObject) => void): Promise<void> {
    if (this.locationSubscription) return;

    this.locationSubscription = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 5000, // Update every 5s
        distanceInterval: 10, // Update every 10m
      },
      callback
    );
  }

  async stopTracking(): Promise<void> {
    if (this.locationSubscription) {
      await this.locationSubscription.remove();
      this.locationSubscription = null;
    }
  }
}

export const locationService = new LocationService();
