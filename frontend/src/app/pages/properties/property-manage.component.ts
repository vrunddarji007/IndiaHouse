import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { PropertyService } from '../../services/property.service';
import { environment } from '../../../environments/environment';

// Last updated: 2026-03-27 05:47 AM - Resolving cache issues.

@Component({
  selector: 'app-property-manage',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container py-5 mt-4 min-vh-100">
      <div *ngIf="loading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>

      <div *ngIf="!loading && property" class="animate-fade-in">
        <!-- Header Section -->
        <div class="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
          <div>
            <nav aria-label="breadcrumb">
              <ol class="breadcrumb mb-2">
                <li class="breadcrumb-item"><a routerLink="/dashboard" class="text-decoration-none text-muted">Dashboard</a></li>
                <li class="breadcrumb-item active">Manage Listing</li>
              </ol>
            </nav>
            <h2 class="fw-bold mb-0 text-forest">{{ property.title }}</h2>
            <p class="text-muted mb-0"><i class="bi bi-geo-alt me-1"></i> {{ property.location }}{{ property.state ? ', ' + property.state : '' }}</p>
          </div>
          <div class="d-flex gap-2 flex-wrap">
            <button class="btn rounded-pill px-4 transition-all" 
                    [ngClass]="property.status === 'sold/rented' ? 'btn-outline-success' : 'btn-outline-yellow'"
                    (click)="toggleStatus()">
              <i class="bi me-2" [ngClass]="property.status === 'sold/rented' ? 'bi-check-circle' : 'bi-dash-circle'"></i>
              {{ property.status === 'sold/rented' ? 'Mark Active' : (property.type === 'rent' ? 'Mark Rented Out' : 'Mark Sold Out') }}
            </button>
            <button class="btn btn-outline-danger rounded-pill px-4" (click)="deleteListing()">
              <i class="bi bi-trash me-2"></i>Delete
            </button>
            <button class="btn btn-forest rounded-pill px-4 text-white shadow-sm shimmer" (click)="shareListing()">
              <i class="bi bi-share me-2"></i>Share Listing
            </button>
          </div>
        </div>

        <!-- Stats Overview Cards -->
        <div class="row g-4 mb-5">
          <div class="col-md-3">
            <div class="card border-0 shadow-sm rounded-4 p-3 bg-white h-100">
              <div class="d-flex align-items-center mb-2">
                <div class="rounded-circle bg-light-primary p-2 me-3">
                  <i class="bi bi-eye text-primary fs-4"></i>
                </div>
                <span class="text-muted small">Total Views</span>
              </div>
              <h3 class="fw-bold mb-0">{{ property.views || 0 }}</h3>
            </div>
          </div>
          <div class="col-md-3">
             <div class="card border-0 shadow-sm rounded-4 p-3 bg-white h-100">
              <div class="d-flex align-items-center mb-2">
                <div class="rounded-circle bg-light-danger p-2 me-3">
                  <i class="bi bi-envelope-heart text-danger fs-4"></i>
                </div>
                <span class="text-muted small">Buyer Inquiries</span>
              </div>
              <h3 class="fw-bold mb-0">{{ inquiries?.length || 0 }}</h3>
            </div>
          </div>
          <div class="col-md-3">
             <div class="card border-0 shadow-sm rounded-4 p-3 bg-white h-100">
              <div class="d-flex align-items-center mb-2">
                <div class="rounded-circle bg-light-warning p-2 me-3">
                  <i class="bi bi-star-fill text-warning fs-4"></i>
                </div>
                <span class="text-muted small">Avg Rating</span>
              </div>
              <h3 class="fw-bold mb-0">{{ property.averageRating || 0 | number:'1.1-1' }}</h3>
            </div>
          </div>
          <div class="col-md-3">
             <div class="card border-0 shadow-sm rounded-4 p-3 bg-white h-100">
              <div class="d-flex align-items-center mb-2">
                <div class="rounded-circle bg-light-success p-2 me-3">
                  <i class="bi bi-chat-text text-success fs-4"></i>
                </div>
                <span class="text-muted small">Reviews</span>
              </div>
              <h3 class="fw-bold mb-0">{{ property.ratings?.length || 0 }}</h3>
            </div>
          </div>
        </div>

        <!-- Main Content Area with Vertical Tabs -->
        <div class="row">
          <div class="col-lg-3">
            <div class="nav flex-column nav-pills custom-pills shadow-sm rounded-4 p-2 bg-white mb-4" id="v-pills-tab" role="tablist">
              <button class="nav-link text-start py-3 mb-1" (click)="setActiveTab('inquiries')" [class.active]="activeTab === 'inquiries'">
                <i class="bi bi-chat-left-dots me-2"></i> Buyer Inquiries
              </button>
              <button class="nav-link text-start py-3 mb-1" (click)="setActiveTab('reviews')" [class.active]="activeTab === 'reviews'">
                <i class="bi bi-star me-2"></i> User Feedback
              </button>
              <button class="nav-link text-start py-3 mb-1" (click)="setActiveTab('details')" [class.active]="activeTab === 'details'">
                <i class="bi bi-info-circle me-2"></i> Post Overview
              </button>
            </div>
          </div>

          <div class="col-lg-9">
            <div class="card border-0 shadow-sm rounded-4 p-4 p-md-5 bg-white mb-5 transition-all" style="min-height: 400px;">
              
              <!-- Tab: Buyer Inquiries -->
              <div *ngIf="activeTab === 'inquiries'" class="animate-fade-in">
                <div class="d-flex justify-content-between align-items-center mb-4">
                  <h4 class="fw-bold mb-0">Direct Inquiries</h4>
                  <span class="badge bg-forest rounded-pill px-3">{{ inquiries?.length || 0 }} Leads</span>
                </div>
                
                <div *ngIf="inquiries?.length === 0" class="text-center py-5 opacity-50">
                  <i class="bi bi-chat-square-dots display-1 mb-3"></i>
                  <p>No buyers have messaged you about this property yet.</p>
                </div>

                <div class="list-group list-group-flush" *ngIf="inquiries?.length > 0">
                  <div class="list-group-item px-0 py-3 border-bottom bg-light-hover rounded-3 px-3 mb-2" *ngFor="let inq of inquiries">
                    <div class="d-flex align-items-center">
                      <div class="cursor-pointer" [routerLink]="['/profile', inq.user?._id]">
                        <img [src]="inq.user?.profilePhoto || inq.user?.profilePic ? apiBase + (inq.user?.profilePhoto || inq.user?.profilePic) : 'https://ui-avatars.com/api/?name=' + inq.user?.name + '&background=096a4d&color=fff'" 
                           class="rounded-circle me-3 border hover-lift" style="width: 50px; height: 50px; object-fit: cover;">
                      </div>
                      <div class="flex-grow-1">
                        <div class="d-flex justify-content-between align-items-start">
                          <h6 class="fw-bold mb-0 text-forest cursor-pointer text-primary-hover" [routerLink]="['/profile', inq.user?._id]">{{ inq.user?.name }}</h6>
                          <span class="extra-small text-muted">{{ inq.date | date:'shortTime' }} • {{ inq.date | date:'mediumDate' }}</span>
                        </div>
                        <p class="text-muted small mb-0 text-truncate" style="max-width: 400px;">"{{ inq.lastMessage }}"</p>
                        <div class="d-flex gap-3 mt-2">
                           <a [href]="'mailto:' + inq.user?.email" class="extra-small text-decoration-none text-muted hover-forest"><i class="bi bi-envelope me-1"></i>Email</a>
                           <a [href]="'tel:' + inq.user?.phone" class="extra-small text-decoration-none text-muted hover-forest"><i class="bi bi-phone me-1"></i>Call</a>
                           <a [routerLink]="['/messages']" [queryParams]="{ user: inq.user?._id }" class="extra-small text-decoration-none text-primary fw-bold hover-forest"><i class="bi bi-chat me-1"></i>Reply in Inbox</a>
                        </div>
                      </div>
                      <a [href]="'https://wa.me/' + inq.user?.phone" target="_blank" class="btn btn-link text-success p-0 fs-3">
                        <i class="bi bi-whatsapp"></i>
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Tab: Ratings -->
              <div *ngIf="activeTab === 'reviews'" class="animate-fade-in">
                <h4 class="fw-bold mb-4">User Feedback</h4>
                <div *ngIf="property.ratings?.length === 0" class="text-center py-5 opacity-50">
                  <i class="bi bi-chat-square-quote display-1 mb-3"></i>
                  <p>No ratings yet for this property.</p>
                </div>
                <div class="d-flex flex-column gap-3">
                  <div class="card border border-light shadow-green mb-2 rounded-4" *ngFor="let r of property.ratings.slice().reverse()">
                    <div class="card-body p-4">
                      <!-- User Info & Stars Header -->
                      <div class="d-flex justify-content-between align-items-start mb-4">
                        <div class="d-flex align-items-center gap-3">
                          <img [src]="r.user?.profilePhoto || r.user?.profilePic ? apiBase + (r.user?.profilePhoto || r.user?.profilePic) : 'https://ui-avatars.com/api/?name=' + r.user?.name + '&background=096a4d&color=fff'" 
                               class="rounded-circle shadow-sm" style="width: 55px; height: 55px; object-fit: cover;" alt="Reviewer">
                          <div>
                            <h5 class="fw-bold text-forest mb-1 cursor-pointer text-primary-hover" [routerLink]="['/profile', r.user?._id]">{{ r.user?.name || 'User' }}</h5>
                            <div class="d-flex align-items-center gap-1">
                              <svg *ngFor="let s of [1,2,3,4,5]" width="18" height="18" viewBox="0 0 24 24" 
                                [attr.fill]="s <= r.rating ? '#ffc107' : 'none'" 
                                [attr.stroke]="s <= r.rating ? '#ffc107' : '#ced4da'" 
                                stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                              </svg>
                            </div>
                          </div>
                        </div>
                        <!-- Date Badge -->
                        <div class="d-flex flex-column align-items-end gap-2">
                          <span class="badge rounded-pill fw-normal px-3 py-2 text-secondary" style="border: 1px solid #dee2e6; background: transparent; font-size: 0.85rem;">
                            {{ r.date | date:'MMM d, yyyy' }}
                          </span>
                        </div>
                      </div>

                      <!-- Review Text Box -->
                      <div class="review-text-box">
                        <p class="mb-0 fs-6 text-dark fst-italic fw-medium" style="font-family: 'Inter', sans-serif;">
                          "{{ r.review || 'No comment provided.' }}"
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Tab: Details -->
              <div *ngIf="activeTab === 'details'" class="animate-fade-in">
                <h4 class="fw-bold mb-4">Post Summary</h4>
                <div class="row g-4">
                  <div class="col-md-6 text-center border-end">
                    <label class="text-muted small d-block mb-1">Price</label>
                    <p class="fw-bold text-forest fs-4">{{ property.price | currency:'INR' }}</p>
                  </div>
                  <div class="col-md-6 text-center">
                    <label class="text-muted small d-block mb-1">Status</label>
                    <span class="badge rounded-pill fw-normal px-4 py-2" 
                        [ngClass]="property.status === 'active' ? 'bg-success' : 'bg-warning text-dark'">
                        {{ property.status | uppercase }}
                    </span>
                  </div>
                  <div class="col-12 mt-4 text-center border-top pt-4" *ngIf="property.lat && property.lng">
                    <label class="text-muted small d-block mb-1 fw-bold">GPS COORDINATES</label>
                    <code class="text-forest">{{ property.lat | number:'1.4-4' }}, {{ property.lng | number:'1.4-4' }}</code>
                  </div>
                  <div class="col-12 mt-4 bg-light p-4 rounded-4">
                     <label class="text-muted small d-block mb-2 fw-bold">DESCRIPTION</label>
                     <p class="text-secondary small mb-0">{{ property.description }}</p>
                  </div>
                </div>
                <div class="mt-5 pt-3">
                  <a [routerLink]="['/properties', property.slug]" target="_blank" class="btn btn-outline-forest rounded-pill px-4 btn-sm">
                    Open Public Listing <i class="bi bi-arrow-up-right ms-1"></i>
                  </a>
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .text-forest { color: #096a4d; }
    .bg-forest { background: #096a4d; color: white; }
    .btn-forest { background: #096a4d; border-color: #096a4d; }
    .btn-outline-forest { color: #096a4d; border-color: #096a4d; }
    .bg-light-primary { background: rgba(13, 110, 253, 0.1); }
    .bg-light-danger { background: rgba(220, 53, 69, 0.1); }
    .bg-light-warning { background: rgba(255, 193, 7, 0.1); }
    .bg-light-success { background: rgba(25, 135, 84, 0.1); }
    .btn-outline-yellow {
      color: #fff707;
      border: 1px solid #fff707;
      background: transparent;
    }
    .btn-outline-yellow:hover {
      background: #fff707;
      color: #000;
    }
    .shadow-green {
      box-shadow: 0 6px 20px rgba(83, 212, 173, 0.23) !important;
    }
    .custom-pills .nav-link { 
      color: #6c757d; 
      border-radius: 12px;
      margin-bottom: 5px;
      transition: all 0.2s;
      border: none;
      background: none;
    }
    .custom-pills .nav-link:hover {
      background: #f8f9fa;
    }
    .review-text-box {
      background-color: #8fffaa1a !important;
      transition: background-color 0.4s ease;
      border-left: 5px solid #066f14 !important;
      border-radius: 8px;
      padding: 1.25rem 1.5rem;
    }
    .custom-pills .nav-link.active {
      background: #096a4d !important;
      color: white !important;
      box-shadow: 0 4px 12px rgba(9, 106, 77, 0.2);
    }
    .bg-light-hover:hover { background: #f8f9fa; transform: translateY(-2px); }
    .transition-all { transition: all 0.3s ease; }
    .animate-fade-in { animation: fadeIn 0.4s ease-out; }
    .hover-forest:hover { color: #096a4d !important; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    .extra-small { font-size: 0.75rem; }
  `]
})
export class PropertyManageComponent implements OnInit {
  property: any = null;
  inquiries: any = [];
  loading = true;
  activeTab = 'inquiries';
  apiBase = environment.apiUrl.replace('/api', '');

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private propertyService: PropertyService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.params['id'];
    this.loadData(id);
  }

  loadData(id: string) {
    this.loading = true;
    
    // 1. Get Property Details (Public Info using ID-based endpoint)
    this.propertyService.getPropertyById(id).subscribe({
      next: (res: any) => {
        this.property = res.data;
        
        // 2. Get Inquiries (Private Info)
        this.propertyService.getPropertyInquiries(id).subscribe({
          next: (inqRes: any) => {
            this.inquiries = inqRes.data;
            this.loading = false;
          },
          error: (err: any) => {
            console.error('Error fetching inquiries:', err);
            this.loading = false;
          }
        });
      },
      error: (err: any) => {
        console.error('Error fetching property:', err);
        this.loading = false;
      }
    });
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  async shareListing() {
    const url = window.location.origin + '/properties/' + this.property.slug;
    const shareData = {
      title: this.property.title,
      text: `Check out this amazing property: ${this.property.title}`,
      url: url
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        navigator.clipboard.writeText(url);
        alert('Listing link copied to clipboard!');
      }
    } catch (err) {
      console.error('Error sharing listing:', err);
    }
  }

  deleteListing() {
    if (confirm('Are you sure you want to delete this listing?')) {
      this.propertyService.deleteProperty(this.property._id).subscribe({
        next: () => {
          alert('Listing deleted successfully');
          this.router.navigate(['/dashboard']);
        }
      });
    }
  }

  toggleStatus() {
    if (!this.property) return;

    const newStatus = this.property.status === 'sold/rented' ? 'active' : 'sold/rented';
    const displayStatus = this.property.type === 'rent' ? 'Rented Out' : 'Sold Out';
    
    const confirmMsg = newStatus === 'sold/rented' 
      ? `Are you sure you want to mark this property as ${displayStatus}?` 
      : 'Are you sure you want to reactivate this property?';

    if (confirm(confirmMsg)) {
      const formData = new FormData();
      formData.append('status', newStatus);
      
      this.propertyService.updateProperty(this.property._id, formData).subscribe({
        next: (res: any) => {
          this.property.status = newStatus;
          alert(`Property marked as ${newStatus === 'active' ? 'Active' : displayStatus} successfully.`);
        },
        error: (err: any) => {
          console.error('Error updating status:', err);
          alert('Failed to update property status. Please ensure you are authorized to manage this property.');
        }
      });
    }
  }
}
