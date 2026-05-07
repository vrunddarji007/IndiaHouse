import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class HostService {
  private baseUrl = `${environment.apiUrl}/host/dashboard`;

  constructor(private http: HttpClient) {}

  getDashboardUsers(page: number = 1, limit: number = 20, search: string = '', role: string = ''): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (search) params = params.set('search', search);
    if (role) params = params.set('role', role);

    return this.http.get<any>(`${this.baseUrl}/users`, { params });
  }

  getDashboardProperties(
    page: number = 1,
    limit: number = 20,
    filters: { type?: string; status?: string; location?: string; postedByRole?: string } = {}
  ): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (filters.type) params = params.set('type', filters.type);
    if (filters.status) params = params.set('status', filters.status);
    if (filters.location) params = params.set('location', filters.location);
    if (filters.postedByRole) params = params.set('postedByRole', filters.postedByRole);

    return this.http.get<any>(`${this.baseUrl}/properties`, { params });
  }

  getUserDetail(userId: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/users/${userId}`);
  }

  updateUserStatus(userId: string, status: 'active' | 'banned', duration?: string): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/users/${userId}/status`, { status, duration });
  }

  deleteUser(userId: string): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/users/${userId}`);
  }

  getAppeals(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/appeals`);
  }

  getAppealHistory(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/appeals/history`);
  }

  handleAppeal(appealId: string, action: 'approve' | 'reject', adminNote: string = ''): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/appeals/${appealId}`, { action, adminNote });
  }

  downloadUserTermsPDF(userId: string): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/users/${userId}/terms-pdf`, {
      responseType: 'blob'
    });
  }
}
