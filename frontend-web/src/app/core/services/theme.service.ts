import { DOCUMENT } from '@angular/common';
import { Injectable, inject, signal } from '@angular/core';

export type AppTheme = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly doc = inject(DOCUMENT);

  private readonly storageKey = 'ri_theme';

  readonly theme = signal<AppTheme>(this.readInitialTheme());

  constructor() {
    this.applyTheme(this.theme());
  }

  toggle() {
    this.setTheme(this.theme() === 'dark' ? 'light' : 'dark');
  }

  setTheme(theme: AppTheme) {
    this.theme.set(theme);
    try {
      localStorage.setItem(this.storageKey, theme);
    } catch {
      // ignore
    }
    this.applyTheme(theme);
  }

  private applyTheme(theme: AppTheme) {
    const root = this.doc.documentElement;
    root.classList.toggle('dark', theme === 'dark');
  }

  private readInitialTheme(): AppTheme {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored === 'dark' || stored === 'light') {
        return stored;
      }
    } catch {
      // ignore
    }
    return 'light';
  }
}
