import { Component, OnInit, OnDestroy, signal, inject, DestroyRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe, TitleCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HostService } from '../../services/host.service';
import { AuthService } from '../../services/auth.service';
import { MessageService } from '../../services/message.service';
import { environment } from '../../../environments/environment';
import { timer, Subscription, take, Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { ReportService } from '../../services/report.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-host-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, DatePipe, CurrencyPipe, TitleCasePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-vh-100" style="background: #f0f2f5;">
      <!-- Header -->
      <div class="py-5" style="background: linear-gradient(135deg, #0f0c29, #302b63, #24243e);">
        <div class="container">
          <div class="d-flex justify-content-between align-items-center flex-wrap gap-3">
            <div>
              <h2 class="text-white fw-bold mb-1 d-flex align-items-center gap-2">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                Host Dashboard
              </h2>
              <p class="text-white-50 mb-0 small">Welcome back, {{ currentUser()?.name }} — Manage IndiaHomes</p>
            </div>
            <div class="d-flex gap-2">
              <span class="badge bg-success fs-6 px-3 py-2">Host Admin</span>
            </div>
          </div>
        </div>
      </div>

      <div class="container py-4" style="margin-top: -20px;">
        <!-- Stats Cards -->
        <div class="row g-3 mb-4 row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-5">
          <div class="col">
            <div class="card border-0 shadow-sm h-100">
              <div class="card-body text-center">
                <div class="fs-3 mb-1 text-primary">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                </div>
                <h4 class="fw-bold text-primary mb-0">{{ totalUsersCount() }}</h4>
                <small class="text-muted">Total Users</small>
              </div>
            </div>
          </div>
          <div class="col">
            <div class="card border-0 shadow-sm h-100">
              <div class="card-body text-center">
                <div class="fs-3 mb-1 text-success">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                </div>
                <h4 class="fw-bold text-success mb-0">{{ propertiesPagination().total }}</h4>
                <small class="text-muted">Properties</small>
              </div>
            </div>
          </div>
          <div class="col">
            <div class="card border-0 shadow-sm h-100">
              <div class="card-body text-center">
                <div class="fs-3 mb-1 text-warning">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
                </div>
                <h4 class="fw-bold text-warning mb-0">{{ agentCount() }}</h4>
                <small class="text-muted">Agents</small>
              </div>
            </div>
          </div>
          <div class="col">
            <div class="card border-0 shadow-sm h-100">
              <div class="card-body text-center">
                <div class="fs-3 mb-1 text-info">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                </div>
                <h4 class="fw-bold text-info mb-0">{{ buyerCount() }}</h4>
                <small class="text-muted">Buyers</small>
              </div>
            </div>
          </div>
          <div class="col">
            <div class="card border-0 shadow-sm h-100">
              <div class="card-body text-center">
                <div class="fs-3 mb-1 text-danger">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                </div>
                <h4 class="fw-bold text-danger mb-0">{{ appeals().length }}</h4>
                <small class="text-muted">Appeals</small>
              </div>
            </div>
          </div>
        </div>

        <!-- Tabs -->
        <ul class="nav nav-pills mb-4 gap-2">
          <li class="nav-item">
            <button class="nav-link px-4 py-2 fw-semibold" [class.active]="activeTab === 'users'"
              [style.background]="activeTab === 'users' ? 'linear-gradient(135deg, #0d6efd, #6610f2)' : ''"
              (click)="activeTab = 'users'">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="me-2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
              All Users
            </button>
          </li>
          <li class="nav-item">
            <button class="nav-link px-4 py-2 fw-semibold" [class.active]="activeTab === 'properties'"
              [style.background]="activeTab === 'properties' ? 'linear-gradient(135deg, #198754, #20c997)' : ''"
              (click)="activeTab = 'properties'">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="me-2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
              All Properties
            </button>
          </li>
          <li class="nav-item">
            <button class="nav-link px-4 py-2 fw-semibold position-relative" [class.active]="activeTab === 'appeals'"
              [style.background]="activeTab === 'appeals' ? 'linear-gradient(135deg, #dc3545, #fd7e14)' : ''"
              (click)="activeTab = 'appeals'; loadAppeals()">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="me-2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
              Unban Appeals
              <span *ngIf="appeals().length" class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                {{ appeals().length }}
              </span>
            </button>
          </li>
          <li class="nav-item">
            <button class="nav-link px-4 py-2 fw-semibold position-relative" [class.active]="activeTab === 'reports'"
              [style.background]="activeTab === 'reports' ? 'linear-gradient(135deg, #6610f2, #e83e8c)' : ''"
              (click)="activeTab = 'reports'; loadReports()">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="me-2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
              User Reports
              <span *ngIf="reports().length" class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                {{ reports().length }}
              </span>
            </button>
          </li>
        </ul>

        <!-- ═══ REPORTS TAB ═══ -->
        <div *ngIf="activeTab === 'reports'" class="card border-0 shadow-sm" style="background-color: #ffffff;">
          <div class="card-header bg-white py-3 border-0 d-flex justify-content-between align-items-center flex-wrap gap-2">
             <h5 class="fw-bold mb-0 text-dark">User Reports</h5>
             <div class="btn-group p-1 bg-light rounded-pill shadow-sm">
               <button class="btn btn-sm px-3 rounded-pill transition-all" 
                 [class.btn-primary]="!showReportHistory" [class.btn-light]="showReportHistory"
                 (click)="showReportHistory = false">Pending</button>
               <button class="btn btn-sm px-3 rounded-pill transition-all" 
                 [class.btn-primary]="showReportHistory" [class.btn-light]="!showReportHistory"
                 (click)="showReportHistory = true; loadReportHistory()">History</button>
             </div>
          </div>
          <div class="card-body p-0">
            <div *ngIf="reportsLoading()" class="text-center py-5">
              <div class="spinner-border text-primary" role="status"></div>
              <p class="text-muted mt-2 mb-0">Loading reports...</p>
            </div>

            <div *ngIf="!reportsLoading() && !reports().length && !showReportHistory" class="text-center py-5">
              <div class="fs-1 text-muted mb-3 opacity-25">🛡️</div>
              <h5 class="text-muted">Safe Environment</h5>
              <p class="small text-muted mb-0">No pending reports found.</p>
            </div>

            <!-- PENDING REPORTS TABLE -->
            <div class="table-responsive" *ngIf="!reportsLoading() && reports().length && !showReportHistory">
              <table class="table table-hover align-middle mb-0">
                <thead class="table-light">
                  <tr>
                    <th class="ps-4">Reported User</th>
                    <th>Reason</th>
                    <th>Reporter</th>
                    <th>Date</th>
                    <th class="text-end pe-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let report of reports()">
                    <td class="ps-4">
                      <div class="d-flex align-items-center gap-2">
                        <div class="avatar bg-soft-danger rounded-circle d-flex align-items-center justify-content-center fw-bold text-danger" style="width: 36px; height: 36px; background-color: #fee2e2;">
                           {{ report.reportedUser?.name?.charAt(0) }}
                        </div>
                        <div>
                          <div class="d-flex align-items-center gap-1">
                            <div class="fw-bold text-dark cursor-pointer text-primary-hover" (click)="openUserDetail(report.reportedUser?._id)">{{ report.reportedUser?.name }}</div>
                            <span class="badge rounded-pill extra-small" [ngClass]="{
                              'bg-primary-subtle text-primary': report.reportedUser?.role === 'buyer',
                              'bg-warning-subtle text-warning': report.reportedUser?.role === 'agent',
                              'bg-success-subtle text-success': report.reportedUser?.role === 'host'
                            }" style="font-size: 8px; padding: 2px 6px;">{{ report.reportedUser?.role | uppercase }}</span>
                          </div>
                          <div class="text-muted x-small">Status: {{ report.reportedUser?.status | uppercase }}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span class="badge" [ngClass]="{
                        'bg-danger': report.reason === 'scam' || report.reason === 'fraud',
                        'bg-warning text-dark': report.reason === 'inappropriate',
                        'bg-secondary': report.reason === 'spam' || report.reason === 'other'
                      }">{{ report.reason | uppercase }}</span>
                      <div class="small text-muted mt-1 text-truncate" style="max-width: 250px;">"{{ report.description || 'No details' }}"</div>
                    </td>
                    <td>
                      <div class="d-flex align-items-center gap-1">
                        <div class="fw-medium text-dark">{{ report.reporter?.name }}</div>
                        <span class="badge rounded-pill extra-small" [ngClass]="{
                          'bg-primary-subtle text-primary': report.reporter?.role === 'buyer',
                          'bg-warning-subtle text-warning': report.reporter?.role === 'agent',
                          'bg-success-subtle text-success': report.reporter?.role === 'host'
                        }" style="font-size: 8px; padding: 2px 6px;">{{ report.reporter?.role | uppercase }}</span>
                      </div>
                      <div class="text-muted x-small">{{ report.reporter?.email }}</div>
                    </td>
                    <td class="small">{{ report.createdAt | date:'medium' }}</td>
                    <td class="text-end pe-4">
                       <div class="btn-group shadow-sm rounded-pill overflow-hidden">
                         <button class="btn btn-danger btn-sm border-0 px-3" (click)="onHandleReport(report, 'resolve')" title="Resolve & Suspend">
                           <i class="bi bi-shield-lock me-1"></i> Resolve
                         </button>
                         <button class="btn btn-outline-secondary btn-sm border-0 px-3" (click)="onHandleReport(report, 'reject')" title="Reject Report">
                           <i class="bi bi-x-circle me-1"></i> Reject
                         </button>
                       </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- REPORT HISTORY TABLE (Optional implementation - showing handled reports) -->
             <div class="table-responsive" *ngIf="!reportsLoading() && showReportHistory">
              <div *ngIf="!reportHistory().length" class="text-center py-5 text-muted">No report history found</div>
              <table class="table table-hover align-middle mb-0" *ngIf="reportHistory().length">
                 <thead class="table-light">
                  <tr>
                    <th class="ps-4">User</th>
                    <th>Result</th>
                    <th>Reason</th>
                    <th>Reporter</th>
                    <th>Handled</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let rh of reportHistory()">
                    <td class="ps-4">
                      <div class="d-flex align-items-center gap-1">
                        <div class="fw-bold text-dark">{{ rh.reportedUser?.name }}</div>
                        <span class="badge rounded-pill extra-small" [ngClass]="{
                          'bg-primary-subtle text-primary': rh.reportedUser?.role === 'buyer',
                          'bg-warning-subtle text-warning': rh.reportedUser?.role === 'agent',
                          'bg-success-subtle text-success': rh.reportedUser?.role === 'host'
                        }" style="font-size: 8px; padding: 2px 6px;">{{ rh.reportedUser?.role | uppercase }}</span>
                      </div>
                      <div class="text-muted x-small">{{ rh.reportedUser?.email }}</div>
                    </td>
                    <td>
                       <span class="badge rounded-pill px-3" 
                        [ngClass]="rh.status === 'resolved' ? 'bg-success' : 'bg-secondary'">
                        {{ rh.status === 'resolved' ? 'Resolved (Action Taken)' : 'Reviewed' }}
                      </span>
                    </td>
                    <td><small>{{ rh.reason | titlecase }}</small></td>
                    <td>
                      <div class="d-flex align-items-center gap-1">
                        <div class="fw-medium text-muted small">{{ rh.reporter?.name }}</div>
                        <span class="badge rounded-pill extra-small" [ngClass]="{
                          'bg-primary-subtle text-primary': rh.reporter?.role === 'buyer',
                          'bg-warning-subtle text-warning': rh.reporter?.role === 'agent',
                          'bg-success-subtle text-success': rh.reporter?.role === 'host'
                        }" style="font-size: 8px; padding: 2px 6px;">{{ rh.reporter?.role | uppercase }}</span>
                      </div>
                    </td>
                    <td class="small text-muted">{{ rh.updatedAt | date:'medium' }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- ═══ APPEALS TAB ═══ -->
        <div *ngIf="activeTab === 'appeals'" class="card border-0 shadow-sm" style="background-color: var(--auth-card-bg);">
          <div class="card-header bg-white py-3 border-0 d-flex justify-content-between align-items-center flex-wrap gap-2">
             <h5 class="fw-bold mb-0 text-dark">Unban Appeals</h5>
             <div class="btn-group p-1 bg-light rounded-pill shadow-sm">
               <button class="btn btn-sm px-3 rounded-pill transition-all" 
                 [class.btn-primary]="!showAppealHistory" [class.btn-light]="showAppealHistory"
                 (click)="showAppealHistory = false">Pending</button>
               <button class="btn btn-sm px-3 rounded-pill transition-all" 
                 [class.btn-primary]="showAppealHistory" [class.btn-light]="!showAppealHistory"
                 (click)="showAppealHistory = true; loadAppealHistory()">History</button>
             </div>
          </div>
          <div class="card-body p-0">
            <div *ngIf="appealsLoading()" class="text-center py-5">
              <div class="spinner-border text-danger" role="status"></div>
              <p class="text-muted mt-2 mb-0">Loading appeals...</p>
            </div>

            <div *ngIf="!appealsLoading() && !appeals().length" class="text-center py-5">
              <div class="fs-1 text-muted mb-3 opacity-25">🕊️</div>
              <h5 class="text-muted">No pending appeals</h5>
              <p class="small text-muted mb-0">Everything is quiet here.</p>
            </div>

            <!-- PENDING APPEALS TABLE -->
            <div class="table-responsive" *ngIf="!appealsLoading() && appeals().length && !showAppealHistory">
              <table class="table table-hover align-middle mb-0">
                <thead class="table-light">
                  <tr>
                    <th class="ps-4">User</th>
                    <th>Status</th>
                    <th>Duration</th>
                    <th>Time Left</th>
                    <th>Appeal Message</th>
                    <th>Date</th>
                    <th class="text-end pe-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let appeal of appeals()">
                    <td class="ps-4">
                      <div class="d-flex align-items-center gap-2">
                        <div class="avatar bg-soft-primary rounded-circle d-flex align-items-center justify-content-center fw-bold text-white" style="width: 36px; height: 36px; background-color: var(--c-forest);">
                           {{ appeal.userId?.name?.charAt(0) }}
                        </div>
                        <div>
                          <div class="fw-bold text-dark">{{ appeal.userId?.name }}</div>
                          <div class="text-muted x-small">{{ appeal.userId?.email }}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span class="badge" [ngClass]="appeal.userId?.status === 'banned' ? 'bg-danger' : 'bg-warning'">
                        {{ appeal.userId?.status | uppercase }}
                      </span>
                    </td>
                    <td>
                      <span class="badge bg-secondary-subtle text-secondary small">
                        {{ getDurationLabel(appeal.userId) }}
                      </span>
                    </td>
                    <td>
                      <span class="badge rounded-pill bg-danger-subtle text-danger d-inline-flex align-items-center gap-1">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                        {{ getRemainingTime(appeal.userId?.suspendedUntil) }}
                      </span>
                    </td>
                    <td>
                      <div class="text-dark bg-light p-2 rounded small shadow-sm" style="max-width: 300px; border-left: 4px solid var(--c-rose);">
                        "{{ appeal.message }}"
                      </div>
                    </td>
                    <td class="small">{{ appeal.createdAt | date:'medium' }}</td>
                    <td class="text-end pe-4">
                       <div class="btn-group shadow-sm rounded-pill overflow-hidden">
                         <button class="btn btn-success btn-sm border-0 px-3" (click)="onHandleAppeal(appeal, 'approve')" title="Approve & Reactivate">
                           <i class="bi bi-check-lg me-1"></i> Approve
                         </button>
                         <button class="btn btn-danger btn-sm border-0 px-3" (click)="onHandleAppeal(appeal, 'reject')" title="Reject Appeal">
                           <i class="bi bi-x-lg me-1"></i> Reject
                         </button>
                       </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- APPEAL HISTORY TABLE -->
            <div class="table-responsive" *ngIf="!appealHistoryLoading() && showAppealHistory">
              <table class="table table-hover align-middle mb-0">
                <thead class="table-light">
                  <tr>
                    <th class="ps-4">User</th>
                    <th>Decision</th>
                    <th>Handled At</th>
                    <th>Admin Note</th>
                    <th>Original Message</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let hist of appealHistory()">
                    <td class="ps-4">
                      <div class="fw-bold text-dark">{{ hist.userId?.name }}</div>
                      <div class="text-muted x-small">{{ hist.userId?.email }}</div>
                    </td>
                    <td>
                      <span class="badge rounded-pill px-3" 
                        [ngClass]="hist.status === 'approved' ? 'bg-success' : 'bg-danger'">
                        {{ hist.status | titlecase }}
                      </span>
                    </td>
                    <td class="small text-muted">{{ hist.updatedAt | date:'medium' }}</td>
                    <td>
                      <span class="text-muted small italic" *ngIf="!hist.adminNote">No notes provided</span>
                      <div class="small text-dark" *ngIf="hist.adminNote">{{ hist.adminNote }}</div>
                    </td>
                    <td>
                      <div class="text-muted x-small text-truncate" style="max-width: 200px;" [title]="hist.message">
                        "{{ hist.message }}"
                      </div>
                    </td>
                  </tr>
                  <tr *ngIf="!appealHistory().length">
                    <td colspan="5" class="text-center py-4 text-muted">No appeal history found</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div *ngIf="appealHistoryLoading()" class="text-center py-5">
              <div class="spinner-grow text-danger"></div>
              <p class="text-muted mt-2 x-small">Loading history...</p>
            </div>
          </div>
        </div>

        <div *ngIf="activeTab === 'users'" class="card border-0 shadow-sm">
          <div class="card-header bg-white py-3">
            <div class="row align-items-center g-2">
              <div class="col-md-6">
                  <div class="input-group shadow-sm rounded">
                    <span class="input-group-text bg-light border-0">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                    </span>
                    <input type="text" class="form-control bg-light border-0" placeholder="Search by name, email, or phone..."
                      style="color: #000 !important; font-weight: 500;"
                      [(ngModel)]="userSearch" (input)="onUserSearch()">
                  </div>
              </div>
              <div class="col-md-3">
                <select class="form-select bg-light border-0 shadow-sm" style="color: #000 !important; font-weight: 500;" [(ngModel)]="userRoleFilter" (change)="loadUsers()">
                  <option value="">All Roles</option>
                  <option value="buyer">Buyer</option>
                  <option value="agent">Agent</option>
                  <option value="host">Host</option>
                </select>
              </div>
              <div class="col-md-3 text-end">
                <span class="badge bg-primary-subtle text-primary px-3 py-2">{{ usersPagination().total }} users</span>
              </div>
            </div>
          </div>
          <div class="card-body p-0">
            <div *ngIf="usersLoading()" class="text-center py-5">
              <div class="spinner-border text-primary" role="status"></div>
              <p class="text-muted mt-2 mb-0">Loading users...</p>
            </div>

            <div class="table-responsive" *ngIf="!usersLoading()">
              <table class="table table-hover align-middle mb-0">
                <thead class="table-light">
                  <tr>
                    <th class="ps-4">#</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Joined</th>
                    <th>Verified</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let user of users(); let i = index">
                    <td class="ps-4 text-muted">{{ (usersPage - 1) * 20 + i + 1 }}</td>
                    <td>
                      <div class="d-flex align-items-center gap-2">
                        <div *ngIf="user.isOnline" class="bg-success rounded-circle pulse-online" style="width: 10px; height: 10px;" title="Online"></div>
                        <a class="fw-semibold text-primary text-decoration-none" style="cursor:pointer;" (click)="openUserDetail(user._id)">
                          {{ user.name }}
                        </a>
                        <span *ngIf="user.isOnline" class="badge bg-success-subtle text-success border border-success-subtle font-monospace px-1 py-0" style="font-size: 8px;">LIVE</span>
                      </div>
                    </td>
                    <td><small class="text-muted">{{ user.email }}</small></td>
                    <td><small>{{ user.phone }}</small></td>
                    <td>
                      <span class="badge rounded-pill" [ngClass]="{
                        'bg-primary-subtle text-primary': user.role === 'buyer',
                        'bg-warning-subtle text-warning': user.role === 'agent',
                        'bg-success-subtle text-success': user.role === 'host'
                      }">{{ user.role | titlecase }}</span>
                    </td>
                    <td>
                      <div class="d-flex flex-column">
                        <span class="badge rounded-pill mb-1" [ngClass]="user.status === 'banned' || (user.suspendedUntil && isSuspended(user.suspendedUntil)) ? 'bg-danger-subtle text-danger' : 'bg-success-subtle text-success'">
                          {{ user.status === 'banned' ? 'BANNED' : (user.suspendedUntil && isSuspended(user.suspendedUntil) ? 'SUSPENDED' : 'ACTIVE') }}
                        </span>
                        <small *ngIf="user.suspendedUntil && isSuspended(user.suspendedUntil)" class="text-danger" style="font-size: 10px;">
                          Until: {{ user.suspendedUntil | date:'medium' }}
                        </small>
                      </div>
                    </td>
                    <td><small class="text-muted">{{ user.createdAt | date:'medium' }}</small></td>
                    <td>
                      <span [class]="user.isVerified ? 'text-success' : 'text-danger'">
                        <svg *ngIf="user.isVerified" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        <svg *ngIf="!user.isVerified" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                      </span>
                    </td>
                    <td>
                      <div class="dropdown">
                        <button class="btn btn-sm btn-light border dropdown-toggle" type="button" data-bs-toggle="dropdown">
                          Manage
                        </button>
                        <ul class="dropdown-menu dropdown-menu-end shadow border-0">
                          <li><a class="dropdown-item py-2" style="cursor:pointer;" (click)="openUserDetail(user._id)">
                            <i class="bi bi-eye me-2"></i> View Profile
                          </a></li>
                          <li><hr class="dropdown-divider"></li>
                          <li><a class="dropdown-item py-2 text-primary" style="cursor:pointer;" (click)="downloadTerms(user._id)">
                            <i class="bi bi-file-earmark-pdf me-2"></i> Download T&C
                          </a></li>
                          <li *ngIf="user.status !== 'banned' && (!user.suspendedUntil || !isSuspended(user.suspendedUntil))">
                            <a class="dropdown-item text-danger py-2" style="cursor:pointer;" (click)="openSuspenseModal(user)">
                              <i class="bi bi-slash-circle me-2"></i> Suspend User
                            </a>
                          </li>
                          <li *ngIf="user.status === 'banned' || (user.suspendedUntil && isSuspended(user.suspendedUntil))">
                            <a class="dropdown-item text-success py-2 font-bold" style="cursor:pointer;" (click)="onQuickApprove(user)">
                              <i class="bi bi-check-circle me-2"></i> Approve
                            </a>
                          </li>
                          <li>
                            <a class="dropdown-item text-danger py-2" style="cursor:pointer;" (click)="deleteUserPermanently(user)">
                              <i class="bi bi-trash me-2"></i> Permanent Delete
                            </a>
                          </li>
                        </ul>
                      </div>
                    </td>
                  </tr>
                  <tr *ngIf="users().length === 0">
                    <td colspan="8" class="text-center py-4 text-muted">No users found</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <!-- Pagination -->
          <div class="card-footer bg-white d-flex justify-content-between align-items-center" *ngIf="usersPagination().pages > 1">
            <small class="text-muted">Page {{ usersPage }} of {{ usersPagination().pages }}</small>
            <div class="btn-group btn-group-sm">
              <button class="btn btn-outline-primary" (click)="usersPage = usersPage - 1; loadUsers()" [disabled]="usersPage <= 1">← Prev</button>
              <button class="btn btn-outline-primary" (click)="usersPage = usersPage + 1; loadUsers()" [disabled]="usersPage >= usersPagination().pages">Next →</button>
            </div>
          </div>
        </div>

        <!-- ═══ PROPERTIES TAB ═══ -->
        <div *ngIf="activeTab === 'properties'" class="card border-0 shadow-sm">
          <div class="card-header bg-white py-3">
            <div class="row align-items-center g-2">
              <div class="col-md-3">
                <select class="form-select bg-light border-0 shadow-sm" style="color: #000 !important; font-weight: 500;" [(ngModel)]="propTypeFilter" (change)="loadProperties()">
                  <option value="">All Types</option>
                  <option value="rent">Rent</option>
                  <option value="sale">Sale</option>
                </select>
              </div>
              <div class="col-md-3">
                <select class="form-select bg-light border-0 shadow-sm" style="color: #000 !important; font-weight: 500;" [(ngModel)]="propStatusFilter" (change)="loadProperties()">
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="sold/rented">Sold/Rented</option>
                </select>
              </div>
              <div class="col-md-3">
                <select class="form-select bg-light border-0 shadow-sm" style="color: #000 !important; font-weight: 500;" [(ngModel)]="propRoleFilter" (change)="loadProperties()">
                  <option value="">Posted By (All)</option>
                  <option value="agent">By Agent</option>
                  <option value="host">By Host</option>
                </select>
              </div>
              <div class="col-md-3">
                <input type="text" class="form-control bg-light border-0 shadow-sm" placeholder="Filter location..."
                  style="color: #000 !important; font-weight: 500;"
                  [(ngModel)]="propLocationFilter" (input)="onPropLocationSearch()">
              </div>
            </div>
          </div>
          <div class="card-body p-0">
            <div *ngIf="propertiesLoading()" class="text-center py-5">
              <div class="spinner-border text-success" role="status"></div>
              <p class="text-muted mt-2 mb-0">Loading properties...</p>
            </div>

            <div class="table-responsive" *ngIf="!propertiesLoading()">
              <table class="table table-hover align-middle mb-0">
                <thead class="table-light">
                  <tr>
                    <th class="ps-4">#</th>
                    <th>Title</th>
                    <th>Price (₹)</th>
                    <th>Type</th>
                    <th>Location</th>
                    <th>Posted By</th>
                    <th>Status</th>
                    <th>Created</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let prop of properties(); let i = index">
                    <td class="ps-4 text-muted">{{ (propsPage - 1) * 20 + i + 1 }}</td>
                    <td class="fw-semibold" style="max-width: 200px;">
                      <span class="text-truncate d-inline-block" style="max-width: 200px;">{{ prop.title }}</span>
                    </td>
                    <td class="text-success fw-bold">{{ prop.price | currency:'INR':'symbol':'1.0-0' }}</td>
                    <td>
                      <span class="badge" [ngClass]="prop.type === 'rent' ? 'bg-info-subtle text-info' : 'bg-primary-subtle text-primary'">
                        {{ prop.type | titlecase }}
                      </span>
                    </td>
                    <td><small>{{ prop.location }}</small></td>
                    <td>
                      <div class="d-flex flex-column">
                        <a class="fw-semibold text-primary text-decoration-none small" style="cursor:pointer;"
                          (click)="openUserDetail(prop.postedBy?._id)" *ngIf="prop.postedBy?._id">
                          {{ prop.postedBy?.name || 'N/A' }}
                        </a>
                        <small class="text-muted">{{ prop.postedBy?.role | titlecase }}</small>
                      </div>
                    </td>
                    <td>
                      <span class="badge rounded-pill" [ngClass]="{
                        'bg-success-subtle text-success': prop.status === 'active',
                        'bg-warning-subtle text-warning': prop.status === 'pending',
                        'bg-danger-subtle text-danger': prop.status === 'sold/rented'
                      }">{{ prop.status | titlecase }}</span>
                    </td>
                    <td><small class="text-muted">{{ prop.createdAt | date:'MMM d, y, h:mm a' }}</small></td>
                  </tr>
                  <tr *ngIf="properties().length === 0">
                    <td colspan="8" class="text-center py-4 text-muted">No properties found</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div class="card-footer bg-white d-flex justify-content-between align-items-center" *ngIf="propertiesPagination().pages > 1">
            <small class="text-muted">Page {{ propsPage }} of {{ propertiesPagination().pages }}</small>
            <div class="btn-group btn-group-sm">
              <button class="btn btn-outline-success" (click)="propsPage = propsPage - 1; loadProperties()" [disabled]="propsPage <= 1">← Prev</button>
              <button class="btn btn-outline-success" (click)="propsPage = propsPage + 1; loadProperties()" [disabled]="propsPage >= propertiesPagination().pages">Next →</button>
            </div>
          </div>
        </div>

      </div>

      <!-- ═══ USER DETAIL MODAL ═══ -->
      <div class="modal fade" [class.show]="showUserDetail" [style.display]="showUserDetail ? 'block' : 'none'" tabindex="-1">
        <div class="modal-dialog modal-lg modal-dialog-scrollable">
          <div class="modal-content border-0 shadow-lg" style="border-radius: 20px; overflow: hidden;">
            <!-- Loading -->
            <div *ngIf="userDetailLoading" class="text-center py-5">
              <div class="spinner-border text-primary"></div>
              <p class="text-muted mt-2">Loading user details...</p>
            </div>

            <div *ngIf="!userDetailLoading && selectedUser">
              <!-- Header -->
              <div class="position-relative" style="height: 160px; background: transparent;">
                <!-- Back Button in Modal -->
                <button (click)="closeUserDetail()" class="btn btn-link text-white p-0 position-absolute hover-lift d-flex align-items-center justify-content-center fw-bold shadow-sm" style="top: 20px; left: 20px; width: 36px; height: 36px; border: 2px solid rgba(255,255,255,0.6); border-radius: 10px; text-decoration: none; z-index: 100;">
                  <i class="bi bi-chevron-left fs-5" style="-webkit-text-stroke: 1.2px currentColor;"></i>
                </button>
              </div>
              <div class="text-center" style="margin-top: -80px; color: #212529;">
                <div class="mx-auto rounded-circle overflow-hidden shadow" style="width: 100px; height: 100px; border: 4px solid white;">
                  <img [src]="selectedUser.profilePhoto ? apiBase + selectedUser.profilePhoto : getAvatar(selectedUser)" class="w-100 h-100" style="object-fit: cover;" alt="avatar">
                </div>
                <h4 class="fw-bold mt-2 mb-0">{{ selectedUser.firstName || '' }} {{ selectedUser.lastName || '' }}</h4>
                <p class="text-muted mb-1" *ngIf="selectedUser.username">&#64;{{ selectedUser.username }}</p>
                <span class="badge rounded-pill px-3 py-2 text-capitalize d-inline-flex align-items-center gap-2" [ngClass]="{
                  'bg-success': selectedUser.role === 'host',
                  'bg-primary': selectedUser.role === 'agent',
                  'bg-info text-dark': selectedUser.role === 'buyer'
                }">
                  <svg *ngIf="selectedUser.role === 'host'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                  <svg *ngIf="selectedUser.role === 'agent'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
                  <svg *ngIf="selectedUser.role === 'buyer'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                  {{ selectedUser.role === 'agent' ? 'Agent' : selectedUser.role === 'buyer' ? 'Buyer' : 'Host Admin' }}
                </span>
                <p class="text-muted small mt-2" *ngIf="selectedUser.bio">{{ selectedUser.bio }}</p>
              </div>

              <div class="modal-body p-4">
                <!-- Info Grid -->
                <div class="row g-3 mb-4">
                  <div class="col-6 col-md-4" *ngIf="selectedUser.email">
                    <small class="text-muted d-block text-uppercase" style="font-size:10px;letter-spacing:1px;">Email</small>
                    <span class="fw-medium small">{{ selectedUser.email }}</span>
                  </div>
                  <div class="col-6 col-md-4" *ngIf="selectedUser.phone">
                    <small class="text-muted d-block text-uppercase" style="font-size:10px;letter-spacing:1px;">Phone</small>
                    <span class="fw-medium small">{{ selectedUser.phone }}</span>
                  </div>
                  <div class="col-6 col-md-4" *ngIf="selectedUser.gender">
                    <small class="text-muted d-block text-uppercase" style="font-size:10px;letter-spacing:1px;">Gender</small>
                    <span class="fw-medium small text-capitalize">{{ selectedUser.gender === 'prefer_not_to_say' ? 'N/A' : selectedUser.gender }}</span>
                  </div>
                  <div class="col-6 col-md-4" *ngIf="selectedUser.company">
                    <small class="text-muted d-block text-uppercase" style="font-size:10px;letter-spacing:1px;">Company</small>
                    <span class="fw-medium small">{{ selectedUser.company }}</span>
                  </div>
                  <div class="col-6 col-md-4" *ngIf="selectedUser.designation">
                    <small class="text-muted d-block text-uppercase" style="font-size:10px;letter-spacing:1px;">Designation</small>
                    <span class="fw-medium small">{{ selectedUser.designation }}</span>
                  </div>
                  <div class="col-6 col-md-4">
                    <small class="text-muted d-block text-uppercase" style="font-size:10px;letter-spacing:1px;">Joined</small>
                    <span class="fw-medium small">{{ selectedUser.createdAt | date:'MMM d, y, h:mm a' }}</span>
                  </div>
                  <div class="col-6 col-md-4" *ngIf="selectedUser.address?.city">
                    <small class="text-muted d-block text-uppercase" style="font-size:10px;letter-spacing:1px;">Location</small>
                    <span class="fw-medium small">{{ selectedUser.address.city }}<span *ngIf="selectedUser.address?.state">, {{ selectedUser.address.state }}</span></span>
                  </div>
                  <div class="col-6 col-md-4" *ngIf="selectedUser.experience">
                    <small class="text-muted d-block text-uppercase" style="font-size:10px;letter-spacing:1px;">Experience</small>
                    <span class="fw-medium small">{{ selectedUser.experience }}</span>
                  </div>
                  <div class="col-6 col-md-4" *ngIf="selectedUser.specialization">
                    <small class="text-muted d-block text-uppercase" style="font-size:10px;letter-spacing:1px;">Specialization</small>
                    <span class="fw-medium small">{{ selectedUser.specialization }}</span>
                  </div>
                </div>

                <!-- AGENT/HOST: Posted Properties -->
                <div *ngIf="(selectedUser.role === 'agent' || selectedUser.role === 'host') && userPostedProperties.length > 0">
                  <h6 class="fw-bold mb-3 d-flex align-items-center gap-2">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                    Posted Properties ({{ userPostedProperties.length }})
                  </h6>
                  <div class="row g-3">
                    <div class="col-md-6" *ngFor="let p of userPostedProperties">
                      <div class="card border shadow-sm h-100" style="border-radius:12px;">
                        <div class="card-body p-3">
                          <div class="d-flex justify-content-between align-items-start">
                            <h6 class="fw-bold mb-1 text-truncate" style="max-width:200px;">{{ p.title }}</h6>
                            <span class="badge rounded-pill" [ngClass]="{
                              'bg-success-subtle text-success': p.status === 'active',
                              'bg-warning-subtle text-warning': p.status === 'pending'
                            }">{{ p.status | titlecase }}</span>
                          </div>
                          <p class="text-success fw-bold mb-1">{{ p.price | currency:'INR':'symbol':'1.0-0' }}</p>
                          <div class="d-flex gap-2 flex-wrap">
                            <small class="badge bg-light text-dark">{{ p.type | titlecase }}</small>
                            <small class="badge bg-light text-dark">{{ p.propertyType }}</small>
                            <small class="badge bg-light text-dark d-inline-flex align-items-center gap-1">
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                              {{ p.location }}
                            </small>
                          </div>
                          <small class="text-muted d-flex align-items-center gap-1 mt-1">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                            {{ p.views }} views · {{ p.createdAt | date:'medium' }}
                          </small>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div *ngIf="(selectedUser.role === 'agent' || selectedUser.role === 'host') && userPostedProperties.length === 0" class="text-center text-muted py-3">
                  <p class="mb-0">No properties posted yet.</p>
                </div>

                <!-- BUYER: Favorite Properties -->
                <div *ngIf="selectedUser.role === 'buyer' && userFavoriteProperties.length > 0">
                  <h6 class="fw-bold mb-3 d-flex align-items-center gap-2">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                    Favorite Properties ({{ userFavoriteProperties.length }})
                  </h6>
                  <div class="row g-3">
                    <div class="col-md-6" *ngFor="let p of userFavoriteProperties">
                      <div class="card border shadow-sm h-100" style="border-radius:12px;">
                        <div class="card-body p-3">
                          <h6 class="fw-bold mb-1 text-truncate" style="max-width:200px;">{{ p.title }}</h6>
                          <p class="text-success fw-bold mb-1">{{ p.price | currency:'INR':'symbol':'1.0-0' }}</p>
                          <div class="d-flex gap-2 flex-wrap">
                            <small class="badge bg-light text-dark">{{ p.type | titlecase }}</small>
                            <small class="badge bg-light text-dark">{{ p.propertyType }}</small>
                            <small class="badge bg-light text-dark d-inline-flex align-items-center gap-1">
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                              {{ p.location }}
                            </small>
                          </div>
                          <small class="text-muted d-block mt-1">By {{ p.postedBy?.name }} · {{ p.createdAt | date:'medium' }}</small>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div *ngIf="selectedUser.role === 'buyer' && userFavoriteProperties.length === 0" class="text-center text-muted py-3">
                  <p class="mb-0">No favorite properties yet.</p>
                </div>
              </div>

              <div class="modal-footer border-0">
                <button class="btn btn-outline-secondary rounded-pill px-4" (click)="closeUserDetail()">Close</button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="modal-backdrop fade" [class.show]="showUserDetail" *ngIf="showUserDetail" (click)="closeUserDetail()"></div>

      <!-- ═══ SUSPENSE MODAL ═══ -->
      <div class="modal fade" [class.show]="showSuspenseModal" [style.display]="showSuspenseModal ? 'block' : 'none'" tabindex="-1">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content border-0 shadow-lg" style="border-radius: 16px;">
            <div class="modal-header border-0 pb-0">
              <h5 class="fw-bold mb-0">Suspend User</h5>
              <button type="button" class="btn-close" (click)="closeSuspenseModal()"></button>
            </div>
            <div class="modal-body py-4">
              <p class="text-muted small mb-3">Choose the suspension duration for <strong>{{ selectedUserForSuspense?.name }}</strong>. During this time, the user will be blocked from accessing their account.</p>
              
              <div class="mb-3">
                <label class="form-label small fw-bold text-uppercase">Duration</label>
                <select class="form-select border-0 bg-light" [(ngModel)]="suspenseDuration">
                  <option value="1d">24 Hours</option>
                  <option value="1w">7 Days (1 Week)</option>
                  <option value="1m">30 Days (1 Month)</option>
                  <option value="1y">365 Days (1 Year)</option>
                  <option value="permanent">Permanent Ban</option>
                </select>
              </div>

              <div class="alert alert-warning border-0 small mb-0">
                <i class="bi bi-exclamation-triangle-fill me-2"></i>
                This user will be automatically reactivated after the suspension period ends.
              </div>
            </div>
            <div class="modal-footer border-0 pt-0">
              <button class="btn btn-light rounded-pill px-4" (click)="closeSuspenseModal()">Cancel</button>
              <button class="btn btn-danger rounded-pill px-4" (click)="submitSuspense()">Confirm Suspension</button>
            </div>
          </div>
        </div>
      </div>
      <div class="modal-backdrop fade" [class.show]="showSuspenseModal" *ngIf="showSuspenseModal" (click)="closeSuspenseModal()"></div>

    </div>
  `,
  styles: [`
    .nav-pills .nav-link { color: #6c757d; border-radius: 12px; transition: all 0.3s; }
    .nav-pills .nav-link.active { color: #fff !important; box-shadow: 0 4px 15px rgba(13, 110, 253, 0.3); }
    .nav-pills .nav-link:hover:not(.active) { background: #e9ecef; }
    .table th { font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.5px; color: #6c757d; border-bottom: 2px solid #dee2e6; }
    .table td { font-size: 0.9rem; vertical-align: middle; }
    .card { border-radius: 16px !important; overflow: hidden; }
    .badge { font-weight: 500; }
    .modal.show { display: block !important; }
    
    .pulse-online {
      box-shadow: 0 0 0 0 rgba(25, 135, 84, 0.7);
      animation: pulse-green 2s infinite;
    }
    @keyframes pulse-green {
      0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(25, 135, 84, 0.7); }
      70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(25, 135, 84, 0); }
      100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(25, 135, 84, 0); }
    }
  `]
})
export class HostDashboardComponent implements OnInit, OnDestroy {
  activeTab = 'users';
  apiBase = environment.apiUrl.replace('/api', '');
  private timerSubscription?: Subscription;

  // Users
  users = signal<any[]>([]);
  usersLoading = signal(true);
  usersPagination = signal<any>({ page: 1, limit: 20, total: 0, pages: 0 });
  usersPage = 1;
  userSearch = '';
  userRoleFilter = '';
  totalUsersCount = signal(0);
  agentCount = signal(0);
  buyerCount = signal(0);

  // Properties
  properties = signal<any[]>([]);
  propertiesLoading = signal(true);
  propertiesPagination = signal<any>({ page: 1, limit: 20, total: 0, pages: 0 });
  propsPage = 1;
  propTypeFilter = '';
  propStatusFilter = '';
  propRoleFilter = '';
  propLocationFilter = '';

  // Appeals
  appeals = signal<any[]>([]);
  appealsLoading = signal(false);
  appealHistory = signal<any[]>([]);
  appealHistoryLoading = signal(false);
  showAppealHistory = false;

  // Reports
  reports = signal<any[]>([]);
  reportsLoading = signal(false);
  reportHistory = signal<any[]>([]);
  showReportHistory = false;

  // User Detail Modal
  showUserDetail = false;
  userDetailLoading = false;
  selectedUser: any = null;
  userPostedProperties: any[] = [];
  userFavoriteProperties: any[] = [];

  // Suspense Modal
  showSuspenseModal = false;
  selectedUserForSuspense: any = null;
  suspenseDuration = '1d';

  currentUser = signal<any>(null);
  
  private userSearchSubject = new Subject<string>();
  private propSearchSubject = new Subject<string>();

  constructor(
    private hostService: HostService,
    private authService: AuthService,
    private messageService: MessageService,
    private reportService: ReportService
  ) {
    this.authService.currentUser.pipe(take(1)).subscribe(u => {
      this.currentUser.set(u);
    });
  }

  ngOnInit() {
    this.loadUsers();
    this.loadProperties();
    this.listenForOnlineUpdates();
    this.loadAppeals();
    this.loadReports();

    // Refresh every 60s
    this.timerSubscription = timer(60000, 60000).subscribe(() => {
      if (this.activeTab === 'appeals') this.loadAppeals();
      if (this.activeTab === 'reports') this.loadReports();
    });

    // Debounced search
    this.userSearchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(() => {
      this.usersPage = 1;
      this.loadUsers();
    });

    this.propSearchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(() => {
      this.propsPage = 1;
      this.loadProperties();
    });
  }
  
  // Property for DestroyRef (inject in constructor)
  private destroyRef = inject(DestroyRef);

  listenForOnlineUpdates() {
    this.messageService.onlineStatus$.subscribe(update => {
      if (!update) return;
      this.users.update(currentUsers => {
        return currentUsers.map(u => {
          if (String(u._id) === String(update.userId)) {
            return { ...u, isOnline: (update.status === 'online') };
          }
          return u;
        });
      });
    });
  }
  updateStatus(user: any, newStatus: 'active' | 'banned', duration?: string) {
    const action = duration === 'none' ? 'ACTIVATE' : (newStatus === 'banned' ? 'BAN PERMANENTLY' : 'UPDATE STATUS');
    if (!confirm(`Are you sure you want to ${action} user "${user.name}"?`)) return;

    this.hostService.updateUserStatus(user._id, newStatus, duration).subscribe({
      next: (res) => {
        user.status = res.data.status;
        user.suspendedUntil = res.data.suspendedUntil;
        user.suspensionDurationLabel = res.data.suspensionDurationLabel;
        // If we opened a modal, close it
        this.closeSuspenseModal();
      },
      error: (err) => alert(err.error?.message || 'Failed to update status')
    });
  }

  // ─── Suspense Modal Logic ───
  openSuspenseModal(user: any) {
    this.selectedUserForSuspense = user;
    this.showSuspenseModal = true;
    this.suspenseDuration = '1d';
  }

  closeSuspenseModal() {
    this.showSuspenseModal = false;
    this.selectedUserForSuspense = null;
  }

  submitSuspense() {
    if (!this.selectedUserForSuspense) return;
    this.updateStatus(this.selectedUserForSuspense, 'active', this.suspenseDuration);
  }

  // ─── Appeals Logic ───
  loadAppeals() {
    if (this.appealsLoading()) return;
    this.appealsLoading.set(true);
    this.hostService.getAppeals().subscribe({
      next: (res) => {
        this.appeals.set(res.data);
        this.appealsLoading.set(false);
      },
      error: () => this.appealsLoading.set(false)
    });
  }

  loadAppealHistory() {
    this.appealHistoryLoading.set(true);
    this.hostService.getAppealHistory().subscribe({
      next: (res) => {
        this.appealHistory.set(res.data);
        this.appealHistoryLoading.set(false);
      },
      error: () => this.appealHistoryLoading.set(false)
    });
  }

  onQuickApprove(user: any) {
    // 1. Find if there's a pending appeal for this user
    const appeal = this.appeals().find(a => a.userId?._id === user._id);
    
    if (appeal) {
      // 2. Process via the existing handleAppeal method
      this.onHandleAppeal(appeal, 'approve');
    } else {
      // 3. Fallback: Directly unban if no formal appeal found
      if (confirm(`No formal appeal found for ${user.name}. Do you want to manually reactivate this account?`)) {
        this.hostService.updateUserStatus(user._id, 'active').subscribe({
          next: () => {
            alert('User reactivated successfully.');
            this.loadUsers();
          },
          error: (err) => alert(err.error?.message || 'Failed to reactivate user')
        });
      }
    }
  }

  onHandleAppeal(appeal: any, action: 'approve' | 'reject') {
    const isApprove = action === 'approve';
    const msg = isApprove ? 'reactivate this user' : 'reject this appeal';
    const promptMsg = isApprove ? 'Add an optional note (public to user):' : 'Reason for rejection (required):';
    
    // Prompt for note
    const adminNote = prompt(promptMsg, '');
    
    // Rejection requires a reason
    if (adminNote === null) return; // Cancelled
    if (!isApprove && !adminNote.trim()) {
      alert('A reason is required to reject an appeal.');
      return;
    }

    if (!confirm(`Are you sure you want to ${msg}?`)) return;

    this.hostService.handleAppeal(appeal._id, action, adminNote).subscribe({
      next: (res) => {
        alert(res.message);
        this.loadAppeals();
        this.loadAppealHistory(); 
        this.loadUsers();
      },
      error: (err) => alert(err.error?.message || 'Failed to handle appeal')
    });
  }

  // ─── Reports Logic ───
  loadReports() {
    if (this.reportsLoading()) return;
    this.reportsLoading.set(true);
    this.reportService.getAllReports().subscribe({
      next: (res) => {
        this.reports.set(res.data.filter((r: any) => r.status === 'pending'));
        this.reportHistory.set(res.data.filter((r: any) => r.status !== 'pending'));
        this.reportsLoading.set(false);
      },
      error: () => this.reportsLoading.set(false)
    });
  }

  loadReportHistory() {
    this.loadReports(); // Same endpoint, just filtered differently in UI or state
  }

  onHandleReport(report: any, action: 'resolve' | 'reject') {
    const isResolve = action === 'resolve';
    
    // For automated system, we don't need to ask for duration anymore
    const adminNote = prompt(isResolve ? 'Admin note (stored in history):' : 'Reason for rejection:', '');
    if (adminNote === null) return;

    const confirmMsg = isResolve 
      ? `Are you sure you want to RESOLVE this report? The user will be automatically suspended based on their violation history.`
      : `Are you sure you want to REJECT this report?`;

    if (!confirm(confirmMsg)) return;

    this.reportService.handleReport(report._id, action, adminNote).subscribe({
      next: (res) => {
        alert(res.message);
        this.loadReports();
        this.loadUsers();
      },
      error: (err) => alert(err.error?.message || 'Failed to handle report')
    });
  }

  isSuspended(date: string): boolean {
    return new Date(date) > new Date();
  }

  downloadTerms(userId: string) {
    this.hostService.downloadUserTermsPDF(userId).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `indiahomes-terms-${userId}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
      },
      error: (err) => alert('Failed to download Terms PDF.')
    });
  }

  deleteUserPermanently(user: any) {
    if (!confirm(`🚨 WARNING: Are you sure you want to PERMANENTLY DELETE user "${user.name}"? This will also remove all their properties and CANNOT be undone.`)) return;

    this.hostService.deleteUser(user._id).subscribe({
      next: () => {
        this.users.set(this.users().filter(u => u._id !== user._id));
        alert('User deleted permanently.');
      },
      error: (err) => alert(err.error?.message || 'Failed to delete user')
    });
  }

  getAvatar(user: any): string {
    const n = user?.name || user?.firstName || 'U';
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(n)}&background=6f42c1&color=fff&size=100`;
  }

  loadUsers() {
    this.usersLoading.set(true);
    this.hostService.getDashboardUsers(this.usersPage, 20, this.userSearch, this.userRoleFilter).subscribe({
      next: (res) => {
        this.users.set(res.data);
        this.usersPagination.set(res.pagination);
        
        // Use global stats from backend if available
        if (res.globalStats) {
          this.totalUsersCount.set(res.globalStats.totalUsers);
          this.agentCount.set(res.globalStats.agents);
          this.buyerCount.set(res.globalStats.buyers);
        }
        
        this.usersLoading.set(false);
      },
      error: () => this.usersLoading.set(false)
    });
  }

  loadProperties() {
    this.propertiesLoading.set(true);
    this.hostService.getDashboardProperties(this.propsPage, 20, {
      type: this.propTypeFilter,
      status: this.propStatusFilter,
      postedByRole: this.propRoleFilter,
      location: this.propLocationFilter
    }).subscribe({
      next: (res) => {
        this.properties.set(res.data);
        this.propertiesPagination.set(res.pagination);
        this.propertiesLoading.set(false);
      },
      error: () => this.propertiesLoading.set(false)
    });
  }

  onUserSearch() {
    this.userSearchSubject.next(this.userSearch);
  }

  onPropLocationSearch() {
    this.propSearchSubject.next(this.propLocationFilter);
  }

  // ─── Countdown Clock ───
  getRemainingTime(suspendedUntil: string): string {
    if (!suspendedUntil) return 'N/A';
    const diff = new Date(suspendedUntil).getTime() - new Date().getTime();
    if (diff <= 0) return 'Expired';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    let parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (mins > 0) parts.push(`${mins}m`);
    
    if (parts.length === 0) return 'Expiring Soon';

    return parts.join(' ');
  }

  getDurationLabel(user: any): string {
    if (!user) return 'N/A';
    if (user.suspensionDurationLabel) return user.suspensionDurationLabel;
    if (!user.suspendedUntil) return 'N/A';

    // Fallback: Calculate roughly if label is missing
    const diffHours = Math.round((new Date(user.suspendedUntil).getTime() - Date.now()) / 3600000);
    if (diffHours <= 24) return '24 Hour';
    if (diffHours <= 24 * 7) return '1 Week';
    if (diffHours <= 24 * 30) return '1 Month';
    return 'Long Term';
  }

  ngOnDestroy() {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
  }

  // ... (User Detail Modal)
  openUserDetail(userId: string) {
    if (!userId) return;
    this.showUserDetail = true;
    this.userDetailLoading = true;
    this.selectedUser = null;
    this.userPostedProperties = [];
    this.userFavoriteProperties = [];

    this.hostService.getUserDetail(userId).subscribe({
      next: (res) => {
        this.selectedUser = res.user;
        this.userPostedProperties = res.postedProperties || [];
        this.userFavoriteProperties = res.favoriteProperties || [];
        this.userDetailLoading = false;
      },
      error: () => {
        this.userDetailLoading = false;
        this.showUserDetail = false;
      }
    });
  }

  closeUserDetail() {
    this.showUserDetail = false;
    this.selectedUser = null;
  }
}
