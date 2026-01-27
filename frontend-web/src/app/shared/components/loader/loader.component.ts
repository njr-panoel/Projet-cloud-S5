import { Component, Input } from '@angular/core';

import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  standalone: true,
  selector: 'app-loader',
  imports: [MatProgressSpinnerModule],
  template: `
    <div class="ri-loader" role="status" aria-live="polite">
      <mat-progress-spinner [diameter]="diameter" mode="indeterminate" />
      @if (label) {
        <div class="ri-loader-label">{{ label }}</div>
      }
    </div>
  `
})
export class LoaderComponent {
  @Input() label?: string;
  @Input() diameter = 22;
}
