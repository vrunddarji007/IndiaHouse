import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PropertyService } from '../../services/property.service';
import { Property } from '../../models/interfaces';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container py-5 mt-4 min-vh-100">
      <h2 class="fw-bold mb-4">My Favorites</h2>

      <div class="row g-4" *ngIf="favorites().length > 0">
        <div class="col-md-4" *ngFor="let prop of favorites()">
          <div class="card property-card h-100">
            <img [src]="prop.images && prop.images.length > 0 ? apiUrl.replace('/api', '') + prop.images[0] : 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=400&q=80'" class="card-img-top" alt="Property Image" style="height: 200px; object-fit: cover;">
            
            <div class="card-body">
              <h5 class="card-title text-truncate fw-bold">{{ prop.title }}</h5>
              <p class="text-primary fw-bold fs-5 mb-2">{{ prop.price | currency:'INR' }}</p>
              <p class="text-muted small mb-3"><i class="bi bi-geo-alt"></i> {{ prop.location }}</p>
              
              <div class="d-flex justify-content-between text-muted small mb-3 border-top pt-3">
                <span><i class="bi bi-house"></i> {{ prop.propertyType }}</span>
              </div>
              
              <div class="d-flex gap-2">
                <button class="btn btn-outline-primary flex-grow-1" [routerLink]="['/properties', prop.slug]">View Details</button>
                <button class="btn btn-danger" (click)="removeFavorite(prop._id!)"><i class="bi bi-trash"></i> Remove</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div *ngIf="favorites().length === 0 && !loading" class="text-center py-5">
        <div class="display-1 text-muted mb-4"><i class="bi bi-heart-break"></i></div>
        <h3 class="text-muted">No favorite properties yet.</h3>
        <button class="btn btn-primary mt-3" routerLink="/properties">Browse Properties</button>
      </div>
      
      <div *ngIf="loading" class="text-center py-5">
        <div class="spinner-border text-primary"></div>
      </div>
    </div>
  `
})
export class FavoritesComponent implements OnInit {
  favorites = signal<Property[]>([]);
  loading = true;
  apiUrl = environment.apiUrl;

  constructor(private propertyService: PropertyService) {}

  ngOnInit() {
    this.loadFavorites();
  }

  loadFavorites() {
    this.propertyService.getFavorites().subscribe({
      next: (res) => {
        this.favorites.set(res.data);
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  removeFavorite(id: string) {
    this.propertyService.toggleFavorite(id).subscribe({
      next: () => {
        // Remove from UI immediately
        this.favorites.update(favs => favs.filter(p => p._id !== id));
      }
    });
  }
}
