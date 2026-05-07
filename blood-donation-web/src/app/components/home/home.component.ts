import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="home-container">
      <nav class="navbar">
        <div class="container">
          <div class="nav-content">
            <h1 class="logo">🩸 Blood<span>Link</span></h1>
            <div class="nav-links">
              <a routerLink="/login" class="btn-text">About</a>
              <a routerLink="/login" class="btn btn-primary">Login / Support</a>
            </div>
          </div>
        </div>
      </nav>

      <div class="hero-section">
        <div class="container hero-grid">
          <div class="hero-content">
            <span class="hero-tag">Support your community</span>
            <h1 class="hero-title">Save Lives with Every <span>Drop</span></h1>
            <p class="hero-subtitle">Your selfless donation can save up to three lives. Join our global network of heroes and make a difference today.</p>
            <div class="hero-buttons">
              <a routerLink="/login" class="btn btn-primary btn-large">Become a Donor</a>
              <a routerLink="/login" class="btn btn-secondary btn-large">Find Donors</a>
            </div>
            <div class="hero-stats">
              <div class="stat-item">
                <span class="stat-value">10k+</span>
                <span class="stat-label">Active Donors</span>
              </div>
              <div class="stat-item">
                <span class="stat-value">25k+</span>
                <span class="stat-label">Lives Saved</span>
              </div>
            </div>
          </div>
          <div class="hero-visual">
            <div class="blob-shape"></div>
            <div class="hero-card glass-panel">
               <div class="card-line"></div>
               <div class="donor-badge">New Request!</div>
               <p>Emergency B+ Blood required at Global Hospital</p>
               <div class="progress-bar"><div class="progress-fill"></div></div>
            </div>
          </div>
        </div>
      </div>

      <div class="features-section">
        <div class="container">
          <div class="section-header">
            <h2 class="section-title">The Power of <span>Donation</span></h2>
            <p>Every second counts. Learn how your contribution creates a ripple effect of hope.</p>
          </div>
          <div class="features-grid">
            <div class="feature-card">
              <div class="feature-icon">❤️</div>
              <h3>Save Lives</h3>
              <p>Directly support patients undergoing surgeries, cancer treatments, and chronic illnesses.</p>
            </div>
            <div class="feature-card">
              <div class="feature-icon">🏥</div>
              <h3>Health Check</h3>
              <p>Receive a free mini-physical and track your pulse, blood pressure, and hemoglobin levels.</p>
            </div>
            <div class="feature-card">
              <div class="feature-icon">👥</div>
              <h3>United Community</h3>
              <p>Be part of a compassionate network dedicated to ensuring nobody suffers from blood shortages.</p>
            </div>
          </div>
        </div>
      </div>

      <footer class="footer">
        <div class="container footer-content">
          <p>&copy; 2024 BloodLink Management System. Handcrafted for a better world.</p>
          <div class="footer-links">
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
            <a href="#">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  `,
  styles: [`
    .home-container {
      min-height: 100vh;
      background: #F8F9FA;
    }

    .navbar {
      background: rgba(255, 255, 255, 0.8);
      backdrop-filter: blur(15px);
      -webkit-backdrop-filter: blur(15px);
      padding: 15px 0;
      position: sticky;
      top: 0;
      z-index: 1000;
      border-bottom: 1px solid rgba(29, 53, 87, 0.05);
    }

    .nav-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .logo {
      font-size: 26px;
      font-weight: 800;
      color: var(--text-main);
      margin: 0;
      letter-spacing: -0.5px;
    }

    .logo span {
      color: var(--accent-color);
    }

    .nav-links {
      display: flex;
      align-items: center;
      gap: 30px;
    }

    .btn-text {
      text-decoration: none;
      color: var(--text-main);
      font-weight: 600;
      font-size: 15px;
      transition: color 0.3s;
    }

    .btn-text:hover {
      color: var(--accent-color);
    }

    /* Hero Section */
    .hero-section {
      padding: 100px 0;
      position: relative;
      overflow: hidden;
      background: radial-gradient(circle at top right, rgba(230, 57, 70, 0.05), transparent),
                  radial-gradient(circle at bottom left, rgba(29, 53, 87, 0.05), transparent);
    }

    .hero-grid {
      display: grid;
      grid-template-columns: 1.2fr 0.8fr;
      gap: 60px;
      align-items: center;
    }

    .hero-tag {
      display: inline-block;
      padding: 6px 16px;
      background: rgba(230, 57, 70, 0.1);
      color: var(--accent-color);
      border-radius: 50px;
      font-weight: 700;
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 24px;
    }

    .hero-title {
      font-size: 64px;
      line-height: 1.1;
      font-weight: 800;
      color: var(--text-main);
      margin-bottom: 24px;
      letter-spacing: -2px;
    }

    .hero-title span {
      color: var(--accent-color);
      position: relative;
    }

    .hero-title span::after {
      content: '';
      position: absolute;
      bottom: 8px;
      left: 0;
      width: 100%;
      height: 8px;
      background: rgba(230, 57, 70, 0.1);
      z-index: -1;
    }

    .hero-subtitle {
      font-size: 20px;
      color: var(--text-muted);
      margin-bottom: 40px;
      max-width: 600px;
      line-height: 1.6;
    }

    .hero-buttons {
      display: flex;
      gap: 20px;
      margin-bottom: 60px;
    }

    .btn-large {
      padding: 18px 40px;
      font-size: 17px;
    }

    .hero-stats {
      display: flex;
      gap: 40px;
    }

    .stat-item {
      display: flex;
      flex-direction: column;
    }

    .stat-value {
      font-size: 32px;
      font-weight: 800;
      color: var(--text-main);
    }

    .stat-label {
      font-size: 14px;
      color: var(--text-muted);
      font-weight: 500;
    }

    /* Hero Visual */
    .hero-visual {
      position: relative;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .blob-shape {
      position: absolute;
      width: 400px;
      height: 400px;
      background: var(--primary-gradient);
      border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%;
      filter: blur(80px);
      opacity: 0.2;
      animation: blobAnimate 10s infinite alternate;
    }

    @keyframes blobAnimate {
      from { border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%; transform: scale(1); }
      to { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; transform: scale(1.1); }
    }

    .hero-card {
      width: 320px;
      padding: 30px;
      border-radius: 24px;
      position: relative;
      z-index: 1;
      transform: rotate(2deg);
      transition: transform 0.5s;
    }

    .hero-card:hover { transform: rotate(0deg) scale(1.05); }

    .card-line {
      width: 40px;
      height: 4px;
      background: var(--accent-color);
      border-radius: 2px;
      margin-bottom: 20px;
    }

    .donor-badge {
      display: inline-block;
      background: var(--accent-color);
      color: white;
      padding: 4px 12px;
      border-radius: 50px;
      font-size: 11px;
      font-weight: 700;
      margin-bottom: 12px;
    }

    .hero-card p {
      font-weight: 600;
      font-size: 16px;
      color: var(--text-main);
      margin-bottom: 20px;
    }

    .progress-bar {
      height: 6px;
      background: rgba(29, 53, 87, 0.1);
      border-radius: 3px;
      overflow: hidden;
    }

    .progress-fill {
      width: 75%;
      height: 100%;
      background: var(--primary-gradient);
    }

    /* Features Section */
    .features-section {
      padding: 120px 0;
      background: white;
    }

    .section-header {
      text-align: center;
      max-width: 700px;
      margin: 0 auto 80px;
    }

    .section-title {
      font-size: 48px;
      font-weight: 800;
      margin-bottom: 16px;
      letter-spacing: -1.5px;
    }

    .section-title span { color: var(--accent-color); }

    .section-header p {
      font-size: 18px;
      color: var(--text-muted);
    }

    .features-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 30px;
    }

    .feature-card {
      padding: 50px 30px;
      border-radius: 24px;
      background: #F8F9FA;
      transition: all 0.4s;
      border: 1px solid transparent;
    }

    .feature-card:hover {
      background: white;
      box-shadow: var(--shadow-premium);
      transform: translateY(-10px);
      border-color: rgba(230, 57, 70, 0.1);
    }

    .feature-icon {
      font-size: 50px;
      margin-bottom: 30px;
    }

    .feature-card h3 {
      font-size: 24px;
      font-weight: 700;
      margin-bottom: 16px;
    }

    .feature-card p {
      color: var(--text-muted);
      line-height: 1.7;
    }

    .footer {
      background: var(--text-main);
      color: white;
      padding: 60px 0;
    }

    .footer-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .footer-links {
      display: flex;
      gap: 30px;
    }

    .footer-links a {
      color: rgba(255,255,255,0.7);
      text-decoration: none;
      font-size: 14px;
    }

    @media (max-width: 992px) {
      .hero-grid { grid-template-columns: 1fr; text-align: center; }
      .hero-content { display: flex; flex-direction: column; align-items: center; }
      .hero-subtitle { margin-inline: auto; }
      .hero-buttons { justify-content: center; }
      .hero-stats { justify-content: center; }
      .features-grid { grid-template-columns: 1fr 1fr; }
    }

    @media (max-width: 768px) {
      .hero-title { font-size: 40px; letter-spacing: -1px; }
      .section-title { font-size: 32px; }
      .features-grid { grid-template-columns: 1fr; }
      .footer-content { flex-direction: column; gap: 30px; text-align: center; }
    }
  `]
})
export class HomeComponent { }





