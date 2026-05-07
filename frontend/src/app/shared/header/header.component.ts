import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { MessageService } from '../../services/message.service';
import { environment } from '../../../environments/environment';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark fixed-top shadow-sm">
      <div class="container">
        <div class="d-flex align-items-center">
          <button *ngIf="showBack" (click)="goBack()" class="btn btn-link text-white p-0 me-3 hover-lift d-flex align-items-center justify-content-center fw-bold" style="width: 32px; height: 32px; border: 1px solid rgba(255, 255, 255, 0.43); border-radius: 8px; text-decoration: none;">
            <i class="bi bi-chevron-left fs-5" style="-webkit-text-stroke: 1.2px currentColor;"></i>
          </button>
          <a class="navbar-brand fw-bold mb-0 d-flex align-items-center gap-2" routerLink="/">
            <img src="logo.png" alt="Logo" style="height: 35px; width: auto;">
            <span><span class="text-primary" style="background: linear-gradient(135deg, #ff5200, #ffffff, #046a38); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">India</span>Homes</span>
          </a>
        </div>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarMain">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarMain">
          <!-- Logged-in Core Navigation -->
          <ul class="navbar-nav me-auto mb-2 mb-lg-0">
            <li class="nav-item">
              <a class="nav-link" routerLink="/properties" routerLinkActive="active">Properties</a>
            </li>
            <ng-container *ngIf="user && (user.isProfileComplete || user.role === 'host')">
              <li class="nav-item" *ngIf="user.role !== 'host'"><a class="nav-link" routerLink="/dashboard" routerLinkActive="active">Dashboard</a></li>
              <li class="nav-item" *ngIf="user.role === 'buyer'"><a class="nav-link" routerLink="/favorites" routerLinkActive="active">Favorites</a></li>
              <li class="nav-item"><a class="nav-link" routerLink="/messages" routerLinkActive="active">Messages</a></li>
            </ng-container>
            <li class="nav-item" *ngIf="user?.role === 'host'">
              <a class="nav-link d-flex align-items-center gap-2" routerLink="/host-dashboard" routerLinkActive="active">
                <i class="bi bi-shield-lock"></i> Host Dashboard
              </a>
            </li>
          </ul>

          <!-- Auth & Profile / Property Button (all grouped right) -->
          <!-- Auth & Profile / Property Button (all grouped right) -->
          <ul class="navbar-nav ms-auto align-items-center gap-1" *ngIf="!user">
            <li class="nav-item">
              <a class="nav-link get-started-link d-flex align-items-center gap-1 cursor-pointer" (click)="onPropertyAction()">
                <i class="bi bi-plus-circle-fill"></i> Property
              </a>
            </li>
            <li class="nav-item ms-2">
              <a class="nav-link get-started-link d-flex align-items-center gap-2 cursor-pointer" routerLink="/auth/register">
                Get Started
              </a>
            </li>
          </ul>

          <ul class="navbar-nav ms-auto align-items-center gap-2" *ngIf="user && (user.isProfileComplete || user.role === 'host')">
            <li class="nav-item" *ngIf="user.role === 'agent' || user.role === 'host'">
              <a class="nav-link get-started-link d-flex align-items-center gap-1 cursor-pointer" (click)="onPropertyAction()">
                <i class="bi bi-plus-circle-fill"></i> Property
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link profile-nav-link d-flex align-items-center gap-2 cursor-pointer" routerLink="/profile" routerLinkActive="active">
                <span class="role-badge small fw-bold text-uppercase px-2 py-1 rounded-pill me-1">
                  {{ user.role }}
                </span>
                <img *ngIf="user.profilePhoto" [src]="apiBase + user.profilePhoto" class="rounded-circle" style="width:28px;height:28px;object-fit:cover;border:2px solid #096a4d;" alt="avatar">
                <span *ngIf="!user.profilePhoto" class="rounded-circle bg-primary d-inline-flex align-items-center justify-content-center text-white fw-bold" style="width:28px;height:28px;font-size:12px;">
                  {{ (user.name || 'U').charAt(0).toUpperCase() }}
                </span>
                <span class="d-none d-sm-inline">{{ user.name }}</span>
              </a>
            </li>
          </ul>
          

        </div>
      </div>
    </nav>
  `,
  styles: [`
    .navbar-brand {
      transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      display: inline-block;
    }
    .navbar-brand:hover {
      transform: scale(1.2);
    }
    .navbar-brand span {
      transition: color 0.5s ease-in-out;
    }
    .nav-link:not(.dropdown-toggle):not(.btn-link):not(.profile-nav-link):not(.get-started-link) {
      position: relative;
      transition: color 0.4s ease-in-out;
      padding-bottom: 5px;
    }
    .nav-link:not(.dropdown-toggle):not(.btn-link):not(.profile-nav-link):not(.get-started-link)::after {
      content: '';
      position: absolute;
      width: 0;
      height: 2px;
      bottom: -2px;
      left: 50%;
      background: linear-gradient(90deg, #E3B8B8, #096a4d, #E3B8B8);
      transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
      transform: translateX(-50%);
      opacity: 0;
    }
    .nav-link:hover:not(.dropdown-toggle):not(.btn-link):not(.profile-nav-link):not(.get-started-link)::after,
    .nav-link.active:not(.dropdown-toggle):not(.btn-link):not(.profile-nav-link):not(.get-started-link)::after {
      width: 80%;
      opacity: 1;
    }
    .nav-link.active {
      color: #096a4d !important;
      font-weight: 600;
    }
    .badge-brand { background: #096a4d; color: white; }
    .dropdown-item:hover { background-color: rgba(9, 106, 77, 0.1); color: #096a4d; }
    
    .profile-nav-link, .theme-toggle-link, .get-started-link {
      position: relative;
      z-index: 1;
      transition: all 0.3s ease;
      background: transparent;
      display: flex !important;
      align-items: center;
      justify-content: center;
      border: none;
      color: rgba(255, 255, 255, 0.8) !important;
    }

    .profile-nav-link, .get-started-link {
      padding: 6px 18px !important;
      border-radius: 50px;
    }

    .role-badge {
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      color: rgba(255, 255, 255, 0.7);
      font-size: 9px !important;
      letter-spacing: 0.5px;
    }

    .profile-nav-link:hover .role-badge {
      background: rgba(9, 106, 77, 0.2);
      color: #fff;
    }

    .profile-nav-link, .get-started-link {
      border: 1px solid #096a4d;  
      color: #096a4d !important;
      font-weight: 700;
    }


    .profile-nav-link::before, .get-started-link::before {
      content: "";
      position: absolute;
      inset: 0;
      border-radius: inherit;
      padding: 2px; /* Border width */
      background: linear-gradient(90deg, #E3B8B8, #034C36, #E3B8B8);
      background-size: 200% auto;
      -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
      -webkit-mask-composite: xor;
      mask-composite: exclude;
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    .profile-nav-link:hover::before, .get-started-link:hover::before {
      opacity: 1;
      animation: border-dance 1.5s linear infinite;
    }

    @keyframes border-dance {
      0% { background-position: 0% center; }
      100% { background-position: 200% center; }
    }

    .profile-nav-link:hover, .get-started-link:hover {
      transform: translateY(-2px);
      background: rgba(9, 106, 77, 0.03);
      color: #fff !important;
    }

    .profile-nav-link.active::before {
      opacity: 0.5;
    }

    @media (max-width: 991.98px) {
      .navbar-nav {
        text-align: center;
        padding-top: 1rem;
      }
      .nav-link {
        display: flex !important;
        justify-content: center;
        width: 100%;
      }
      .nav-item {
        margin-bottom: 0.5rem;
      }
    }
  `]
})
export class HeaderComponent {
  user: any = null;
  canPost = false;
  apiBase = environment.apiUrl.replace('/api', '');
  showBack = false;

  constructor(
    public authService: AuthService, 
    private messageService: MessageService,
    private router: Router,
    private location: Location
  ) {
    this.authService.currentUser.subscribe(u => {
      this.user = u;
      this.canPost = u?.role === 'agent' || u?.role === 'host';
      if (u?._id) {
        this.messageService.connectSocket(u._id);
      }
    });

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.showBack = event.urlAfterRedirects !== '/';
    });
  }

  goBack() {
    this.location.back();
  }

  onPropertyAction() {
    if (!this.user) {
      this.router.navigate(['/auth/login']);
    } else if (this.user.role === 'agent' || this.user.role === 'host') {
      this.router.navigate(['/properties/post']);
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }

}
