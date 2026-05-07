import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container position-fixed bottom-0 end-0 p-4" style="z-index: 10000;">
      <div *ngFor="let toast of toastService.toasts()" 
           class="toast show d-flex align-items-center border-0 mb-3 animate__animated animate__backInRight glass-3d" 
           [ngClass]="getToastClass(toast.type)"
           role="alert" aria-live="assertive" aria-atomic="true">
        
        <!-- Left accent line -->
        <div class="accent-line" [style.background-color]="getAccentColor(toast.type)"></div>
        
        <div class="d-flex p-3 w-100">
          <div class="toast-body d-flex align-items-center gap-3 flex-grow-1 fw-bold">
            <div class="icon-box shadow-sm" [style.background-color]="getAccentColor(toast.type)">
              <i class="bi" [ngClass]="getIconClass(toast.type)" style="color: white; font-size: 1.2rem;"></i>
            </div>
            <div class="message-content">
              {{ toast.message }}
            </div>
          </div>
          <button type="button" class="btn-close ms-2 m-auto" (click)="toastService.remove(toast.id)"></button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .toast-container {
      perspective: 1000px;
    }
    
    .glass-3d {
      min-width: 340px;
      border-radius: 20px;
      background: rgba(255, 255, 255, 0.75);
      backdrop-filter: blur(15px) saturate(180%);
      -webkit-backdrop-filter: blur(15px) saturate(180%);
      border: 1px solid rgba(255, 255, 255, 0.4) !important;
      box-shadow: 
        0 10px 30px rgba(0, 0, 0, 0.1),
        0 1px 8px rgba(0, 0, 0, 0.05),
        inset 0 0 0 1px rgba(255, 255, 255, 0.5);
      color: #1a1a1a;
      overflow: hidden;
      position: relative;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      transform-style: preserve-3d;
    }
    
    .glass-3d:hover {
      transform: translateY(-5px) scale(1.02);
      box-shadow: 
        0 20px 40px rgba(0, 0, 0, 0.15),
        0 5px 15px rgba(0, 0, 0, 0.08);
      background: rgba(255, 255, 255, 0.85);
    }
    
    .accent-line {
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 6px;
      border-radius: 6px 0 0 6px;
    }
    
    .icon-box {
      width: 42px;
      height: 42px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    
    .message-content {
      font-size: 0.95rem;
      letter-spacing: -0.2px;
    }

    /* Dark Mode support */
    @media (prefers-color-scheme: dark) {
      .glass-3d {
        background: rgba(30, 30, 40, 0.8);
        border-color: rgba(255, 255, 255, 0.1) !important;
        color: #f0f0f0;
      }
      .glass-3d:hover {
        background: rgba(40, 40, 50, 0.9);
      }
    }
    
    .animate__animated {
      animation-duration: 0.6s;
    }
  `]
})
export class ToastComponent {
  constructor(public toastService: ToastService) {}

  getToastClass(type: string) {
    return `toast-${type}`;
  }

  getAccentColor(type: string) {
    switch (type) {
      case 'success': return '#096a4d';
      case 'error': return '#ff4d5a';
      case 'warning': return '#ffc107';
      default: return '#0d6efd';
    }
  }

  getIconClass(type: string) {
    switch (type) {
      case 'success': return 'bi-check-lg';
      case 'error': return 'bi-x-lg';
      case 'warning': return 'bi-exclamation-triangle';
      default: return 'bi-info-circle';
    }
  }
}
