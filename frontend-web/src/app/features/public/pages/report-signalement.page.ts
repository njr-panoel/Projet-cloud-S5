import { Component, DestroyRef, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { SignalementsService } from '../../../core/services/signalements.service';
import { ToastService } from '../../../core/services/toast.service';
import { TypeTravaux } from '../../../models/signalement.models';

@Component({
  standalone: true,
  selector: 'app-report-signalement-page',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="ri-page-header">
      <h1>Créer un signalement</h1>
      <div class="ri-page-actions">
        <a mat-stroked-button routerLink="/signalements">
          <mat-icon>arrow_back</mat-icon> Retour liste
        </a>
        <a mat-stroked-button routerLink="/carte">
          <mat-icon>map</mat-icon> Carte
        </a>
      </div>
    </div>

    <mat-card>
      <mat-card-content>
        <form [formGroup]="form" (ngSubmit)="submit()">
          <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 0 16px;">
            <mat-form-field appearance="outline" style="width: 100%">
              <mat-label>Titre</mat-label>
              <input matInput formControlName="titre" autocomplete="off" placeholder="Ex: Nid de poule rue..." />
              @if (form.controls.titre.touched && form.controls.titre.invalid) {
                <mat-error>Titre requis.</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" style="width: 100%">
              <mat-label>Type de travaux</mat-label>
              <mat-select formControlName="typeTravaux">
                @for (t of allTypes; track t) {
                  <mat-option [value]="t">{{ t }}</mat-option>
                }
              </mat-select>
              @if (form.controls.typeTravaux.touched && form.controls.typeTravaux.invalid) {
                <mat-error>Type requis.</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" style="width: 100%">
              <mat-label>Latitude</mat-label>
              <input matInput type="number" formControlName="latitude" />
              @if (form.controls.latitude.touched && form.controls.latitude.invalid) {
                <mat-error>Latitude requise.</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" style="width: 100%">
              <mat-label>Longitude</mat-label>
              <input matInput type="number" formControlName="longitude" />
              @if (form.controls.longitude.touched && form.controls.longitude.invalid) {
                <mat-error>Longitude requise.</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" style="width: 100%">
              <mat-label>Adresse</mat-label>
              <input matInput formControlName="adresse" autocomplete="street-address" />
            </mat-form-field>

            <mat-form-field appearance="outline" style="width: 100%">
              <mat-label>Photos (URLs séparées par virgule)</mat-label>
              <input matInput formControlName="photos" autocomplete="off" />
            </mat-form-field>
          </div>

          <mat-form-field appearance="outline" style="width: 100%; margin-top: 4px;">
            <mat-label>Description</mat-label>
            <textarea matInput rows="4" formControlName="description" placeholder="Décrivez le problème..."></textarea>
          </mat-form-field>

          <div style="display:flex; gap: 12px; flex-wrap: wrap; margin-top: 8px;">
            <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid || loading">
              @if (loading) {
                <mat-progress-spinner diameter="18" mode="indeterminate" />
              } @else {
                <ng-container><mat-icon>send</mat-icon> Envoyer</ng-container>
              }
            </button>
            <button mat-stroked-button type="button" (click)="cancel()" [disabled]="loading">Annuler</button>
          </div>
        </form>
      </mat-card-content>
    </mat-card>
  `
})
export class ReportSignalementPage {
  private readonly fb = inject(FormBuilder);
  private readonly signalements = inject(SignalementsService);
  private readonly toast = inject(ToastService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  protected loading = false;

  protected readonly allTypes: TypeTravaux[] = [
    'NIDS_DE_POULE',
    'FISSURE',
    'AFFAISSEMENT',
    'INONDATION',
    'SIGNALISATION',
    'ECLAIRAGE',
    'AUTRE'
  ];

  protected readonly form = this.fb.group({
    titre: ['', [Validators.required]],
    description: [''],
    typeTravaux: ['NIDS_DE_POULE' as TypeTravaux, [Validators.required]],
    latitude: [null as number | null, [Validators.required]],
    longitude: [null as number | null, [Validators.required]],
    adresse: [''],
    photos: ['']
  });

  constructor() {
    const qp = this.route.snapshot.queryParamMap;
    const lat = Number(qp.get('lat'));
    const lonRaw = qp.get('lon') ?? qp.get('lng');
    const lon = Number(lonRaw);

    if (Number.isFinite(lat)) {
      this.form.controls.latitude.setValue(lat);
    }

    if (Number.isFinite(lon)) {
      this.form.controls.longitude.setValue(lon);
    }
  }

  submit() {
    if (this.form.invalid) {
      return;
    }

    const payload = {
      titre: this.form.value.titre ?? '',
      description: (this.form.value.description ?? '').trim() || null,
      typeTravaux: (this.form.value.typeTravaux ?? 'NIDS_DE_POULE') as TypeTravaux,
      latitude: Number(this.form.value.latitude),
      longitude: Number(this.form.value.longitude),
      adresse: (this.form.value.adresse ?? '').trim() || null,
      photos: (this.form.value.photos ?? '').trim() || null
    };

    this.loading = true;
    this.signalements
      .create(payload)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.loading = false;
          this.toast.success('Signalement envoyé.');
          this.router.navigateByUrl('/signalements');
        },
        error: () => {
          this.loading = false;
          this.toast.danger('Impossible de créer le signalement.');
        }
      });
  }

  cancel() {
    this.router.navigateByUrl('/signalements');
  }
}
