import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, FormsModule],
  template: `
    <div class="min-vh-100 d-flex flex-column align-items-center justify-content-center position-relative" style="padding: 60px 0;">
      <div class="position-absolute top-0 end-0 p-4">
        <a routerLink="/auth/login" class="btn btn-outline-danger border-2 rounded-pill px-4 fw-bold shadow-sm hover-lift d-flex align-items-center gap-2">
          <i class="bi bi-box-arrow-in-right"></i> Sign In
        </a>
      </div>
      <div class="container py-4">
        <div class="row justify-content-center">
          <div class="col-lg-6 col-md-8">

            <div class="text-center mb-4">
              <h2 class="fw-bold fs-3" style="color: var(--c-deep-green); letter-spacing: 1px;">IndiaHomes Identity</h2>
            </div>

            <!-- ═══ HOST LOGIN MODE ═══ -->
            <div *ngIf="authMode === 'host'">
              <div class="card border-0 shadow-lg" style="border-radius: 20px; overflow: hidden; background-color: var(--auth-card-bg); border: 2px solid var(--auth-card-border);">
                <div class="text-center d-flex flex-column justify-content-center" style="height: 160px; background: transparent; border-bottom: 4px solid var(--c-rose); color: #212529;">
                  <h2 class="fw-bold mb-1 d-flex align-items-center justify-content-center gap-2">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                    Host Login
                  </h2>
                  <p class="text-muted mb-0 small">Admin access for IndiaHomes</p>
                </div>
                <div class="card-body p-4 p-md-5">
                  <form [formGroup]="hostForm" (ngSubmit)="onHostLogin()">
                    <div class="mb-3">
                      <label class="form-label fw-semibold text-muted small">HOST EMAIL</label>
                      <input type="email" class="form-control form-control-lg bg-light border-0 rounded-3" formControlName="email" placeholder="host&#64;indiahomes.com">
                    </div>
                    <div class="mb-3">
                      <label class="form-label fw-semibold text-muted small">PASSWORD</label>
                      <div class="input-group">
                        <input [type]="showPassword ? 'text' : 'password'" class="form-control form-control-lg border-0 border-end-0 rounded-3" style="border-top-right-radius: 0 !important; border-bottom-right-radius: 0 !important;" formControlName="password" placeholder="••••••••">
                        <button class="input-group-text border-0 border-start-0 cursor-pointer" style="color: var(--auth-input-text) !important; border-top-left-radius: 0 !important; border-bottom-left-radius: 0 !important;" type="button" (click)="showPassword = !showPassword">
                          <i class="bi" [ngClass]="showPassword ? 'bi-eye-slash-fill' : 'bi-eye-fill'"></i>
                        </button>
                      </div>
                    </div>
                    <div class="alert alert-danger py-2 small" *ngIf="hostError">{{ hostError }}</div>
                    <button type="submit" class="btn btn-lg w-100 rounded-3 fw-bold mt-2" [disabled]="hostForm.invalid || hostLoading"
                      style="background: linear-gradient(135deg, #198754, #0d6efd); border: none; padding: 14px; color: #fff;">
                      <span *ngIf="hostLoading" class="spinner-border spinner-border-sm me-2"></span>
                      {{ hostLoading ? 'Authenticating...' : '🛡️ Login as Host' }}
                    </button>
                  </form>
                </div>
              </div>
            </div>

            <!-- ═══ OTP MODE (Buyer/Agent) ═══ -->
            <div *ngIf="authMode === 'otp'">
              <!-- Progress -->
              <div class="text-center mb-4">
                <div class="d-flex justify-content-center align-items-center gap-2">
                  <div class="step-circle" [class.active]="step >= 1">1</div>
                  <div class="step-line" [class.active]="step >= 2"></div>
                  <div class="step-circle" [class.active]="step >= 2">2</div>
                  <div class="step-line" [class.active]="step >= 3"></div>
                  <div class="step-circle" [class.active]="step >= 3">3</div>
                  <div class="step-line" [class.active]="step >= 4"></div>
                  <div class="step-circle" [class.active]="step >= 4">4</div>
                </div>
                <p class="text-white-50 mt-2 small">
                  {{ step === 1 ? 'Get Started' : step === 2 ? 'Choose Role' : step === 3 ? 'Verify OTP' : 'Set Password' }}
                </p>
              </div>

              <div class="card border-0 shadow-lg" style="border-radius: 20px; overflow: hidden; background-color: var(--auth-card-bg); border: 2px solid var(--auth-card-border);">

                <!-- ═══ STEP 1: Email/Phone ═══ -->
                <div *ngIf="step === 1">
                  <div class="text-center d-flex flex-column justify-content-center" style="height: 160px; background: transparent; border-bottom: 4px solid var(--c-rose); color: #212529;">
                    <h2 class="fw-bold mb-1 d-flex align-items-center justify-content-center gap-2">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                      Welcome to IndiaHomes
                    </h2>
                    <p class="text-muted mb-0 small">Sign up or log in with OTP</p>
                  </div>
                  <div class="card-body p-4 p-md-5">
                    <form [formGroup]="authForm" (ngSubmit)="onSubmitAuth()">
                      <div class="mb-3">
                        <label class="form-label fw-semibold text-muted small">EMAIL ADDRESS</label>
                        <input type="email" class="form-control form-control-lg bg-light border-0 rounded-3" formControlName="email" placeholder="you@example.com">
                      </div>
                      <div class="row g-2 mb-3">
                        <div class="col-6">
                          <label class="form-label fw-semibold text-muted small">FIRST NAME</label>
                          <input type="text" class="form-control form-control-lg bg-light border-0 rounded-3" formControlName="firstName" placeholder="First Name">
                        </div>
                        <div class="col-6">
                          <label class="form-label fw-semibold text-muted small">LAST NAME</label>
                          <input type="text" class="form-control form-control-lg bg-light border-0 rounded-3" formControlName="lastName" placeholder="Last Name">
                        </div>
                      </div>
                      <div class="mb-3">
                        <label class="form-label fw-semibold text-muted small">PHONE NUMBER</label>
                        <div class="input-group">
                          <span class="input-group-text bg-light border-0 fw-semibold">+91</span>
                          <input type="text" class="form-control form-control-lg bg-light border-0 rounded-end-3" formControlName="phone" placeholder="9876543210" maxlength="10">
                        </div>
                      </div>
                      <div class="alert alert-danger py-2 small" *ngIf="error">{{ error }}</div>
                      <button type="submit" class="btn btn-primary btn-lg w-100 rounded-3 fw-bold mt-2" [disabled]="authForm.invalid || loading"
                        style="background: linear-gradient(135deg, var(--c-forest), var(--c-deep-green)); border: none; padding: 14px;">
                        <span *ngIf="loading" class="spinner-border spinner-border-sm me-2"></span>
                        {{ loading ? 'Processing...' : 'Continue →' }}
                      </button>
                    </form>
                    <p class="text-center text-muted mt-4 mb-0 small">Have a password? <a routerLink="/auth/login" class="fw-bold text-decoration-none">Log In</a></p>
                  </div>
                </div>

                <!-- ═══ STEP 2: Role Selection (first-time only) ═══ -->
                <div *ngIf="step === 2">
                  <div class="text-center py-4" style="background: var(--auth-header-bg); border-bottom: 4px solid var(--c-rose);">
                    <h2 class="text-white fw-bold mb-1 d-flex align-items-center justify-content-center gap-2">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                      Choose Your Role
                    </h2>
                    <p class="mb-0 small" style="color: white; font-weight: 600;">How will you use IndiaHomes?</p>
                  </div>
                  <div class="card-body p-4">
                    <div class="row g-3">
                      <div class="col-12" *ngFor="let r of roles">
                        <div class="card border-2 rounded-3 p-3 role-card" [class.border-primary]="selectedRole === r.value" [class.bg-primary-subtle]="selectedRole === r.value"
                          (click)="selectedRole = r.value" style="cursor: pointer; transition: all 0.2s;">
                          <div class="d-flex align-items-center gap-3">
                            <div class="fs-1" [innerHTML]="r.icon"></div>
                            <div>
                              <h6 class="fw-bold mb-1">{{ r.label }}</h6>
                              <small style="color: black !important;">{{ r.desc }}</small>
                            </div>
                            <div class="ms-auto">
                              <div class="form-check">
                                <input class="form-check-input" type="radio" [checked]="selectedRole === r.value" name="role">
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div class="alert alert-danger py-2 small mt-3" *ngIf="error">{{ error }}</div>
                    <button class="btn btn-lg w-100 rounded-3 fw-bold mt-3" (click)="onSelectRole()" [disabled]="!selectedRole || loading"
                      style="background: linear-gradient(135deg, #fd7e14, #dc3545); border: none; padding: 14px; color: #fff;">
                      <span *ngIf="loading" class="spinner-border spinner-border-sm me-2"></span>
                      Continue as {{ selectedRole | titlecase }} →
                    </button>
                  </div>
                </div>

                <!-- ═══ STEP 3: OTP Verification ═══ -->
                <div *ngIf="step === 3">
                  <div class="text-center py-4" style="background: var(--auth-header-bg); border-bottom: 4px solid var(--c-rose);">
                    <h2 class="text-white fw-bold mb-1 d-flex align-items-center justify-content-center gap-2">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                      Verify Account
                    </h2>
                    <p class="mb-0 small" style="color: white; font-weight: bold;">OTP</p>
                  </div>
                  <div class="card-body p-4 p-md-5 text-center" *ngIf="!otpVerified">
                    <p class="text-muted mb-4">Enter the 6-digit code sent to your <strong>email and phone</strong></p>
                    <div class="d-flex justify-content-center gap-2 mb-4">
                      <input *ngFor="let i of [0,1,2,3,4,5]; let idx = index" type="text"
                        class="form-control text-center fw-bold fs-4 otp-input"
                        [id]="'otp-' + idx" maxlength="1"
                        (input)="onOtpInput($event, idx)"
                        (keydown)="onOtpKeyDown($event, idx)"
                        (paste)="onOtpPaste($event)"
                        style="width:52px; height:60px; border-radius:12px; border:2px solid #dee2e6;">
                    </div>
                    <div class="alert alert-danger py-2 small" *ngIf="otpError && !showSuspensionLink">{{ otpError }}</div>
                    <div class="alert alert-danger py-2 small" *ngIf="otpError && showSuspensionLink">
                      {{ otpError }}
                      <a href="javascript:void(0)" class="fw-bold text-danger ms-1" style="text-decoration: none;" (click)="showAppealModal = true">
                      Request for un-suspension
                      </a>
                    </div>
                    <div class="alert alert-success py-2 small" *ngIf="otpSuccess">{{ otpSuccess }}</div>
                    <button class="btn btn-success btn-lg w-100 rounded-3 fw-bold" (click)="onVerify()" [disabled]="otpValue.length < 6 || verifying" style="padding:14px;">
                      <span *ngIf="verifying" class="spinner-border spinner-border-sm me-2"></span> {{ verifying ? 'Verifying...' : '✓ Verify' }}
                    </button>
                    <div class="mt-3">
                      <button class="btn btn-link fw-bold small p-0 m-0" (click)="onResend()" [disabled]="countdown > 0" style="color: black !important; text-decoration: underline;">
                        {{ countdown > 0 ? 'Resend in ' + countdown + 's' : 'resend code' }}
                      </button>
                    </div>
                  </div>

                  <div class="card-body p-4 p-md-5" *ngIf="otpVerified">
                    <h4 class="fw-bold mb-4 text-center" style="color: var(--auth-text-color);">Set Password</h4>
                    <form [formGroup]="passForm" (ngSubmit)="onSetPassword()">
                      <div class="mb-3">
                        <label class="form-label fw-semibold text-muted small">NEW PASSWORD</label>
                        <div class="input-group">
                          <input [type]="showPassword ? 'text' : 'password'" class="form-control form-control-lg bg-light border-0 border-end-0 rounded-3" style="border-top-right-radius: 0 !important; border-bottom-right-radius: 0 !important;" formControlName="password" placeholder="Min 6 characters">
                          <button class="input-group-text border-0 border-start-0 cursor-pointer" style="color: var(--auth-input-text) !important; border-top-left-radius: 0 !important; border-bottom-left-radius: 0 !important;" type="button" (click)="showPassword = !showPassword">
                            <i class="bi" [ngClass]="showPassword ? 'bi-eye-slash-fill' : 'bi-eye-fill'"></i>
                          </button>
                        </div>
                      </div>
                      <div class="mb-3">
                        <label class="form-label fw-semibold text-muted small">CONFIRM</label>
                        <div class="input-group">
                          <input [type]="showConfirmPassword ? 'text' : 'password'" class="form-control form-control-lg bg-light border-0 border-end-0 rounded-3" style="border-top-right-radius: 0 !important; border-bottom-right-radius: 0 !important;" formControlName="confirm" placeholder="Re-enter">
                          <button class="input-group-text border-0 border-start-0 cursor-pointer" style="color: var(--auth-input-text) !important; border-top-left-radius: 0 !important; border-bottom-left-radius: 0 !important;" type="button" (click)="showConfirmPassword = !showConfirmPassword">
                            <i class="bi" [ngClass]="showConfirmPassword ? 'bi-eye-slash-fill' : 'bi-eye-fill'"></i>
                          </button>
                        </div>
                      </div>
                      <div class="alert alert-danger py-2 small" *ngIf="passError">{{ passError }}</div>
                      <div class="alert alert-success py-2 small" *ngIf="passSuccess">{{ passSuccess }}</div>
                      <button type="submit" class="btn btn-lg w-100 rounded-3 fw-bold" [disabled]="passForm.invalid || passSaving || passForm.value.password !== passForm.value.confirm"
                        style="background: linear-gradient(135deg, #6f42c1, #d63384); border: none; padding: 14px; color: #fff;">
                        {{ passSaving ? 'Saving...' : '🔐 Set Password' }}
                      </button>
                    </form>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </div>

      <!-- Appeal Modal -->
      <div class="modal fade" [class.show]="showAppealModal" [style.display]="showAppealModal ? 'block' : 'none'" tabindex="-1" style="z-index: 1060;">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content border-0 shadow-lg" style="border-radius: 20px;">
            <div class="modal-header border-0 pb-0">
              <h5 class="fw-bold mb-0">Account Suspended</h5>
              <button type="button" class="btn-close" (click)="showAppealModal = false"></button>
            </div>
            <div class="modal-body py-4">
              <div class="alert alert-danger border-0 small mb-4">
                <i class="bi bi-exclamation-triangle-fill me-2"></i>
                {{ suspensionMessage }}
              </div>
              
              <div class="mb-3">
                <label class="form-label small fw-bold text-uppercase">Appeal Message</label>
                <textarea class="form-control" rows="4" [(ngModel)]="appealMessage" placeholder="Explain why your account should be reactivated..."></textarea>
              </div>
              <p class="text-muted small mb-0">Our team will review your request and get back to you soon.</p>
            </div>
            <div class="modal-footer border-0 pt-0">
              <button class="btn btn-light rounded-pill px-4" (click)="showAppealModal = false">Cancel</button>
              <button class="btn btn-primary rounded-pill px-4" (click)="submitAppeal()" [disabled]="!appealMessage.trim() || appealLoading">
                <span *ngIf="appealLoading" class="spinner-border spinner-border-sm me-2"></span>
                Submit Appeal
              </button>
            </div>
          </div>
        </div>
      </div>
      <div class="modal-backdrop fade" [class.show]="showAppealModal" *ngIf="showAppealModal" (click)="showAppealModal = false"></div>
    </div>
  `,
  styles: [`
    .step-circle { width:32px;height:32px;border-radius:50%;background:rgba(0,0,0,.1);color:var(--c-deep-green);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:13px;transition:all .3s; border: 1px solid var(--c-silver) }
    .step-circle.active { background:var(--c-forest);color:#fff;box-shadow:0 0 12px rgba(3,76,54,.5) }
    .step-line { width:30px;height:3px;background:rgba(0,0,0,.1);border-radius:3px;transition:all .3s }
    .step-line.active { background:var(--c-forest) }
    .otp-input:focus { border-color:var(--c-rose)!important;box-shadow:0 0 0 3px rgba(111, 66, 193, 0.15) }
    .role-card:hover { border-color:var(--c-forest)!important;transform:translateY(-2px);box-shadow:0 4px 12px rgba(0,0,0,.08) }
    label {
      color: var(--auth-text-color) !important;
      font-weight: 700 !important;
      letter-spacing: 1px;
    }
    .form-control, .form-select, .input-group-text {
      border: 1px solid var(--auth-text-color) !important;
      background-color: #E8F0FE !important;
      color: var(--auth-input-text) !important;
    }
    .form-control::placeholder {
      color: rgba(0, 0, 0, 0.4) !important;
    }
    .form-control:focus, .form-select:focus {
      box-shadow: 0 0 0 3px rgba(255, 255, 255, 1);
      border-color: var(--c-rose) !important;
      background-color: var(--auth-input-bg) !important;
    }
    .input-group-text {
      background-color: rgba(0, 0, 0, 0.2) !important;
      color: var(--auth-text-color) !important;
      font-weight: 600;
    }
    .text-muted {
      --bs-text-opacity: 1 !important;
      color: #ffffff !important;
    }
  `]
})
export class RegisterComponent {
  authForm: FormGroup;
  passForm: FormGroup;
  hostForm: FormGroup;
  step = 1;
  loading = false;
  error = '';
  userEmail = '';
  selectedRole = '';
  authMode: 'otp' | 'host' = 'otp';
  showPassword = false;
  showConfirmPassword = false;

  // Host login
  hostLoading = false;
  hostError = '';

  // OTP
  otpValues = ['','','','','',''];
  otpError = ''; otpSuccess = '';
  showSuspensionLink = false;
  verifying = false;
  otpVerified = false;
  countdown = 0;
  private timer: any;

  // Pass
  passSaving = false; passError = ''; passSuccess = '';

  roles = [
    { value: 'buyer', icon: '<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>', label: 'Buyer / Tenant', desc: 'Browse properties, save favorites, contact owners & agents' },
    { value: 'agent', icon: '<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>', label: 'Agent', desc: 'List properties for clients, manage inquiries, professional tools' },
  ];

  constructor(private fb: FormBuilder, private router: Router, private auth: AuthService) {
    if (this.auth.currentUserValue) this.router.navigate(['/']);

    this.authForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      phone: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(10)]]
    });
    this.passForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirm: ['', [Validators.required, Validators.minLength(6)]],
    });
    this.hostForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });
  }

  get otpValue() { return this.otpValues.join(''); }

  // ═══ HOST LOGIN ═══
  onHostLogin() {
    if (this.hostForm.invalid) return;
    this.hostLoading = true; this.hostError = ''; this.showSuspensionLink = false;
    this.auth.hostLogin(this.hostForm.value.email, this.hostForm.value.password).subscribe({
      next: (res: any) => {
        this.hostLoading = false;
        if (!res.isProfileComplete) this.router.navigate(['/complete-profile']);
        else this.router.navigate(['/host-dashboard']);
      },
      error: (e: any) => {
        this.hostLoading = false;
        const msg = e.error?.message || e.message || '';
        const isSuspMsg = msg.toLowerCase().includes('your account is suspended');
        if ((e.status === 403 && e.error?.isSuspended) || isSuspMsg) {
          this.userEmail = this.hostForm.value.email;
          this.hostError = msg;
          this.suspensionMessage = msg;
          this.showSuspensionLink = true;
          this.showAppealModal = true;
        } else {
          this.hostError = e.error?.message || 'Invalid credentials';
        }
      }
    });
  }

  // ═══ STEP 1 ═══
  onSubmitAuth() {
    this.loading = true; this.error = ''; this.showSuspensionLink = false;
    const d: any = { 
      email: this.authForm.value.email, 
      verificationMethod: 'both',
      firstName: this.authForm.value.firstName,
      lastName: this.authForm.value.lastName,
      phone: '+91' + this.authForm.value.phone
    };

    this.auth.registerOrLogin(d).subscribe({
      next: (res: any) => {
        this.loading = false;
        this.userEmail = res.email;
        if (res.needsRole) { this.step = 2; } // First-time user
        else { this.step = 3; this.startTimer(); } // Existing user or OTP sent
      },
      error: (e: any) => {
        this.loading = false;
        if (e.error?.needsRole) { this.step = 2; }
        else { this.error = e.error?.message || 'Something went wrong'; }
      }
    });
  }

  // ═══ STEP 2: Role ═══
  onSelectRole() {
    this.loading = true; this.error = '';
    const d: any = {
      email: this.authForm.value.email,
      firstName: this.authForm.value.firstName,
      lastName: this.authForm.value.lastName,
      phone: '+91' + this.authForm.value.phone,
      role: this.selectedRole,
      verificationMethod: 'both',
    };

    this.auth.registerOrLogin(d).subscribe({
      next: (res: any) => { this.loading = false; this.userEmail = res.email; this.step = 3; this.startTimer(); },
      error: (e: any) => { this.loading = false; this.error = e.error?.message || 'Failed'; }
    });
  }

  // ═══ OTP ═══
  onOtpInput(e: any, i: number) {
    if (!/^\d$/.test(e.target.value)) { e.target.value = ''; this.otpValues[i] = ''; return; }
    this.otpValues[i] = e.target.value;
    if (i < 5) (document.getElementById('otp-' + (i + 1)) as HTMLInputElement)?.focus();
  }
  onOtpKeyDown(e: KeyboardEvent, i: number) {
    if (e.key === 'Backspace') {
      if (this.otpValues[i]) { this.otpValues[i] = ''; (e.target as HTMLInputElement).value = ''; }
      else if (i > 0) { const p = document.getElementById('otp-' + (i-1)) as HTMLInputElement; if (p) { p.value=''; this.otpValues[i-1]=''; p.focus(); } }
      e.preventDefault();
    }
  }
  onOtpPaste(e: ClipboardEvent) {
    e.preventDefault();
    const d = (e.clipboardData?.getData('text') || '').replace(/\D/g, '').substring(0, 6);
    for (let i = 0; i < 6; i++) { const el = document.getElementById('otp-' + i) as HTMLInputElement; if (el) { el.value = d[i] || ''; this.otpValues[i] = d[i] || ''; } }
  }

  onVerify() {
    this.verifying = true; this.otpError = ''; this.otpSuccess = ''; this.showSuspensionLink = false;
    this.auth.verifyOTP(this.userEmail, this.otpValue).subscribe({
      next: (res: any) => { this.verifying = false; this.otpSuccess = 'Verified!';
        if (res.needsPassword) { setTimeout(() => { this.otpVerified = true; this.otpSuccess = ''; }, 800); }
        else if (!res.isProfileComplete) { setTimeout(() => this.router.navigate(['/complete-profile']), 800); }
        else { setTimeout(() => this.goHome(), 800); }
      },
      error: (e: any) => {
        this.verifying = false;
        const msg = e.error?.message || e.message || '';
        const isSuspMsg = msg.toLowerCase().includes('your account is suspended');
        if ((e.status === 403 && e.error?.isSuspended) || isSuspMsg) {
          this.otpError = msg;
          this.suspensionMessage = msg;
          this.showSuspensionLink = true;
          this.showAppealModal = true;
        } else {
          this.otpError = e.error?.message || 'Invalid OTP';
        }
      }
    });
  }

  onResend() {
    this.otpError = '';
    this.auth.resendOTP(this.userEmail, 'both').subscribe({
      next: () => { this.otpSuccess = 'New code sent!'; this.startTimer(); },
      error: (e: any) => { this.otpError = e.error?.message || 'Failed'; }
    });
  }

  startTimer() { this.countdown = 60; clearInterval(this.timer); this.timer = setInterval(() => { this.countdown--; if (this.countdown <= 0) clearInterval(this.timer); }, 1000); }

  // ═══ STEP 4: Password ═══
  onSetPassword() {
    if (this.passForm.value.password !== this.passForm.value.confirm) { this.passError = 'Passwords don\'t match'; return; }
    this.passSaving = true; this.passError = '';
    this.auth.setPassword(this.passForm.value.password).subscribe({
      next: () => { 
        this.passSaving = false; this.passSuccess = 'Password set!'; 
        setTimeout(() => this.router.navigate(['/complete-profile']), 1000); 
      },
      error: (e: any) => { this.passSaving = false; this.passError = e.error?.message || 'Failed'; }
    });
  }

  goHome() {
    const u = this.auth.currentUserValue;
    if (!u?.isProfileComplete) { this.router.navigate(['/complete-profile']); return; }
    if (u.role === 'host') this.router.navigate(['/host-dashboard']);
    else if (u.role === 'agent') this.router.navigate(['/dashboard']);
    else this.router.navigate(['/']);
  }

  // Appeal logic
  showAppealModal = false;
  suspensionMessage = '';
  appealMessage = '';
  appealLoading = false;

  submitAppeal() {
    if (!this.appealMessage.trim()) return;
    this.appealLoading = true;
    this.auth.submitAppeal(this.userEmail, this.appealMessage).subscribe({
      next: (res) => {
        alert(res.message);
        this.showAppealModal = false;
        this.appealLoading = false;
        this.appealMessage = '';
      },
      error: (err) => {
        const errorMsg = err.error?.message || err.message || 'Failed to submit appeal';
        alert(errorMsg);
        this.appealLoading = false;
      }
    });
  }
}
