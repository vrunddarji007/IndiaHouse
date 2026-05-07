import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private activeTheme = new BehaviorSubject<'light' | 'dark'>('light');

  constructor() {
    this.initTheme();
  }

  get currentTheme$(): Observable<'light' | 'dark'> {
    return this.activeTheme.asObservable();
  }

  get isDark(): boolean {
    return this.activeTheme.value === 'dark';
  }

  private initTheme() {
    const saved = localStorage.getItem('app-theme') as 'light' | 'dark';
    if (saved) {
      this.setTheme(saved);
    } else {
      // Default to light
      this.setTheme('light');
    }
  }

  toggleTheme() {
    const next = this.activeTheme.value === 'light' ? 'dark' : 'light';
    this.setTheme(next);
  }

  setTheme(theme: 'light' | 'dark') {
    this.activeTheme.next(theme);
    localStorage.setItem('app-theme', theme);
    document.documentElement.setAttribute('data-bs-theme', theme);
  }
}
