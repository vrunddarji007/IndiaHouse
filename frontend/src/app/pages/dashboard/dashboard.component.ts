import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PropertyService } from '../../services/property.service';
import { AuthService } from '../../services/auth.service';
import { Property, User } from '../../models/interfaces';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container py-5 mt-4 min-vh-100">
      <div class="d-flex justify-content-between align-items-center mb-5 border-bottom pb-3">
        <div>
          <h2 class="fw-bold mb-1">Dashboard</h2>
          <p class="text-muted mb-0">Welcome, {{ currentUser()?.name }}</p>
        </div>
        <a routerLink="/properties/post" class="btn btn-primary" *ngIf="currentUser()?.role !== 'buyer'">
          <i class="bi bi-plus-lg"></i> Post Property
        </a>
      </div>

      <!-- Agent View: My Listings -->
      <div *ngIf="currentUser()?.role !== 'buyer'">
        <h4 class="fw-bold mb-4">My Listings</h4>
        
        <div class="row g-4 mb-5" *ngIf="myProperties().length > 0">
          <div class="col-md-6 col-lg-4" *ngFor="let prop of myProperties()">
            <div class="card property-card h-100 border shadow-sm">
              <div class="position-absolute top-0 end-0 p-2 z-index-1">
                <span class="badge" [ngClass]="{
                  'bg-success': prop.status === 'active',
                  'bg-warning text-dark': prop.status === 'pending',
                  'bg-danger': prop.status === 'sold/rented'
                }">{{ prop.status === 'sold/rented' ? (prop.type === 'rent' ? 'RENTED OUT' : 'SOLD OUT') : prop.status | uppercase }}</span>
              </div>
              
              <img [src]="prop.images && prop.images.length > 0 ? apiUrl.replace('/api', '') + prop.images[0] : 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=400&q=80'" class="card-img-top" style="height: 180px; object-fit: cover;">
              
              <div class="card-body">
                <h6 class="fw-bold text-truncate">{{ prop.title }}</h6>
                <p class="text-primary fw-bold mb-1">{{ prop.price | currency:'INR' }}</p>
                <p class="text-muted small mb-2"><i class="bi bi-geo-alt me-1"></i><span *ngIf="prop.village">{{ prop.village }}, </span><span *ngIf="prop.town">{{ prop.town }}, </span>{{ prop.location }}{{ prop.state ? ', ' + prop.state : '' }}</p>
                <div class="d-flex justify-content-between small text-muted border-top pt-2 mt-3">
                  <span><i class="bi bi-eye"></i> {{ prop.views }} Views</span>
                  <div class="d-flex flex-column gap-2 w-100">
                    <a [routerLink]="['/properties/manage', prop._id]" class="btn btn-outline-primary w-100 py-2 rounded-3 fw-bold">
                      View Details
                    </a>
                    <div class="d-flex justify-content-end">
                      <button class="btn btn-sm btn-link text-danger p-0 d-flex align-items-center" (click)="deleteProperty(prop._id!)" title="Delete Listing">
                        <i class="bi bi-trash-fill me-1"></i> <small>Delete Listing</small>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div *ngIf="myProperties().length === 0 && !loading" class="text-center py-5 bg-light rounded text-muted">
          <p class="mb-0">You have not posted any properties yet.</p>
        </div>
      </div>

      <!-- Buyer View -->
      <div *ngIf="currentUser()?.role === 'buyer'" class="row g-4">
        <div class="col-md-4">
          <div class="card bg-light border-0 text-center p-5 shadow-sm h-100">
            <i class="bi bi-heart display-4 text-danger mb-3"></i>
            <h5 class="fw-bold">My Favorites</h5>
            <p class="text-muted small">Properties you have saved for later.</p>
            <a routerLink="/favorites" class="btn btn-outline-danger mt-auto">View Favorites</a>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card bg-light border-0 text-center p-5 shadow-sm h-100">
            <i class="bi bi-chat-dots display-4 text-primary mb-3"></i>
            <h5 class="fw-bold">Message Agents</h5>
            <p class="text-muted small">Continue conversations with agents.</p>
            <a routerLink="/messages" class="btn btn-outline-primary mt-auto">View Inbox</a>
          </div>
        </div>
      </div>
      
    </div>
  `
})
export class DashboardComponent implements OnInit {
  myProperties = signal<Property[]>([]);
  currentUser = signal<User | null>(null);
  loading = true;
  apiUrl = environment.apiUrl;

  constructor(
    private propertyService: PropertyService,
    private authService: AuthService
  ) {
    this.authService.currentUser.subscribe(u => this.currentUser.set(u));
  }

  ngOnInit() {
    if (this.currentUser()?.role !== 'buyer') {
      this.loadMyProperties();
    }
  }

  loadMyProperties() {
    // Calling general getProperties endpoint, simulating "my listings" because I am not using a dedicated /my endpoint, we get our own via normal filtering or logic
    // We fetch all and filter by current user locally for this portfolio demo. Or standard query if API supported it fully.
    this.propertyService.getProperties({ status: 'all' }).subscribe({
      next: (res: any) => {
        const mine = res.data.filter((p:any) => p.postedBy?._id === this.currentUser()?._id);
        this.myProperties.set(mine);
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  deleteProperty(id: string) {
    if(confirm('Are you sure you want to delete this property?')) {
      this.propertyService.deleteProperty(id).subscribe({
        next: () => {
          this.myProperties.update(props => props.filter(p => p._id !== id));
        }
      });
    }
  }
}
