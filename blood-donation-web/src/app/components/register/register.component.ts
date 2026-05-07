import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="auth-container">
      <div class="auth-bg">
        <div class="blob blob-1"></div>
        <div class="blob blob-2"></div>
      </div>
      
      <nav class="auth-nav">
        <a routerLink="/" class="logo">🩸 Blood<span>Link</span></a>
      </nav>

      <div class="auth-wrapper">
        <div class="auth-card glass-panel register-card">
          <div class="auth-header">
            <h2>Join the Network</h2>
            <p>Become a local hero. It only takes a few minutes.</p>
          </div>

          <form (ngSubmit)="onSubmit()" #registerForm="ngForm" class="auth-form">
            <div class="form-grid">
              <div class="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  [(ngModel)]="name"
                  name="name"
                  class="form-control"
                  placeholder="John Doe"
                  required
                />
              </div>

              <div class="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  [(ngModel)]="email"
                  name="email"
                  class="form-control"
                  placeholder="john@example.com"
                  required
                />
              </div>

              <div class="form-group">
                <label>Password</label>
                <input
                  type="password"
                  [(ngModel)]="password"
                  name="password"
                  class="form-control"
                  placeholder="Min 6 characters"
                  required
                  minlength="6"
                />
              </div>

              <div class="form-group">
                <label>Role</label>
                <select [(ngModel)]="role" name="role" class="form-control" required>
                  <option value="">Select Role</option>
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div class="form-group">
                <label>Blood Type</label>
                <select [(ngModel)]="bloodType" name="bloodType" class="form-control" required>
                  <option value="">Select Blood Type</option>
                  <option *ngFor="let b of bloodTypes" [value]="b">{{ b }}</option>
                </select>
              </div>

              <div class="form-group">
                <label>Phone Number</label>
                <input
                  type="text"
                  [(ngModel)]="phone"
                  name="phone"
                  class="form-control"
                  placeholder="+1 (555) 000-0000"
                  required
                />
              </div>
            </div>

            <div class="form-group">
              <label>Residential Address</label>
              <textarea
                [(ngModel)]="address"
                name="address"
                class="form-control"
                rows="2"
                placeholder="Enter your full address"
                required
              ></textarea>
            </div>

            <div *ngIf="errorMessage" class="alert-error">
              {{ errorMessage }}
            </div>

            <button type="submit" class="btn btn-primary btn-block" [disabled]="loading">
              {{ loading ? 'Creating Account...' : 'Continue to Verification' }}
              <span *ngIf="!loading">→</span>
            </button>
          </form>

          <div class="auth-footer">
            <p>Already a member? <a routerLink="/login">Sign in here</a></p>
            <a routerLink="/" class="back-link">Return to Home</a>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-container {
      min-height: 100vh;
      position: relative;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      background: #F8F9FA;
    }

    .auth-bg {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 0;
    }

    .blob {
      position: absolute;
      border-radius: 50%;
      filter: blur(80px);
      opacity: 0.15;
    }

    .blob-1 {
      width: 500px;
      height: 500px;
      background: var(--accent-color);
      top: -100px;
      right: -100px;
      animation: float 20s infinite alternate;
    }

    .blob-2 {
      width: 400px;
      height: 400px;
      background: var(--text-main);
      bottom: -100px;
      left: -100px;
      animation: float 15s infinite alternate-reverse;
    }

    @keyframes float {
      from { transform: translate(0, 0); }
      to { transform: translate(50px, 50px); }
    }

    .auth-nav {
      padding: 30px;
      text-align: center;
      position: relative;
      z-index: 1;
    }

    .logo {
      font-size: 28px;
      font-weight: 800;
      color: var(--text-main);
      text-decoration: none;
    }

    .logo span { color: var(--accent-color); }

    .auth-wrapper {
      flex: 1;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 40px 20px;
      position: relative;
      z-index: 1;
    }

    .register-card {
      max-width: 650px;
    }

    .auth-card {
      width: 100%;
      padding: 50px;
      border-radius: 32px;
    }

    .auth-header {
      text-align: center;
      margin-bottom: 40px;
    }

    .auth-header h2 {
      font-size: 36px;
      font-weight: 800;
      color: var(--text-main);
      margin-bottom: 10px;
      letter-spacing: -1px;
    }

    .auth-header p {
      color: var(--text-muted);
      font-size: 16px;
    }

    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }

    .btn-block {
      width: 100%;
      margin-top: 20px;
      padding: 16px;
      font-size: 18px;
    }

    .auth-footer {
      margin-top: 40px;
      text-align: center;
    }

    .auth-footer p {
      color: var(--text-muted);
      margin-bottom: 20px;
    }

    .auth-footer a {
      color: var(--accent-color);
      font-weight: 700;
      text-decoration: none;
    }

    .back-link {
      display: block;
      font-size: 14px;
      opacity: 0.7;
      transition: opacity 0.3s;
    }

    .back-link:hover { opacity: 1; }

    @media (max-width: 768px) {
      .form-grid { grid-template-columns: 1fr; }
      .auth-card { padding: 30px 20px; border-radius: 20px; }
      .auth-header h2 { font-size: 28px; }
    }
  `]
  // scoped styles to reduce form width
})
export class RegisterComponent {
  name = '';
  email = '';
  password = '';
  role = '';
  bloodType = '';
  phone = '';
  address = '';

  loading = false;
  errorMessage = '';

  bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  onSubmit(): void {
    this.errorMessage = '';
    this.loading = true;

    const payload = {
      name: this.name,
      email: this.email,
      password: this.password,
      role: this.role,
      bloodType: this.bloodType,
      phone: this.phone,
      address: this.address
    };

    this.authService.register(payload).subscribe({
      next: (res) => {
        this.loading = false;
        // Redirect to OTP verification page
        this.router.navigate(['/verify-otp'], { queryParams: { email: this.email } });
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage =
          error.error?.message || 'Registration failed. Please try again.';
      }
    });
  }
}
