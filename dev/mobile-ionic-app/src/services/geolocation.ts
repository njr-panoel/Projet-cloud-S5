import { Geolocation } from '@capacitor/geolocation';
import type { GeolocationPosition } from '@capacitor/geolocation';

export const getCurrentPosition = async (): Promise<GeolocationPosition> => {
  return Geolocation.getCurrentPosition();
};

export const watchPosition = (cb: (pos: GeolocationPosition) => void) => {
  const watchId = Geolocation.watchPosition({}, (position: any) => {
    if (position) cb(position as GeolocationPosition);
  });
  return () => Geolocation.clearWatch({ id: watchId });
};