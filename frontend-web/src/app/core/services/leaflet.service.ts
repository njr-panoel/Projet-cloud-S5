import { Injectable } from '@angular/core';

type LeafletNamespace = typeof import('leaflet');

@Injectable({ providedIn: 'root' })
export class LeafletService {
  private leaflet: LeafletNamespace | null = null;

  async load() {
    if (this.leaflet) {
      return this.leaflet;
    }
    const L = await import('leaflet');
    this.leaflet = L;
    return L;
  }
}
