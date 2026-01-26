import { Component } from '@angular/core';

import { MapComponent } from '../../../shared/components/map/map.component';

@Component({
  standalone: true,
  selector: 'app-public-map-page',
  imports: [MapComponent],
  template: `
    <h1>Carte des signalements</h1>

    <app-map />
  `
})
export class PublicMapPage {}
