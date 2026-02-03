import { AfterViewInit, Component, DestroyRef, ViewChild, inject } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';

import { startWith, Subject, switchMap } from 'rxjs';

import { ExcelExportService } from '../../../core/services/excel-export.service';
import { UsersService } from '../../../core/services/users.service';
import { UserDto, UserRole } from '../../../models/user.models';

@Component({
  standalone: true,
  selector: 'app-manager-users-page',
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatTableModule,
    MatSortModule,
    MatSnackBarModule,
    MatProgressSpinnerModule
  ],
  template: `
    <h1>Gestion des utilisateurs</h1>

    <mat-card style="margin-bottom: 12px;">
      <mat-card-title>Créer un compte</mat-card-title>
      <mat-card-content>
        <form [formGroup]="createForm" (ngSubmit)="create()" style="display:grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 10px;">
          <mat-form-field appearance="outline">
            <mat-label>Email</mat-label>
            <input matInput type="email" formControlName="email" autocomplete="email" />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Mot de passe</mat-label>
            <input matInput type="password" formControlName="password" autocomplete="new-password" />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Nom</mat-label>
            <input matInput formControlName="nom" />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Prénom</mat-label>
            <input matInput formControlName="prenom" />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Téléphone</mat-label>
            <input matInput formControlName="telephone" autocomplete="tel" />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Rôle</mat-label>
            <mat-select formControlName="role">
              <mat-option value="VISITEUR">VISITEUR</mat-option>
              <mat-option value="MANAGER">MANAGER</mat-option>
              <mat-option value="UTILISATEUR_MOBILE">UTILISATEUR_MOBILE</mat-option>
            </mat-select>
          </mat-form-field>

          <div style="display:flex; gap: 10px; align-items:center; flex-wrap: wrap;">
            <button mat-raised-button color="primary" type="submit" [disabled]="createForm.invalid || loading">Créer</button>
            @if (loading) {
              <mat-progress-spinner diameter="18" mode="indeterminate" />
            }
          </div>
        </form>
      </mat-card-content>
    </mat-card>

    <mat-card>
      <mat-card-title>Liste utilisateurs</mat-card-title>
      <mat-card-content>
        <div style="display:flex; gap: 10px; flex-wrap: wrap; align-items:center;">
          <mat-form-field appearance="outline">
            <mat-label>Recherche</mat-label>
            <input matInput [formControl]="searchCtrl" placeholder="Email, nom, prénom…" />
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Rôle</mat-label>
            <mat-select [formControl]="roleCtrl">
              <mat-option [value]="''">Tous</mat-option>
              <mat-option value="VISITEUR">VISITEUR</mat-option>
              <mat-option value="MANAGER">MANAGER</mat-option>
              <mat-option value="UTILISATEUR_MOBILE">UTILISATEUR_MOBILE</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Verrouillés</mat-label>
            <mat-select [formControl]="lockedCtrl">
              <mat-option [value]="''">Tous</mat-option>
              <mat-option value="1">Oui</mat-option>
              <mat-option value="0">Non</mat-option>
            </mat-select>
          </mat-form-field>

          <button mat-stroked-button type="button" (click)="refresh()" [disabled]="loading">Rafraîchir</button>
          <button mat-stroked-button type="button" (click)="export()" [disabled]="loading">Exporter (.xlsx)</button>
        </div>

        <div style="margin-top: 12px; display:flex; align-items:center; justify-content: space-between; gap: 12px; flex-wrap: wrap;">
          <div><strong>Résultats:</strong> {{ dataSource.filteredData.length }}</div>
        </div>

        <div style="overflow:auto; margin-top: 12px;">
          <table mat-table [dataSource]="dataSource" matSort>
            <ng-container matColumnDef="id">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>ID</th>
              <td mat-cell *matCellDef="let u">#{{ u.id }}</td>
            </ng-container>

            <ng-container matColumnDef="email">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Email</th>
              <td mat-cell *matCellDef="let u">{{ u.email }}</td>
            </ng-container>

            <ng-container matColumnDef="nom">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Nom</th>
              <td mat-cell *matCellDef="let u">{{ u.nom }} {{ u.prenom }}</td>
            </ng-container>

            <ng-container matColumnDef="role">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Rôle</th>
              <td mat-cell *matCellDef="let u">
                <mat-form-field appearance="outline" style="width: 200px; margin: 0;">
                  <mat-select [value]="u.role" (selectionChange)="setRole(u, $event.value)">
                    <mat-option value="VISITEUR">VISITEUR</mat-option>
                    <mat-option value="MANAGER">MANAGER</mat-option>
                    <mat-option value="UTILISATEUR_MOBILE">UTILISATEUR_MOBILE</mat-option>
                  </mat-select>
                </mat-form-field>
              </td>
            </ng-container>

            <ng-container matColumnDef="locked">
              <th mat-header-cell *matHeaderCellDef mat-sort-header>Verrouillé</th>
              <td mat-cell *matCellDef="let u">{{ u.accountLocked ? 'Oui' : 'Non' }}</td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Actions</th>
              <td mat-cell *matCellDef="let u">
                <div style="display:flex; gap: 8px; flex-wrap: wrap;">
                  @if (u.accountLocked) {
                    <button mat-button type="button" (click)="unlock(u)">Débloquer</button>
                  }
                  <button mat-button type="button" (click)="remove(u)">Supprimer</button>
                </div>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
          </table>
        </div>
      </mat-card-content>
    </mat-card>
  `
})
export class ManagerUsersPage implements AfterViewInit {
  private readonly users = inject(UsersService);
  private readonly excel = inject(ExcelExportService);
  private readonly snack = inject(MatSnackBar);
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  private readonly refresh$ = new Subject<void>();

  protected loading = false;

  protected readonly searchCtrl = new FormControl<string>('', { nonNullable: true });
  protected readonly roleCtrl = new FormControl<string>('', { nonNullable: true });
  protected readonly lockedCtrl = new FormControl<string>('', { nonNullable: true });

  protected readonly displayedColumns = ['id', 'email', 'nom', 'role', 'locked', 'actions'];
  protected readonly dataSource = new MatTableDataSource<UserDto>([]);

  protected readonly createForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    nom: ['', [Validators.required]],
    prenom: ['', [Validators.required]],
    telephone: [''],
    role: ['VISITEUR' as UserRole, [Validators.required]]
  });

  @ViewChild(MatSort) sort?: MatSort;

  ngAfterViewInit() {
    this.dataSource.sort = this.sort ?? null;

    this.dataSource.filterPredicate = (row, raw) => {
      let filter: { q: string; role: string; locked: string };
      try {
        filter = JSON.parse(raw) as { q: string; role: string; locked: string };
      } catch {
        filter = { q: '', role: '', locked: '' };
      }

      const q = (filter.q || '').trim().toLowerCase();
      const role = (filter.role || '').trim();
      const locked = (filter.locked || '').trim();

      if (role && row.role !== role) {
        return false;
      }
      if (locked === '1' && !row.accountLocked) {
        return false;
      }
      if (locked === '0' && row.accountLocked) {
        return false;
      }

      if (!q) {
        return true;
      }

      const hay = [row.email, row.nom, row.prenom, row.telephone ?? '', row.role].join(' ').toLowerCase();
      return hay.includes(q);
    };

    this.refresh$
      .pipe(
        startWith(undefined),
        switchMap(() => {
          this.loading = true;
          return this.users.list();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (list) => {
          this.loading = false;
          this.dataSource.data = list;
          this.applyFilter();
        },
        error: () => {
          this.loading = false;
          this.snack.open('Impossible de charger les utilisateurs.', 'OK', { duration: 3500 });
        }
      });

    this.searchCtrl.valueChanges.pipe(startWith(this.searchCtrl.value), takeUntilDestroyed(this.destroyRef)).subscribe(() => this.applyFilter());
    this.roleCtrl.valueChanges.pipe(startWith(this.roleCtrl.value), takeUntilDestroyed(this.destroyRef)).subscribe(() => this.applyFilter());
    this.lockedCtrl.valueChanges.pipe(startWith(this.lockedCtrl.value), takeUntilDestroyed(this.destroyRef)).subscribe(() => this.applyFilter());
  }

  refresh() {
    this.refresh$.next();
  }

  private applyFilter() {
    this.dataSource.filter = JSON.stringify({
      q: this.searchCtrl.value,
      role: this.roleCtrl.value,
      locked: this.lockedCtrl.value
    });
  }

  create() {
    if (this.createForm.invalid) {
      return;
    }

    const email = this.createForm.value.email ?? '';
    const password = this.createForm.value.password ?? '';
    const nom = this.createForm.value.nom ?? '';
    const prenom = this.createForm.value.prenom ?? '';
    const telephoneRaw = (this.createForm.value.telephone ?? '').trim();
    const role = (this.createForm.value.role ?? 'VISITEUR') as UserRole;

    this.loading = true;
    this.users
      .createUser({ email, password, nom, prenom, telephone: telephoneRaw || null, role })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.loading = false;
          this.snack.open('Compte créé.', 'OK', { duration: 2500 });
          this.createForm.reset({ role: 'VISITEUR' as UserRole, telephone: '' });
          this.refresh();
        },
        error: () => {
          this.loading = false;
          this.snack.open('Impossible de créer le compte.', 'OK', { duration: 3500 });
        }
      });
  }

  unlock(u: UserDto) {
    this.users.unlock(u.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (updated) => {
        u.accountLocked = updated.accountLocked;
        u.lockedUntil = updated.lockedUntil;
        u.loginAttempts = updated.loginAttempts;
        this.applyFilter();
        this.snack.open('Utilisateur débloqué.', 'OK', { duration: 2500 });
      },
      error: () => {
        this.snack.open("Impossible de débloquer l'utilisateur.", 'OK', { duration: 3500 });
      }
    });
  }

  setRole(u: UserDto, role: UserRole) {
    if (u.role === role) {
      return;
    }
    this.users.updateRole(u.id, role).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (updated) => {
        u.role = updated.role;
        this.applyFilter();
        this.snack.open('Rôle mis à jour.', 'OK', { duration: 2500 });
      },
      error: () => {
        this.snack.open('Impossible de mettre à jour le rôle.', 'OK', { duration: 3500 });
      }
    });
  }

  remove(u: UserDto) {
    this.users.delete(u.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.dataSource.data = this.dataSource.data.filter((x) => x.id !== u.id);
        this.applyFilter();
        this.snack.open('Utilisateur supprimé.', 'OK', { duration: 2500 });
      },
      error: () => {
        this.snack.open("Impossible de supprimer l'utilisateur.", 'OK', { duration: 3500 });
      }
    });
  }

  export() {
    const rows = this.dataSource.filteredData.map((u) => ({
      id: u.id,
      email: u.email,
      nom: u.nom,
      prenom: u.prenom,
      telephone: u.telephone,
      role: u.role,
      authProvider: u.authProvider,
      active: u.active,
      accountLocked: u.accountLocked,
      lockedUntil: u.lockedUntil,
      loginAttempts: u.loginAttempts,
      createdAt: u.createdAt,
      lastLoginAt: u.lastLoginAt
    }));
    this.excel.exportAsXlsx('utilisateurs', rows, 'Utilisateurs');
  }
}
