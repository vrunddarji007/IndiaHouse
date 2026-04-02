import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { User } from '../models/interfaces';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;

  constructor(private http: HttpClient) {
    const u = localStorage.getItem('currentUser');
    this.currentUserSubject = new BehaviorSubject<User | null>(u ? JSON.parse(u) : null);
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  // Unified register or login
  registerOrLogin(data: { name?: string; email: string; phone?: string; role?: string; verificationMethod?: string }): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/auth/register-or-login`, data);
  }

  // Verify OTP → saves JWT + user with role
  verifyOTP(email: string, otp: string): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/auth/verify-otp`, { email, otp })
      .pipe(map(user => {
        if (user.token) {
          localStorage.setItem('currentUser', JSON.stringify(user));
          this.currentUserSubject.next(user);
        }
        return user;
      }));
  }

  resendOTP(email: string, method: string = 'email'): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/auth/resend-otp`, { email, verificationMethod: method });
  }

  setPassword(password: string): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/auth/set-password`, { password });
  }

  login(email: string, password: string): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/auth/login`, { email, password })
      .pipe(map(user => {
        if (user.token) {
          localStorage.setItem('currentUser', JSON.stringify(user));
          this.currentUserSubject.next(user);
        }
        return user;
      }));
  }

  hostLogin(email: string, password: string): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/auth/host-login`, { email, password })
      .pipe(map(user => {
        if (user.token) {
          localStorage.setItem('currentUser', JSON.stringify(user));
          this.currentUserSubject.next(user);
        }
        return user;
      }));
  }

  updateCurrentUser(userData: Partial<any>) {
    const current = this.currentUserSubject.value;
    if (current) {
      const updated = { ...current, ...userData };
      localStorage.setItem('currentUser', JSON.stringify(updated));
      this.currentUserSubject.next(updated);
    }
  }

  logout() {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/auth/forgot-password`, { email });
  }

  resetPassword(email: string, otp: string, newPassword: string): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/auth/reset-password`, { email, otp, newPassword });
  }

  submitAppeal(email: string, message: string): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/auth/appeal`, { email, message });
  }

  hasRole(role: string): boolean {
    return this.currentUserValue?.role === role;
  }

  canPost(): boolean {
    const r = this.currentUserValue?.role;
    return r === 'agent' || r === 'host';
  }
}
