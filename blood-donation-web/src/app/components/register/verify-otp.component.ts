import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-verify-otp',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="auth-container">
      <div class="auth-wrapper">
        <div class="auth-card glass-panel verify-card">
          <div class="auth-header">
            <h2>Verify Your Account</h2>
            <p>Enter the 6-digit code sent to <strong>{{ email }}</strong>.</p>
          </div>

          <form (ngSubmit)="onSubmit()" class="auth-form">
            <div class="form-group">
              <label>OTP Code</label>
              <input
                type="text"
                [(ngModel)]="otp"
                name="otp"
                class="form-control"
                placeholder="123456"
                minlength="4"
                maxlength="8"
                required
              />
            </div>

            <div *ngIf="errorMessage" class="alert-error">{{ errorMessage }}</div>
            <div *ngIf="successMessage" class="alert-success">{{ successMessage }}</div>

            <button type="submit" class="btn btn-primary btn-block" [disabled]="loading">
              {{ loading ? 'Verifying...' : 'Verify OTP' }}
            </button>
          </form>

          <div class="verify-actions">
            <button type="button" class="btn btn-secondary" (click)="resendOtp()" [disabled]="loading || !email">
              Resend OTP
            </button>
          </div>

          <div class="auth-footer">
            <p>Already verified? <a routerLink="/login">Sign in</a></p>
            <a routerLink="/" class="back-link">Return to Home</a>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .auth-container {
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #f8f9fa;
        padding: 40px 20px;
      }

      .auth-wrapper {
        width: 100%;
        max-width: 520px;
      }

      .auth-card {
        width: 100%;
        padding: 40px;
        border-radius: 32px;
      }

      .verify-card {
        box-shadow: 0 24px 80px rgba(0, 0, 0, 0.08);
      }

      .auth-header {
        text-align: center;
        margin-bottom: 32px;
      }

      .auth-header h2 {
        margin-bottom: 8px;
        font-size: 32px;
      }

      .auth-header p {
        margin: 0;
        color: #6c757d;
      }

      .form-group {
        margin-bottom: 20px;
      }

      .form-control {
        width: 100%;
        padding: 14px 16px;
        border-radius: 12px;
        border: 1px solid #d7dce0;
      }

      .btn-block {
        width: 100%;
        margin-top: 12px;
        padding: 14px;
      }

      .verify-actions {
        margin-top: 18px;
        display: flex;
        justify-content: center;
      }

      .auth-footer {
        margin-top: 30px;
        text-align: center;
      }

      .auth-footer a,
      .back-link {
        color: #007bff;
        text-decoration: none;
      }

      .alert-error {
        color: #b00020;
        margin-bottom: 16px;
      }

      .alert-success {
        color: #0f5132;
        margin-bottom: 16px;
      }
    `
  ]
})
export class VerifyOtpComponent {
  email = '';
  otp = '';
  loading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private router: Router
  ) {
    this.route.queryParams.subscribe(params => {
      if (params['email']) {
        this.email = params['email'];
      }
    });
  }

  onSubmit(): void {
    if (!this.email) {
      this.errorMessage = 'No email found for verification.';
      return;
    }

    this.errorMessage = '';
    this.loading = true;

    this.authService.verifyOtp(this.email, this.otp).subscribe({
      next: (response) => {
        this.loading = false;
        if (response.user?.role === 'admin') {
          this.router.navigate(['/admin']);
        } else {
          this.router.navigate(['/user']);
        }
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = error.error?.message || 'OTP verification failed. Please try again.';
      }
    });
  }

  resendOtp(): void {
    if (!this.email) {
      this.errorMessage = 'No email available to resend OTP.';
      return;
    }

    this.errorMessage = '';
    this.successMessage = '';
    this.loading = true;

    this.authService.resendOtp(this.email).subscribe({
      next: () => {
        this.loading = false;
        this.successMessage = 'OTP has been resent to your email.';
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = error.error?.message || 'Could not resend OTP. Please try again.';
      }
    });
  }
}
