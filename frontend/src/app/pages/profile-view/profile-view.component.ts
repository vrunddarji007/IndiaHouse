import { Component, OnInit, signal } from '@angular/core';
import { take } from 'rxjs';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProfileService } from '../../services/profile.service';
import { AuthService } from '../../services/auth.service';
import { ReportService } from '../../services/report.service';
import { ToastService } from '../../services/toast.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-profile-view',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="min-vh-100" style="padding-top: 80px; background: #f8f9fa;">

      <!-- Loading -->
      <div *ngIf="loading" class="text-center py-5">
        <div class="spinner-border text-primary" style="width: 3rem; height: 3rem;"></div>
        <p class="text-muted mt-3">Loading profile...</p>
      </div>

      <div class="container py-4 position-relative" *ngIf="!loading && user">
        
        <!-- Top-Right Actions (Absolute Page Corner) -->
        <div class="position-absolute d-flex gap-2" style="top: -45px; right: 0; z-index: 10;">
          <ng-container *ngIf="isSelf; else otherActions">
            <a routerLink="/profile/edit" class="btn btn-forest px-3 py-2 rounded-pill d-flex align-items-center gap-2 fw-bold shadow-sm hover-lift border-2 border-white">
              <i class="bi bi-pencil-square"></i>
              Edit Profile
            </a>
            <button (click)="logout()" class="btn btn-danger-soft px-3 py-2 rounded-pill d-flex align-items-center gap-2 fw-bold shadow-sm hover-lift border-2 border-white">
              <i class="bi bi-box-arrow-right"></i>
              Logout
            </button>
          </ng-container>
          <ng-template #otherActions>
            <button (click)="openReportModal()" class="btn btn-outline-danger px-4 py-2 rounded-pill d-flex align-items-center gap-2 fw-bold shadow-sm hover-lift border-2 border-white bg-white">
              <i class="bi bi-flag-fill"></i>
              Report User
            </button>
          </ng-template>
        </div>

        <!-- ═══ HERO CARD ═══ -->
        <div class="card border-0 shadow-sm mb-4 overflow-hidden" style="border-radius: 24px; background: #ffffff;">
          <div class="row g-0 align-items-center">
            
            <!-- Information (Left) -->
            <div class="col-md-8 p-4 p-md-5">
              <div class="d-flex flex-column gap-1">
                <div class="mb-2">
                  <span class="badge badge-brand text-capitalize" 
                        style="background: rgba(9, 106, 77, 0.1); color: #096a4d !important; border: 1px solid rgba(9, 106, 77, 0.2); font-size: 0.85rem; padding: 6px 16px;">
                    <i class="bi" [ngClass]="{
                      'bi-shield-check': user.role === 'host',
                      'bi-building': user.role === 'agent',
                      'bi-person': user.role === 'buyer'
                    }"></i>
                    {{ user.role === 'host' ? 'Host Admin' : user.role === 'agent' ? 'Agent' : 'Buyer' }}
                  </span>
                </div>
                
                <h1 class="display-5 fw-bold mb-1" style="color: #003332; letter-spacing: -1px;">
                  {{ user.firstName }} {{ user.lastName || user.name }}
                </h1>
                
                <p class="fs-4 mb-3 fw-medium" style="color: #096a4d; opacity: 0.9;">
                  &#64;{{ user.username || 'user' }}
                </p>

                <p class="mb-4 fw-medium text-muted" style="max-width: 500px; line-height: 1.6;" *ngIf="user.bio">
                  {{ user.bio }}
                </p>

                <!-- Social Links -->
                <div class="d-flex gap-3 mb-2" *ngIf="user.socialLinks">
                  <a *ngIf="user.socialLinks.linkedin" [href]="user.socialLinks.linkedin" target="_blank" class="text-forest fs-5 hover-lift" title="LinkedIn">
                    <i class="bi bi-linkedin"></i>
                  </a>
                  <a *ngIf="user.socialLinks.twitter" [href]="user.socialLinks.twitter" target="_blank" class="text-forest fs-5 hover-lift" title="Twitter / X">
                    <i class="bi bi-twitter-x"></i>
                  </a>
                  <a *ngIf="user.socialLinks.instagram" [href]="user.socialLinks.instagram" target="_blank" class="text-forest fs-5 hover-lift" title="Instagram">
                    <i class="bi bi-instagram"></i>
                  </a>
                  <a *ngIf="user.socialLinks.facebook" [href]="user.socialLinks.facebook" target="_blank" class="text-forest fs-5 hover-lift" title="Facebook">
                    <i class="bi bi-facebook"></i>
                  </a>
                </div>
              </div>
            </div>

            <!-- Profile Photo (Right) -->
            <div class="col-md-4 p-4 d-flex align-items-center justify-content-center" style="min-height: 280px; background: #ffffff;">
              <div class="rounded-circle overflow-hidden border border-4 border-white shadow-lg cursor-zoom-in hover-lift" 
                   style="width: 200px; height: 200px;"
                   (click)="openLightbox()">
                <img [src]="user.profilePhoto ? apiBase + user.profilePhoto : avatarUrl" 
                     class="w-100 h-100" 
                     style="object-fit: cover;" 
                     alt="Profile">
              </div>
            </div>
          </div>
        </div>

        <!-- ═══ INFO CARDS ═══ -->
        <div class="row g-4 mb-4">
          <!-- Personal Info -->
          <div class="col-md-4">
            <div class="card border-0 shadow-sm h-100" style="border-radius: 16px;">
              <div class="card-body p-4">
                <h5 class="fw-bold mb-4 d-flex align-items-center gap-2">
                  <i class="bi bi-person-badge text-forest"></i>
                  Personal Information
                </h5>
                <div class="row g-3">
                  <div class="col-12" *ngIf="user.email && (isSelf || user.role !== 'buyer')">
                    <small class="text-muted d-block text-uppercase fw-semibold" style="font-size:11px;letter-spacing:1px;">Email</small>
                    <p class="mb-0 fw-medium text-truncate">{{ user.email }}</p>
                  </div>
                  <div class="col-12" *ngIf="user.phone && (isSelf || user.role !== 'buyer')">
                    <small class="text-muted d-block text-uppercase fw-semibold" style="font-size:11px;letter-spacing:1px;">Phone</small>
                    <p class="mb-0 fw-medium">{{ user.phone }}</p>
                  </div>
                  <div class="col-12">
                    <small class="text-muted d-block text-uppercase fw-semibold" style="font-size:11px;letter-spacing:1px;">Joined</small>
                    <p class="mb-0 fw-medium">{{ user.createdAt | date:'mediumDate' }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Professional Details (If Agent/Host) -->
          <div class="col-md-4" *ngIf="user.role !== 'buyer'">
            <div class="card border-0 shadow-sm h-100" style="border-radius: 16px;">
              <div class="card-body p-4">
                <h5 class="fw-bold mb-4 d-flex align-items-center gap-2">
                  <i class="bi bi-briefcase text-forest"></i>
                  Professional Info
                </h5>
                <div class="row g-3">
                  <div class="col-12" *ngIf="user.company">
                    <small class="text-muted d-block text-uppercase fw-semibold" style="font-size:11px;letter-spacing:1px;">Company</small>
                    <p class="mb-0 fw-medium text-truncate">{{ user.company }}</p>
                  </div>
                  <div class="col-12" *ngIf="user.reraNumber">
                    <small class="text-muted d-block text-uppercase fw-semibold" style="font-size:11px;letter-spacing:1px;">RERA Number</small>
                    <p class="mb-0 fw-medium">{{ user.reraNumber }}</p>
                  </div>
                  <div class="col-12" *ngIf="user.website">
                    <small class="text-muted d-block text-uppercase fw-semibold" style="font-size:11px;letter-spacing:1px;">Website</small>
                    <a [href]="user.website" target="_blank" class="text-decoration-none fw-medium d-block text-truncate small">{{ user.website }}</a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Address & Location Card -->
          <div class="col-md" [ngClass]="user.role === 'buyer' ? 'col-md-8' : 'col-md-4'">
            <div class="card border-0 shadow-sm h-100" style="border-radius: 16px;">
              <div class="card-body p-4">
                <h5 class="fw-bold mb-4 d-flex align-items-center gap-2">
                  <i class="bi bi-geo-alt text-forest"></i>
                  Address & Location
                </h5>
                <div class="row g-3" *ngIf="user.address">
                  <div class="col-12" *ngIf="user.address.street">
                    <small class="text-muted d-block text-uppercase fw-semibold" style="font-size:11px;letter-spacing:1px;">Street Address</small>
                    <p class="mb-0 fw-medium small">{{ user.address.street }}</p>
                  </div>
                  <div class="col-6" *ngIf="user.address.town">
                    <small class="text-muted d-block text-uppercase fw-semibold" style="font-size:11px;letter-spacing:1px;">Town</small>
                    <p class="mb-0 fw-medium">{{ user.address.town }}</p>
                  </div>
                  <div class="col-6" *ngIf="user.address.village">
                    <small class="text-muted d-block text-uppercase fw-semibold" style="font-size:11px;letter-spacing:1px;">Village</small>
                    <p class="mb-0 fw-medium">{{ user.address.village }}</p>
                  </div>
                  <div class="col-6" *ngIf="user.address.city">
                    <small class="text-muted d-block text-uppercase fw-semibold" style="font-size:11px;letter-spacing:1px;">City</small>
                    <p class="mb-0 fw-medium">{{ user.address.city }}</p>
                  </div>
                  <div class="col-6" *ngIf="user.address.state">
                    <small class="text-muted d-block text-uppercase fw-semibold" style="font-size:11px;letter-spacing:1px;">State</small>
                    <p class="mb-0 fw-medium">{{ user.address.state }}</p>
                  </div>
                </div>
                <div *ngIf="!user.address || (!user.address.city && !user.address.town && !user.address.village)" class="text-center py-3 opacity-50">
                   <p class="small mb-0">Location not provided</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Lightbox -->
      <div class="lightbox-overlay" *ngIf="showLightbox" (click)="closeLightbox()">
        <div class="lightbox-content" (click)="$event.stopPropagation()">
          <img [src]="user.profilePhoto ? apiBase + user.profilePhoto : avatarUrl" class="img-fluid rounded-4 shadow-lg border border-3 border-white">
          <button class="btn-close btn-close-white position-absolute top-0 end-0 m-3 shadow" (click)="closeLightbox()"></button>
        </div>
      </div>

      <!-- Report Modal -->
      <div class="modal fade" [class.show]="showReportModal" [style.display]="showReportModal ? 'block' : 'none'" tabindex="-1">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content border-0 shadow-lg" style="border-radius: 20px;">
            <div class="modal-header border-0 pb-0">
              <h5 class="modal-title fw-bold text-danger d-flex align-items-center gap-2">
                <i class="bi bi-exclamation-triangle-fill"></i> Report User
              </h5>
              <button type="button" class="btn-close" (click)="closeReportModal()"></button>
            </div>
            <div class="modal-body p-4">
              <p class="text-muted small mb-4">You are reporting <strong>{{ user?.firstName }} {{ user?.lastName || user?.name }}</strong>. Please specify the reason for this report.</p>
              
              <div class="mb-3">
                <label class="form-label fw-bold small text-uppercase text-muted">Reason</label>
                <select class="form-select border-0 bg-light rounded-3" [(ngModel)]="reportReason">
                  <option value="" disabled selected>Select a reason</option>
                  <option value="scam">Scam / Fraud</option>
                  <option value="fake_profile">Fake Profile</option>
                  <option value="inappropriate">Inappropriate Content/Behavior</option>
                  <option value="spam">Spam</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div class="mb-4">
                <label class="form-label fw-bold small text-uppercase text-muted">Details (Optional)</label>
                <textarea class="form-control border-0 bg-light rounded-3" rows="3" [(ngModel)]="reportDescription" placeholder="Provide more context..."></textarea>
              </div>

              <button class="btn btn-danger w-100 py-3 rounded-pill fw-bold shadow-sm" [disabled]="!reportReason || reporting" (click)="submitReport()">
                <span *ngIf="reporting" class="spinner-border spinner-border-sm me-2"></span>
                Submit Report
              </button>
            </div>
          </div>
        </div>
      </div>
      <div class="modal-backdrop fade show" *ngIf="showReportModal"></div>

    </div>
  `,
  styles: [`
    .text-forest { color: #096a4d; }
    .btn-forest { background: #096a4d; color: #fff; }
    .btn-forest:hover { background: #075a41; color: #fff; }
    .btn-danger-soft { background: #fff5f5; color: #dc3545; border: none; }
    .btn-danger-soft:hover { background: #fee2e2; color: #dc3545; }
    .cursor-zoom-in { cursor: zoom-in; }
    .hover-lift:hover { transform: translateY(-3px); transition: 0.3s; }
    .text-primary-hover:hover { color: #096a4d !important; text-decoration: underline !important; }

    .lightbox-overlay {
      position: fixed;
      top: 0; left: 0; width: 100vw; height: 100vh;
      background: rgba(0,0,0,0.8); backdrop-filter: blur(10px);
      z-index: 9999; display: flex; align-items: center; justify-content: center;
      cursor: zoom-out;
    }
    .lightbox-content { max-width: 90vw; max-height: 90vh; position: relative; animation: zoomIn 0.3s; }
    @keyframes zoomIn { from { transform: scale(0.8); opacity: 0; } to { transform: scale(1); opacity: 1; } }

    .modal.show { display: block; background: rgba(0,0,0,0.4); }
  `]
})
export class ProfileViewComponent implements OnInit {
  user: any = null;
  loading = true;
  isSelf = false;
  apiBase = environment.apiUrl.replace('/api', '');
  showLightbox = false;

  // Reporting
  showReportModal = false;
  reportReason = '';
  reportDescription = '';
  reporting = false;

  constructor(
    private profileService: ProfileService,
    private authService: AuthService,
    private reportService: ReportService,
    private router: Router,
    private route: ActivatedRoute,
    private toast: ToastService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      const userId = params['id'];
      if (userId) {
        this.loadOtherProfile(userId);
      } else {
        this.loadMyProfile();
      }
    });
  }

  loadMyProfile() {
    this.isSelf = true;
    this.profileService.getProfile().subscribe({
      next: (res: any) => {
        this.user = res.user;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  loadOtherProfile(id: string) {
    // Check if looking at self via ID
    this.authService.currentUser.pipe(take(1)).subscribe(curr => {
      if (curr && curr._id === id) {
        this.isSelf = true;
        this.loadMyProfile();
        return;
      }
      
      this.isSelf = false;
      this.profileService.getPublicProfile(id).subscribe({
        next: (res: any) => {
          this.user = res.user;
          this.loading = false;
        },
        error: () => {
          this.loading = false;
          this.toast.error('Profile not found or access restricted.');
          this.router.navigate(['/']);
        }
      });
    });
  }

  openLightbox() {
    this.showLightbox = true;
    document.body.style.overflow = 'hidden';
  }

  closeLightbox() {
    this.showLightbox = false;
    document.body.style.overflow = 'auto';
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }

  // Report logic
  openReportModal() {
    this.showReportModal = true;
    this.reportReason = '';
    this.reportDescription = '';
  }

  closeReportModal() {
    this.showReportModal = false;
  }

  submitReport() {
    if (!this.reportReason || !this.user?._id) return;
    this.reporting = true;
    
    this.reportService.submitReport({
      reportedUser: this.user._id,
      reason: this.reportReason,
      description: this.reportDescription
    }).subscribe({
      next: (res) => {
        this.toast.success(res.message || 'Report submitted successfully. Thank you for making our platform safer.');
        this.reporting = false;
        this.closeReportModal();
      },
      error: (err) => {
        this.reporting = false;
        this.toast.error(err.error?.message || 'Failed to submit report. Please try again later.');
      }
    });
  }

  get avatarUrl(): string {
    const f = this.user?.firstName || this.user?.name || 'U';
    const l = this.user?.lastName || '';
    return `https://ui-avatars.com/api/?name=${f}+${l}&background=034C36&color=fff&size=200`;
  }

  get genderLabel(): string {
    const g = this.user?.gender;
    if (g === 'prefer_not_to_say') return 'Prefer not to say';
    return g || '';
  }
}
