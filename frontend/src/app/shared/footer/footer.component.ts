import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <footer class="footer-section mt-5">
      <div class="container py-5">
        <div class="row g-4">

          <!-- Column 1: IndiaHomes -->
          <div class="col-lg-3 col-md-6">
            <h5 class="footer-heading mb-3">
              <span class="text-tricolor">India</span>Homes
            </h5>
            <ul class="footer-links">
              <li><a routerLink="/">Home</a></li>
              <li><a routerLink="/properties">Our Properties</a></li>
              <li><a routerLink="/properties" [queryParams]="{type: 'sale'}">Buy Property</a></li>
              <li><a routerLink="/properties" [queryParams]="{type: 'rent'}">Rent Property</a></li>
              <li><a routerLink="/properties/post">Post your Property</a></li>
              <li><a routerLink="/properties" [queryParams]="{propertyType: 'Plot'}">Plots in India</a></li>
              <li><a routerLink="/properties" [queryParams]="{propertyType: 'Commercial'}">Commercial Properties</a></li>
            </ul>
          </div>

          <!-- Column 2: Company -->
          <div class="col-lg-3 col-md-6">
            <h5 class="footer-heading mb-3">Company</h5>
            <ul class="footer-links">
              <li><a href="javascript:void(0)">About us</a></li>
              <li><a href="javascript:void(0)">Contact us</a></li>
              <li><a href="javascript:void(0)">Careers with us</a></li>
              <li><a href="javascript:void(0)">Terms &amp; Conditions</a></li>
              <li><a href="javascript:void(0)">Privacy Policy</a></li>
              <li><a href="javascript:void(0)">Testimonials</a></li>
              <li><a href="javascript:void(0)">Safety Guide</a></li>
            </ul>
          </div>

          <!-- Column 3: Explore -->
          <div class="col-lg-3 col-md-6">
            <h5 class="footer-heading mb-3">Explore</h5>
            <ul class="footer-links">
              <li><a routerLink="/properties" [queryParams]="{location: 'Mumbai'}">Properties in Mumbai</a></li>
              <li><a routerLink="/properties" [queryParams]="{location: 'Delhi'}">Properties in Delhi</a></li>
              <li><a routerLink="/properties" [queryParams]="{location: 'Bengaluru'}">Properties in Bengaluru</a></li>
              <li><a routerLink="/properties" [queryParams]="{location: 'Ahmedabad'}">Properties in Ahmedabad</a></li>
              <li><a routerLink="/properties" [queryParams]="{location: 'Pune'}">Properties in Pune</a></li>
              <li><a routerLink="/properties" [queryParams]="{location: 'Chennai'}">Properties in Chennai</a></li>
              <li><a routerLink="/properties" [queryParams]="{location: 'Hyderabad'}">Properties in Hyderabad</a></li>
            </ul>
          </div>

          <!-- Column 4: Contact Us -->
          <div class="col-lg-3 col-md-6">
            <h5 class="footer-heading mb-3">Contact Us</h5>
            <div class="contact-info mb-3">
              <p class="mb-1 fw-semibold"><i class="bi bi-telephone-fill me-2 text-tricolor-icon"></i>Contact Number - 6354252455</p>
              <p class="small text-muted mb-0">9:30 AM to 6:30 PM (Mon-Sun)</p>
            </div>
            <div class="contact-info mb-4">
              <p class="mb-0">
                <a href="mailto:darjivrund005&#64;gmail.com" class="footer-email-link">
                  <i class="bi bi-envelope-fill me-2"></i>Email - darjivrund007&#64;gmail.com
                </a>
              </p>
            </div>

            <h6 class="footer-subheading mb-3">Connect with us</h6>
            <div class="social-icons mb-4">
              <a href="javascript:void(0)" class="social-icon" aria-label="Facebook"><i class="bi bi-facebook"></i></a>
              <a href="javascript:void(0)" class="social-icon" aria-label="YouTube"><i class="bi bi-youtube"></i></a>
              <a href="javascript:void(0)" class="social-icon" aria-label="Twitter"><i class="bi bi-twitter-x"></i></a>
              <a href="javascript:void(0)" class="social-icon" aria-label="Instagram"><i class="bi bi-instagram"></i></a>
              <a href="javascript:void(0)" class="social-icon" aria-label="LinkedIn"><i class="bi bi-linkedin"></i></a>
            </div>

            <h6 class="footer-subheading mb-3">Download the App</h6>
            <div class="d-flex gap-2 flex-wrap">
              <a href="javascript:void(0)" class="store-badge">
                <i class="bi bi-google-play me-2"></i>
                <div>
                  <small class="d-block lh-1" style="font-size: 9px;">GET IT ON</small>
                  <span class="fw-bold" style="font-size: 13px;">Google Play</span>
                </div>
              </a>
              <a href="javascript:void(0)" class="store-badge">
                <i class="bi bi-apple me-2"></i>
                <div>
                  <small class="d-block lh-1" style="font-size: 9px;">Download on the</small>
                  <span class="fw-bold" style="font-size: 13px;">App Store</span>
                </div>
              </a>
            </div>
            
          </div>

          <div class="col-12 mt-4 text-center">
            <span class="fw-bold" style="font-size: 20px; color:red;">
              <b>🚧 Feature Coming Soon</b><br>
              The Download on App Store and Get it on Google Play features are currently under development and are not available yet.
              We’re working hard to make them available soon.<br>
              Thank you for your patience!
            </span>
          </div>
        </div>
      </div>

      <!-- Bottom Bar -->
      <div class="footer-bottom">
        <div class="container d-flex flex-column flex-md-row justify-content-between align-items-center py-3">
          <p class="mb-0 small text-muted">&copy; {{ currentYear }} IndiaHomes. All rights reserved.</p>
          <p class="mb-0 small text-muted">All trademarks are the property of their respective owners.</p>
        </div>
      </div>

      <!-- Back to Top Button -->
      <button
        class="back-to-top"
        [class.visible]="showBackToTop"
        (click)="scrollToTop()"
        aria-label="Back to top"
      >
        <i class="bi bi-arrow-up-short"></i>
      </button>
    </footer>
  `,
  styles: [`
    .footer-section {
      background: #013736e3;
      color: #c9d1d9;
      position: relative;
    }

    .footer-heading {
      color: #ffffff;
      font-size: 1rem;
      font-weight: 700;
      letter-spacing: 0.5px;
    }

    .footer-subheading {
      color: #e6edf3;
      font-size: 0.85rem;
      font-weight: 600;
    }

    .text-tricolor {
      background: linear-gradient(135deg, #ff5200, #ffffff, #046a38);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      font-weight: 700;
    }

    .text-tricolor-icon {
      color: #ff9933;
    }

    .footer-links {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .footer-links li {
      margin-bottom: 8px;
    }

    .footer-links a {
      color: #8b949e;
      text-decoration: none;
      font-size: 0.85rem;
      transition: color 0.3s ease, padding-left 0.3s ease;
      display: inline-block;
    }

    .footer-links a:hover {
      color: #58a6ff;
      padding-left: 6px;
    }

    .footer-email-link {
      color: #58a6ff !important;
      text-decoration: none;
      font-size: 0.85rem;
      transition: color 0.3s ease;
    }

    .footer-email-link:hover {
      color: #79c0ff !important;
    }

    .contact-info p {
      font-size: 0.85rem;
    }

    .social-icons {
      display: flex;
      gap: 12px;
    }

    .social-icon {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      border: 1px solid rgba(255, 255, 255, 0.15);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #c9d1d9;
      text-decoration: none;
      transition: all 0.3s ease;
      font-size: 1rem;
    }

    .social-icon:hover {
      background: #096a4d;
      border-color: #096a4d;
      color: #ffffff;
      transform: translateY(-3px);
      box-shadow: 0 4px 15px rgba(9, 106, 77, 0.4);
    }

    .store-badge {
      display: flex;
      align-items: center;
      padding: 6px 14px;
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 8px;
      color: #ffffff;
      text-decoration: none;
      transition: all 0.3s ease;
      background: rgba(255, 255, 255, 0.05);
    }

    .store-badge:hover {
      background: rgba(255, 255, 255, 0.1);
      border-color: rgba(255, 255, 255, 0.4);
      color: #ffffff;
      transform: translateY(-2px);
    }

    .store-badge i {
      font-size: 1.4rem;
    }

    .footer-bottom {
      border-top: 1px solid rgba(255, 255, 255, 0.08);
    }

    .back-to-top {
      position: fixed;
      bottom: 30px;
      right: 30px;
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: linear-gradient(135deg, #096a4d, #003332);
      color: #ffffff;
      border: none;
      font-size: 1.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      opacity: 0;
      visibility: hidden;
      transform: translateY(20px);
      transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      box-shadow: 0 4px 20px rgba(9, 106, 77, 0.4);
      z-index: 999;
    }

    .back-to-top.visible {
      opacity: 1;
      visibility: visible;
      transform: translateY(0);
    }

    .back-to-top:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 30px rgba(9, 106, 77, 0.6);
    }

    @media (max-width: 767.98px) {
      .footer-section .row > div {
        text-align: center;
      }
      .social-icons {
        justify-content: center;
      }
      .d-flex.gap-2 {
        justify-content: center;
      }
      .footer-bottom .container {
        text-align: center;
      }
    }
  `]
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
  showBackToTop = false;

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', () => {
        this.showBackToTop = window.scrollY > 400;
      });
    }
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
