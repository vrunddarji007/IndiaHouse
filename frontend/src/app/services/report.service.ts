import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ReportService {
  private baseUrl = `${environment.apiUrl}/reports`;

  constructor(private http: HttpClient) {}

  submitReport(reportData: { reportedUser: string; reason: string; description?: string }): Observable<any> {
    return this.http.post<any>(this.baseUrl, reportData);
  }

  getAllReports(): Observable<any> {
    return this.http.get<any>(this.baseUrl);
  }

  handleReport(id: string, action: string, adminNote: string, duration?: string): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/${id}/handle`, { action, adminNote, duration });
  }
}
