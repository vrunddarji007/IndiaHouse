import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PropertyService } from '../../services/property.service';
import { MessageService } from '../../services/message.service';
import { AuthService } from '../../services/auth.service';
import { Property, User } from '../../models/interfaces';
import { environment } from '../../../environments/environment';
import { Map, tileLayer, marker, icon, Marker, LatLngExpression, polyline, Polyline } from 'leaflet';

import { SeoService } from '../../services/seo.service';

@Component({
  selector: 'app-property-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="container py-5 mt-4" *ngIf="property()">
      <!-- Header -->
      <div class="d-flex justify-content-between align-items-center border-bottom pb-3 mb-4">
        <div>
          <h1 class="fw-bold mb-1">{{ property()!.title }}</h1>
          <p class="text-muted fs-5 mb-0">
            <i class="bi bi-geo-alt text-primary"></i> 
            <span *ngIf="property()!.village">{{ property()!.village }}, </span><span *ngIf="property()!.town">{{ property()!.town }}, </span>{{ property()!.location }}{{ property()!.state ? ', ' + property()!.state : '' }}
          </p>
          <p class="text-secondary small mb-2" *ngIf="property()!.address"><i class="bi bi-house-door text-secondary"></i> {{ property()!.address }}</p>
          
          <!-- Stars -->
          <div class="d-flex align-items-center gap-1">
            <span class="d-flex align-items-center gap-1" [innerHTML]="getStarsSVG(property()!.averageRating || 0)"></span>
            <span class="text-muted small">
              {{ (property()!.averageRating || 0) | number:'1.1-1' }} ({{ property()!.ratings?.length || 0 }} reviews)
            </span>
          </div>
        </div>
        <div class="text-end">
          <h2 class="text-primary fw-bold mb-1">{{ property()!.price | currency:'INR' }}</h2>
          <span class="badge bg-info p-2 fs-6">{{ property()!.type | titlecase }}</span>
        </div>
      </div>

      <div class="row g-5">
        <!-- Main Content -->
        <div class="col-lg-8">
          <!-- Image Gallery (Carousel) -->
          <div class="mb-5 bg-dark rounded overflow-hidden position-relative" style="height: 400px;" *ngIf="property()!.images?.length">
            <div id="propertyCarousel" class="carousel slide h-100" data-bs-ride="carousel">
              <div class="carousel-inner h-100">
                <div class="carousel-item h-100" *ngFor="let img of property()!.images; let i = index" [class.active]="i === 0">
                  <img [src]="apiBase + img" class="w-100 h-100" style="object-fit: cover; cursor: zoom-in;" alt="Property Image" (click)="openZoom(apiBase + img)">
                </div>
              </div>
              <button class="carousel-control-prev" type="button" data-bs-target="#propertyCarousel" data-bs-slide="prev" *ngIf="property()!.images!.length > 1">
                <span class="carousel-control-prev-icon bg-dark rounded-circle p-3" aria-hidden="true" style="opacity:0.8;"></span>
                <span class="visually-hidden">Previous</span>
              </button>
              <button class="carousel-control-next" type="button" data-bs-target="#propertyCarousel" data-bs-slide="next" *ngIf="property()!.images!.length > 1">
                <span class="carousel-control-next-icon bg-dark rounded-circle p-3" aria-hidden="true" style="opacity:0.8;"></span>
                <span class="visually-hidden">Next</span>
              </button>
            </div>
          </div>
          <div *ngIf="!property()!.images?.length" class="mb-5 bg-dark rounded d-flex align-items-center justify-content-center text-light" style="height: 400px;">
            No images available
          </div>

          <!-- Description -->
          <h4 class="fw-bold mb-3">Description</h4>
          <p class="text-secondary lh-lg mb-5">{{ property()!.description }}</p>

          <!-- Details Grid -->
          <h4 class="fw-bold mb-3">Property Details</h4>
          <div class="card bg-light border-0 mb-5">
            <div class="card-body">
              <div class="row g-3">
                <div class="col-sm-4"><p class="mb-0 text-muted">Type</p><p class="fw-bold">{{ property()!.propertyType }}</p></div>
                <div class="col-sm-4"><p class="mb-0 text-muted">Area</p><p class="fw-bold">{{ property()!.area }} sqft</p></div>
                <div class="col-sm-4"><p class="mb-0 text-muted">Furnishing</p><p class="fw-bold">{{ property()!.furnishing }}</p></div>
                <div class="col-sm-4"><p class="mb-0 text-muted">Bedrooms</p><p class="fw-bold">{{ property()!.bedrooms || '-' }}</p></div>
                <div class="col-sm-4"><p class="mb-0 text-muted">Bathrooms</p><p class="fw-bold">{{ property()!.bathrooms || '-' }}</p></div>
                <div class="col-sm-4"><p class="mb-0 text-muted">Status</p><p class="fw-bold"><span class="badge bg-success">{{ property()!.status | uppercase }}</span></p></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar (Agent Card + Contact + Favorites) -->
        <div class="col-lg-4">
          <div class="card border-0 shadow-sm mb-4">
            <div class="card-body text-center p-4">
              <h5 class="fw-bold mb-3">Posted By</h5>
              <div class="position-relative mb-3 d-inline-block cursor-pointer" [routerLink]="['/profile', property()!.postedBy._id || property()!.postedBy]">
                <img [src]="getImageUrl(property()!.postedBy?.profilePhoto || property()!.postedBy?.profilePic, property()!.postedBy?.name)" 
                     class="rounded-circle shadow-sm border hover-lift" style="width: 90px; height: 90px; object-fit: cover;" alt="Agent Avatar">
              </div>
              <div *ngIf="currentUser(); else loginToView">
                <h5 class="fw-bold mb-1 cursor-pointer text-primary-hover" [routerLink]="['/profile', property()!.postedBy._id || property()!.postedBy]">{{ property()!.postedBy?.name }}</h5>
                <p class="text-muted mb-0"><i class="bi bi-telephone"></i> {{ property()!.postedBy?.phone || 'Hidden' }}</p>
              </div>
              <ng-template #loginToView>
                <h5 class="fw-bold mb-1 text-muted">Agent Info</h5>
                <p class="small text-muted mb-0">Login to see contact details</p>
              </ng-template>
            </div>
          </div>

          <div class="card border-0 shadow-sm bg-light" *ngIf="currentUser()">
            <div class="card-body p-4">
              <h5 class="fw-bold mb-3">Contact Agent</h5>
              <form (ngSubmit)="sendMessage()">
                <div class="mb-3">
                  <textarea class="form-control" rows="4" [(ngModel)]="messageText" name="msg" placeholder="I am interested in this property..." required></textarea>
                </div>
                <button type="submit" class="btn btn-primary w-100 py-2">Send Message</button>
              </form>
            </div>
          </div>
          
          <div class="alert alert-info" *ngIf="!currentUser()">
            Please <a routerLink="/auth/login" class="alert-link">login</a> to contact the agent.
          </div>
          
          <div class="d-grid gap-2 mt-4">
             <button class="btn btn-lg" [ngClass]="isFavorite ? 'btn-danger' : 'btn-outline-danger'" (click)="toggleFavorite()">
               <i class="bi" [ngClass]="isFavorite ? 'bi-heart-fill' : 'bi-heart'"></i> 
               {{ isFavorite ? 'Favorited' : 'Add to Favorites' }}
             </button>
             <button class="btn btn-lg btn-outline-success" (click)="shareProperty()">
               <i class="bi bi-share"></i> Share Property
             </button>
          </div>
        </div>
      </div>

      <!-- ===== FULL-WIDTH Location Section (outside the 2-col layout) ===== -->
      <div class="mb-3">
         <h4 class="fw-bold mb-0">Location</h4>
      </div>

      <div class="row g-3 mb-5">
        <div [ngClass]="routeInfo ? 'col-lg-4' : 'col-lg-8'">
          <div id="map" class="rounded shadow-sm border position-relative" style="height: 450px; z-index: 1;">
             <div class="position-absolute top-0 end-0 m-3 d-flex flex-column gap-2" style="z-index: 1000;">
                <button class="btn btn-white shadow-sm btn-sm rounded" title="Get Directions" (click)="openInGoogleMaps()">
                  <i class="bi bi-signpost-2 fs-5"></i>
                </button>
             </div>
          </div>
        </div>
        
        <div class="col-lg-4">
          <div class="card border-0 bg-light h-100 shadow-sm">
            <div class="card-body p-4 d-flex flex-column justify-content-between">
               <div>
                  <h6 class="text-forest fw-bold mb-3 small d-flex align-items-center gap-2">
                    <i class="bi bi-info-circle-fill"></i> FULL ADDRESS
                  </h6>
                  <p class="text-dark fw-bold mb-2 fs-5" style="line-height: 1.4;">{{ property()!.address || 'N/A' }}</p>
                  <div class="mb-3 d-flex flex-wrap gap-2">
                    <span class="badge bg-white text-dark border p-2" *ngIf="property()!.village"><i class="bi bi-house-door text-forest me-1"></i>Village: {{ property()!.village }}</span>
                    <span class="badge bg-white text-dark border p-2" *ngIf="property()!.town"><i class="bi bi-building text-forest me-1"></i>Town: {{ property()!.town }}</span>
                    <span class="badge bg-white text-dark border p-2"><i class="bi bi-geo-alt text-forest me-1"></i>{{ property()!.location }}</span>
                    <span class="badge bg-white text-dark border p-2" *ngIf="property()!.state"><i class="bi bi-map text-forest me-1"></i>{{ property()!.state }}</span>
                  </div>
                  
                  <div *ngIf="property()!.nearbyLandmarks?.length" class="mt-4">
                    <h6 class="text-muted small fw-bold mb-2">NEARBY LANDMARKS</h6>
                    <ul class="list-unstyled mb-0">
                       <li *ngFor="let m of property()!.nearbyLandmarks" class="text-secondary small mb-1">
                         <i class="bi bi-check2 text-success me-2"></i>{{ m }}
                       </li>
                    </ul>
                  </div>
               </div>

               <div class="mt-4 d-grid gap-2">
                  <button class="btn btn-forest py-2 rounded-pill fw-bold text-white d-flex align-items-center justify-content-center gap-2" (click)="toggleUserLocation()">
                    <i class="bi bi-geo-alt-fill"></i> 📍 Use My Live Location
                  </button>
                  <button class="btn btn-forest py-2 rounded-pill fw-bold text-white d-flex align-items-center justify-content-center gap-2" (click)="openInGoogleMaps()">
                    <i class="bi bi-google"></i> Directions 
                  </button>
               </div>
            </div>
          </div>
        </div>

        <!-- Route Panel (appears as 3rd column when active) -->
        <div class="col-lg-4" *ngIf="routeInfo">
          <div class="card border-0 bg-light h-100 shadow-sm">
            <div class="card-body p-3 d-flex flex-column">
               <!-- Distance & Time -->
               <div class="row g-0 rounded shadow-sm overflow-hidden border mb-3">
                  <div class="col-6 bg-white text-center py-3 border-end">
                     <span class="text-muted small d-block">Km</span>
                     <h3 class="text-danger fw-bold mb-0">{{ (routeInfo.distance / 1000).toFixed(1) }}</h3>
                     <span class="text-secondary small">Distance</span>
                  </div>
                  <div class="col-6 bg-white text-center py-3">
                     <span class="text-muted small d-block">Hr</span>
                     <h3 class="text-danger fw-bold mb-0">{{ formatTime(routeInfo.duration) }}</h3>
                     <span class="text-secondary small">Time</span>
                  </div>
               </div>

               <!-- Itinerary -->
               <h6 class="text-muted small fw-bold mb-3 d-flex align-items-center gap-2">
                 <i class="bi bi-sign-turn-right-fill text-danger"></i> ROUTE ITINERARY
               </h6>
               <div class="custom-scrollbar waypoint-list flex-grow-1" style="max-height: 280px; overflow-y: auto;">
                  <div *ngFor="let step of routeInfo.steps; let i = index" class="waypoint-item d-flex gap-3 mb-3 position-relative">
                     <div class="marker-line" *ngIf="i < routeInfo.steps.length - 1"></div>
                     <div class="waypoint-marker">
                       <i class="bi bi-circle text-danger"></i>
                     </div>
                     <div class="waypoint-content">
                       <p class="mb-0 fw-bold small text-dark">{{ step.name || 'Unnamed Road' }}</p>
                       <small class="text-secondary d-block" style="font-size: 0.7rem;">{{ step.instruction }}</small>
                     </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ===== Reviews Section (Full Width) ===== -->
      <h4 class="fw-bold mb-3">Reviews & Ratings</h4>
      <div class="card border-0 shadow-sm mb-5">
        <div class="card-body">
          <div *ngIf="currentUser()" class="mb-4 pb-4 border-bottom">
            <div *ngIf="hasReachedReviewLimit()">
              <div class="alert alert-warning mb-0" role="alert">
                <i class="bi bi-info-circle-fill me-2"></i> You have reached the maximum limit of 3 review submissions for this property.
              </div>
            </div>
            <div *ngIf="!hasReachedReviewLimit()">
              <h6 class="fw-bold">Leave a Review</h6>
              <div class="d-flex align-items-center gap-2 mb-3">
                <span class="text-muted">Your Rating:</span>
                <div class="d-flex align-items-center bg-light px-3 py-1 rounded" style="gap: 5px;">
                    <svg *ngFor="let s of [1,2,3,4,5]" width="24" height="24" viewBox="0 0 24 24" [attr.fill]="s <= newRating ? '#ffc107' : 'none'" [attr.stroke]="s <= newRating ? '#ffc107' : '#ced4da'" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="cursor: pointer;" (click)="newRating = s">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                    </svg>
                </div>
              </div>
              <div class="mb-3">
                <textarea class="form-control" rows="2" [(ngModel)]="newReview" placeholder="Share your experience..."></textarea>
              </div>
              <button class="btn btn-primary btn-sm px-4 rounded-pill" (click)="submitRating()" [disabled]="newRating === 0 || ratingLoading">
                <span *ngIf="ratingLoading" class="spinner-border spinner-border-sm me-2"></span>
                Submit Review
              </button>
            </div>
          </div>

          <div *ngIf="property()!.ratings?.length; else noReviews">
            <div *ngFor="let rat of property()!.ratings!.slice().reverse()" class="card border border-light mb-4 rounded-4">
              <div class="card-body p-4">
                <!-- User Info & Stars Header -->
                <div class="d-flex justify-content-between align-items-start mb-4">
                  <div class="d-flex align-items-center gap-3">
                    <img [src]="getImageUrl(rat.user?.profilePhoto || rat.user?.profilePic, rat.user?.name)" 
                         class="rounded-circle shadow-sm" style="width: 55px; height: 55px; object-fit: cover;" alt="Reviewer">
                    <div>
                      <h5 class="fw-bold text-forest mb-1">{{ rat.user?.name || 'User' }}</h5>
                      <div class="d-flex align-items-center gap-1">
                        <svg *ngFor="let s of [1,2,3,4,5]" width="18" height="18" viewBox="0 0 24 24" 
                          [attr.fill]="s <= rat.rating ? '#ffc107' : 'none'" 
                          [attr.stroke]="s <= rat.rating ? '#ffc107' : '#ced4da'" 
                          stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                        </svg>
                      </div>
                    </div>
                  </div>
                  <!-- Date & Actions -->
                  <div class="d-flex flex-column align-items-end gap-2">
                    <span class="badge rounded-pill fw-normal px-3 py-2 text-secondary" style="border: 1px solid #dee2e6; background: transparent; font-size: 0.85rem;">
                      {{ rat.date | date:'MMM d, yyyy' }}
                    </span>
                    <button *ngIf="isOwnReview(rat)" class="btn btn-sm text-danger p-0 d-flex align-items-center bg-transparent border-0" style="opacity: 0.7; transition: opacity 0.2s;" onmouseover="this.style.opacity=1" onmouseout="this.style.opacity=0.7" (click)="deleteReview(rat)" title="Delete your review">
                      <i class="bi bi-trash fs-6"></i> <span class="ms-1" style="font-size: 0.8rem;">Delete</span>
                    </button>
                  </div>
                </div>

                <!-- Review Text Box -->
                <div class="review-text-box">
                  <p class="mb-0 fs-6 text-dark fst-italic fw-medium" style="font-family: 'Inter', sans-serif;">
                    "{{ rat.review }}"
                  </p>
                </div>
                
                <!-- Like Button Footer (subtle) -->
                <div class="text-end mt-2">
                  <button class="btn btn-sm btn-link text-decoration-none p-0" 
                    [ngClass]="isReviewLiked(rat) ? 'text-primary' : 'text-secondary'"
                    (click)="toggleReviewLike(rat)">
                    <i class="bi" [ngClass]="isReviewLiked(rat) ? 'bi-hand-thumbs-up-fill' : 'bi-hand-thumbs-up'"></i>
                    <span class="ms-1" style="font-size: 0.85rem;">{{ rat.likes?.length || 0 }}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
          <ng-template #noReviews>
            <p class="text-muted">No reviews yet. Be the first to review!</p>
          </ng-template>
        </div>
      </div>
    </div>
    
    <div *ngIf="!property() && !loading" class="text-center py-5">
      <h3 class="text-muted">Property not found</h3>
    </div>

    <!-- Zoom Modal (Lightbox) -->
    <div class="modal fade" [class.show]="zoomImage" [style.display]="zoomImage ? 'block' : 'none'" tabindex="-1" style="background: rgba(0,0,0,0.9);">
      <div class="modal-dialog modal-fullscreen">
        <div class="modal-content bg-transparent border-0">
          <div class="modal-header border-0">
            <button type="button" class="btn-close btn-close-white" aria-label="Close" (click)="closeZoom()"></button>
          </div>
          <div class="modal-body d-flex align-items-center justify-content-center p-0" (click)="closeZoom()">
            <img *ngIf="zoomImage" [src]="zoomImage" class="img-fluid" style="max-height: 90vh; max-width: 90vw; object-fit: contain;" alt="Zoomed property">
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .cursor-pointer { cursor: pointer; }
    .text-white {
        --bs-text-opacity: 1 !important;
        color: #fff !important;
    }
    .btn-forest { background: hsla(130, 98%, 21%, 1.00) !important; color: white !important; border: none; }
    .btn-forest:hover { background: #013c1bff !important; transform: translateY(-1px); }
    .text-forest { color: #003332 !important; }
    .btn-white { background: white; border: 1px solid rgba(0,0,0,0.1); color: #333; }
    .btn-white:hover { background: #f8f9fa; }
    .btn-outline-forest { border: 1.5px solid #003332; color: #003332; font-weight: 600; }
    .btn-outline-forest:hover { background: #003332; color: white; }
    @keyframes pulse-me {
      0% { transform: scale(1); opacity: 0.8; }
      100% { transform: scale(2.5); opacity: 0; }
    }
    .user-loc-dot { position: relative; }
    .user-loc-dot::after {
      content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 100%;
      background: #0d6efd; border-radius: 50%; animation: pulse-me 1.5s infinite ease-out;
    }
    .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.2); border-radius: 10px; }
    .waypoint-list { padding-left: 5px; }
    .waypoint-item { position: relative; }
    .waypoint-marker { z-index: 2; background: #f8f9fa; }
    .marker-line { 
      position: absolute; left: 7px; top: 15px; bottom: -15px; 
      width: 2px; background: #dee2e6; z-index: 1; 
    }
    .review-text-box {
      background-color: #8fffaa1a !important;
      transition: background-color 0.4s ease;
      border-left: 5px solid #066f14 !important;
      border-radius: 8px;
      padding: 1.25rem 1.5rem;
    }
  `]
})
export class PropertyDetailComponent implements OnInit {
  property = signal<Property | null>(null);
  loading = true;
  apiBase = environment.apiUrl.replace('/api', '');
  messageText = '';
  currentUser = signal<User | null>(null);
  mapInstance!: Map;
  userMarker: Marker | null = null;
  routePolyline: Polyline | null = null;
  routeInfo: any = null;

  zoomImage: string | null = null;
  newRating = 0;
  newReview = '';
  ratingLoading = false;
  isFavorite = false;

  constructor(
    private propertyService: PropertyService,
    private messageService: MessageService,
    public authService: AuthService,
    private seoService: SeoService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.authService.currentUser.subscribe(user => this.currentUser.set(user));
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.loadProperty(params['slug']);
    });
  }

  loadProperty(slug: string) {
    this.propertyService.getPropertyBySlug(slug).subscribe({
      next: (res) => {
        const prop = res.data;
        this.property.set(prop);
        this.loading = false;
        
        // SEO Dynamic Metadata Injection
        this.seoService.updateTags({
          title: `${prop.bedrooms ? prop.bedrooms + 'BHK ' : ''}${prop.propertyType} in ${prop.location}`,
          description: prop.description?.substring(0, 160) + '...',
          image: this.apiBase + (prop.images?.[0] || '/assets/default-property.jpg'),
          url: window.location.href,
          type: 'article'
        });

        // Setup initial favorite state
        const userFavs = this.currentUser()?.favorites || [];
        this.isFavorite = userFavs.includes(prop._id);

        setTimeout(() => this.initMap(), 100);
      },
      error: () => {
        this.loading = false;
        this.seoService.resetDefaultTags();
      }
    });
  }

  initMap() {
    const prop = this.property();
    if (!prop) return;
    
    // Default to Center of India
    const lat = prop.lat || 20.5937; 
    const lng = prop.lng || 78.9629; 

    if (this.mapInstance) {
      this.mapInstance.remove();
    }
    this.mapInstance = new Map('map').setView([lat, lng], prop.lat ? 18 : 5);
    // Use Google Hybrid/Satellite maps for building visibility
    tileLayer('https://{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
      maxZoom: 20,
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
      attribution: '&copy; Google Maps'
    }).addTo(this.mapInstance);

    const markerIcon = icon({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41]
    });

    marker([lat, lng], { icon: markerIcon }).addTo(this.mapInstance);
  }

  toggleUserLocation() {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const curLatLng: LatLngExpression = [latitude, longitude];

        if (this.userMarker) {
          this.userMarker.setLatLng(curLatLng);
        } else {
          const userIcon = icon({
            iconUrl: 'https://cdn-icons-png.flaticon.com/512/2944/2944068.png', 
            iconSize: [35, 35],
            iconAnchor: [17, 35]
          });
          this.userMarker = marker(curLatLng, { icon: userIcon }).addTo(this.mapInstance);
        }

        this.mapInstance.setView(curLatLng, 16);
        this.fetchRoute(curLatLng);
      },
      (err) => {
        alert('Could not get your location. Please check browser permissions.');
      }
    );
  }

  fetchRoute(userLatLng: LatLngExpression) {
    const prop = this.property();
    if (!prop || !prop.lat || !prop.lng) return;

    const user = userLatLng as [number, number];
    const url = `https://router.project-osrm.org/route/v1/driving/${user[1]},${user[0]};${prop.lng},${prop.lat}?overview=full&geometries=geojson&steps=true`;

    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (data.routes && data.routes[0]) {
          const route = data.routes[0];

          // Draw polyline first
          if (this.routePolyline) this.mapInstance.removeLayer(this.routePolyline);
          const coords = route.geometry.coordinates.map((c: any) => [c[1], c[0]]);
          this.routePolyline = polyline(coords, { color: '#0d6efd', weight: 6, opacity: 0.8 }).addTo(this.mapInstance);
          this.mapInstance.fitBounds(this.routePolyline.getBounds(), { padding: [50, 50] });

          // Set basic info first, then resolve city names
          this.routeInfo = {
            distance: route.distance,
            duration: route.duration,
            steps: [{ name: 'Loading cities...', instruction: '' }]
          };

          // Resolve city names along the route
          this.resolveCityNames(route.geometry.coordinates, route.distance, route.duration);
        }
      })
      .catch(err => console.error('Route Fetch Error:', err));
  }

  async resolveCityNames(routeCoords: any[], distance: number, duration: number) {
    const totalPoints = routeCoords.length;
    const sampleCount = Math.min(12, Math.max(4, Math.floor(totalPoints / 25)));
    const interval = Math.floor(totalPoints / sampleCount);
    const sampled: any[] = [];
    for (let i = 0; i < totalPoints; i += interval) {
      sampled.push(routeCoords[i]);
    }
    sampled.push(routeCoords[totalPoints - 1]);

    try {
      // BigDataCloud is free, no rate limit, no API key needed
      const results = await Promise.all(
        sampled.map(coord =>
          fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${coord[1]}&longitude=${coord[0]}&localityLanguage=en`)
            .then(r => r.json())
            .catch(() => null)
        )
      );

      const citySet = new Set<string>();
      const cities: { name: string; instruction: string }[] = [];

      for (const data of results) {
        if (!data) continue;
        const city = data.city || data.locality || data.principalSubdivision || '';
        if (city && !citySet.has(city)) {
          citySet.add(city);
          cities.push({ name: city, instruction: data.principalSubdivision || '' });
        }
      }

      const prop = this.property();
      this.routeInfo = {
        distance,
        duration,
        steps: cities.length > 0 ? cities : [{ name: prop?.location || 'Destination', instruction: prop?.state || '' }]
      };
    } catch (e) {
      const prop = this.property();
      this.routeInfo = {
        distance,
        duration,
        steps: [{ name: prop?.location || 'Destination', instruction: prop?.state || '' }]
      };
    }
  }

  formatTime(seconds: number): string {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.ceil((seconds % 3600) / 60);
    if (hrs > 0) return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:00`;
    return `00:${mins.toString().padStart(2, '0')}:00`;
  }

  openInGoogleMaps() {
    const prop = this.property();
    if (!prop) return;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${prop.lat},${prop.lng}`;
    window.open(url, '_blank');
  }

  getStarsSVG(rating: number): string {
    const full = Math.floor(rating);
    const hasHalf = rating - full >= 0.5;
    const empty = 5 - full - (hasHalf ? 1 : 0);
    
    let html = '';
    // Full stars
    for(let i=0; i<full; i++) html += '<svg width="16" height="16" viewBox="0 0 24 24" fill="#ffc107" stroke="#ffc107" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>';
    // Half star
    if(hasHalf) html += '<svg width="16" height="16" viewBox="0 0 24 24" fill="url(#halfGrad)" stroke="#ffc107" stroke-width="2"><defs><linearGradient id="halfGrad"><stop offset="50%" stop-color="#ffc107"/><stop offset="50%" stop-color="transparent" stop-opacity="1"/></linearGradient></defs><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>';
    // Empty stars
    for(let i=0; i<empty; i++) html += '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ced4da" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>';
    
    return html;
  }

  openZoom(imgUrl: string) {
    this.zoomImage = imgUrl;
  }

  closeZoom() {
    this.zoomImage = null;
  }

  hasReachedReviewLimit(): boolean {
    const user = this.currentUser();
    const prop = this.property();
    if (!user || (!user._id && !(user as any).id) || !prop || !prop.ratings) return false;
    
    const userId = user._id || (user as any).id;

    // Check total number of separate reviews submitted by this user
    let userReviewsCount = 0;
    for (const r of prop.ratings) {
      if (!r.user) continue;
      const rId = typeof r.user === 'string' ? r.user : ((r.user as any)._id || (r.user as any).id);
      if (rId && rId.toString() === userId.toString()) {
        userReviewsCount++;
      }
    }
    
    return userReviewsCount >= 3;
  }

  submitRating() {
    if (!this.newRating || !this.property()) return;
    this.ratingLoading = true;
    
    this.propertyService.rateProperty(this.property()!._id!, this.newRating, this.newReview).subscribe({
      next: (res) => {
        this.property.set(res.data);
        this.newRating = 0;
        this.newReview = '';
        this.ratingLoading = false;
        alert('Thank you for rating this property!');
      },
      error: (err) => {
        this.ratingLoading = false;
        alert(err.error?.message || err.error?.error || 'Error submitting rating');
      }
    });
  }

  isOwnReview(rat: any): boolean {
    const user = this.currentUser();
    if (!user || !rat.user) return false;
    const userId = user._id || (user as any).id;
    const rId = typeof rat.user === 'string' ? rat.user : ((rat.user as any)._id || (rat.user as any).id);
    return userId && rId && userId.toString() === rId.toString();
  }

  deleteReview(rat: any) {
    if (!confirm('Are you sure you want to delete this review?')) return;
    this.propertyService.deleteReview(this.property()!._id!, rat._id).subscribe({
      next: (res) => {
        this.property.set(res.data);
      },
      error: (err) => {
        alert(err.error?.message || err.error?.error || 'Error deleting review');
      }
    });
  }

  sendMessage() {
    if (!this.messageText.trim()) return;
    
    const prop = this.property();
    if (!prop) return;

    const recipientId = prop.postedBy._id || prop.postedBy;
    this.messageService.sendMessage(prop._id!, recipientId, this.messageText).subscribe({
      next: () => {
        alert('Message sent successfully!');
        this.messageText = '';
      },
      error: (err) => {
        console.error('Send Error:', err);
        alert(err.error?.message || 'Failed to send message');
      }
    });
  }

  async shareProperty() {
    if (!this.property()) return;
    const url = window.location.href;
    const shareData = {
      title: this.property()!.title,
      text: `Check out this amazing property: ${this.property()!.title}`,
      url: url
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        navigator.clipboard.writeText(url);
        alert('Link copied to clipboard!');
      }
    } catch (err) {
      console.error('Error sharing property:', err);
    }
  }

  toggleFavorite() {
    const prop = this.property();
    if (!prop) return;

    this.propertyService.toggleFavorite(prop._id!).subscribe({
      next: () => {
        this.isFavorite = !this.isFavorite;
        
        // Persist to local storage so it survives refresh
        const user = this.currentUser();
        if (user) {
          const favs = user.favorites || [];
          const newFavs = favs.includes(prop._id!) 
            ? favs.filter(fid => fid !== prop._id!) 
            : [...favs, prop._id!];
          this.authService.updateCurrentUser({ favorites: newFavs });
        }
      },
      error: () => alert('Please login to add favorites.')
    });
  }

  isReviewLiked(rat: any): boolean {
    const user = this.currentUser();
    if (!user || !user._id || !rat.likes) return false;
    return rat.likes.includes(user._id);
  }

  toggleReviewLike(rat: any) {
    const prop = this.property();
    const user = this.currentUser();
    if (!prop || !user || !user._id) {
      alert('Please login to like reviews.');
      return;
    }

    if (!rat._id) return; 

    this.propertyService.likeReview(prop._id!, rat._id).subscribe({
      next: (res) => {
        const likes = rat.likes || [];
        if (likes.includes(user._id!)) {
          rat.likes = likes.filter((id: string) => id !== user._id!);
        } else {
          rat.likes = [...likes, user._id!];
        }
      },
      error: () => alert('Failed to toggle like on review.')
    });
  }

  getImageUrl(path: string | undefined, name?: string): string {
    if (!path || path === '') {
      const initials = name ? encodeURIComponent(name) : 'User';
      return `https://ui-avatars.com/api/?name=${initials}&background=0d6efd&color=fff`;
    }
    if (path.startsWith('http')) return path;
    const base = environment.apiUrl.replace('/api', '');
    return path.startsWith('/') ? `${base}${path}` : `${base}/${path}`;
  }
}
