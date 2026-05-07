import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private baseUrl = `${environment.apiUrl}/profile`;

  constructor(private http: HttpClient) {}

  completeProfile(formData: FormData): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/complete`, formData);
  }

  editProfile(formData: FormData): Observable<any> {
    return this.http.put<any>(this.baseUrl, formData);
  }

  getProfile(): Observable<any> {
    return this.http.get<any>(this.baseUrl);
  }

  checkUsername(username: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/check-username/${username}`);
  }

  getPublicProfile(id: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${id}`);
  }
}
