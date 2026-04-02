import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-terms',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-vh-100 d-flex align-items-center justify-content-center" style="background: var(--auth-bg);">
      <div class="container py-5">
        <div class="row w-100 mx-auto justify-content-center">
          <div class="col-lg-8 col-md-10">
            <div class="card border-0 shadow-lg" style="border-radius: 20px; overflow: hidden; background-color: var(--auth-card-bg); border: 2px solid var(--auth-card-border);">
              
              <!-- Header -->
              <div class="text-center py-4" style="background: var(--auth-header-bg); border-bottom: 4px solid var(--c-rose);">
                <h2 class="text-white fw-bold mb-1">Terms and Conditions</h2>
                <p class="text-white-50 mb-0 small uppercase fw-semibold" style="letter-spacing: 1px;">IndiaHomes Agreement</p>
              </div>

              <!-- Content -->
              <div class="card-body p-4 p-md-5">
                <div class="terms-container rounded-3 p-4 mb-4" style="height: 350px; overflow-y: auto; background-color: var(--auth-input-bg); border: 1px solid var(--auth-text-color); color: var(--auth-text-color);">
                  <h5 class="fw-bold mb-3">1. Services Provided</h5>
                  <p class="small text-muted">IndiaHomes is an online intermediary connecting Buyers, Agents, and Hosts. We do not own, verify, or guarantee any properties listed. All transactions are solely between users.</p>
                  
                  <h5 class="fw-bold mb-3 mt-4">2. User Accounts</h5>
                  <ul class="small text-muted mb-0">
                    <li class="mb-1"><strong>Eligibility:</strong> You must be 18+ years old.</li>
                    <li class="mb-1"><strong>Accuracy:</strong> You agree to provide truthful registration details (OTP/Direct Login).</li>
                    <li><strong>Security:</strong> You are responsible for all activities under your account. We reserve the right to terminate accounts for misuse or fraud.</li>
                  </ul>

                  <h5 class="fw-bold mb-3 mt-4">3. Roles & Responsibilities</h5>
                  <ul class="small text-muted mb-0">
                    <li class="mb-1"><strong>Buyers:</strong> Responsible for independent due diligence and legal verification.</li>
                    <li><strong>Agents/Hosts:</strong> Must ensure all listings are accurate and comply with Indian laws (including RERA where applicable). Hosts are fully liable for their direct listings.</li>
                  </ul>

                  <h5 class="fw-bold mb-3 mt-4">4. Property Listings & Chat</h5>
                  <ul class="small text-muted mb-0">
                    <li class="mb-1"><strong>Content:</strong> Users are liable for all listings and chat messages (images, files, emojis).</li>
                    <li class="mb-1"><strong>Monitoring:</strong> IndiaHomes does not pre-screen content but reserves the right to remove material that violates these terms or legal standards.</li>
                    <li><strong>No Warranty:</strong> We do not guarantee property availability, price, or quality.</li>
                  </ul>

                  <h5 class="fw-bold mb-3 mt-4">5. Prohibited Conduct</h5>
                  <p class="small text-muted mb-1">You agree not to:</p>
                  <ul class="small text-muted mb-0">
                    <li class="mb-1">Post fraudulent listings or upload malicious code.</li>
                    <li class="mb-1">Harass users or bypass Platform security.</li>
                    <li>Use automated scrapers or bots without authorization.</li>
                  </ul>

                  <h5 class="fw-bold mb-3 mt-4">6. Intellectual Property</h5>
                  <p class="small text-muted">All Platform branding belongs to IndiaHomes. By uploading content, you grant us a non-exclusive license to display and distribute it for service purposes.</p>

                  <h5 class="fw-bold mb-3 mt-4">7. Legal Disclaimers</h5>
                  <ul class="small text-muted mb-0">
                    <li class="mb-1"><strong>"As-Is":</strong> The Platform is provided without warranties of any kind.</li>
                    <li class="mb-1"><strong>Liability:</strong> IndiaHomes is not liable for indirect damages or disputes arising between users.</li>
                    <li><strong>Indemnity:</strong> You agree to hold IndiaHomes harmless from claims resulting from your breach of these Terms.</li>
                  </ul>

                  <h5 class="fw-bold mb-3 mt-4">8. Governing Law</h5>
                  <p class="small text-muted">These Terms are governed by the Laws of India. Disputes are subject to the exclusive jurisdiction of courts in Vadodara.</p>

                  <hr class="my-4">
                  <h6 class="fw-bold">Contact & Grievance</h6>
                  <p class="small text-muted mb-0">For complaints or inquiries, contact our Grievance Officer:</p>
                  <ul class="small text-muted mt-1">
                    <li>Email: grievance&#64;indiahomes.com</li>
                    <li>Web: www.indiahomes.com</li>
                  </ul>
                </div>

                <div class="form-check mb-4">
                  <input class="form-check-input" type="checkbox" id="agreeCheck" [(ngModel)]="agreed" style="width: 20px; height: 20px; margin-top: 0.2rem; cursor: pointer;">
                  <label class="form-check-label ms-2 fw-semibold" for="agreeCheck" style="color: var(--auth-text-color); cursor: pointer;">
                    I agree to the Terms and Conditions and have read the Privacy Policy of IndiaHomes.
                  </label>
                </div>

                <!-- Alerts -->
                <div class="alert alert-danger py-2 small" *ngIf="error">{{ error }}</div>
                <div class="alert alert-success py-2 small" *ngIf="success">{{ success }}</div>

                <!-- Submit Action -->
                <button class="btn btn-lg w-100 rounded-3 fw-bold" (click)="onSubmit()" [disabled]="!agreed || loading"
                  style="background: linear-gradient(135deg, var(--c-forest), var(--c-deep-green)); border: none; padding: 14px; color: #fff;">
                  <span *ngIf="loading" class="spinner-border spinner-border-sm me-2"></span>
                  {{ loading ? 'Processing...' : 'Submit & Create Account' }}
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .terms-container::-webkit-scrollbar {
      width: 8px;
    }
    .terms-container::-webkit-scrollbar-track {
      background: rgba(0,0,0,0.05); 
      border-radius: 4px;
    }
    .terms-container::-webkit-scrollbar-thumb {
      background: var(--c-rose); 
      border-radius: 4px;
    }
    .form-check-input:checked {
      background-color: var(--c-forest);
      border-color: var(--c-forest);
    }
  `]
})
export class TermsComponent {
  agreed = false;
  loading = false;
  error = '';
  success = '';

  constructor(private router: Router, private http: HttpClient, private authService: AuthService) {}

  onSubmit() {
    if (!this.agreed) return;
    this.loading = true;
    this.error = '';
    this.success = '';

    this.http.post(`${environment.apiUrl}/auth/accept-terms`, {}, {
      headers: { Authorization: `Bearer ${this.authService.currentUserValue?.token}` }
    }).subscribe({
      next: (res: any) => {
        this.loading = false;
        this.success = 'Account created successfully!';
        
        // Let the user see the success message briefly before routing
        setTimeout(() => {
          const role = this.authService.currentUserValue?.role;
          if (role === 'host') this.router.navigate(['/host-dashboard']);
          else if (role === 'agent') this.router.navigate(['/dashboard']);
          else this.router.navigate(['/']);
        }, 1500);
      },
      error: (e: any) => {
        this.loading = false;
        this.error = e.error?.message || 'Failed to accept terms and conditions. Please try again.';
      }
    });
  }
}
