import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ProfileService } from '../../services/profile.service';
import { AuthService } from '../../services/auth.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-complete-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="min-vh-100" style="padding-top: 80px;">
      <div class="container py-4">
        <div class="row justify-content-center">
          <div class="col-lg-8 col-md-10">
            <div class="card border-0 shadow-lg" style="border-radius: 20px; overflow: hidden; background-color: var(--auth-card-bg); border: 2px solid var(--auth-card-border);">

              <!-- Header -->
              <div class="text-center py-4" style="background: var(--auth-header-bg); border-bottom: 4px solid var(--c-rose);">
                <h2 class="text-white fw-bold mb-1 d-flex align-items-center justify-content-center gap-2">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                  {{ editMode ? 'Edit Profile' : 'Complete Your Profile' }}
                </h2>
                <p class="mb-0 small uppercase fw-semibold" style="letter-spacing: 1px; color: white !important;">IndiaHomes Identity</p>
              </div>

              <div class="card-body p-4 p-md-5">
                <form [formGroup]="profileForm" (ngSubmit)="onSubmit()">

                  <!-- ═══ SECTION 1: Photo + Basic ═══ -->
                  <h6 class="fw-bold mb-3 text-uppercase small d-flex align-items-center gap-2" style="letter-spacing: 1.5px; color: var(--auth-text-color);">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
                    Basic Information
                  </h6>

                  <div class="text-center mb-4">
                    <div class="position-relative d-inline-block">
                      <div class="rounded-circle overflow-hidden mx-auto"
                        style="width: 110px; height: 110px; border: 4px solid var(--c-forest); cursor: pointer;"
                        (click)="fileInput.click()">
                        <img [src]="photoPreview || existingPhoto || avatarUrl" class="w-100 h-100" style="object-fit: cover;" alt="Profile">
                      </div>
                      <div class="position-absolute bottom-0 end-0 bg-primary rounded-circle d-flex align-items-center justify-content-center"
                        style="width: 32px; height: 32px; cursor: pointer; border: 2px solid white;" (click)="fileInput.click()">
                        <span class="text-white small">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
                        </span>
                      </div>
                    </div>
                    <input type="file" #fileInput hidden accept="image/jpeg,image/png,image/jpg" (change)="onPhotoSelect($event)">
                    <p class="text-white-50 small mt-2 mb-0">Click to upload (JPG/PNG, max 2MB)</p>
                    <div class="text-danger small mt-1" *ngIf="photoError">{{ photoError }}</div>
                  </div>

                  <div class="row g-3 mb-3">
                    <div class="col-md-6">
                      <label class="form-label fw-semibold text-muted small">FIRST NAME *</label>
                      <input type="text" class="form-control form-control-lg bg-light border-0 rounded-3" formControlName="firstName" placeholder="John">
                    </div>
                    <div class="col-md-6">
                      <label class="form-label fw-semibold text-muted small">LAST NAME *</label>
                      <input type="text" class="form-control form-control-lg bg-light border-0 rounded-3" formControlName="lastName" placeholder="Doe">
                    </div>
                  </div>

                  <div class="row g-3 mb-3">
                    <div class="col-md-6">
                      <label class="form-label fw-semibold text-muted small">EMAIL</label>
                      <input type="email" class="form-control form-control-lg bg-light border-0 rounded-3 text-muted" formControlName="email">
                    </div>
                    <div class="col-md-6">
                      <label class="form-label fw-semibold text-muted small">PHONE</label>
                      <input type="text" class="form-control form-control-lg bg-light border-0 rounded-3 text-muted" formControlName="phone">
                    </div>
                  </div>

                  <div class="mb-3">
                    <label class="form-label fw-semibold text-muted small">USERNAME *</label>
                    <div class="input-group">
                      <span class="input-group-text bg-light border-0 fw-semibold text-muted">&#64;</span>
                      <input type="text" class="form-control form-control-lg bg-light border-0 rounded-end-3" formControlName="username" placeholder="johndoe" (input)="onUsernameInput()">
                    </div>
                    <div class="mt-1" *ngIf="usernameStatus">
                      <small [class]="usernameStatus === 'available' ? 'text-success' : usernameStatus === 'taken' ? 'text-danger' : 'text-muted'">
                        {{ usernameStatus === 'checking' ? '⏳ Checking...' : usernameStatus === 'available' ? '✅ Available' : usernameStatus === 'taken' ? '❌ Taken' : '⚠️ 3-30 chars: a-z, 0-9, _' }}
                      </small>
                    </div>
                  </div>

                  <div class="mb-3">
                    <label class="form-label fw-semibold text-muted small">BIO <span style="color: white !important;">(max 250)</span></label>
                    <textarea class="form-control bg-light border-0 rounded-3" formControlName="bio" rows="2" placeholder="Real estate enthusiast..." maxlength="250"></textarea>
                    <small class="d-block text-end" style="color: white !important;">{{ profileForm.value.bio?.length || 0 }}/250</small>
                  </div>

                  <!-- ═══ SECTION 2: Personal ═══ -->
                  <hr class="my-4">
                  <h6 class="fw-bold mb-3 text-uppercase small d-flex align-items-center gap-2" style="letter-spacing: 1.5px; color: var(--auth-text-color);">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                    Personal Details
                  </h6>

                  <div class="row g-3 mb-3">
                    <div class="col-md-6">
                      <label class="form-label fw-semibold text-muted small">GENDER</label>
                      <select class="form-select form-select-lg bg-light border-0 rounded-3" formControlName="gender">
                        <option value="">Select</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                        <option value="prefer_not_to_say">Prefer not to say</option>
                      </select>
                    </div>
                    <div class="col-md-6">
                      <label class="form-label fw-semibold text-muted small">DATE OF BIRTH</label>
                      <input type="date" class="form-control form-control-lg bg-light border-0 rounded-3" formControlName="dateOfBirth">
                    </div>
                  </div>

                  <!-- ═══ SECTION 3: Address ═══ -->
                  <hr class="my-4">
                  <h6 class="fw-bold mb-3 text-uppercase small d-flex align-items-center gap-2" style="letter-spacing: 1.5px; color: var(--auth-text-color);">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                    Address
                  </h6>

                  <div class="mb-3">
                    <label class="form-label fw-semibold text-muted small">STREET ADDRESS</label>
                    <input type="text" class="form-control form-control-lg bg-light border-0 rounded-3" formControlName="street" placeholder="123 Main Street, Alkapuri">
                  </div>
                  <div class="row g-3 mb-3">
                    <div class="col-md-4">
                      <label class="form-label fw-semibold text-muted small">CITY</label>
                      <input type="text" class="form-control bg-light border-0 rounded-3" formControlName="city" placeholder="Vadodara">
                    </div>
                    <div class="col-md-4">
                      <label class="form-label fw-semibold text-muted small">STATE</label>
                      <input type="text" class="form-control bg-light border-0 rounded-3" formControlName="state" placeholder="Gujarat">
                    </div>
                    <div class="col-md-2">
                      <label class="form-label fw-semibold text-muted small">PINCODE</label>
                      <input type="text" class="form-control bg-light border-0 rounded-3" formControlName="pincode" placeholder="390001" maxlength="6">
                    </div>
                    <div class="col-md-2">
                      <label class="form-label fw-semibold text-muted small">COUNTRY</label>
                      <input type="text" class="form-control bg-light border-0 rounded-3" formControlName="country">
                    </div>
                  </div>

                  <!-- ═══ SECTION 4: Professional ═══ -->
                  <hr class="my-4">
                  <h6 class="fw-bold mb-3 text-uppercase small d-flex align-items-center gap-2" style="letter-spacing: 1.5px; color: var(--auth-text-color);">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
                    Professional Info
                  </h6>

                  <div class="row g-3 mb-3">
                    <div class="col-md-6">
                      <label class="form-label fw-semibold text-muted small">COMPANY / ORGANIZATION</label>
                      <input type="text" class="form-control bg-light border-0 rounded-3" formControlName="company" placeholder="IndiaHomes Realty">
                    </div>
                    <div class="col-md-6">
                      <label class="form-label fw-semibold text-muted small">DESIGNATION</label>
                      <input type="text" class="form-control bg-light border-0 rounded-3" formControlName="designation" placeholder="Senior Agent">
                    </div>
                  </div>
                  <div class="row g-3 mb-3">
                    <div class="col-md-6">
                      <label class="form-label fw-semibold text-muted small">EXPERIENCE</label>
                      <input type="text" class="form-control bg-light border-0 rounded-3" formControlName="experience" placeholder="5 years">
                    </div>
                    <div class="col-md-6">
                      <label class="form-label fw-semibold text-muted small">SPECIALIZATION</label>
                      <input type="text" class="form-control bg-light border-0 rounded-3" formControlName="specialization" placeholder="Residential Properties">
                    </div>
                  </div>
                  <div class="row g-3 mb-3">
                    <div class="col-md-6">
                      <label class="form-label fw-semibold text-muted small">WEBSITE</label>
                      <input type="url" class="form-control bg-light border-0 rounded-3" formControlName="website" placeholder="https://yourwebsite.com">
                    </div>
                    <div class="col-md-6">
                      <label class="form-label fw-semibold text-muted small">LANGUAGES</label>
                      <input type="text" class="form-control bg-light border-0 rounded-3" formControlName="languages" placeholder="English, Hindi, Gujarati">
                    </div>
                  </div>
                  <div class="mb-3" *ngIf="profileForm.value.role === 'agent'">
                    <label class="form-label fw-semibold text-muted small">RERA NUMBER</label>
                    <input type="text" class="form-control bg-light border-0 rounded-3" formControlName="reraNumber" placeholder="RERA/GJ/xxxx/xxxxx">
                  </div>

                  <!-- ═══ SECTION 5: Social Links ═══ -->
                  <hr class="my-4">
                  <h6 class="fw-bold mb-3 text-uppercase small d-flex align-items-center gap-2" style="letter-spacing: 1.5px; color: var(--auth-text-color);">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                    Social Links
                  </h6>

                  <div class="row g-3 mb-3">
                    <div class="col-md-6">
                      <label class="form-label fw-semibold text-muted small">🔗 LINKEDIN</label>
                      <input type="url" class="form-control bg-light border-0 rounded-3" formControlName="linkedin" placeholder="https://linkedin.com/in/username">
                    </div>
                    <div class="col-md-6">
                      <label class="form-label fw-semibold text-muted small">🐦 TWITTER / X</label>
                      <input type="url" class="form-control bg-light border-0 rounded-3" formControlName="twitter" placeholder="https://twitter.com/username">
                    </div>
                  </div>
                  <div class="row g-3 mb-3">
                    <div class="col-md-6">
                      <label class="form-label fw-semibold text-muted small">📸 INSTAGRAM</label>
                      <input type="url" class="form-control bg-light border-0 rounded-3" formControlName="instagram" placeholder="https://instagram.com/username">
                    </div>
                    <div class="col-md-6">
                      <label class="form-label fw-semibold text-muted small">📘 FACEBOOK</label>
                      <input type="url" class="form-control bg-light border-0 rounded-3" formControlName="facebook" placeholder="https://facebook.com/username">
                    </div>
                  </div>

                  <!-- Alerts -->
                  <div class="alert alert-danger py-2 small" *ngIf="error">{{ error }}</div>
                  <div class="alert alert-success py-2 small" *ngIf="success">{{ success }}</div>

                  <!-- Submit -->
                      <button type="submit" class="btn btn-lg w-100 rounded-3 fw-bold mt-3 d-flex align-items-center justify-content-center gap-2" [disabled]="profileForm.invalid || saving || usernameStatus === 'taken' || usernameStatus === 'checking'"
                    style="background: linear-gradient(135deg, var(--c-forest), var(--c-deep-green)); border: none; padding: 14px; color: #fff;">
                    <span *ngIf="saving" class="spinner-border spinner-border-sm me-2"></span>
                    <svg *ngIf="!saving" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
                    {{ saving ? 'Saving...' : editMode ? 'Save Changes' : 'Complete Profile & Continue →' }}
                  </button>
                </form>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    label {
      color: var(--auth-text-color) !important;
      font-weight: 700 !important;
      letter-spacing: 1px;
    }
    .form-control, .form-select, .input-group-text {
      border: 1px solid var(--auth-text-color) !important;
      background-color: var(--auth-input-bg) !important;
      color: var(--auth-input-text) !important;
    }
    .form-control::placeholder {
      color: rgba(0, 0, 0, 0.4) !important;
    }
    .form-control:focus, .form-select:focus {
      box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.1);
      border-color: var(--c-rose) !important;
      background-color: var(--auth-input-bg) !important;
    }
    .input-group-text {
      background-color: rgba(0, 0, 0, 0.2) !important;
      color: var(--auth-text-color) !important;
      font-weight: 600;
    }
  `]
})
export class CompleteProfileComponent implements OnInit {
  profileForm: FormGroup;
  saving = false;
  error = '';
  success = '';
  photoPreview: string | null = null;
  existingPhoto: string | null = null;
  photoFile: File | null = null;
  photoError = '';
  usernameStatus: 'checking' | 'available' | 'taken' | 'invalid' | '' = '';
  editMode = false;
  private usernameTimeout: any;
  apiBase = environment.apiUrl.replace('/api', '');

  get avatarUrl(): string {
    const f = this.profileForm?.value?.firstName || 'U';
    const l = this.profileForm?.value?.lastName || '';
    return `https://ui-avatars.com/api/?name=${f}+${l}&background=6f42c1&color=fff&size=110`;
  }

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private profileService: ProfileService,
    private authService: AuthService
  ) {
    this.profileForm = this.fb.group({
      email: [{value: '', disabled: true}],
      phone: [{value: '', disabled: true}],
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(30), Validators.pattern(/^[a-z0-9_]+$/)]],
      bio: ['', [Validators.required]],
      gender: ['', [Validators.required]],
      dateOfBirth: ['', [Validators.required]],
      street: ['', [Validators.required]],
      city: ['', [Validators.required]],
      state: ['', [Validators.required]],
      pincode: ['', [Validators.required]],
      country: ['India', [Validators.required]],
      company: ['', [Validators.required]],
      designation: ['', [Validators.required]],
      website: ['', [Validators.required]],
      experience: ['', [Validators.required]],
      specialization: ['', [Validators.required]],
      languages: ['', [Validators.required]],
      reraNumber: [''],
      linkedin: [''],
      twitter: [''],
      instagram: [''],
      facebook: [''],
      role: [''],
    });
  }

  ngOnInit() {
    const user = this.authService.currentUserValue;
    this.editMode = !!(user?.isProfileComplete);

    // Load full profile from API
    this.profileService.getProfile().subscribe({
      next: (res: any) => {
        const u = res.user;
        this.profileForm.patchValue({
          firstName: u.firstName || (u.name ? u.name.split(' ')[0] : ''),
          lastName: u.lastName || (u.name ? u.name.split(' ').slice(1).join(' ') : ''),
          username: u.username || '',
          bio: u.bio || '',
          gender: u.gender || '',
          dateOfBirth: u.dateOfBirth ? u.dateOfBirth.substring(0, 10) : '',
          street: u.address?.street || '',
          city: u.address?.city || '',
          state: u.address?.state || '',
          pincode: u.address?.pincode || '',
          country: u.address?.country || 'India',
          company: u.company || '',
          designation: u.designation || '',
          website: u.website || '',
          experience: u.experience || '',
          specialization: u.specialization || '',
          languages: (u.languages || []).join(', '),
          reraNumber: u.reraNumber || '',
          linkedin: u.socialLinks?.linkedin || '',
          twitter: u.socialLinks?.twitter || '',
          instagram: u.socialLinks?.instagram || '',
          facebook: u.socialLinks?.facebook || '',
          role: u.role || '',
          email: u.email || '',
          phone: u.phone || '',
        });
        if (u.profilePhoto) {
          this.existingPhoto = this.apiBase + u.profilePhoto;
        }
      },
      error: () => {},
    });
  }

  onPhotoSelect(event: any) {
    const file = event.target.files[0];
    this.photoError = '';
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) { this.photoError = 'Only JPG/PNG allowed'; return; }
    if (file.size > 2 * 1024 * 1024) { this.photoError = 'Max 2MB'; return; }
    this.photoFile = file;
    const reader = new FileReader();
    reader.onload = (e: any) => this.photoPreview = e.target.result;
    reader.readAsDataURL(file);
  }

  onUsernameInput() {
    clearTimeout(this.usernameTimeout);
    const val = this.profileForm.value.username?.toLowerCase().trim();
    if (!val || val.length < 3) { this.usernameStatus = val ? 'invalid' : ''; return; }
    if (!/^[a-z0-9_]{3,30}$/.test(val)) { this.usernameStatus = 'invalid'; return; }
    this.usernameStatus = 'checking';
    this.usernameTimeout = setTimeout(() => {
      this.profileService.checkUsername(val).subscribe({
        next: (r) => this.usernameStatus = r.available ? 'available' : 'taken',
        error: () => this.usernameStatus = '',
      });
    }, 500);
  }

  onSubmit() {
    if (this.usernameStatus === 'taken') return;
    this.saving = true; this.error = ''; this.success = '';

    const fd = new FormData();
    const v = this.profileForm.value;
    fd.append('firstName', v.firstName.trim());
    fd.append('lastName', v.lastName.trim());
    fd.append('username', v.username.toLowerCase().trim());
    fd.append('bio', v.bio?.trim() || '');
    fd.append('gender', v.gender || '');
    fd.append('dateOfBirth', v.dateOfBirth || '');
    fd.append('street', v.street?.trim() || '');
    fd.append('city', v.city?.trim() || '');
    fd.append('state', v.state?.trim() || '');
    fd.append('pincode', v.pincode?.trim() || '');
    fd.append('country', v.country?.trim() || 'India');
    fd.append('company', v.company?.trim() || '');
    fd.append('designation', v.designation?.trim() || '');
    fd.append('website', v.website?.trim() || '');
    fd.append('experience', v.experience?.trim() || '');
    fd.append('specialization', v.specialization?.trim() || '');
    fd.append('languages', v.languages?.trim() || '');
    fd.append('reraNumber', v.reraNumber?.trim() || '');
    fd.append('linkedin', v.linkedin?.trim() || '');
    fd.append('twitter', v.twitter?.trim() || '');
    fd.append('instagram', v.instagram?.trim() || '');
    fd.append('facebook', v.facebook?.trim() || '');
    if (this.photoFile) fd.append('profilePhoto', this.photoFile);

    const call$ = this.editMode
      ? this.profileService.editProfile(fd)
      : this.profileService.completeProfile(fd);

    call$.subscribe({
      next: (res: any) => {
        this.saving = false;
        this.success = this.editMode ? 'Profile updated!' : 'Profile saved!';
        this.authService.updateCurrentUser({
          name: res.user.name,
          firstName: res.user.firstName,
          lastName: res.user.lastName,
          username: res.user.username,
          profilePhoto: res.user.profilePhoto,
          bio: res.user.bio,
          isProfileComplete: true,
        });
        if (!this.editMode) {
          setTimeout(() => this.router.navigate(['/terms']), 1000);
        }
      },
      error: (e: any) => {
        this.saving = false;
        this.error = e.error?.message || 'Failed to save profile';
      },
    });
  }

  skip() { this.router.navigate(['/terms']); }

  private goHome() {
    const role = this.authService.currentUserValue?.role;
    if (role === 'host') this.router.navigate(['/host-dashboard']);
    else if (role === 'agent') this.router.navigate(['/dashboard']);
    else this.router.navigate(['/']);
  }
}
