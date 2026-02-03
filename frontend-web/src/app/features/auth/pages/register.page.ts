import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';

import { AuthService } from '../../../core/services/auth.service';

@Component({
  standalone: true,
  selector: 'app-register-page',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatProgressSpinnerModule
  ],
  template: `
    <h1>Créer un compte</h1>

    <mat-card>
      <mat-card-content>
        <form [formGroup]="form" (ngSubmit)="submit()">
          <mat-form-field appearance="outline" style="width: 100%">
            <mat-label>Nom</mat-label>
            <input matInput formControlName="nom" autocomplete="name" />
            @if (form.controls.nom.touched && form.controls.nom.invalid) {
              <mat-error>
                @if (form.controls.nom.errors?.['required']) { Nom requis. }
                @if (form.controls.nom.errors?.['minlength']) { Nom trop court (min 2). }
              </mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline" style="width: 100%">
            <mat-label>Prénom</mat-label>
            <input matInput formControlName="prenom" autocomplete="given-name" />
            @if (form.controls.prenom.touched && form.controls.prenom.invalid) {
              <mat-error>
                @if (form.controls.prenom.errors?.['required']) { Prénom requis. }
                @if (form.controls.prenom.errors?.['minlength']) { Prénom trop court (min 2). }
              </mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline" style="width: 100%">
            <mat-label>Email</mat-label>
            <input matInput type="email" formControlName="email" autocomplete="email" />
            @if (form.controls.email.touched && form.controls.email.invalid) {
              <mat-error>
                @if (form.controls.email.errors?.['required']) { Email requis. }
                @if (form.controls.email.errors?.['email']) { Email invalide. }
              </mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline" style="width: 100%">
            <mat-label>Profil</mat-label>
            <mat-select formControlName="role">
              <mat-option value="VISITEUR">Visiteur (lecture seule)</mat-option>
              <mat-option value="UTILISATEUR_MOBILE">Utilisateur (peut signaler)</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline" style="width: 100%">
            <mat-label>Mot de passe</mat-label>
            <input matInput type="password" formControlName="password" autocomplete="new-password" />
            @if (form.controls.password.touched && form.controls.password.invalid) {
              <mat-error>
                @if (form.controls.password.errors?.['required']) { Mot de passe requis. }
                @if (form.controls.password.errors?.['minlength']) { Minimum 6 caractères. }
              </mat-error>
            }
          </mat-form-field>

          @if (errorMessage) {
            <div style="color: #b00020; margin-bottom: 12px;">{{ errorMessage }}</div>
          }

          <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid || loading">
            @if (loading) {
              <mat-progress-spinner diameter="18" mode="indeterminate" />
            } @else {
              S'inscrire
            }
          </button>

          <a mat-button routerLink="/auth/login" type="button">Déjà un compte ?</a>
        </form>
      </mat-card-content>
    </mat-card>
  `
})
export class RegisterPage {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly form = this.fb.group({
    nom: ['', [Validators.required, Validators.minLength(2)]],
    prenom: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    telephone: [''],
    role: ['VISITEUR'],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  protected loading = false;
  protected errorMessage: string | null = null;

  submit() {
    if (this.form.invalid) {
      return;
    }

    this.errorMessage = null;
    this.loading = true;

    const nom = this.form.value.nom ?? '';
    const prenom = this.form.value.prenom ?? '';
    const email = this.form.value.email ?? '';
    const telephone = (this.form.value.telephone ?? '').trim();
    const role = (this.form.value.role ?? 'VISITEUR') as 'VISITEUR' | 'UTILISATEUR_MOBILE';
    const password = this.form.value.password ?? '';

    this.auth.register({ nom, prenom, email, password, telephone: telephone || null, role }).subscribe({
      next: () => {
        this.loading = false;
        if (role === 'UTILISATEUR_MOBILE') {
          this.router.navigateByUrl('/signaler');
        } else {
          this.router.navigateByUrl('/');
        }
      },
      error: () => {
        this.loading = false;
        this.errorMessage = "Impossible de créer le compte. Vérifiez les informations.";
      }
    });
  }
}
