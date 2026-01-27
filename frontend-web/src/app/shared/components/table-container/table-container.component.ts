import { Component, Input } from '@angular/core';

@Component({
  standalone: true,
  selector: 'app-table-container',
  template: `
    <div class="ri-table-container" [class.ri-table-container-padded]="padded">
      <ng-content />
    </div>
  `
})
export class TableContainerComponent {
  @Input() padded = false;
}
