import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService, User } from './api.service';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(
    private apiService: ApiService,
    private router: Router,
  ) { }

  login(email: string, password: string, role: 'admin' | 'user'): Observable<any> {
    return this.apiService.login(email, password, role);
  }
  register(data: any): Observable<any> {
    return this.apiService.register(data);
  }

  verifyOtp(email: string, otp: string): Observable<any> {
    return this.apiService.verifyOtp(email, otp);
  }

  resendOtp(email: string): Observable<any> {
    return this.apiService.resendOtp(email);
  }


  logout(): void {
    // Clear all auth data from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    this.apiService.logout();
    this.router.navigate(['/']);
  }

  getCurrentUser(): User | null {
    return this.apiService.getCurrentUser();
  }

  isAuthenticated(): boolean {
    return this.apiService.getCurrentUser() !== null;
  }

  isAdmin(): boolean {
    return this.apiService.getCurrentUser()?.role === 'admin';
  }

  isUser(): boolean {
    return this.apiService.getCurrentUser()?.role === 'user';
  }


  // Demo method for setting user (for demo purposes only - fallback when backend is not available)
  setDemoUser(user: any): void {
    localStorage.setItem('currentUser', JSON.stringify(user));
    localStorage.setItem('token', 'demo-token');
  }
}
