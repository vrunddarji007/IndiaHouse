import { Component, OnInit, OnDestroy, signal, effect, ViewChild, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ProfileService } from '../../services/profile.service';
import { environment } from '../../../environments/environment';

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
          <div class="col-lg-6 col-md-8" [class.col-lg-8]="step >= 4">

            <div class="text-center mb-4">
              <h2 class="fw-bold fs-3" style="color: var(--c-deep-green); letter-spacing: 1px;">IndiaHomes Identity</h2>
            </div>

            <!-- ═══ OTP MODE (Buyer/Agent) ═══ -->
            <div>
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
                  <div class="step-line" [class.active]="step >= 5"></div>
                  <div class="step-circle" [class.active]="step >= 5">5</div>
                </div>
                <p class="text-white-50 mt-2 small">
                  {{ step === 1 ? 'Get Started' : step === 2 ? 'Choose Role' : step === 3 ? 'Verify & Secure' : step === 4 ? 'Profile Details' : 'Terms & Conditions' }}
                </p>
                <div *ngIf="registrationFailed" class="alert alert-danger mx-auto mt-2 py-2" style="max-width: 400px;">
                  <i class="bi bi-exclamation-triangle-fill me-2"></i> Registration incomplete. Please complete all 5 steps to access the platform.
                </div>
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
                        <input type="email" class="form-control form-control-lg bg-light border-0 rounded-3" formControlName="email" placeholder="you&#64;example.com">
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

                <!-- ═══ STEP 2: Role Selection ═══ -->
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

                <!-- ═══ STEP 3: OTP + Password ═══ -->
                <div *ngIf="step === 3">
                  <div class="text-center py-4" style="background: var(--auth-header-bg); border-bottom: 4px solid var(--c-rose);">
                    <h2 class="text-white fw-bold mb-1 d-flex align-items-center justify-content-center gap-2">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                      Verify & Secure
                    </h2>
                    <p class="mb-0 small" style="color: white; font-weight: bold;">OTP & Password</p>
                  </div>

                  <!-- OTP Section -->
                  <div class="card-body p-4 p-md-5 text-center" *ngIf="!otpVerified">
                    <p class="text-muted mb-4">Enter the 6-digit code sent to your <strong>email address</strong></p>
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

                  <!-- Set Password Section -->
                  <div class="card-body p-4 p-md-5" *ngIf="otpVerified">
                    <div class="text-center mb-4">
                      <div class="success-icon-circle mx-auto mb-3 animate__animated animate__zoomIn">
                        <i class="bi bi-shield-check text-success display-4"></i>
                      </div>
                      <h4 class="fw-bold" style="color: var(--auth-text-color);">OTP Verified!</h4>
                      <p class="text-muted">Now, please set a secure password for your account.</p>
                    </div>

                    <form [formGroup]="passForm" (ngSubmit)="onSetPassword()">
                      <div class="mb-3">
                        <label class="form-label fw-semibold text-muted small">NEW PASSWORD *</label>
                        <div class="input-group shadow-sm">
                          <span class="input-group-text bg-white border-end-0"><i class="bi bi-lock"></i></span>
                          <input [type]="showPassword ? 'text' : 'password'" class="form-control form-control-lg border-start-0" formControlName="password" placeholder="Min 6 characters">
                          <button class="btn btn-outline-secondary border-start-0" type="button" (click)="showPassword = !showPassword">
                            <i class="bi" [ngClass]="showPassword ? 'bi-eye-slash' : 'bi-eye'"></i>
                          </button>
                        </div>
                      </div>
                      <div class="mb-4">
                        <label class="form-label fw-semibold text-muted small">CONFIRM PASSWORD *</label>
                        <div class="input-group shadow-sm">
                          <span class="input-group-text bg-white border-end-0"><i class="bi bi-lock-fill"></i></span>
                          <input [type]="showConfirmPassword ? 'text' : 'password'" class="form-control form-control-lg border-start-0" formControlName="confirm" placeholder="Re-enter">
                          <button class="btn btn-outline-secondary border-start-0" type="button" (click)="showConfirmPassword = !showConfirmPassword">
                            <i class="bi" [ngClass]="showConfirmPassword ? 'bi-eye-slash' : 'bi-eye'"></i>
                          </button>
                        </div>
                      </div>
                      <div class="alert alert-danger py-2 small" *ngIf="passError">{{ passError }}</div>
                      <button type="submit" class="btn btn-primary btn-lg w-100 rounded-3 fw-bold shadow-sm" [disabled]="passForm.invalid || passSaving || passForm.value.password !== passForm.value.confirm">
                        {{ passSaving ? 'Saving...' : 'Set Password & Continue →' }}
                      </button>
                    </form>
                  </div>
                </div>

                <!-- ═══ STEP 4: Profile Details ═══ -->
                <div *ngIf="step === 4">
                  <div class="text-center py-4" style="background: var(--auth-header-bg); border-bottom: 4px solid var(--c-rose);">
                    <h2 class="text-white fw-bold mb-1 d-flex align-items-center justify-content-center gap-2">
                       <i class="bi bi-person-circle"></i> Complete Profile
                    </h2>
                    <p class="mb-0 small" style="color: white; font-weight: bold;">Step 4 of 5</p>
                  </div>
                  <div class="card-body p-4 p-md-5 overflow-auto" style="max-height: 65vh;">
                    <form [formGroup]="profileForm" (ngSubmit)="onSaveProfile()">
                      
                      <!-- Basic Info -->
                      <div class="text-center mb-4">
                        <div class="position-relative d-inline-block">
                          <div class="rounded-circle overflow-hidden mx-auto shadow-sm"
                            style="width: 120px; height: 120px; border: 4px solid white; cursor: pointer; background: #f8f9fa;"
                            (click)="fileInput.click()">
                            <img [src]="photoPreview || avatarUrl" class="w-100 h-100" style="object-fit: cover;" alt="Profile">
                          </div>
                          <button type="button" class="position-absolute bottom-0 end-0 btn btn-forest btn-sm rounded-circle shadow" (click)="fileInput.click()">
                            <i class="bi bi-camera-fill text-white"></i>
                          </button>
                        </div>
                        <input type="file" #fileInput hidden accept="image/*" (change)="onPhotoSelect($event)">
                        <p class="small text-muted mt-2 mb-0">Profile Photo</p>
                      </div>

                      <div class="row g-3 mb-3">
                        <div class="col-md-6">
                          <label class="form-label fw-semibold text-muted small">FIRST NAME *</label>
                          <input type="text" class="form-control" [class.is-invalid]="profileForm.get('firstName')?.invalid && profileForm.get('firstName')?.touched" formControlName="firstName" placeholder="John">
                        </div>
                        <div class="col-md-6">
                          <label class="form-label fw-semibold text-muted small">LAST NAME *</label>
                          <input type="text" class="form-control" [class.is-invalid]="profileForm.get('lastName')?.invalid && profileForm.get('lastName')?.touched" formControlName="lastName" placeholder="Doe">
                        </div>
                      </div>

                      <div class="mb-3">
                        <label class="form-label fw-semibold text-muted small">PHONE NUMBER *</label>
                        <div class="input-group shadow-sm" [class.is-invalid]="profileForm.get('phone')?.invalid && profileForm.get('phone')?.touched">
                          <span class="input-group-text bg-white border-end-0">+91</span>
                          <input type="text" class="form-control border-start-0" [class.is-invalid]="profileForm.get('phone')?.invalid && profileForm.get('phone')?.touched" formControlName="phone" placeholder="9876543210" maxlength="10">
                        </div>
                      </div>

                      <div class="mb-3">
                        <label class="form-label fw-semibold text-muted small">USERNAME *</label>
                        <div class="input-group" [class.is-invalid]="profileForm.get('username')?.invalid && profileForm.get('username')?.touched">
                          <span class="input-group-text">&#64;</span>
                          <input type="text" class="form-control" [class.is-invalid]="profileForm.get('username')?.invalid && profileForm.get('username')?.touched" formControlName="username" (input)="onUsernameInput()" placeholder="johndoe">
                        </div>
                        <div class="mt-1" *ngIf="usernameStatus">
                          <small [class]="usernameStatus === 'available' ? 'text-success' : 'text-danger'">
                            {{ usernameStatus === 'checking' ? '⏳ Checking...' : usernameStatus === 'available' ? '✅ Available' : usernameStatus === 'taken' ? '❌ Taken' : '⚠️ Invalid format' }}
                          </small>
                        </div>
                      </div>

                      <div class="mb-3">
                        <label class="form-label fw-semibold text-muted small">BIO *</label>
                        <textarea class="form-control" [class.is-invalid]="profileForm.get('bio')?.invalid && profileForm.get('bio')?.touched" formControlName="bio" placeholder="Tell us about yourself..." maxlength="250" rows="3"></textarea>
                        <small class="text-muted d-block text-end">{{ profileForm.value.bio?.length || 0 }}/250</small>
                      </div>

                      <!-- Personal Section -->
                      <hr class="my-4">
                      <h6 class="fw-bold mb-3 text-uppercase small text-forest">Personal Details</h6>
                      <div class="row g-3 mb-3">
                        <div class="col-md-6">
                          <label class="form-label fw-semibold text-muted small">GENDER *</label>
                          <select class="form-select" [class.is-invalid]="profileForm.get('gender')?.invalid && profileForm.get('gender')?.touched" formControlName="gender">
                            <option value="">Select</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                        <div class="col-md-6">
                          <label class="form-label fw-semibold text-muted small">DATE OF BIRTH *</label>
                          <input type="date" class="form-control" [class.is-invalid]="profileForm.get('dateOfBirth')?.invalid && profileForm.get('dateOfBirth')?.touched" formControlName="dateOfBirth">
                        </div>
                      </div>

                      <!-- Address Section -->
                      <hr class="my-4">
                      <h6 class="fw-bold mb-3 text-uppercase small text-forest">Location</h6>
                      <div class="mb-3">
                        <label class="form-label fw-semibold text-muted small">STREET ADDRESS *</label>
                        <input type="text" class="form-control" [class.is-invalid]="profileForm.get('street')?.invalid && profileForm.get('street')?.touched" formControlName="street" placeholder="123 Street Name">
                      </div>
                      <div class="row g-3 mb-3">
                        <div class="col-md-6">
                          <label class="form-label fw-semibold text-muted small">CITY *</label>
                          <input type="text" class="form-control" [class.is-invalid]="profileForm.get('city')?.invalid && profileForm.get('city')?.touched" formControlName="city" placeholder="Vadodara">
                        </div>
                        <div class="col-md-6">
                          <label class="form-label fw-semibold text-muted small">STATE *</label>
                          <input type="text" class="form-control" [class.is-invalid]="profileForm.get('state')?.invalid && profileForm.get('state')?.touched" formControlName="state" placeholder="Gujarat">
                        </div>
                        <div class="col-md-6">
                          <label class="form-label fw-semibold text-muted small">PINCODE *</label>
                          <input type="text" class="form-control" [class.is-invalid]="profileForm.get('pincode')?.invalid && profileForm.get('pincode')?.touched" formControlName="pincode" placeholder="390001" maxlength="6">
                          <div class="invalid-feedback" *ngIf="profileForm.get('pincode')?.errors?.['pattern']">Must be 6 digits</div>
                        </div>
                        <div class="col-md-6">
                          <label class="form-label fw-semibold text-muted small">COUNTRY</label>
                          <input type="text" class="form-control" formControlName="country" placeholder="India">
                        </div>
                      </div>

                      <!-- Professional Section (Hidden for Buyers) -->
                      <div *ngIf="getUserRole() !== 'buyer'">
                        <hr class="my-4">
                        <h6 class="fw-bold mb-3 text-uppercase small text-forest">Professional Information</h6>
                        <div class="row g-3 mb-3">
                          <div class="col-md-6">
                            <label class="form-label fw-semibold text-muted small">COMPANY *</label>
                            <input type="text" class="form-control" [class.is-invalid]="profileForm.get('company')?.invalid && profileForm.get('company')?.touched" formControlName="company" placeholder="Agency Name">
                          </div>
                          <div class="col-md-6">
                            <label class="form-label fw-semibold text-muted small">DESIGNATION *</label>
                            <input type="text" class="form-control" [class.is-invalid]="profileForm.get('designation')?.invalid && profileForm.get('designation')?.touched" formControlName="designation" placeholder="Real Estate Consultant">
                          </div>
                          <div class="col-md-6">
                            <label class="form-label fw-semibold text-muted small">EXPERIENCE *</label>
                            <input type="text" class="form-control" [class.is-invalid]="profileForm.get('experience')?.invalid && profileForm.get('experience')?.touched" formControlName="experience" placeholder="e.g. 5 Years">
                          </div>
                          <div class="col-md-6">
                            <label class="form-label fw-semibold text-muted small">SPECIALIZATION *</label>
                            <input type="text" class="form-control" [class.is-invalid]="profileForm.get('specialization')?.invalid && profileForm.get('specialization')?.touched" formControlName="specialization" placeholder="e.g. Residential">
                          </div>
                          <div class="col-12">
                            <label class="form-label fw-semibold text-muted small">LANGUAGES *</label>
                            <input type="text" class="form-control" [class.is-invalid]="profileForm.get('languages')?.invalid && profileForm.get('languages')?.touched" formControlName="languages" placeholder="English, Hindi, Gujarati">
                          </div>
                          <div class="col-md-6">
                            <label class="form-label fw-semibold text-muted small">WEBSITE</label>
                            <input type="url" class="form-control" formControlName="website" placeholder="https://...">
                          </div>
                          <div class="col-md-6">
                            <label class="form-label fw-semibold text-muted small">RERA NUMBER</label>
                            <input type="text" class="form-control" formControlName="reraNumber" placeholder="RERA/GJ/...">
                          </div>
                        </div>
                      </div>

                      <!-- Social Section -->
                      <hr class="my-4">
                      <h6 class="fw-bold mb-3 text-uppercase small text-forest">Social Profiles (Optional)</h6>
                      <div class="row g-3 mb-4">
                        <div class="col-md-6">
                          <div class="input-group">
                            <span class="input-group-text bg-white border-end-0"><i class="bi bi-linkedin text-primary"></i></span>
                            <input type="url" class="form-control border-start-0" formControlName="linkedin" placeholder="LinkedIn URL">
                          </div>
                        </div>
                        <div class="col-md-6">
                          <div class="input-group">
                            <span class="input-group-text bg-white border-end-0"><i class="bi bi-twitter-x text-dark"></i></span>
                            <input type="url" class="form-control border-start-0" formControlName="twitter" placeholder="Twitter URL">
                          </div>
                        </div>
                        <div class="col-md-6">
                          <div class="input-group">
                            <span class="input-group-text bg-white border-end-0"><i class="bi bi-instagram text-danger"></i></span>
                            <input type="url" class="form-control border-start-0" formControlName="instagram" placeholder="Instagram URL">
                          </div>
                        </div>
                        <div class="col-md-6">
                          <div class="input-group">
                            <span class="input-group-text bg-white border-end-0"><i class="bi bi-facebook text-primary"></i></span>
                            <input type="url" class="form-control border-start-0" formControlName="facebook" placeholder="Facebook URL">
                          </div>
                        </div>
                      </div>

                      <div class="alert alert-danger py-2 small mb-3" *ngIf="profileForm.invalid && profileForm.touched">
                        <i class="bi bi-exclamation-triangle-fill me-2"></i> Please fill out all required fields marked with *.
                      </div>

                      <button type="submit" class="btn btn-primary btn-lg w-100 rounded-3 fw-bold shadow-sm" [disabled]="usernameStatus === 'checking'">
                        Next: Accept Terms & Conditions →
                      </button>
                    </form>
                  </div>
                </div>

                <!-- ═══ STEP 5: Terms & Conditions ═══ -->
                <div *ngIf="step === 5">
                  <div class="text-center py-4" style="background: var(--auth-header-bg); border-bottom: 4px solid var(--c-rose);">
                    <h2 class="text-white fw-bold mb-1 d-flex align-items-center justify-content-center gap-2">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                      Terms & Conditions
                    </h2>
                    <p class="mb-0 small" style="color: white; font-weight: bold;">Final Step</p>
                  </div>
                  <div class="card-body p-4 p-md-5">
                    <div class="terms-content mb-4 p-3 border rounded overflow-auto" style="max-height: 250px; font-size: 0.85rem; background-color: var(--auth-input-bg); color: var(--auth-text-color);">
                      <h6 class="fw-bold mb-2" >1. Services Provided</h6>
                      <p class="small" style="color: black;">IndiaHomes is an online intermediary connecting Buyers, Agents, and Hosts. We do not own, verify, or guarantee any properties listed. All transactions are solely between users.</p>
                      <h6 class="fw-bold mb-2">2. User Accounts</h6>
                      <ul class="small mb-2" style="color: black;">
                        <li><strong>Eligibility:</strong> You must be 18+ years old.</li>
                        <li><strong>Accuracy:</strong> You agree to provide truthful registration details.</li>
                        <li><strong>Security:</strong> You are responsible for all activities under your account.</li>
                      </ul>
                      <h6 class="fw-bold mb-2">3. Roles & Responsibilities</h6>
                      <ul class="small mb-2" style="color: black;">
                        <li><strong>Buyers:</strong> Responsible for independent due diligence.</li>
                        <li><strong>Agents/Hosts:</strong> Must ensure all listings are accurate and comply with Indian laws.</li>
                      </ul>
                      <h6 class="fw-bold mb-2">4. Property Listings & Chat</h6>
                      <ul class="small mb-2" style="color: black;">
                        <li>Users are liable for all listings and chat messages.</li>
                        <li>IndiaHomes reserves the right to remove violating material.</li>
                      </ul>
                      <h6 class="fw-bold mb-2">5. Prohibited Conduct</h6>
                      <ul class="small mb-2" style="color: black;">
                        <li>No fraudulent listings or malicious code.</li>
                        <li>No harassment or security bypassing.</li>
                      </ul>
                      <h6 class="fw-bold mb-2">6. Governing Law</h6>
                      <p class="small mb-0" style="color: black;">These Terms are governed by the Laws of India. Disputes are subject to courts in Vadodara.</p>
                    </div>
                    <div class="form-check mb-4">
                      <input class="form-check-input" type="checkbox" id="acceptTerms" [(ngModel)]="acceptedTerms" [ngModelOptions]="{standalone: true}" style="width: 20px; height: 20px; cursor: pointer;">
                      <label class="form-check-label ms-2 fw-semibold" for="acceptTerms" style="cursor: pointer; color: var(--auth-text-color);">
                        I agree to the Terms & Conditions and Privacy Policy of IndiaHomes.
                      </label>
                    </div>
                    <div class="alert alert-danger py-2 small" *ngIf="error">{{ error }}</div>
                    <button class="btn btn-lg w-100 rounded-3 fw-bold" (click)="onFinalSubmit()" [disabled]="!acceptedTerms || termsSaving"
                      style="background: linear-gradient(135deg, var(--c-forest), var(--c-deep-green)); border: none; padding: 14px; color: #fff;">
                      <span *ngIf="termsSaving" class="spinner-border spinner-border-sm me-2"></span>
                      {{ termsSaving ? 'Creating Account...' : '✓ Complete Registration' }}
                    </button>
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
    .terms-content::-webkit-scrollbar { width: 8px; }
    .terms-content::-webkit-scrollbar-track { background: rgba(0,0,0,0.05); border-radius: 4px; }
    .terms-content::-webkit-scrollbar-thumb { background: var(--c-rose); border-radius: 4px; }
  `]
})
export class RegisterComponent implements OnInit {
  authForm: FormGroup;
  passForm: FormGroup;
  profileForm: FormGroup;
  hostForm: FormGroup;
  step = 1;
  loading = false;
  error = '';
  userEmail = '';
  selectedRole = '';
  showPassword = false;
  showConfirmPassword = false;

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

  // Profile (Face 4)
  photoPreview: string | null = null;
  photoFile: File | null = null;
  photoError = '';
  usernameStatus: 'checking' | 'available' | 'taken' | 'invalid' | '' = '';
  private usernameTimeout: any;

  // Terms (Face 5)
  acceptedTerms = false;
  termsSaving = false;
  registrationFailed = false;

  // Appeal
  showAppealModal = false;
  suspensionMessage = '';
  appealMessage = '';
  appealLoading = false;

  roles = [
    { value: 'buyer', icon: '<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>', label: 'Buyer / Tenant', desc: 'Browse properties, save favorites, contact owners & agents' },
    { value: 'agent', icon: '<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>', label: 'Agent', desc: 'List properties for clients, manage inquiries, professional tools' },
  ];

  get avatarUrl(): string {
    const f = this.authForm?.value?.firstName || 'U';
    const l = this.authForm?.value?.lastName || '';
    return `https://ui-avatars.com/api/?name=${f}+${l}&background=6f42c1&color=fff&size=100`;
  }

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private auth: AuthService,
    private profileService: ProfileService
  ) {
    if (this.auth.currentUserValue && this.auth.currentUserValue.isProfileComplete) {
      this.router.navigate(['/']);
    }

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
    this.profileForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      username: ['', [Validators.required]],
      bio: ['', [Validators.required]],
      gender: ['', [Validators.required]],
      dateOfBirth: ['', [Validators.required]],
      street: ['', [Validators.required]],
      city: ['', [Validators.required]],
      town: [''],
      village: [''],
      state: ['', [Validators.required]],
      pincode: ['', [Validators.required, Validators.pattern('^[0-9]{6}$')]],
      country: ['India'],
      company: [''],
      designation: [''],
      website: [''],
      experience: [''],
      specialization: [''],
      languages: [''],
      reraNumber: [''],
      phone: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(10)]],
      linkedin: [''],
      twitter: [''],
      instagram: [''],
      facebook: [''],
    });

    effect(() => {
      const role = this.auth.currentUserValue?.role;
      if (role && role !== 'buyer') {
        ['company', 'designation', 'experience', 'specialization', 'languages'].forEach(f => {
          this.profileForm.get(f)?.setValidators([Validators.required]);
        });
      }
    });

    this.profileForm.patchValue({
      firstName: this.authForm.value.firstName,
      lastName: this.authForm.value.lastName
    });
    this.hostForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const isGoogle = params['google'] === 'true';
      const jumpStep = params['step'];

      if (isGoogle) {
        const user = this.auth.currentUserValue;
        if (user) {
          const parts = user.name.split(' ');
          const first = parts[0] || '';
          const last = parts.slice(1).join(' ') || '';
          
          this.authForm.patchValue({ email: user.email, firstName: first, lastName: last });
          this.profileForm.patchValue({ firstName: first, lastName: last, phone: user.phone || '' });
          this.userEmail = user.email;
          this.otpVerified = true; // Skip password/OTP face
          this.step = jumpStep ? parseInt(jumpStep) : 2; 
        }
      } else if (params['incomplete']) {
        this.registrationFailed = true;
        const user = this.auth.currentUserValue;
        if (user) {
          this.userEmail = user.email;
          this.selectedRole = user.role;
          // Skip to the appropriate step
          this.step = 4;
        }
      }
    });
  }

  getUserRole(): string {
    return this.auth.currentUserValue?.role || this.selectedRole;
  }

  prepareProfileForm() {
    const role = this.getUserRole();
    if (role === 'agent' || role === 'host') {
      const proFields = ['company', 'designation', 'experience', 'specialization', 'languages'];
      proFields.forEach(f => {
        this.profileForm.get(f)?.setValidators([Validators.required]);
        this.profileForm.get(f)?.updateValueAndValidity();
      });
    }
  }

  get otpValue() { return this.otpValues.join(''); }

  // ═══ STEP 1 ═══
  onSubmitAuth() {
    this.loading = true; this.error = ''; this.showSuspensionLink = false;
    const d: any = {
      email: this.authForm.value.email,
      verificationMethod: 'email',
      firstName: this.authForm.value.firstName,
      lastName: this.authForm.value.lastName,
      phone: this.authForm.value.phone ? '+91' + this.authForm.value.phone : undefined
    };

    this.auth.registerOrLogin(d).subscribe({
      next: (res: any) => {
        this.loading = false;
        this.userEmail = res.email;
        if (res.needsRole) { this.step = 2; }
        else { this.step = 3; this.startTimer(); }
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
    const isGoogle = this.route.snapshot.queryParams['google'] === 'true';
    if (isGoogle && this.auth.currentUserValue) {
      // Go to Step 4 (Profile) as requested for first time
      this.step = 4;
      return;
    }

    this.loading = true; this.error = '';
    const d: any = {
      email: this.authForm.value.email,
      firstName: this.authForm.value.firstName,
      lastName: this.authForm.value.lastName,
      phone: this.authForm.value.phone ? '+91' + this.authForm.value.phone : undefined,
      role: this.selectedRole,
      verificationMethod: 'email',
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
        else if (!res.isProfileComplete) { setTimeout(() => { this.step = 4; this.prepareProfileForm(); }, 800); }
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
    this.auth.resendOTP(this.userEmail, 'email').subscribe({
      next: () => { this.otpSuccess = 'New code sent!'; this.startTimer(); },
      error: (e: any) => { this.otpError = e.error?.message || 'Failed'; }
    });
  }

  startTimer() { this.countdown = 60; clearInterval(this.timer); this.timer = setInterval(() => { this.countdown--; if (this.countdown <= 0) clearInterval(this.timer); }, 1000); }

  // ═══ STEP 3: Password ═══
  onSetPassword() {
    if (this.passForm.value.password !== this.passForm.value.confirm) { this.passError = 'Passwords don\'t match'; return; }
    this.passSaving = true; this.passError = '';
    this.auth.setPassword(this.passForm.value.password).subscribe({
      next: () => {
        this.passSaving = false; this.passSuccess = 'Password set!';
        setTimeout(() => {
          this.step = 4;
          this.passSuccess = '';
          this.prepareProfileForm();
        }, 1000);
      },
      error: (e: any) => { this.passSaving = false; this.passError = e.error?.message || 'Failed'; }
    });
  }

  // ═══ STEP 4: Profile ═══
  onPhotoSelect(event: any) {
    const file = event.target.files[0];
    this.photoError = '';
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) { this.photoError = 'Only JPG/PNG'; return; }
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

  onSaveProfile() {
    if (this.profileForm.invalid || this.usernameStatus === 'taken') {
      this.profileForm.markAllAsTouched();
      return;
    }
    this.step = 5;
  }

  // ═══ STEP 5: Final Submission ═══
  onFinalSubmit() {
    if (!this.acceptedTerms) return;
    this.termsSaving = true; this.error = '';

    const fd = new FormData();
    const v = this.profileForm.value;
    fd.append('firstName', v.firstName || '');
    fd.append('lastName', v.lastName || '');
    fd.append('role', this.selectedRole); // Include updated role
    fd.append('username', v.username?.toLowerCase().trim() || '');
    fd.append('bio', v.bio?.trim() || '');
    fd.append('phone', v.phone || '');
    fd.append('gender', v.gender || '');
    fd.append('dateOfBirth', v.dateOfBirth || '');
    fd.append('street', v.street?.trim() || '');
    fd.append('city', v.city?.trim() || '');
    fd.append('town', v.town?.trim() || '');
    fd.append('village', v.village?.trim() || '');
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

    this.profileService.completeProfile(fd).subscribe({
      next: (res: any) => {
        this.termsSaving = false;
        this.auth.updateCurrentUser({
          isProfileComplete: true,
          ...res.user
        });
        alert('Welcome to IndiaHomes! Your registration is complete.');
        this.goHome();
      },
      error: (e: any) => {
        this.termsSaving = false;
        this.error = e.error?.message || 'Failed to complete registration';
      }
    });
  }

  goHome() {
    const u = this.auth.currentUserValue;
    if (!u?.isProfileComplete) {
      this.step = 4;
      this.registrationFailed = true;
      return;
    }
    if (u.role === 'host') this.router.navigate(['/host-dashboard']);
    else if (u.role === 'agent') this.router.navigate(['/dashboard']);
    else this.router.navigate(['/']);
  }

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
