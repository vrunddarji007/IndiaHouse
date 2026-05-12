import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogService } from './dialog.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    <ng-container *ngIf="dialog.state().open">
      <div class="modal fade app-dialog show" style="display:block;" tabindex="-1" aria-modal="true" role="dialog">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content app-dialog__content">
            <div class="modal-header app-dialog__header">
              <div class="d-flex align-items-center gap-2">
                <div class="app-dialog__icon" [ngClass]="iconClass()">
                  <i class="bi" [ngClass]="iconGlyph()"></i>
                </div>
                <div>
                  <div class="app-dialog__title">{{ title() }}</div>
                  <div class="app-dialog__subtitle">{{ subtitle() }}</div>
                </div>
              </div>
              <button type="button" class="btn-close" (click)="cancel()"></button>
            </div>

            <div class="modal-body app-dialog__body">
              <p class="mb-0 app-dialog__message">{{ message() }}</p>

              <div *ngIf="dialog.state().type === 'input'" class="app-dialog__field">
                <textarea
                  class="form-control app-dialog__textarea"
                  rows="3"
                  [placeholder]="inputPlaceholder()"
                  [value]="inputValue()"
                  (input)="onInput(($any($event.target)).value)"></textarea>
                <div class="app-dialog__required" *ngIf="isInputRequired()">
                  This field is required.
                </div>
              </div>
            </div>

            <div class="modal-footer app-dialog__footer">
              <button class="btn btn-light rounded-pill px-4" (click)="cancel()">{{ cancelText() }}</button>
              <button class="btn rounded-pill px-4 app-dialog__primary-btn" [ngClass]="primaryBtnClass()" (click)="confirm()">
                {{ confirmText() }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="modal-backdrop fade show app-dialog-backdrop" (click)="cancel()"></div>
    </ng-container>
  `,
  styles: [`
    .app-dialog .modal-dialog { max-width: 520px; }
    .app-dialog__content {
      border-radius: 18px;
      border: 1px solid rgba(15, 23, 42, 0.08);
      box-shadow: 0 24px 60px rgba(15, 23, 42, 0.22);
      overflow: hidden;
      background: #fff;
    }
    .app-dialog__header {
      border: 0;
      padding: 16px 16px 12px;
      background: linear-gradient(135deg, rgba(15, 12, 41, 0.06), rgba(48, 43, 99, 0.06), rgba(36, 36, 62, 0.04));
    }
    .app-dialog__title { font-weight: 800; color: #0f172a; line-height: 1.1; }
    .app-dialog__subtitle { font-size: 12px; color: rgba(15, 23, 42, 0.6); margin-top: 2px; }
    .app-dialog__icon {
      width: 40px; height: 40px; border-radius: 12px;
      display: grid; place-items: center;
      border: 1px solid rgba(15, 23, 42, 0.08);
      background: rgba(15, 23, 42, 0.04);
      flex: 0 0 auto;
    }
    .app-dialog__icon i { font-size: 18px; }
    .app-dialog__icon--primary { color: #0d6efd; background: rgba(13, 110, 253, 0.08); border-color: rgba(13, 110, 253, 0.18); }
    .app-dialog__icon--danger { color: #dc3545; background: rgba(220, 53, 69, 0.08); border-color: rgba(220, 53, 69, 0.18); }
    .app-dialog__icon--success { color: #198754; background: rgba(25, 135, 84, 0.08); border-color: rgba(25, 135, 84, 0.18); }
    .app-dialog__icon--secondary { color: #6c757d; background: rgba(108, 117, 125, 0.10); border-color: rgba(108, 117, 125, 0.18); }

    .app-dialog__body { padding: 14px 16px 6px; }
    .app-dialog__message { color: rgba(15, 23, 42, 0.75); font-size: 14px; }
    .app-dialog__field { margin-top: 12px; }
    .app-dialog__textarea {
      border-radius: 14px;
      border: 1px solid rgba(15, 23, 42, 0.10);
      background: rgba(241, 245, 249, 0.8);
      padding: 12px 12px;
      box-shadow: inset 0 1px 0 rgba(255,255,255,0.6);
      resize: vertical;
      min-height: 96px;
    }
    .app-dialog__textarea:focus {
      outline: none;
      border-color: rgba(13, 110, 253, 0.35);
      box-shadow: 0 0 0 4px rgba(13, 110, 253, 0.12);
      background: #fff;
    }
    .app-dialog__required { color: #dc3545; font-size: 12px; margin-top: 6px; }
    .app-dialog__footer { border: 0; padding: 12px 16px 16px; gap: 10px; }
    .app-dialog__primary-btn { box-shadow: 0 10px 24px rgba(15, 23, 42, 0.18); }
    .app-dialog-backdrop { background: rgba(2, 6, 23, 0.55); backdrop-filter: blur(6px); }
  `]
})
export class AppDialogComponent {
  constructor(public dialog: DialogService, private toast: ToastService) {}

  title(): string {
    const s = this.dialog.state();
    return s.type === 'none' ? '' : s.title;
  }

  message(): string {
    const s = this.dialog.state();
    return s.type === 'none' ? '' : s.message;
  }

  subtitle(): string {
    const s = this.dialog.state();
    if (s.type === 'input') return s.required ? 'Required input' : 'Optional input';
    if (s.type === 'confirm') return 'Please confirm to continue';
    return '';
  }

  confirmText(): string {
    const s = this.dialog.state();
    return s.type === 'none' ? '' : s.confirmText;
  }

  cancelText(): string {
    const s = this.dialog.state();
    return s.type === 'none' ? '' : s.cancelText;
  }

  variant(): 'primary' | 'danger' | 'success' | 'secondary' {
    const s = this.dialog.state();
    return s.type === 'none' ? 'primary' : s.variant;
  }

  iconClass(): string {
    return `app-dialog__icon--${this.variant()}`;
  }

  iconGlyph(): string {
    const v = this.variant();
    if (v === 'danger') return 'bi-exclamation-lg';
    if (v === 'success') return 'bi-check-lg';
    if (v === 'secondary') return 'bi-info-lg';
    return (this.dialog.state().type === 'input') ? 'bi-pencil-square' : 'bi-question-lg';
  }

  primaryBtnClass(): string {
    const v = this.variant();
    return v === 'primary' ? 'btn-primary' : v === 'danger' ? 'btn-danger' : v === 'success' ? 'btn-success' : 'btn-secondary';
  }

  onInput(value: string) {
    this.dialog.updateInputValue(value);
  }

  inputPlaceholder(): string {
    const s = this.dialog.state();
    return s.type === 'input' ? s.placeholder : '';
  }

  inputValue(): string {
    const s = this.dialog.state();
    return s.type === 'input' ? s.value : '';
  }

  isInputRequired(): boolean {
    const s = this.dialog.state();
    return s.type === 'input' ? s.required : false;
  }

  cancel() {
    const s = this.dialog.state();
    if (s.type === 'confirm') this.dialog.resolveConfirm(false);
    else if (s.type === 'input') this.dialog.resolveInput(null);
    else this.dialog.close();
  }

  confirm() {
    const s = this.dialog.state();
    if (s.type === 'confirm') {
      this.dialog.resolveConfirm(true);
      return;
    }
    if (s.type === 'input') {
      const val = (s.value || '').trim();
      if (s.required && !val) {
        this.toast.error('This field is required.');
        return;
      }
      this.dialog.resolveInput(val);
      return;
    }
  }
}

