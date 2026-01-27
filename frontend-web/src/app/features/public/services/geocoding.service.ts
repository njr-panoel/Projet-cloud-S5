import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map, Observable, of } from 'rxjs';

export type GeoPlace = {
  label: string;
  lat: number;
  lon: number;
};

type PhotonResponse = {
  features: Array<{
    properties: {
      name?: string;
      city?: string;
      state?: string;
      country?: string;
    };
    geometry: {
      coordinates: [number, number];
    };
  }>;
};

@Injectable({ providedIn: 'root' })
export class GeocodingService {
  private readonly http = inject(HttpClient);

  search(query: string, limit = 5): Observable<GeoPlace[]> {
    const q = query.trim();
    if (!q) {
      return of([] as GeoPlace[]);
    }

    const params = new HttpParams().set('q', q).set('limit', String(limit));

    return this.http
      .get<PhotonResponse>('https://photon.komoot.io/api/', { params })
      .pipe(map((resp) => this.mapResponse(resp)));
  }

  private mapResponse(resp: PhotonResponse): GeoPlace[] {
    return (resp.features ?? []).map((f) => {
      const [lon, lat] = f.geometry.coordinates;
      const p = f.properties ?? {};
      const parts = [p.name, p.city, p.state, p.country].filter(Boolean);
      return {
        label: parts.join(', ') || `${lat}, ${lon}`,
        lat,
        lon
      };
    });
  }
}
