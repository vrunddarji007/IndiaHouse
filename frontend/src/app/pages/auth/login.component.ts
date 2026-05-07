import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { environment } from '../../../environments/environment';

declare var google: any;

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, FormsModule],
  template: `
    <div class="min-vh-100 d-flex align-items-center" style="padding-top: 50px;">
      <div class="container py-4">
        <div class="row justify-content-center">
          <div class="col-lg-5 col-md-7">
            <div class="card border-0 shadow-lg" style="border-radius: 20px; overflow: hidden; background-color: var(--auth-card-bg); border: 2px solid var(--auth-card-border);">
              <div class="text-center d-flex flex-column justify-content-center" style="height: 160px; background: transparent; border-bottom: 4px solid var(--c-rose); color: #212529;">
                <h2 class="fw-bold mb-1 d-flex align-items-center justify-content-center gap-2">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                  Welcome Back
                </h2>
                <p class="text-muted mb-0 small">Sign in to your IndiaHomes account</p>
              </div>

              <div class="card-body p-4 p-md-5">
                <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
                  <div class="mb-3">
                    <label class="form-label fw-bold small">EMAIL ADDRESS</label>
                    <input type="email" class="form-control form-control-lg rounded-3" formControlName="email" placeholder="you&#64;example.com">
                  </div>
                  <div class="mb-3">
                    <label class="form-label fw-bold small">PASSWORD</label>
                    <div class="input-group">
                      <input [type]="showPassword ? 'text' : 'password'" class="form-control form-control-lg rounded-start-3 border-end-0" formControlName="password" placeholder="••••••••">
                      <button class="input-group-text border-start-0 cursor-pointer" style="color: var(--auth-input-text) !important;" type="button" (click)="showPassword = !showPassword">
                        <i class="bi" [ngClass]="showPassword ? 'bi-eye-slash-fill' : 'bi-eye-fill'"></i>
                      </button>
                    </div>
                  </div>

                  <!-- Forgot Password Link -->
                  <div class="text-end mb-2">
                    <a href="javascript:void(0)" class="small fw-semibold text-decoration-none forgot-password-link" (click)="openForgotPassword()">
                      Forgot Password?
                    </a>
                  </div>

                  <div class="alert alert-danger py-2 small" *ngIf="error && !showSuspensionLink">{{ error }}</div>
                  
                  <div class="alert alert-danger py-2 small" *ngIf="error && showSuspensionLink">
                    {{ error }}
                    <a href="javascript:void(0)" class="fw-bold text-danger ms-1" style="text-decoration: none;" (click)="showAppealModal = true">
                    Request for un-suspension
                    </a>
                  </div>
                  <button type="submit" class="btn btn-primary btn-lg w-100 rounded-3 fw-bold mt-3" [disabled]="loginForm.invalid || loading"
                    style="background: linear-gradient(-135deg, var(--c-forest), var(--c-deep-green)); border: none; padding: 14px;">
                    <span *ngIf="loading" class="spinner-border spinner-border-sm me-2"></span>
                    Log In
                  </button>
                </form>

                <!-- Google Login Divider -->
                <div class="d-flex align-items-center my-4">
                  <hr class="flex-grow-1">
                  <span class="mx-3 text-muted small fw-bold">OR CONTINUE WITH</span>
                  <hr class="flex-grow-1">
                </div>

                <div class="d-flex justify-content-center mt-2">
                  <div class="glass-google-wrapper w-100 p-3 rounded-4 animate__animated animate__fadeInUp animate__delay-1s">
                    <div id="googleBtn" class="w-100 google-btn-styled"></div>
                  </div>
                </div>

                <p class="text-center mt-4 mb-0 small" style="color: var(--auth-text-color);">Don't have an account? <a routerLink="/auth/register" class="fw-bold text-decoration-none" style="color: var(--c-rose);">Sign Up</a></p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Forgot Password Modal -->
      <div class="modal fade" [class.show]="showForgotModal" [style.display]="showForgotModal ? 'block' : 'none'" tabindex="-1">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content border-0 shadow-lg" style="border-radius: 20px; overflow: hidden;">
            <!-- Modal Header -->
            <div class="text-center py-4 px-4" style="background: linear-gradient(-135deg, var(--c-forest), var(--c-deep-green));">
              <div class="d-flex justify-content-between align-items-start mb-2">
                <div></div>
                <button type="button" class="btn-close btn-close-white" (click)="closeForgotModal()"></button>
              </div>
              <div class="forgot-icon-wrapper mx-auto mb-3">
                <i class="bi" [ngClass]="{
                  'bi-envelope-at-fill': forgotStep === 1,
                  'bi-shield-lock-fill': forgotStep === 2,
                  'bi-key-fill': forgotStep === 3,
                  'bi-check-circle-fill': forgotStep === 4
                }" style="font-size: 2.5rem; color: #fff;"></i>
              </div>
              <h5 class="fw-bold text-white mb-1">
                {{ forgotStep === 1 ? 'Forgot Password' : forgotStep === 2 ? 'Verify OTP' : forgotStep === 3 ? 'New Password' : 'Success!' }}
              </h5>
              <p class="text-white-50 small mb-0">
                {{ forgotStep === 1 ? 'Enter your email to receive a reset code' : forgotStep === 2 ? 'Enter the 6-digit code sent to your email' : forgotStep === 3 ? 'Create a strong new password' : 'Password updated successfully' }}
              </p>
            </div>

            <!-- Step Progress -->
            <div class="d-flex gap-2 px-4 pt-3" *ngIf="forgotStep < 4">
              <div class="forgot-step-bar" [class.active]="forgotStep >= 1"></div>
              <div class="forgot-step-bar" [class.active]="forgotStep >= 2"></div>
              <div class="forgot-step-bar" [class.active]="forgotStep >= 3"></div>
            </div>

            <div class="modal-body p-4">
              <!-- Step 1: Enter Email -->
              <div *ngIf="forgotStep === 1">
                <div class="mb-3">
                  <label class="form-label small fw-bold text-uppercase">Email Address</label>
                  <div class="input-group">
                    <span class="input-group-text"><i class="bi bi-envelope-fill"></i></span>
                    <input type="email" class="form-control form-control-lg" [(ngModel)]="forgotEmail" placeholder="you&#64;example.com" (keydown.enter)="sendForgotOTP()">
                  </div>
                </div>
                <div class="alert alert-danger py-2 small" *ngIf="forgotError">
                  <i class="bi bi-exclamation-circle-fill me-1"></i> {{ forgotError }}
                </div>
                <button class="btn btn-lg w-100 rounded-3 fw-bold" (click)="sendForgotOTP()" [disabled]="!forgotEmail || forgotLoading"
                  style="background: linear-gradient(-135deg, var(--c-forest), var(--c-deep-green)); border: none; color: #fff; padding: 12px;">
                  <span *ngIf="forgotLoading" class="spinner-border spinner-border-sm me-2"></span>
                  <i class="bi bi-send-fill me-2" *ngIf="!forgotLoading"></i>
                  Send Reset Code
                </button>
              </div>

              <!-- Step 2: Enter OTP -->
              <div *ngIf="forgotStep === 2">
                <div class="mb-3">
                  <label class="form-label small fw-bold text-uppercase">Verification Code</label>
                  <div class="otp-input-group d-flex gap-2 justify-content-center">
                    <input *ngFor="let digit of otpDigits; let i = index; trackBy: trackByIndex"
                      type="text" maxlength="1" class="form-control form-control-lg text-center otp-digit-input"
                      [id]="'otp-digit-' + i"
                      [value]="otpDigits[i]"
                      (input)="onOtpInput(i, $event)"
                      (keydown)="onOtpKeydown(i, $event)"
                      (paste)="onOtpPaste($event)"
                      inputmode="numeric"
                      style="width: 52px; height: 56px; font-size: 1.5rem; font-weight: 700; border-radius: 12px;">
                  </div>
                  <p class="text-muted small mt-2 text-center">
                    Code sent to <strong>{{ forgotEmail }}</strong>
                    <a href="javascript:void(0)" class="ms-2" style="color: var(--c-rose);" (click)="resendForgotOTP()" *ngIf="!resendCooldown">Resend</a>
                    <span class="ms-2 text-muted" *ngIf="resendCooldown">Resend in {{ resendCooldown }}s</span>
                  </p>
                </div>
                <div class="alert alert-danger py-2 small" *ngIf="forgotError">
                  <i class="bi bi-exclamation-circle-fill me-1"></i> {{ forgotError }}
                </div>
                <button class="btn btn-lg w-100 rounded-3 fw-bold" (click)="verifyForgotOTP()" [disabled]="getOtpString().length !== 6 || forgotLoading"
                  style="background: linear-gradient(-135deg, var(--c-forest), var(--c-deep-green)); border: none; color: #fff; padding: 12px;">
                  <span *ngIf="forgotLoading" class="spinner-border spinner-border-sm me-2"></span>
                  <i class="bi bi-shield-check me-2" *ngIf="!forgotLoading"></i>
                  Verify Code
                </button>
              </div>

              <!-- Step 3: New Password -->
              <div *ngIf="forgotStep === 3">
                <div class="mb-3">
                  <label class="form-label small fw-bold text-uppercase">New Password</label>
                  <div class="input-group">
                    <span class="input-group-text"><i class="bi bi-lock-fill"></i></span>
                    <input [type]="showNewPassword ? 'text' : 'password'" class="form-control form-control-lg border-end-0" [(ngModel)]="newPassword" placeholder="Enter new password">
                    <button class="input-group-text border-start-0" type="button" (click)="showNewPassword = !showNewPassword">
                      <i class="bi" [ngClass]="showNewPassword ? 'bi-eye-slash-fill' : 'bi-eye-fill'"></i>
                    </button>
                  </div>
                </div>
                <div class="mb-3">
                  <label class="form-label small fw-bold text-uppercase">Confirm Password</label>
                  <div class="input-group">
                    <span class="input-group-text"><i class="bi bi-lock-fill"></i></span>
                    <input [type]="showConfirmPassword ? 'text' : 'password'" class="form-control form-control-lg border-end-0" [(ngModel)]="confirmPassword" placeholder="Confirm new password" (keydown.enter)="resetPassword()">
                    <button class="input-group-text border-start-0" type="button" (click)="showConfirmPassword = !showConfirmPassword">
                      <i class="bi" [ngClass]="showConfirmPassword ? 'bi-eye-slash-fill' : 'bi-eye-fill'"></i>
                    </button>
                  </div>
                </div>

                <!-- Password strength indicators -->
                <div class="password-strength mb-3" *ngIf="newPassword">
                  <div class="d-flex gap-1 mb-1">
                    <div class="strength-bar" [class.active]="newPassword.length >= 6" [class.weak]="newPassword.length >= 6 && getPasswordStrength() <= 1"></div>
                    <div class="strength-bar" [class.active]="getPasswordStrength() >= 2" [class.medium]="getPasswordStrength() === 2"></div>
                    <div class="strength-bar" [class.active]="getPasswordStrength() >= 3" [class.strong]="getPasswordStrength() >= 3"></div>
                    <div class="strength-bar" [class.active]="getPasswordStrength() >= 4" [class.very-strong]="getPasswordStrength() >= 4"></div>
                  </div>
                  <small class="text-muted">{{ getPasswordStrengthLabel() }}</small>
                </div>

                <div class="alert alert-danger py-2 small" *ngIf="forgotError">
                  <i class="bi bi-exclamation-circle-fill me-1"></i> {{ forgotError }}
                </div>
                <button class="btn btn-lg w-100 rounded-3 fw-bold" (click)="resetPassword()" [disabled]="!newPassword || newPassword.length < 6 || newPassword !== confirmPassword || forgotLoading"
                  style="background: linear-gradient(-135deg, var(--c-forest), var(--c-deep-green)); border: none; color: #fff; padding: 12px;">
                  <span *ngIf="forgotLoading" class="spinner-border spinner-border-sm me-2"></span>
                  <i class="bi bi-check2-circle me-2" *ngIf="!forgotLoading"></i>
                  Reset Password
                </button>
              </div>

              <!-- Step 4: Success -->
              <div *ngIf="forgotStep === 4" class="text-center py-3">
                <div class="success-checkmark mb-3">
                  <i class="bi bi-check-circle-fill" style="font-size: 4rem; color: var(--c-forest);"></i>
                </div>
                <h5 class="fw-bold mb-2">Password Reset Complete</h5>
                <p class="text-muted small mb-4">You can now log in with your new password.</p>
                <button class="btn btn-lg w-100 rounded-3 fw-bold"
                  (click)="closeForgotModal()"
                  style="background: linear-gradient(-135deg, var(--c-forest), var(--c-deep-green)); border: none; color: #fff; padding: 12px;">
                  <i class="bi bi-box-arrow-in-right me-2"></i>
                  Back to Login
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="modal-backdrop fade" [class.show]="showForgotModal" *ngIf="showForgotModal" (click)="closeForgotModal()"></div>

      <!-- Appeal Modal -->
      <div class="modal fade" [class.show]="showAppealModal" [style.display]="showAppealModal ? 'block' : 'none'" tabindex="-1">
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
      label {
        color: var(--auth-text-color) !important;
        font-weight: 700 !important;
        letter-spacing: 1px;
      }
      .form-control, .input-group-text {
        border: 1px solid var(--auth-text-color) !important;
        background-color: #E8F0FE !important;
        color: var(--auth-input-text) !important;
      }
      .form-control::placeholder {
        color: rgba(0, 0, 0, 0.4) !important;
      }
      .form-control:focus {
        box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.1);
        border-color: var(--c-rose) !important;
        background-color: var(--auth-input-bg) !important;
      }
      .text-muted {
        --bs-text-opacity: 1 !important;
        color: #ffffff !important;
      }

      /* Forgot Password Link */
      .forgot-password-link {
        color: var(--c-rose);
        transition: all 0.2s ease;
        position: relative;
      }
      .forgot-password-link:hover {
        color: var(--c-rose);
        opacity: 0.85;
      }
      .forgot-password-link::after {
        content: '';
        position: absolute;
        bottom: -2px;
        left: 0;
        width: 0;
        height: 1.5px;
        background: var(--c-rose);
        transition: width 0.3s ease;
      }
      .forgot-password-link:hover::after {
        width: 100%;
      }

      /* Forgot Password Modal */
      .forgot-icon-wrapper {
        width: 72px;
        height: 72px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.15);
        display: flex;
        align-items: center;
        justify-content: center;
        backdrop-filter: blur(10px);
      }

      .forgot-step-bar {
        flex: 1;
        height: 4px;
        border-radius: 2px;
        background: #e9ecef;
        transition: background 0.3s ease;
      }
      .forgot-step-bar.active {
        background: var(--c-forest);
      }

      /* OTP Input */
      .otp-digit-input {
        border: 2px solid #dee2e6 !important;
        background: #f8f9fa !important;
        transition: all 0.2s ease;
        caret-color: var(--c-forest);
      }
      .otp-digit-input:focus {
        border-color: var(--c-forest) !important;
        background: #fff !important;
        box-shadow: 0 0 0 4px rgba(0, 77, 64, 0.12) !important;
        transform: scale(1.05);
      }

      /* Password strength bars */
      .strength-bar {
        flex: 1;
        height: 4px;
        border-radius: 2px;
        background: #e9ecef;
        transition: all 0.3s ease;
      }
      .strength-bar.active.weak { background: #dc3545; }
      .strength-bar.active.medium { background: #ffc107; }
      .strength-bar.active.strong { background: #28a745; }
      .strength-bar.active.very-strong { background: #1b8a3a; }

      /* Success animation */
      .success-checkmark {
        animation: scaleIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      }
      @keyframes scaleIn {
        0% { transform: scale(0); opacity: 0; }
        100% { transform: scale(1); opacity: 1; }
      }

      /* Modal overrides for non-auth context */
      .modal-content label {
        color: #333 !important;
      }
      .modal-content .form-control,
      .modal-content .input-group-text {
        border: 1px solid #dee2e6 !important;
        background-color: #f8f9fa !important;
        color: #333 !important;
      }
      .modal-content .form-control:focus {
        border-color: var(--c-forest) !important;
        background-color: #fff !important;
        box-shadow: 0 0 0 4px rgba(0, 77, 64, 0.12) !important;
      }
      .modal-content .text-muted {
        color: #6c757d !important;
      }
    `]
  })
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;
  error = '';
  userEmail = '';
  showSuspensionLink = false;
  returnUrl: string;

  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {
    if (this.authService.currentUserValue) {
      this.router.navigate(['/']);
    }

    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  ngOnInit() {
    this.initializeGoogleLogin();
  }

  initializeGoogleLogin() {
    if (typeof google !== 'undefined') {
      google.accounts.id.initialize({
        client_id: environment.googleClientId,
        callback: (resp: any) => this.handleGoogleCredential(resp)
      });
      google.accounts.id.renderButton(
        document.getElementById('googleBtn'),
        { theme: 'outline', size: 'large', width: '100%', shape: 'rectangular' }
      );
    } else {
      setTimeout(() => this.initializeGoogleLogin(), 1000);
    }
  }

  handleGoogleCredential(resp: any) {
    this.loading = true;
    this.authService.googleLogin(resp.credential).subscribe({
      next: (res: any) => {
        if (res.isNewUser || !res.isProfileComplete) {
          // If profile is incomplete, go back to Role/Profile selection
          this.router.navigate(['/auth/register'], { queryParams: { google: 'true', step: 2 } });
        } else if (res.needsTerms) {
          this.router.navigate(['/auth/register'], { queryParams: { google: 'true', step: 5 } });
        } else {
          this.router.navigate([this.returnUrl]);
        }
      },
      error: err => {
        console.error('[GOOGLE LOGIN ERROR]', err);
        const detail = err.error?.message || err.message || JSON.stringify(err);
        this.error = 'Google Auth Failed: ' + detail;
        this.loading = false;
        alert('Diagnostic Error: ' + detail);
      }
    });
  }

  onSubmit() {
    if (this.loginForm.invalid) return;

    this.loading = true;
    this.error = '';
    this.showSuspensionLink = false;

    this.authService.login(this.loginForm.value.email, this.loginForm.value.password)
      .subscribe({
        next: () => {
          this.router.navigate([this.returnUrl]);
        },
        error: error => {
          this.error = error.error?.message || error.message;
          
          const isSuspMsg = this.error.toLowerCase().includes('your account is suspended');
          if ((error.status === 403 && error.error?.isSuspended) || isSuspMsg) {
            this.userEmail = this.loginForm.value.email;
            this.showSuspensionLink = true;
            this.suspensionMessage = this.error;
            this.showAppealModal = true;
          } else if (error.error?.notVerified) {
            this.router.navigate(['/auth/register']);
          }
          this.loading = false;
        }
      });
  }

  // ─── Forgot Password Logic ───
  showForgotModal = false;
  forgotStep = 1; // 1=email, 2=otp, 3=new password, 4=success
  forgotEmail = '';
  forgotError = '';
  forgotLoading = false;
  otpDigits: string[] = ['', '', '', '', '', ''];
  newPassword = '';
  confirmPassword = '';
  showNewPassword = false;
  showConfirmPassword = false;
  resendCooldown = 0;
  private resendTimer: any;

  openForgotPassword() {
    this.showForgotModal = true;
    this.forgotStep = 1;
    this.forgotError = '';
    this.forgotLoading = false;
    this.otpDigits = ['', '', '', '', '', ''];
    this.newPassword = '';
    this.confirmPassword = '';
    // Pre-fill email if already typed in login form
    if (this.loginForm.value.email) {
      this.forgotEmail = this.loginForm.value.email;
    }
  }

  closeForgotModal() {
    this.showForgotModal = false;
    this.forgotError = '';
    this.forgotLoading = false;
    if (this.resendTimer) clearInterval(this.resendTimer);
    this.resendCooldown = 0;
  }

  sendForgotOTP() {
    if (!this.forgotEmail) return;
    this.forgotLoading = true;
    this.forgotError = '';

    this.authService.forgotPassword(this.forgotEmail).subscribe({
      next: () => {
        this.forgotLoading = false;
        this.forgotStep = 2;
        this.startResendCooldown();
      },
      error: (err) => {
        this.forgotError = err.error?.message || 'Failed to send reset code';
        this.forgotLoading = false;
      }
    });
  }

  resendForgotOTP() {
    if (this.resendCooldown > 0) return;
    this.forgotLoading = true;
    this.forgotError = '';

    this.authService.forgotPassword(this.forgotEmail).subscribe({
      next: () => {
        this.forgotLoading = false;
        this.startResendCooldown();
      },
      error: (err) => {
        this.forgotError = err.error?.message || 'Failed to resend code';
        this.forgotLoading = false;
      }
    });
  }

  startResendCooldown() {
    this.resendCooldown = 30;
    if (this.resendTimer) clearInterval(this.resendTimer);
    this.resendTimer = setInterval(() => {
      this.resendCooldown--;
      if (this.resendCooldown <= 0) {
        clearInterval(this.resendTimer);
      }
    }, 1000);
  }

  getOtpString(): string {
    return this.otpDigits.join('');
  }

  trackByIndex(index: number, obj: any): any {
    return index;
  }

  onOtpInput(index: number, event: any) {
    const inputElement = event.target as HTMLInputElement;
    let value = inputElement.value;

    // Handle android/mobile double-entry by taking the last character if multiple are present
    if (value.length > 1) {
      value = value.substring(value.length - 1);
      inputElement.value = value;
    }

    if (value && !/^\d$/.test(value)) {
      this.otpDigits[index] = '';
      inputElement.value = '';
      return;
    }
    
    this.otpDigits[index] = value;

    if (value && index < 5) {
      const nextInput = document.getElementById('otp-digit-' + (index + 1)) as HTMLInputElement;
      if (nextInput) {
        // slight timeout helps on mobile devices so focus transition is smoother
        setTimeout(() => nextInput.focus(), 10);
      }
    }
    // Auto-verify when all 6 digits entered
    if (this.getOtpString().length === 6) {
      this.verifyForgotOTP();
    }
  }

  onOtpKeydown(index: number, event: KeyboardEvent) {
    if (event.key === 'Backspace' && !this.otpDigits[index] && index > 0) {
      const prevInput = document.getElementById('otp-digit-' + (index - 1)) as HTMLInputElement;
      if (prevInput) {
        this.otpDigits[index - 1] = '';
        prevInput.focus();
      }
    }
  }

  onOtpPaste(event: ClipboardEvent) {
    event.preventDefault();
    const pasted = event.clipboardData?.getData('text')?.replace(/\D/g, '').slice(0, 6) || '';
    for (let i = 0; i < 6; i++) {
      this.otpDigits[i] = pasted[i] || '';
    }
    if (pasted.length === 6) {
      const lastInput = document.getElementById('otp-digit-5') as HTMLInputElement;
      if (lastInput) lastInput.focus();
      this.verifyForgotOTP();
    }
  }

  verifyForgotOTP() {
    const otp = this.getOtpString();
    if (otp.length !== 6) return;
    // OTP is verified on the server during resetPassword. Just move to step 3.
    this.forgotError = '';
    this.forgotStep = 3;
  }

  resetPassword() {
    if (this.newPassword.length < 6) {
      this.forgotError = 'Password must be at least 6 characters';
      return;
    }
    if (this.newPassword !== this.confirmPassword) {
      this.forgotError = 'Passwords do not match';
      return;
    }

    this.forgotLoading = true;
    this.forgotError = '';

    this.authService.resetPassword(this.forgotEmail, this.getOtpString(), this.newPassword).subscribe({
      next: () => {
        this.forgotLoading = false;
        this.forgotStep = 4;
      },
      error: (err) => {
        this.forgotError = err.error?.message || 'Failed to reset password';
        this.forgotLoading = false;
        // If OTP was invalid, go back to OTP step
        if (err.error?.message?.toLowerCase().includes('otp')) {
          this.forgotStep = 2;
          this.otpDigits = ['', '', '', '', '', ''];
        }
      }
    });
  }

  getPasswordStrength(): number {
    let strength = 0;
    if (this.newPassword.length >= 6) strength++;
    if (/[A-Z]/.test(this.newPassword)) strength++;
    if (/[0-9]/.test(this.newPassword)) strength++;
    if (/[^A-Za-z0-9]/.test(this.newPassword)) strength++;
    return strength;
  }

  getPasswordStrengthLabel(): string {
    const s = this.getPasswordStrength();
    if (s <= 1) return 'Weak password';
    if (s === 2) return 'Fair password';
    if (s === 3) return 'Strong password';
    return 'Very strong password';
  }

  // ─── Appeal Logic ───
  showAppealModal = false;
  suspensionMessage = '';
  appealMessage = '';
  appealLoading = false;

  submitAppeal() {
    if (!this.appealMessage.trim()) return;
    this.appealLoading = true;
    this.authService.submitAppeal(this.userEmail, this.appealMessage).subscribe({
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
