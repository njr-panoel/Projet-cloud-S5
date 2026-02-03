import { Geolocation } from '@capacitor/geolocation';

export const geolocationService = {
  async currentPosition(): Promise<{ lat: number; lng: number } | null> {
    try {
      const { coords } = await Geolocation.getCurrentPosition({ enableHighAccuracy: true });
      return { lat: coords.latitude, lng: coords.longitude };
    } catch (e) {
      return null;
    }
  }
};
