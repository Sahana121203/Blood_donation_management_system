import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
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
        <div class="auth-card glass-panel">
          <div class="auth-header">
            <h2>Welcome Back</h2>
            <p>Ready to save lives again? Login below.</p>
          </div>

          <form (ngSubmit)="onSubmit()" #loginForm="ngForm" class="auth-form">
            <div class="form-group">
              <label>Login As</label>
              <div class="role-selector">
                <label class="role-option" [class.active]="selectedRole === 'user'">
                  <input type="radio" name="role" value="user" [(ngModel)]="selectedRole" required>
                  <span>User</span>
                </label>
                <label class="role-option" [class.active]="selectedRole === 'admin'">
                  <input type="radio" name="role" value="admin" [(ngModel)]="selectedRole" required>
                  <span>Admin</span>
                </label>
              </div>
            </div>

            <div class="form-group">
              <label>Email Address</label>
              <div class="input-wrapper">
                <i>📧</i>
                <input
                  type="email"
                  [(ngModel)]="email"
                  name="email"
                  class="form-control"
                  placeholder="name@example.com"
                  required
                />
              </div>
            </div>

            <div class="form-group">
              <label>Password</label>
              <div class="input-wrapper">
                <i>🔒</i>
                <input
                  type="password"
                  [(ngModel)]="password"
                  name="password"
                  class="form-control"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <div *ngIf="errorMessage" class="alert-error">
              {{ errorMessage }}
            </div>

            <button type="submit" class="btn btn-primary btn-block" [disabled]="loading">
              {{ loading ? 'Authenticating...' : 'Sign In' }}
              <span *ngIf="!loading">→</span>
            </button>
          </form>

          <div class="auth-footer">
            <p>New here? <a routerLink="/register">Create an account</a></p>
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
      padding: 20px;
      position: relative;
      z-index: 1;
    }

    .auth-card {
      width: 100%;
      max-width: 480px;
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

    .input-wrapper {
      position: relative;
    }

    .input-wrapper i {
      position: absolute;
      left: 16px;
      top: 50%;
      transform: translateY(-50%);
      opacity: 0.5;
      font-style: normal;
    }

    .input-wrapper .form-control {
      padding-left: 45px;
    }

    .role-selector {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }

    .role-option {
      position: relative;
      padding: 12px;
      background: var(--white);
      border: 1px solid rgba(29, 53, 87, 0.1);
      border-radius: var(--radius-md);
      cursor: pointer;
      text-align: center;
      font-weight: 600;
      transition: all 0.3s;
    }

    .role-option input {
      position: absolute;
      opacity: 0;
    }

    .role-option.active {
      background: var(--text-main);
      color: var(--white);
      border-color: var(--text-main);
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

    @media (max-width: 576px) {
      .auth-card { padding: 30px 20px; border-radius: 20px; }
      .auth-header h2 { font-size: 28px; }
    }
  `]
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  selectedRole: string = '';
  errorMessage: string = '';
  loading: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  onSubmit(): void {
    if (!this.selectedRole) {
      this.errorMessage = 'Please select a role';
      return;
    }

    this.errorMessage = '';
    this.loading = true;

    // Try to login with backend API
    this.authService.login(this.email, this.password, this.selectedRole as 'admin' | 'user').subscribe({
      next: (response) => {
        this.loading = false;
        if (this.selectedRole === 'admin') {
          this.router.navigate(['/admin']);
        } else {
          this.router.navigate(['/user']);
        }
      },
      error: (error) => {
        this.loading = false;
        console.error('Login error:', error);

        // If backend is not available, fallback to demo mode
        if (error.status === 0 || error.status === 404) {
          console.log('Backend not available, using demo mode');
          const user = {
            email: this.email,
            role: this.selectedRole as 'admin' | 'user',
            name: this.email.split('@')[0]
          };

          // Store in localStorage for persistence
          localStorage.setItem('currentUser', JSON.stringify(user));
          localStorage.setItem('token', 'demo-token');

          if (this.selectedRole === 'admin') {
            this.router.navigate(['/admin']);
          } else {
            this.router.navigate(['/user']);
          }
        } else if (error.status === 401 && error.error?.email) {
          // Redirect to verification
          this.router.navigate(['/verify-otp'], { queryParams: { email: error.error.email } });
        } else {
          this.errorMessage = error.error?.message || 'Login failed. Please check your credentials.';
        }
      }
    });
  }
}

