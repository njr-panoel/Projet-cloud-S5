import { AsyncPipe } from '@angular/common';
import { Component, DestroyRef, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { AuthService } from '../../../core/services/auth.service';

@Component({
  standalone: true,
  selector: 'app-manager-profile-page',
  imports: [
    AsyncPipe,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule
  ],
  template: `
    <h1>Mon profil</h1>

    <mat-card style="margin-bottom: 12px;">
      <mat-card-title>Informations</mat-card-title>
      <mat-card-content>
        <form [formGroup]="profileForm" (ngSubmit)="saveProfile()">
          <mat-form-field appearance="outline" style="width: 100%">
            <mat-label>Nom</mat-label>
            <input matInput formControlName="nom" autocomplete="name" />
            @if (profileForm.controls.nom.touched && profileForm.controls.nom.invalid) {
              <mat-error>
                @if (profileForm.controls.nom.errors?.['required']) { Nom requis. }
                @if (profileForm.controls.nom.errors?.['minlength']) { Minimum 2 caractères. }
              </mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline" style="width: 100%">
            <mat-label>Email</mat-label>
            <input matInput type="email" formControlName="email" autocomplete="email" />
            @if (profileForm.controls.email.touched && profileForm.controls.email.invalid) {
              <mat-error>
                @if (profileForm.controls.email.errors?.['required']) { Email requis. }
                @if (profileForm.controls.email.errors?.['email']) { Email invalide. }
              </mat-error>
            }
          </mat-form-field>

          @if (profileMessage) {
            <div style="margin-bottom: 12px;" [style.color]="profileMessageColor">{{ profileMessage }}</div>
          }

          <button mat-raised-button color="primary" type="submit" [disabled]="profileForm.invalid || profileLoading">
            @if (profileLoading) {
              <mat-progress-spinner diameter="18" mode="indeterminate" />
            } @else {
              Enregistrer
            }
          </button>
        </form>
      </mat-card-content>
    </mat-card>

    <mat-card>
      <mat-card-title>Mot de passe</mat-card-title>
      <mat-card-content>
        <form [formGroup]="passwordForm" (ngSubmit)="changePassword()">
          <mat-form-field appearance="outline" style="width: 100%">
            <mat-label>Ancien mot de passe</mat-label>
            <input matInput type="password" formControlName="oldPassword" autocomplete="current-password" />
            @if (passwordForm.controls.oldPassword.touched && passwordForm.controls.oldPassword.invalid) {
              <mat-error>Champ requis.</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline" style="width: 100%">
            <mat-label>Nouveau mot de passe</mat-label>
            <input matInput type="password" formControlName="newPassword" autocomplete="new-password" />
            @if (passwordForm.controls.newPassword.touched && passwordForm.controls.newPassword.invalid) {
              <mat-error>
                @if (passwordForm.controls.newPassword.errors?.['required']) { Champ requis. }
                @if (passwordForm.controls.newPassword.errors?.['minlength']) { Minimum 8 caractères. }
              </mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline" style="width: 100%">
            <mat-label>Confirmer le nouveau mot de passe</mat-label>
            <input matInput type="password" formControlName="confirmPassword" autocomplete="new-password" />
            @if (passwordForm.controls.confirmPassword.touched && passwordMismatch) {
              <mat-error>Les mots de passe ne correspondent pas.</mat-error>
            }
          </mat-form-field>

          @if (passwordMessage) {
            <div style="margin-bottom: 12px;" [style.color]="passwordMessageColor">{{ passwordMessage }}</div>
          }

          <button mat-raised-button color="primary" type="submit" [disabled]="passwordForm.invalid || passwordMismatch || passwordLoading">
            @if (passwordLoading) {
              <mat-progress-spinner diameter="18" mode="indeterminate" />
            } @else {
              Changer le mot de passe
            }
          </button>
        </form>
      </mat-card-content>
    </mat-card>
  `
})
export class ManagerProfilePage {
  private readonly auth = inject(AuthService);
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  protected profileLoading = false;
  protected profileMessage: string | null = null;
  protected profileMessageColor = '#0f172a';

  protected passwordLoading = false;
  protected passwordMessage: string | null = null;
  protected passwordMessageColor = '#0f172a';

  protected readonly profileForm = this.fb.group({
    nom: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]]
  });

  protected readonly passwordForm = this.fb.group({
    oldPassword: ['', [Validators.required]],
    newPassword: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', [Validators.required]]
  });

  constructor() {
    this.auth
      .loadProfile()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (profile) => {
          this.profileForm.patchValue({ nom: profile.nom, email: profile.email });
        },
        error: () => {
          const current = this.auth.user();
          if (current) {
            this.profileForm.patchValue({ nom: current.nom, email: current.email });
          }
        }
      });
  }

  get passwordMismatch() {
    const a = this.passwordForm.value.newPassword ?? '';
    const b = this.passwordForm.value.confirmPassword ?? '';
    return a.length > 0 && b.length > 0 && a !== b;
  }

  saveProfile() {
    if (this.profileForm.invalid) {
      return;
    }

    this.profileMessage = null;
    this.profileLoading = true;

    const nom = this.profileForm.value.nom ?? '';
    const email = this.profileForm.value.email ?? '';

    this.auth
      .updateProfile({ nom, email })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.profileLoading = false;
          this.profileMessage = 'Profil mis à jour.';
          this.profileMessageColor = '#2e7d32';
        },
        error: () => {
          this.profileLoading = false;
          this.profileMessage = "Impossible de mettre à jour le profil.";
          this.profileMessageColor = '#b00020';
        }
      });
  }

  changePassword() {
    if (this.passwordForm.invalid || this.passwordMismatch) {
      return;
    }

    this.passwordMessage = null;
    this.passwordLoading = true;

    const oldPassword = this.passwordForm.value.oldPassword ?? '';
    const newPassword = this.passwordForm.value.newPassword ?? '';

    this.auth
      .changePassword({ oldPassword, newPassword })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.passwordLoading = false;
          this.passwordMessage = 'Mot de passe modifié.';
          this.passwordMessageColor = '#2e7d32';
          this.passwordForm.reset();
        },
        error: () => {
          this.passwordLoading = false;
          this.passwordMessage = "Impossible de changer le mot de passe.";
          this.passwordMessageColor = '#b00020';
        }
      });
  }
}
