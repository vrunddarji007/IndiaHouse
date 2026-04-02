import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Property } from '../models/interfaces';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PropertyService {
  constructor(private http: HttpClient) { }

  getProperties(filters: any = {}): Observable<any> {
    let params = new HttpParams();
    for (const key in filters) {
      if (filters[key]) {
        params = params.append(key, filters[key]);
      }
    }
    return this.http.get(`${environment.apiUrl}/properties`, { params });
  }

  getPropertyBySlug(slug: string): Observable<any> {
    return this.http.get(`${environment.apiUrl}/properties/${slug}`);
  }

  getPropertyById(id: string): Observable<any> {
    return this.http.get(`${environment.apiUrl}/properties/id/${id}`);
  }

  getPropertyInquiries(id: string): Observable<any> {
    return this.http.get(`${environment.apiUrl}/properties/id/${id}/inquiries`);
  }

  // Stability alias for build consistency
  getPropertyAnalytics(id: string): Observable<any> {
    return this.getPropertyInquiries(id);
  }

  createProperty(formData: FormData): Observable<any> {
    return this.http.post(`${environment.apiUrl}/properties`, formData);
  }

  updateProperty(id: string, formData: FormData): Observable<any> {
    return this.http.put(`${environment.apiUrl}/properties/${id}`, formData);
  }

  deleteProperty(id: string): Observable<any> {
    return this.http.delete(`${environment.apiUrl}/properties/${id}`);
  }

  // Favorites
  getFavorites(): Observable<any> {
    return this.http.get(`${environment.apiUrl}/favorites`);
  }

  toggleFavorite(propertyId: string): Observable<any> {
    return this.http.post(`${environment.apiUrl}/favorites/${propertyId}`, {});
  }

  // Ratings
  rateProperty(propertyId: string, rating: number, review: string = ''): Observable<any> {
    return this.http.post(`${environment.apiUrl}/properties/${propertyId}/rate`, { rating, review });
  }

  likeReview(propertyId: string, reviewId: string): Observable<any> {
    return this.http.post(`${environment.apiUrl}/properties/${propertyId}/reviews/${reviewId}/like`, {});
  }

  deleteReview(propertyId: string, reviewId: string): Observable<any> {
    return this.http.delete(`${environment.apiUrl}/properties/${propertyId}/reviews/${reviewId}`);
  }
}
