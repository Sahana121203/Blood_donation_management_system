import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import * as L from 'leaflet';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ApiService } from '../../services/api.service';
import { MapService, Location } from '../../services/map.service';

interface DonationAppointment {
  id: string; // Changed from number to string for MongoDB _id
  date: string;
  time: string;
  location: {
    hospital: string;
    city: string;
    lat: number;
    lng: number;
  };
  status: string;
}

interface DonationHistory {
  id: number;
  date: string;
  location: string;
  units: number;
}

interface NearbyDonor {
  id: number;
  name: string;
  email: string;
  bloodType: string;
  phone: string;
  address: string;
  latitude: number;
  longitude: number;
  status: string;
  distance?: number;
}

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="dashboard-container">
      <nav class="navbar">
        <div class="container">
          <div class="nav-content">
            <h1 class="logo">🩸 Blood<span>Link</span></h1>
            <div class="nav-links">
              <div class="user-badge">
                <span class="user-name">Welcome, {{ currentUser?.name || 'Donor' }}</span>
                <span class="user-role">Verified Donor</span>
              </div>
              <button class="btn btn-outline btn-sm" (click)="logout()">Logout</button>
            </div>
          </div>
        </div>
      </nav>

      <div class="container dashboard-body">
        <div class="dashboard-header">
          <div class="header-text">
            <h2>Your Donation Journey</h2>
            <p>Track your impact and schedule your next life-saving contribution.</p>
          </div>
          <div class="stats-grid">
            <div class="stat-card premium-card">
              <div class="stat-icon">🩸</div>
              <div class="stat-info">
                <span class="stat-value">{{ donationHistory.length }}</span>
                <span class="stat-label">Total Donations</span>
              </div>
            </div>
            <div class="stat-card premium-card">
              <div class="stat-icon">📅</div>
              <div class="stat-info">
                <span class="stat-value">{{ appointments.length }}</span>
                <span class="stat-label">Scheduled</span>
              </div>
            </div>
            <div class="stat-card premium-card">
              <div class="stat-icon">🧪</div>
              <div class="stat-info">
                <span class="stat-value">{{ getTotalUnitsDonated() }}</span>
                <span class="stat-label">Units (ml)</span>
              </div>
            </div>
          </div>
        </div>

        <nav class="dashboard-tabs">
          <button class="tab-item" [class.active]="activeTab === 'appointments'" (click)="activeTab = 'appointments'">
            <i>🗓️</i> <span>Schedule</span>
          </button>
          <button class="tab-item" [class.active]="activeTab === 'history'" (click)="activeTab = 'history'">
            <i>📝</i> <span>History</span>
          </button>
          <button class="tab-item" [class.active]="activeTab === 'profile'" (click)="activeTab = 'profile'">
            <i>👤</i> <span>Profile</span>
          </button>
          <button class="tab-item" [class.active]="activeTab === 'search'" (click)="activeTab = 'search'; initMap()">
            <i>📍</i> <span>Find Centers</span>
          </button>
          <button class="tab-item" [class.active]="activeTab === 'notifications'" (click)="activeTab = 'notifications'">
            <i>🔔</i> <span>Alerts</span>
          </button>
        </nav>

        <main class="dashboard-main">
          <!-- Schedule Appointment Tab -->
          <div *ngIf="activeTab === 'appointments'" class="tab-content animate-in">
            <div class="card glass-panel">
              <div class="card-header">
                <h3>Schedule Appointment</h3>
                <p>Choose a convenient time at your nearest center.</p>
              </div>
              
              <form (ngSubmit)="scheduleAppointment()" class="premium-form">
                <div class="form-grid">
                  <div class="form-group">
                    <label>Preferred Date</label>
                    <input type="date" [(ngModel)]="newAppointment.date" name="date" class="form-control" required />
                  </div>
                  <div class="form-group">
                    <label>Preferred Time</label>
                    <select [(ngModel)]="newAppointment.time" name="time" class="form-control" required>
                      <option value="">Select Time Slot</option>
                      <option value="09:00">09:00 AM</option>
                      <option value="10:00">10:00 AM</option>
                      <option value="11:00">11:00 AM</option>
                      <option value="14:00">02:00 PM</option>
                      <option value="15:00">03:00 PM</option>
                      <option value="16:00">04:00 PM</option>
                    </select>
                  </div>
                </div>
                
                <div class="form-group">
                  <label>Select Blood Center</label>
                  <select [(ngModel)]="newAppointment.location" name="location" class="form-control" required>
                    <option value="" disabled selected>Search for a hospital...</option>
                    <optgroup label="Karnataka Centers">
                      <option *ngFor="let loc of karnatakaLocations" [ngValue]="loc">{{ loc.hospital }} - {{ loc.city }}</option>
                    </optgroup>
                    <optgroup label="Pan India Centers">
                      <option *ngFor="let loc of indiaLocations" [ngValue]="loc">{{ loc.hospital }} - {{ loc.city }}</option>
                    </optgroup>
                  </select>
                </div>

                <button type="submit" class="btn btn-primary">Reserve Appointment Slot</button>
              </form>

              <div class="appointments-section">
                <h4>Upcoming Reservations</h4>
                <div *ngIf="appointments.length === 0" class="empty-state">
                  <p>You have no upcoming appointments.</p>
                </div>
                <div class="appointment-grid">
                  <div *ngFor="let appointment of appointments" class="appointment-card glass-panel">
                    <div class="card-line"></div>
                    <div class="apt-header">
                       <h5>{{ appointment.location.hospital }}</h5>
                       <span class="status-chip" [class.pending]="appointment.status === 'Pending'">{{ appointment.status }}</span>
                    </div>
                    <div class="apt-details">
                      <p>📅 {{ appointment.date }}</p>
                      <p>🕒 {{ appointment.time }}</p>
                      <p>📍 {{ appointment.location.city }}</p>
                    </div>
                    <button class="btn-text-danger" (click)="cancelAppointment(appointment.id)">Cancel Appointment</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Donation History Tab -->
          <div *ngIf="activeTab === 'history'" class="tab-content animate-in">
            <div class="card glass-panel">
               <div class="card-header">
                <h3>Donation Records</h3>
                <p>View your past contributions to the community.</p>
              </div>
              <div *ngIf="donationHistory.length === 0" class="empty-state">
                <p>No donation history found.</p>
              </div>
              <div class="table-container" *ngIf="donationHistory.length > 0">
                <table class="table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Location</th>
                      <th>Volume</th>
                      <th>Type</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let donation of donationHistory">
                      <td>{{ donation.date }}</td>
                      <td>{{ donation.location }}</td>
                      <td>{{ donation.units }} Unit(s)</td>
                      <td><span class="badge">Whole Blood</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- Profile Tab -->
          <div *ngIf="activeTab === 'profile'" class="tab-content animate-in">
             <div class="card glass-panel">
               <div class="card-header">
                <h3>Personal Information</h3>
                <p>Update your details to stay connected with the network.</p>
              </div>
               <form (ngSubmit)="updateProfile()" class="premium-form max-600">
                <div class="form-grid">
                  <div class="form-group">
                    <label>Full Name</label>
                    <input type="text" [(ngModel)]="userProfile.name" name="name" class="form-control" />
                  </div>
                  <div class="form-group">
                    <label>Email Address</label>
                    <input type="email" [(ngModel)]="userProfile.email" name="email" class="form-control" />
                  </div>
                  <div class="form-group">
                    <label>Blood Type</label>
                    <select [(ngModel)]="userProfile.bloodType" name="bloodType" class="form-control">
                      <option *ngFor="let type of ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']" [value]="type">{{ type }}</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label>Phone Number</label>
                    <input type="tel" [(ngModel)]="userProfile.phone" name="phone" class="form-control" />
                  </div>
                </div>
                <div class="form-group">
                  <label>Residential Address</label>
                  <div class="location-group">
                    <textarea [(ngModel)]="userProfile.address" name="address" class="form-control" rows="3"></textarea>
                    <button type="button" class="btn btn-outline btn-sm" (click)="getCurrentLocationForProfile()">
                       Update to Current Location
                    </button>
                  </div>
                </div>
                <button type="submit" class="btn btn-primary">Save Profile Changes</button>
              </form>
            </div>
          </div>

          <!-- Find Donors by Location Tab -->
          <div *ngIf="activeTab === 'search'" class="tab-content animate-in">
             <div class="card glass-panel search-panel">
               <div class="card-header">
                 <h3>Search Centers</h3>
                 <p>Find specialized blood centers and donation points near you.</p>
               </div>
               
               <div class="search-grid">
                  <div class="form-group">
                    <label>Location Search</label>
                    <div class="search-input-wrapper">
                       <input 
                        type="text" 
                        [(ngModel)]="searchLocation" 
                        name="searchLocation"
                        class="form-control" 
                        placeholder="City or Pincode..."
                        (input)="onSearchInput($event)"
                        (keyup.enter)="searchCenters()"
                        autocomplete="off"
                      />
                       <button type="button" class="icon-btn" (click)="useMyLocation()">📍</button>
                      <div *ngIf="suggestions.length > 0" class="suggestions-dropdown">
                        <div *ngFor="let suggestion of suggestions" class="suggestion-item" (click)="selectSuggestion(suggestion)">
                          {{ suggestion.display_name }}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="form-group">
                    <label>Blood Type Filter</label>
                    <select [(ngModel)]="filterBloodType" name="filterBloodType" class="form-control" (change)="searchCenters()">
                      <option value="">Availability All Types</option>
                      <option *ngFor="let type of ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']" [value]="type">{{ type }}</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label>Radius</label>
                    <select [(ngModel)]="searchRadius" name="searchRadius" class="form-control" (change)="searchCenters()">
                      <option value="10">Within 10 km</option>
                      <option value="25">Within 25 km</option>
                      <option value="50">Within 50 km</option>
                      <option value="100">Across 100 km</option>
                    </select>
                  </div>
               </div>

               <div class="map-wrapper">
                 <div #mapContainer class="map-view" id="donorMap"></div>
               </div>

               <div *ngIf="nearbyCenters.length > 0" class="results-container">
                  <h4>Top Results Near You</h4>
                  <div class="results-grid">
                    <div *ngFor="let center of nearbyCenters" class="result-card glass-panel">
                       <h5>{{ center.hospital }}</h5>
                       <div class="result-meta">
                          <span>📍 {{ center.city }}</span>
                          <span class="dist-badge">{{ center.distance?.toFixed(1) }} km</span>
                       </div>
                    </div>
                  </div>
               </div>
            </div>
          </div>

          <!-- Notifications Tab -->
          <div *ngIf="activeTab === 'notifications'" class="tab-content animate-in">
             <div class="card glass-panel">
                <div class="card-header">
                  <h3>Alerts & Updates</h3>
                  <p>Stay informed about emergency requests and campaign events.</p>
                </div>
                <div *ngIf="notifications.length === 0" class="empty-state">
                  <p>No new notifications at the moment.</p>
                </div>
                <div class="note-stack" *ngIf="notifications.length > 0">
                   <div class="note-item" *ngFor="let note of notifications" [class.unread]="!note.isRead">
                      <div class="note-icon-box">
                         <span *ngIf="note.type === 'campaign'">📣</span>
                         <span *ngIf="note.type === 'request'">🩸</span>
                         <span *ngIf="note.type === 'system'">⚙️</span>
                      </div>
                      <div class="note-body">
                         <h4>{{ note.title }}</h4>
                         <p>{{ note.message }}</p>
                         <span class="note-time">{{ note.createdAt | date:'medium' }}</span>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </main>
      </div>

       <!-- Detailed Center Modal -->
       <div class="modal-backdrop" *ngIf="selectedHospital" (click)="closeModal()">
          <div class="modal-card glass-panel" (click)="$event.stopPropagation()">
             <div class="modal-top">
                <h3>{{ selectedHospital.hospital }}</h3>
                <button class="close-trigger" (click)="closeModal()">×</button>
             </div>
             <div class="modal-main">
                <div class="inventory-section">
                   <h4>Current Inventory</h4>
                   <div class="inventory-grid">
                      <div *ngFor="let item of hospitalInventory" class="inv-item">
                         <span class="inv-type">{{ item.bloodType }}</span>
                         <span class="inv-amount" [class.low]="item.units < 5">{{ item.units }} Units</span>
                      </div>
                   </div>
                </div>

                <div class="request-form-container">
                    <h4>Submit Emergency Request</h4>
                    <form (ngSubmit)="requestBlood()" class="premium-form">
                       <div class="form-group">
                          <label>Patient Full Name</label>
                          <input type="text" [(ngModel)]="bloodRequest.patientName" name="patientName" class="form-control" required placeholder="Full legal name">
                       </div>
                       <div class="form-grid">
                          <div class="form-group">
                             <label>Required Blood Type</label>
                             <select [(ngModel)]="bloodRequest.bloodType" name="bloodType" class="form-control" required>
                                <option *ngFor="let type of ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']" [value]="type">{{ type }}</option>
                             </select>
                          </div>
                          <div class="form-group">
                             <label>Quantity (Units)</label>
                             <input type="number" [(ngModel)]="bloodRequest.units" name="units" class="form-control" min="1" required>
                          </div>
                       </div>
                       <div class="form-group">
                          <label>Priority Level</label>
                          <div class="priority-selector">
                             <label *ngFor="let p of ['Low', 'Medium', 'High']" class="priority-option" [class.active]="bloodRequest.urgency === p">
                               <input type="radio" [(ngModel)]="bloodRequest.urgency" name="urgency" [value]="p"> {{ p }}
                             </label>
                          </div>
                       </div>
                       <button type="submit" class="btn btn-danger btn-block">Confirm Request</button>
                    </form>
                </div>
             </div>
          </div>
       </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      min-height: 100vh;
      background: #F8F9FA;
      color: var(--text-main);
    }

    .navbar {
      background: rgba(255, 255, 255, 0.85);
      backdrop-filter: blur(15px);
      -webkit-backdrop-filter: blur(15px);
      padding: 15px 0;
      border-bottom: 1px solid rgba(29, 53, 87, 0.05);
      position: sticky;
      top: 0;
      z-index: 1000;
    }

    .nav-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .logo {
      font-size: 24px;
      font-weight: 800;
      margin: 0;
    }

    .logo span { color: var(--accent-color); }

    .nav-links {
      display: flex;
      align-items: center;
      gap: 24px;
    }

    .user-badge {
      display: flex;
      flex-direction: column;
      text-align: right;
    }

    .user-name {
      font-weight: 700;
      font-size: 14px;
      color: var(--text-main);
    }

    .user-role {
      font-size: 11px;
      color: var(--accent-color);
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .dashboard-body {
      padding: 40px 24px;
    }

    .dashboard-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-bottom: 40px;
      gap: 30px;
    }

    .header-text h2 {
      font-size: 32px;
      font-weight: 800;
      margin-bottom: 8px;
      letter-spacing: -1px;
    }

    .header-text p {
      color: var(--text-muted);
      font-size: 16px;
    }

    .stats-grid {
      display: flex;
      gap: 20px;
    }

    .premium-card {
      background: white;
      border-radius: 20px;
      padding: 20px 30px;
      box-shadow: var(--shadow-premium);
      display: flex;
      align-items: center;
      gap: 20px;
      transition: transform 0.3s;
    }

    .premium-card:hover { transform: translateY(-5px); }

    .stat-icon {
      font-size: 32px;
      width: 50px;
      height: 50px;
      background: #F1FAEE;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .stat-info { display: flex; flex-direction: column; }

    .stat-value {
      font-size: 24px;
      font-weight: 800;
      color: var(--text-main);
    }

    .stat-label {
      font-size: 12px;
      color: var(--text-muted);
      font-weight: 600;
    }

    /* Tabs */
    .dashboard-tabs {
      display: flex;
      gap: 8px;
      margin-bottom: 30px;
      padding: 8px;
      background: rgba(29, 53, 87, 0.03);
      border-radius: 16px;
      width: fit-content;
    }

    .tab-item {
      padding: 12px 24px;
      border: none;
      background: transparent;
      border-radius: 12px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 10px;
      font-weight: 600;
      color: var(--text-muted);
      transition: all 0.3s;
    }

    .tab-item i { font-style: normal; font-size: 18px; }

    .tab-item.active {
      background: var(--white);
      color: var(--accent-color);
      box-shadow: 0 4px 12px rgba(230, 57, 70, 0.1);
    }

    .tab-content.animate-in {
      animation: slideUp 0.5s ease-out;
    }

    @keyframes slideUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* Cards & Forms */
    .card {
      padding: 40px;
      border-radius: 32px;
    }

    .card-header { margin-bottom: 30px; }
    .card-header h3 { font-size: 24px; font-weight: 800; margin-bottom: 8px; }
    .card-header p { color: var(--text-muted); font-size: 14px; }

    .premium-form .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
      margin-bottom: 24px;
    }

    .max-600 { max-width: 600px; }

    .location-group { position: relative; }
    .location-group .btn-sm {
      position: absolute;
      right: 12px;
      bottom: 12px;
    }

    /* Appointment Cards */
    .appointments-section { margin-top: 50px; }
    .appointments-section h4 { font-size: 18px; font-weight: 700; margin-bottom: 24px; }

    .appointment-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 20px;
    }

    .appointment-card {
      padding: 24px;
      border-radius: 20px;
      position: relative;
    }

    .card-line { width: 30px; height: 3px; background: var(--accent-color); border-radius: 2px; margin-bottom: 16px; }

    .apt-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .apt-header h5 { font-size: 16px; font-weight: 700; margin: 0; }

    .status-chip {
      padding: 4px 10px;
      border-radius: 50px;
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      background: #E8F5E9;
      color: #2E7D32;
    }

    .status-chip.pending { background: #FFF3E0; color: #E65100; }

    .apt-details p { font-size: 14px; color: var(--text-muted); margin: 6px 0; }

    .btn-text-danger {
      background: none;
      border: none;
      color: var(--accent-color);
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
      padding: 0;
      margin-top: 16px;
      opacity: 0.7;
    }

    .btn-text-danger:hover { opacity: 1; }

    /* Map Search */
    .search-grid {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr;
      gap: 20px;
      margin-bottom: 30px;
    }

    .search-input-wrapper { position: relative; }
    .search-input-wrapper .icon-btn {
      position: absolute;
      right: 12px;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      cursor: pointer;
      font-size: 18px;
    }

    .map-wrapper {
      height: 400px;
      border-radius: 24px;
      overflow: hidden;
      margin-bottom: 30px;
      border: 1px solid rgba(29, 53, 87, 0.1);
    }

    .map-view { width: 100%; height: 100%; }

    .results-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
      gap: 16px;
    }

    .result-card { padding: 20px; border-radius: 16px; }
    .result-card h5 { font-size: 15px; font-weight: 700; margin-bottom: 12px; }
    .result-meta { display: flex; justify-content: space-between; font-size: 13px; color: var(--text-muted); }
    .dist-badge { color: var(--accent-color); font-weight: 700; }

    /* Notifications */
    .note-stack { display: flex; flex-direction: column; gap: 12px; }
    .note-item {
      display: flex;
      gap: 20px;
      padding: 20px;
      background: white;
      border-radius: 20px;
      border-left: 4px solid #DFE3E8;
    }

    .note-item.unread { border-left-color: var(--accent-color); box-shadow: 0 4px 12px rgba(230, 57, 70, 0.05); }

    .note-icon-box { font-size: 24px; }
    .note-body h4 { font-size: 16px; font-weight: 700; margin: 0 0 4px 0; }
    .note-body p { font-size: 14px; color: var(--text-muted); margin: 0 0 8px 0; }
    .note-time { font-size: 11px; font-weight: 600; color: #919EAB; }

    /* Modal */
    .modal-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(29, 53, 87, 0.4);
      backdrop-filter: blur(8px);
      z-index: 2000;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .modal-card { width: 90%; max-width: 600px; max-height: 90vh; overflow-y: auto; padding: 40px; }
    .modal-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
    .modal-top h3 { font-size: 24px; font-weight: 800; margin: 0; }
    .close-trigger { background: none; border: none; font-size: 32px; cursor: pointer; opacity: 0.5; }

    .inventory-section { margin-bottom: 40px; }
    .inventory-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
    .inv-item { background: #F8F9FA; padding: 12px; border-radius: 12px; text-align: center; }
    .inv-type { display: block; font-weight: 800; font-size: 14px; margin-bottom: 4px; }
    .inv-amount { font-size: 11px; color: #2E7D32; font-weight: 700; }
    .inv-amount.low { color: var(--accent-color); }

    .priority-selector { display: flex; gap: 12px; }
    .priority-option {
      flex: 1;
      padding: 10px;
      background: var(--white);
      border: 1px solid rgba(29, 53, 87, 0.1);
      border-radius: 12px;
      text-align: center;
      cursor: pointer;
      font-size: 14px;
      font-weight: 600;
    }
    .priority-option.active { background: var(--text-main); color: white; }
    .priority-option input { display: none; }

    @media (max-width: 992px) {
      .dashboard-header { flex-direction: column; align-items: flex-start; }
      .search-grid { grid-template-columns: 1fr; }
    }

    @media (max-width: 768px) {
      .premium-form .form-grid { grid-template-columns: 1fr; }
      .dashboard-tabs { width: 100%; overflow-x: auto; }
      .stats-grid { flex-direction: column; width: 100%; }
    }
  `]
})
export class UserComponent implements OnInit, AfterViewInit {
  @ViewChild('mapContainer', { static: false }) mapContainer!: ElementRef;

  currentUser: any;
  activeTab: string = 'appointments';
  appointments: DonationAppointment[] = [];
  donationHistory: DonationHistory[] = [];
  searchLocation: string = '';
  filterBloodType: string = '';
  searchRadius: number = 25;
  nearbyCenters: any[] = []; // Changed from nearbyDonors
  searchPerformed: boolean = false;
  map: L.Map | null = null;
  markers: L.Marker[] = [];
  suggestions: any[] = [];
  currentSearchLat: number = 20.5937;
  currentSearchLng: number = 78.9629;

  selectedHospital: any = null;
  hospitalInventory: any[] = [];
  bloodRequest = {
    patientName: '',
    bloodType: '',
    units: 1,
    hospital: '',
    urgency: 'Medium'
  };

  newAppointment = {
    date: '',
    time: '',
    location: ''
  };

  userProfile = {
    name: '',
    email: '',
    bloodType: '',
    phone: '',
    address: ''
  };

  notifications: any[] = [];

  // Donors data will be fetched from API
  allDonors: NearbyDonor[] = [];
  allCenters: any[] = [];

  //   karnatakaLocations = [
  //   { hospital: 'Victoria Hospital', city: 'Bengaluru', lat: 12.9634, lng: 77.5730 },
  //   { hospital: 'KIMS Hospital', city: 'Hubballi', lat: 15.3647, lng: 75.1240 },
  //   { hospital: 'KR Hospital', city: 'Mysuru', lat: 12.3052, lng: 76.6552 },
  //   { hospital: 'Wenlock Hospital', city: 'Mangaluru', lat: 12.9141, lng: 74.8560 },
  //   { hospital: 'District Hospital', city: 'Belagavi', lat: 15.8497, lng: 74.4977 },
  //   { hospital: 'ESI Hospital', city: 'Kalaburagi', lat: 17.3297, lng: 76.8343 },
  //   { hospital: 'Shimoga Institute', city: 'Shivamogga', lat: 13.9299, lng: 75.5681 },
  //   { hospital: 'Koppal District Hospital', city: 'Koppal', lat: 15.3455, lng: 76.1547 },
  //   { hospital: 'Mandya General Hospital', city: 'Mandya', lat: 12.5218, lng: 76.8951 },
  //   { hospital: 'Hassan Institute', city: 'Hassan', lat: 13.0068, lng: 76.0996 }
  // ];

  karnatakaLocations = [
    // Bengaluru Urban & Rural Districts
    { hospital: 'Victoria Hospital', city: 'Bengaluru', lat: 12.9634, lng: 77.5730 },
    { hospital: 'Bowring Hospital', city: 'Bengaluru', lat: 12.9855, lng: 77.5994 },
    { hospital: 'KC General Hospital', city: 'Bengaluru', lat: 12.9698, lng: 77.5986 },
    { hospital: 'Jayanagar General Hospital', city: 'Bengaluru', lat: 12.9250, lng: 77.5838 },
    { hospital: 'Rajiv Gandhi Hospital', city: 'Bengaluru', lat: 13.0103, lng: 77.5510 },
    { hospital: 'Vani Vilas Hospital', city: 'Bengaluru', lat: 12.9591, lng: 77.5713 },
    { hospital: 'Indira Gandhi Hospital', city: 'Bengaluru', lat: 12.9716, lng: 77.5946 },
    { hospital: 'Baptist Hospital', city: 'Bengaluru', lat: 12.9561, lng: 77.6013 },
    { hospital: 'St Johns Hospital', city: 'Bengaluru', lat: 12.9539, lng: 77.6007 },
    { hospital: 'Mallya Hospital', city: 'Bengaluru', lat: 12.9891, lng: 77.5989 },
    { hospital: 'BGS Global Hospital', city: 'Bengaluru', lat: 12.9194, lng: 77.4965 },
    { hospital: 'Columbia Asia Hospital', city: 'Bengaluru', lat: 13.0192, lng: 77.6437 },
    { hospital: 'Narayana Hospital', city: 'Bengaluru', lat: 12.9121, lng: 77.6446 },
    { hospital: 'Apollo Hospital', city: 'Bengaluru', lat: 12.9508, lng: 77.6409 },
    { hospital: 'Fortis Hospital', city: 'Bengaluru', lat: 12.9194, lng: 77.6408 },
    { hospital: 'Manipal Hospital', city: 'Bengaluru', lat: 12.9716, lng: 77.5946 },
    { hospital: 'Sakra Hospital', city: 'Bengaluru', lat: 13.0158, lng: 77.6508 },
    { hospital: 'Sparsh Hospital', city: 'Bengaluru', lat: 12.9279, lng: 77.6271 },
    { hospital: 'Aster CMI Hospital', city: 'Bengaluru', lat: 13.0158, lng: 77.6390 },
    { hospital: 'Motherhood Hospital', city: 'Bengaluru', lat: 12.9698, lng: 77.6411 },
    { hospital: 'Rainbow Hospital', city: 'Bengaluru', lat: 12.9858, lng: 77.6413 },
    { hospital: 'Cloudnine Hospital', city: 'Bengaluru', lat: 12.9279, lng: 77.6271 },
    { hospital: 'Nelamangala Govt Hospital', city: 'Nelamangala', lat: 13.0989, lng: 77.3936 },
    { hospital: 'Devanahalli Taluk Hospital', city: 'Devanahalli', lat: 13.2426, lng: 77.7122 },
    { hospital: 'Doddaballapur Hospital', city: 'Doddaballapur', lat: 13.2277, lng: 77.5360 },
    { hospital: 'Hoskote Govt Hospital', city: 'Hoskote', lat: 13.0719, lng: 77.7994 },
    { hospital: 'Ramanagara District Hospital', city: 'Ramanagara', lat: 12.7241, lng: 77.2826 },
    { hospital: 'Magadi Taluk Hospital', city: 'Magadi', lat: 12.9577, lng: 77.2242 },
    { hospital: 'Channapatna Hospital', city: 'Channapatna', lat: 12.6513, lng: 77.2067 },
    { hospital: 'Kanakapura Govt Hospital', city: 'Kanakapura', lat: 12.5391, lng: 77.4213 },

    // Mysuru District
    { hospital: 'KR Hospital', city: 'Mysuru', lat: 12.3052, lng: 76.6552 },
    { hospital: 'Cheluvamba Hospital', city: 'Mysuru', lat: 12.3089, lng: 76.6553 },
    { hospital: 'JSS Hospital', city: 'Mysuru', lat: 12.2898, lng: 76.6394 },
    { hospital: 'Apollo BGS Hospital', city: 'Mysuru', lat: 12.2897, lng: 76.6394 },
    { hospital: 'Columbia Asia Hospital', city: 'Mysuru', lat: 12.2958, lng: 76.6394 },
    { hospital: 'Vikram Hospital', city: 'Mysuru', lat: 12.3089, lng: 76.6481 },
    { hospital: 'Basappa Memorial Hospital', city: 'Mysuru', lat: 12.3016, lng: 76.6394 },
    { hospital: 'Manipal Hospital', city: 'Mysuru', lat: 12.2958, lng: 76.6394 },
    { hospital: 'Narayana Multispeciality', city: 'Mysuru', lat: 12.2958, lng: 76.6503 },
    { hospital: 'Nanjangud Taluk Hospital', city: 'Nanjangud', lat: 12.1175, lng: 76.6838 },
    { hospital: 'HD Kote Hospital', city: 'HD Kote', lat: 12.0942, lng: 76.2942 },
    { hospital: 'Hunsur Taluk Hospital', city: 'Hunsur', lat: 12.3022, lng: 76.2922 },
    { hospital: 'Periyapatna Hospital', city: 'Periyapatna', lat: 12.3422, lng: 76.0992 },
    { hospital: 'KR Nagar Hospital', city: 'KR Nagar', lat: 12.4122, lng: 76.7631 },
    { hospital: 'T Narasipura Hospital', city: 'T Narasipura', lat: 12.2122, lng: 76.9061 },

    // Mandya District
    { hospital: 'Mandya General Hospital', city: 'Mandya', lat: 12.5218, lng: 76.8951 },
    { hospital: 'Adichunchanagiri Hospital', city: 'Mandya', lat: 12.5218, lng: 76.8951 },
    { hospital: 'Maddur Taluk Hospital', city: 'Maddur', lat: 12.5834, lng: 77.0438 },
    { hospital: 'Malavalli Hospital', city: 'Malavalli', lat: 12.3835, lng: 77.0611 },
    { hospital: 'Pandavapura Hospital', city: 'Pandavapura', lat: 12.6656, lng: 76.6861 },
    { hospital: 'Srirangapatna Hospital', city: 'Srirangapatna', lat: 12.4216, lng: 76.6947 },
    { hospital: 'Nagamangala Hospital', city: 'Nagamangala', lat: 12.8188, lng: 76.7547 },
    { hospital: 'KR Pet Hospital', city: 'KR Pet', lat: 12.6656, lng: 76.9861 },

    // Chamarajanagar District
    { hospital: 'Chamarajanagar District Hospital', city: 'Chamarajanagar', lat: 11.9258, lng: 76.9397 },
    { hospital: 'Gundlupet Taluk Hospital', city: 'Gundlupet', lat: 11.8097, lng: 76.6847 },
    { hospital: 'Kollegal Hospital', city: 'Kollegal', lat: 12.1551, lng: 77.1105 },
    { hospital: 'Yelandur Hospital', city: 'Yelandur', lat: 12.0451, lng: 77.0305 },

    // Hassan District
    { hospital: 'Hassan Institute', city: 'Hassan', lat: 13.0068, lng: 76.0996 },
    { hospital: 'Hassan District Hospital', city: 'Hassan', lat: 13.0068, lng: 76.0996 },
    { hospital: 'Shravanabelagola Hospital', city: 'Shravanabelagola', lat: 12.8577, lng: 76.4881 },
    { hospital: 'Holenarasipura Hospital', city: 'Holenarasipura', lat: 13.0377, lng: 76.3481 },
    { hospital: 'Arkalgud Hospital', city: 'Arkalgud', lat: 12.7577, lng: 76.0611 },
    { hospital: 'Channarayapatna Hospital', city: 'Channarayapatna', lat: 12.9077, lng: 76.3881 },
    { hospital: 'Belur Taluk Hospital', city: 'Belur', lat: 13.1655, lng: 75.8655 },
    { hospital: 'Sakleshpur Hospital', city: 'Sakleshpur', lat: 12.9411, lng: 75.7847 },
    { hospital: 'Alur Hospital', city: 'Alur', lat: 13.0277, lng: 75.9681 },

    // Chikkamagaluru District
    { hospital: 'Chikkamagaluru District Hospital', city: 'Chikkamagaluru', lat: 13.3161, lng: 75.7720 },
    { hospital: 'Kadur Taluk Hospital', city: 'Kadur', lat: 13.5533, lng: 76.0108 },
    { hospital: 'Tarikere Hospital', city: 'Tarikere', lat: 13.7097, lng: 75.8147 },
    { hospital: 'Koppa Hospital', city: 'Koppa', lat: 13.5333, lng: 75.3608 },
    { hospital: 'Sringeri Hospital', city: 'Sringeri', lat: 13.4186, lng: 75.2519 },
    { hospital: 'Mudigere Hospital', city: 'Mudigere', lat: 13.1333, lng: 75.6347 },
    { hospital: 'NR Pura Hospital', city: 'NR Pura', lat: 13.0186, lng: 75.5919 },

    // Dakshina Kannada District
    { hospital: 'Wenlock Hospital', city: 'Mangaluru', lat: 12.9141, lng: 74.8560 },
    { hospital: 'Lady Goschen Hospital', city: 'Mangaluru', lat: 12.8698, lng: 74.8560 },
    { hospital: 'KMC Hospital', city: 'Mangaluru', lat: 12.9141, lng: 74.8560 },
    { hospital: 'AJ Hospital', city: 'Mangaluru', lat: 12.8698, lng: 74.8421 },
    { hospital: 'Father Muller Hospital', city: 'Mangaluru', lat: 12.8898, lng: 74.8421 },
    { hospital: 'Unity Hospital', city: 'Mangaluru', lat: 12.8698, lng: 74.8560 },
    { hospital: 'Yenepoya Hospital', city: 'Mangaluru', lat: 12.8898, lng: 74.8860 },
    { hospital: 'KS Hegde Hospital', city: 'Mangaluru', lat: 12.8398, lng: 74.9260 },
    { hospital: 'Indiana Hospital', city: 'Mangaluru', lat: 12.8698, lng: 74.8421 },
    { hospital: 'Highland Hospital', city: 'Mangaluru', lat: 12.8898, lng: 74.8560 },
    { hospital: 'Bantwal Taluk Hospital', city: 'Bantwal', lat: 12.8947, lng: 75.0347 },
    { hospital: 'Belthangady Hospital', city: 'Belthangady', lat: 13.0686, lng: 75.2919 },
    { hospital: 'Puttur Taluk Hospital', city: 'Puttur', lat: 12.7597, lng: 75.2047 },
    { hospital: 'Sullia Hospital', city: 'Sullia', lat: 12.5597, lng: 75.3847 },
    { hospital: 'Moodabidri Hospital', city: 'Moodabidri', lat: 13.0686, lng: 74.9919 },

    // Udupi District
    { hospital: 'Udupi District Hospital', city: 'Udupi', lat: 13.3409, lng: 74.7421 },
    { hospital: 'Kasturba Hospital', city: 'Udupi', lat: 13.3409, lng: 74.7421 },
    { hospital: 'Adarsh Hospital', city: 'Udupi', lat: 13.3409, lng: 74.7421 },
    { hospital: 'Kundapura Taluk Hospital', city: 'Kundapura', lat: 13.6275, lng: 74.6914 },
    { hospital: 'Karkala Hospital', city: 'Karkala', lat: 13.2114, lng: 74.9914 },
    { hospital: 'Brahmavar Hospital', city: 'Brahmavar', lat: 13.4525, lng: 74.7314 },

    // Uttara Kannada District
    { hospital: 'Karwar District Hospital', city: 'Karwar', lat: 14.8133, lng: 74.1297 },
    { hospital: 'Kumta Taluk Hospital', city: 'Kumta', lat: 14.4297, lng: 74.4147 },
    { hospital: 'Sirsi District Hospital', city: 'Sirsi', lat: 14.6186, lng: 74.8347 },
    { hospital: 'Siddapur Hospital', city: 'Siddapur', lat: 14.3386, lng: 74.8947 },
    { hospital: 'Haliyal Hospital', city: 'Haliyal', lat: 15.3186, lng: 74.7547 },
    { hospital: 'Yellapur Hospital', city: 'Yellapur', lat: 14.9636, lng: 74.7097 },
    { hospital: 'Mundgod Hospital', city: 'Mundgod', lat: 14.9736, lng: 75.0347 },
    { hospital: 'Ankola Hospital', city: 'Ankola', lat: 14.6597, lng: 74.3047 },
    { hospital: 'Bhatkal Hospital', city: 'Bhatkal', lat: 13.9847, lng: 74.5547 },
    { hospital: 'Honavar Hospital', city: 'Honavar', lat: 14.2797, lng: 74.4447 },

    // Shivamogga District
    { hospital: 'Shimoga Institute', city: 'Shivamogga', lat: 13.9299, lng: 75.5681 },
    { hospital: 'McGann Hospital', city: 'Shivamogga', lat: 13.9299, lng: 75.5681 },
    { hospital: 'Bhadravathi General Hospital', city: 'Bhadravathi', lat: 13.8486, lng: 75.7047 },
    { hospital: 'Sagar Taluk Hospital', city: 'Sagar', lat: 14.1686, lng: 75.0297 },
    { hospital: 'Hosanagara Hospital', city: 'Hosanagara', lat: 13.8186, lng: 75.0647 },
    { hospital: 'Thirthahalli Hospital', city: 'Thirthahalli', lat: 13.6886, lng: 75.2447 },
    { hospital: 'Shikaripura Hospital', city: 'Shikaripura', lat: 14.2686, lng: 75.3547 },
    { hospital: 'Soraba Hospital', city: 'Soraba', lat: 14.3786, lng: 75.0847 },

    // Davangere District
    { hospital: 'Davangere District Hospital', city: 'Davangere', lat: 14.4644, lng: 75.9217 },
    { hospital: 'Chigateri General Hospital', city: 'Davangere', lat: 14.4644, lng: 75.9217 },
    { hospital: 'SS Hospital', city: 'Davangere', lat: 14.4644, lng: 75.9217 },
    { hospital: 'Bapuji Hospital', city: 'Davangere', lat: 14.4644, lng: 75.9217 },
    { hospital: 'Honnali Hospital', city: 'Honnali', lat: 14.2344, lng: 75.6467 },
    { hospital: 'Harihara Hospital', city: 'Harihara', lat: 14.5144, lng: 75.8067 },
    { hospital: 'Harihar Polyclinic', city: 'Harihara', lat: 14.5144, lng: 75.8067 },
    { hospital: 'Channagiri Hospital', city: 'Channagiri', lat: 14.0244, lng: 75.9267 },
    { hospital: 'Jagalur Hospital', city: 'Jagalur', lat: 14.5144, lng: 76.3367 },

    // Chitradurga District
    { hospital: 'Chitradurga District Hospital', city: 'Chitradurga', lat: 14.2225, lng: 76.4008 },
    { hospital: 'Basaveshwara Hospital', city: 'Chitradurga', lat: 14.2225, lng: 76.4008 },
    { hospital: 'Hiriyur Taluk Hospital', city: 'Hiriyur', lat: 13.9425, lng: 76.6208 },
    { hospital: 'Holalkere Hospital', city: 'Holalkere', lat: 14.0525, lng: 76.1808 },
    { hospital: 'Challakere Hospital', city: 'Challakere', lat: 14.3125, lng: 76.6508 },
    { hospital: 'Hosadurga Hospital', city: 'Hosadurga', lat: 13.7925, lng: 76.2808 },
    { hospital: 'Molakalmuru Hospital', city: 'Molakalmuru', lat: 14.7125, lng: 76.7508 },

    // Tumakuru District
    { hospital: 'Tumakuru District Hospital', city: 'Tumakuru', lat: 13.3392, lng: 77.1006 },
    { hospital: 'Siddaganga Hospital', city: 'Tumakuru', lat: 13.3392, lng: 77.1006 },
    { hospital: 'Gubbi Taluk Hospital', city: 'Gubbi', lat: 13.3142, lng: 76.9306 },
    { hospital: 'Tiptur Hospital', city: 'Tiptur', lat: 13.2542, lng: 76.4756 },
    { hospital: 'Turuvekere Hospital', city: 'Turuvekere', lat: 13.1642, lng: 76.6656 },
    { hospital: 'Kunigal Hospital', city: 'Kunigal', lat: 13.0242, lng: 77.0256 },
    { hospital: 'Koratagere Hospital', city: 'Koratagere', lat: 13.5242, lng: 77.2456 },
    { hospital: 'Madhugiri Hospital', city: 'Madhugiri', lat: 13.6542, lng: 77.2056 },
    { hospital: 'Pavagada Hospital', city: 'Pavagada', lat: 14.0992, lng: 77.2806 },
    { hospital: 'Sira Hospital', city: 'Sira', lat: 13.7442, lng: 76.9006 },

    // Kolar District
    { hospital: 'Kolar District Hospital', city: 'Kolar', lat: 13.1375, lng: 78.1297 },
    { hospital: 'Bangarapet Hospital', city: 'Bangarapet', lat: 12.9875, lng: 78.1797 },
    { hospital: 'Malur Taluk Hospital', city: 'Malur', lat: 13.0075, lng: 77.9397 },
    { hospital: 'Mulbagal Hospital', city: 'Mulbagal', lat: 13.1625, lng: 78.3947 },
    { hospital: 'Srinivaspur Hospital', city: 'Srinivaspur', lat: 13.3375, lng: 78.2047 },

    // Chikkaballapura District
    { hospital: 'Chikkaballapura District Hospital', city: 'Chikkaballapura', lat: 13.4355, lng: 77.7314 },
    { hospital: 'Bagepalli Hospital', city: 'Bagepalli', lat: 13.7855, lng: 77.7914 },
    { hospital: 'Chintamani Hospital', city: 'Chintamani', lat: 13.4005, lng: 78.0514 },
    { hospital: 'Gauribidanur Hospital', city: 'Gauribidanur', lat: 13.6105, lng: 77.5214 },
    { hospital: 'Gudibande Hospital', city: 'Gudibande', lat: 13.6705, lng: 77.7014 },
    { hospital: 'Shidlaghatta Hospital', city: 'Shidlaghatta', lat: 13.3805, lng: 77.8514 },

    // Raichur District
    { hospital: 'Raichur District Hospital', city: 'Raichur', lat: 16.2120, lng: 77.3439 },
    { hospital: 'Devadurga Hospital', city: 'Devadurga', lat: 16.4120, lng: 77.0239 },
    { hospital: 'Lingsugur Hospital', city: 'Lingsugur', lat: 16.1620, lng: 76.5239 },
    { hospital: 'Manvi Hospital', city: 'Manvi', lat: 15.9920, lng: 77.0539 },
    { hospital: 'Sindhanur Hospital', city: 'Sindhanur', lat: 15.7720, lng: 76.7539 },

    // Koppal District
    { hospital: 'Koppal District Hospital', city: 'Koppal', lat: 15.3455, lng: 76.1547 },
    { hospital: 'Gangavathi Hospital', city: 'Gangavathi', lat: 15.4255, lng: 76.5297 },
    { hospital: 'Kustagi Hospital', city: 'Kustagi', lat: 15.7555, lng: 76.1797 },
    { hospital: 'Yelburga Hospital', city: 'Yelburga', lat: 15.6155, lng: 76.0197 },

    // Ballari District
    { hospital: 'Ballari District Hospital', city: 'Ballari', lat: 15.1394, lng: 76.9214 },
    { hospital: 'VIMS Hospital', city: 'Ballari', lat: 15.1394, lng: 76.9214 },
    { hospital: 'Jindal Hospital', city: 'Ballari', lat: 15.1394, lng: 76.9214 },
    { hospital: 'Hospet Taluk Hospital', city: 'Hospet', lat: 15.2694, lng: 76.3864 },
    { hospital: 'Hagaribommanahalli Hospital', city: 'Hagaribommanahalli', lat: 15.0294, lng: 75.9714 },
    { hospital: 'Hadagali Hospital', city: 'Hadagali', lat: 14.9894, lng: 75.8914 },
    { hospital: 'Kudligi Hospital', city: 'Kudligi', lat: 14.9094, lng: 76.3814 },
    { hospital: 'Sandur Hospital', city: 'Sandur', lat: 15.0894, lng: 76.5514 },
    { hospital: 'Siruguppa Hospital', city: 'Siruguppa', lat: 15.6294, lng: 77.1114 },

    // Vijayanagara District
    { hospital: 'Vijayanagara District Hospital', city: 'Hosapete', lat: 15.2694, lng: 76.3864 },
    { hospital: 'Harapanahalli Hospital', city: 'Harapanahalli', lat: 14.7894, lng: 75.9664 },
    { hospital: 'Hoovina Hadagali Hospital', city: 'Hoovina Hadagali', lat: 15.1394, lng: 75.9964 },
    { hospital: 'Kottur Hospital', city: 'Kottur', lat: 15.3694, lng: 76.2164 },

    // Belagavi District
    { hospital: 'District Hospital', city: 'Belagavi', lat: 15.8497, lng: 74.4977 },
    { hospital: 'KLE Hospital', city: 'Belagavi', lat: 15.8497, lng: 74.4977 },
    { hospital: 'KIMS Hospital', city: 'Belagavi', lat: 15.8497, lng: 74.4977 },
    { hospital: 'SDM Hospital', city: 'Belagavi', lat: 15.8497, lng: 74.4977 },
    { hospital: 'Gokak Taluk Hospital', city: 'Gokak', lat: 16.1697, lng: 74.8227 },
    { hospital: 'Bailhongal Hospital', city: 'Bailhongal', lat: 15.8197, lng: 74.8627 },
    { hospital: 'Athani Hospital', city: 'Athani', lat: 16.7297, lng: 75.0627 },
    { hospital: 'Chikkodi Hospital', city: 'Chikkodi', lat: 16.2297, lng: 74.5927 },
    { hospital: 'Hukkeri Hospital', city: 'Hukkeri', lat: 16.2397, lng: 74.6127 },
    { hospital: 'Raibag Hospital', city: 'Raibag', lat: 16.4897, lng: 74.7727 },
    { hospital: 'Ramdurg Hospital', city: 'Ramdurg', lat: 15.9397, lng: 75.1827 },
    { hospital: 'Saundatti Hospital', city: 'Saundatti', lat: 15.7697, lng: 75.1127 },
    { hospital: 'Khanapur Hospital', city: 'Khanapur', lat: 15.6497, lng: 74.5027 },
    { hospital: 'Kittur Hospital', city: 'Kittur', lat: 16.0197, lng: 74.6527 },

    // Vijayapura District
    { hospital: 'Vijayapura District Hospital', city: 'Vijayapura', lat: 16.8302, lng: 75.7100 },
    { hospital: 'Al-Ameen Hospital', city: 'Vijayapura', lat: 16.8302, lng: 75.7100 },
    { hospital: 'Basavana Bagewadi Hospital', city: 'Basavana Bagewadi', lat: 16.5702, lng: 75.9700 },
    { hospital: 'Indi Hospital', city: 'Indi', lat: 17.1702, lng: 75.9500 },
    { hospital: 'Muddebihal Hospital', city: 'Muddebihal', lat: 16.3402, lng: 76.1300 },
    { hospital: 'Sindagi Hospital', city: 'Sindagi', lat: 16.9202, lng: 75.9800 },
    { hospital: 'Talikoti Hospital', city: 'Talikoti', lat: 16.4802, lng: 76.3100 },
    { hospital: 'Tikota Hospital', city: 'Tikota', lat: 16.5302, lng: 75.8400 },

    // Bagalkot District
    { hospital: 'Bagalkot District Hospital', city: 'Bagalkot', lat: 16.1697, lng: 75.6947 },
    { hospital: 'Mudhol Hospital', city: 'Mudhol', lat: 16.3397, lng: 75.2847 },
    { hospital: 'Jamkhandi Hospital', city: 'Jamkhandi', lat: 16.5097, lng: 75.2947 },
    { hospital: 'Badami Hospital', city: 'Badami', lat: 15.9147, lng: 75.6797 },
    { hospital: 'Bilagi Hospital', city: 'Bilagi', lat: 16.3597, lng: 75.6247 },
    { hospital: 'Hunagund Hospital', city: 'Hunagund', lat: 15.9997, lng: 75.5247 },

    // Gadag District
    { hospital: 'Gadag District Hospital', city: 'Gadag', lat: 15.4297, lng: 75.6297 },
    { hospital: 'Mundargi Hospital', city: 'Mundargi', lat: 15.2097, lng: 75.8847 },
    { hospital: 'Nargund Hospital', city: 'Nargund', lat: 15.7197, lng: 75.3847 },
    { hospital: 'Ron Hospital', city: 'Ron', lat: 15.6997, lng: 75.7347 },
    { hospital: 'Shirahatti Hospital', city: 'Shirahatti', lat: 15.2397, lng: 75.5747 },

    // Dharwad District
    { hospital: 'Dharwad District Hospital', city: 'Dharwad', lat: 15.4589, lng: 75.0078 },
    { hospital: 'SDM Hospital', city: 'Dharwad', lat: 15.4589, lng: 75.0078 },
    { hospital: 'KIMS Hospital', city: 'Dharwad', lat: 15.4589, lng: 75.0078 },
    { hospital: 'Alnoor Hospital', city: 'Dharwad', lat: 15.4589, lng: 75.0078 },
    { hospital: 'Kalghatgi Hospital', city: 'Kalghatgi', lat: 15.1789, lng: 74.9678 },
    { hospital: 'Kundgol Hospital', city: 'Kundgol', lat: 15.2589, lng: 75.2478 },
    { hospital: 'Navalgund Hospital', city: 'Navalgund', lat: 15.5589, lng: 75.3478 },
    { hospital: 'Annigeri Hospital', city: 'Annigeri', lat: 15.4189, lng: 75.4378 },

    // Haveri District
    { hospital: 'Haveri District Hospital', city: 'Haveri', lat: 14.7952, lng: 75.4030 },
    { hospital: 'Byadgi Hospital', city: 'Byadgi', lat: 14.6752, lng: 75.4930 },
    { hospital: 'Hanagal Hospital', city: 'Hanagal', lat: 14.7652, lng: 75.0930 },
    { hospital: 'Hirekerur Hospital', city: 'Hirekerur', lat: 14.4552, lng: 75.3930 },
    { hospital: 'Ranebennur Hospital', city: 'Ranebennur', lat: 14.6152, lng: 75.6230 },
    { hospital: 'Savanur Hospital', city: 'Savanur', lat: 14.9652, lng: 75.3430 },
    { hospital: 'Shiggaon Hospital', city: 'Shiggaon', lat: 14.9952, lng: 75.2230 },

    // Hubballi-Dharwad
    { hospital: 'KIMS Hospital', city: 'Hubballi', lat: 15.3647, lng: 75.1240 },
    { hospital: 'SDM Narayana Hospital', city: 'Hubballi', lat: 15.3647, lng: 75.1240 },
    { hospital: 'V Care Hospital', city: 'Hubballi', lat: 15.3647, lng: 75.1240 },
    { hospital: 'Alnoor Hospital', city: 'Hubballi', lat: 15.3647, lng: 75.1240 },
    { hospital: 'KLE Hospital', city: 'Hubballi', lat: 15.3647, lng: 75.1240 },
    { hospital: 'Srinivas Hospital', city: 'Hubballi', lat: 15.3647, lng: 75.1240 },
    { hospital: 'Tirth Hospital', city: 'Hubballi', lat: 15.3647, lng: 75.1240 },

    // Kalaburagi District
    { hospital: 'ESI Hospital', city: 'Kalaburagi', lat: 17.3297, lng: 76.8343 },
    { hospital: 'Basaveshwar Hospital', city: 'Kalaburagi', lat: 17.3297, lng: 76.8343 },
    { hospital: 'HKE Hospital', city: 'Kalaburagi', lat: 17.3297, lng: 76.8343 },
    { hospital: 'Sharanabasaveshwar Hospital', city: 'Kalaburagi', lat: 17.3297, lng: 76.8343 },
    { hospital: 'Aland Hospital', city: 'Aland', lat: 17.5597, lng: 76.5643 },
    { hospital: 'Afzalpur Hospital', city: 'Afzalpur', lat: 17.1997, lng: 76.3643 },
    { hospital: 'Chincholi Hospital', city: 'Chincholi', lat: 17.4697, lng: 77.4143 },
    { hospital: 'Chitapur Hospital', city: 'Chitapur', lat: 17.1297, lng: 77.0843 },
    { hospital: 'Jewargi Hospital', city: 'Jewargi', lat: 17.0497, lng: 76.7643 },
    { hospital: 'Sedam Hospital', city: 'Sedam', lat: 17.1797, lng: 77.2843 },

    // Yadgir District
    { hospital: 'Yadgir District Hospital', city: 'Yadgir', lat: 16.7697, lng: 77.1397 },
    { hospital: 'Shahapur Hospital', city: 'Shahapur', lat: 16.6997, lng: 76.8497 },
    { hospital: 'Shorapur Hospital', city: 'Shorapur', lat: 16.5197, lng: 76.7597 },
    { hospital: 'Surpur Hospital', city: 'Surpur', lat: 16.2697, lng: 77.0897 },

    // Bidar District
    { hospital: 'Bidar District Hospital', city: 'Bidar', lat: 17.9134, lng: 77.5199 },
    { hospital: 'Basaveshwar Hospital', city: 'Bidar', lat: 17.9134, lng: 77.5199 },
    { hospital: 'Aurad Hospital', city: 'Aurad', lat: 18.2534, lng: 77.4199 },
    { hospital: 'Basavakalyan Hospital', city: 'Basavakalyan', lat: 17.8734, lng: 76.9499 },
    { hospital: 'Bhalki Hospital', city: 'Bhalki', lat: 18.0434, lng: 77.2199 },
    { hospital: 'Humnabad Hospital', city: 'Humnabad', lat: 17.7734, lng: 77.1099 },

    // Kodagu District
    { hospital: 'Kodagu District Hospital', city: 'Madikeri', lat: 12.4244, lng: 75.7382 },
    { hospital: 'Virajpet Hospital', city: 'Virajpet', lat: 12.1944, lng: 75.8082 },
    { hospital: 'Somwarpet Hospital', city: 'Somwarpet', lat: 12.5944, lng: 75.8482 },

    // Additional hospitals across Karnataka
    { hospital: 'Columbia Asia Hospital', city: 'Whitefield', lat: 12.9698, lng: 77.7499 },
    { hospital: 'Vydehi Hospital', city: 'Whitefield', lat: 12.9998, lng: 77.7499 },
    { hospital: 'Sagar Hospital', city: 'Jayanagar', lat: 12.9250, lng: 77.5838 },
    { hospital: 'Apollo Hospital', city: 'Bannerghatta', lat: 12.8898, lng: 77.6099 },
    { hospital: 'HCG Hospital', city: 'Bengaluru', lat: 13.0158, lng: 77.6390 },
    { hospital: 'Mazumdar Shaw Cancer Center', city: 'Bengaluru', lat: 12.9121, lng: 77.6446 },
    { hospital: 'St Philomenas Hospital', city: 'Bengaluru', lat: 12.9716, lng: 77.5946 },
    { hospital: 'Mallige Hospital', city: 'Bengaluru', lat: 13.0103, lng: 77.5510 },
    { hospital: 'MS Ramaiah Hospital', city: 'Bengaluru', lat: 13.0192, lng: 77.5637 },
    { hospital: 'Rajarajeshwari Hospital', city: 'Bengaluru', lat: 12.9121, lng: 77.5146 },
    { hospital: 'Hosmat Hospital', city: 'Bengaluru', lat: 12.9858, lng: 77.6413 },
    { hospital: 'Sagar Hospital', city: 'Banashankari', lat: 12.9279, lng: 77.5571 },
    { hospital: 'Kauvery Hospital', city: 'Electronic City', lat: 12.8398, lng: 77.6799 },
    { hospital: 'People Tree Hospital', city: 'Yeshwanthpur', lat: 13.0192, lng: 77.5437 },
    { hospital: 'Vydehi Hospital', city: 'Marathahalli', lat: 12.9598, lng: 77.6999 },
    { hospital: 'Ramaiah Memorial Hospital', city: 'Bengaluru', lat: 13.0292, lng: 77.5737 },
    { hospital: 'Sagar Apollo Hospital', city: 'BTM Layout', lat: 12.9150, lng: 77.6100 },
    { hospital: 'Sri Sathya Sai Hospital', city: 'Whitefield', lat: 12.9998, lng: 77.7299 },
    { hospital: 'Sita Bhateja Hospital', city: 'Banashankari', lat: 12.9179, lng: 77.5471 },
    { hospital: 'Cure Hospital', city: 'Bengaluru', lat: 12.9698, lng: 77.6211 },
    { hospital: 'Shishu Mandir Hospital', city: 'Bengaluru', lat: 12.9598, lng: 77.5846 },
    { hospital: 'Mathrushree Hospital', city: 'Jayanagar', lat: 12.9250, lng: 77.5938 },
    { hospital: 'Sathguru Hospital', city: 'Yelahanka', lat: 13.1003, lng: 77.5910 },
    { hospital: 'Kanva Hospital', city: 'Bengaluru', lat: 12.9398, lng: 77.5646 },
    { hospital: 'Apollo Spectra', city: 'Koramangala', lat: 12.9352, lng: 77.6245 },
    { hospital: 'Sagar Hospital', city: 'DSI', lat: 13.0458, lng: 77.5610 },
    { hospital: 'KJR Hospital', city: 'Vijayanagar', lat: 12.9679, lng: 77.5271 },
    { hospital: 'NU Hospitals', city: 'Padmanabhanagar', lat: 12.9079, lng: 77.5571 },
    { hospital: 'KMC Hospital', city: 'Ambedkar Veedhi', lat: 12.9741, lng: 77.6013 },
    { hospital: 'Chinmaya Mission Hospital', city: 'Indiranagar', lat: 12.9716, lng: 77.6412 },
    { hospital: 'Apollo Cradle', city: 'Brookefield', lat: 12.9798, lng: 77.7199 },
    { hospital: 'Shushruti Hospital', city: 'Mysuru', lat: 12.2958, lng: 76.6394 },
    { hospital: 'Apollo Spectra', city: 'Mysuru', lat: 12.3016, lng: 76.6494 },
    { hospital: 'Cloud Nine Hospital', city: 'Mysuru', lat: 12.2958, lng: 76.6494 },
    { hospital: 'Cauvery Hospital', city: 'Mysuru', lat: 12.3016, lng: 76.6294 },
    { hospital: 'Nandi Hospital', city: 'Chickballapur', lat: 13.4355, lng: 77.7414 },
    { hospital: 'District Hospital', city: 'Kolar', lat: 13.1375, lng: 78.1397 },
    { hospital: 'Community Health Centre', city: 'Sidlaghatta', lat: 13.3805, lng: 77.8614 },
    { hospital: 'Taluk Hospital', city: 'Gauribidanur', lat: 13.6105, lng: 77.5314 },
    { hospital: 'PHC Hospital', city: 'Bagepalli', lat: 13.7855, lng: 77.8014 },
    { hospital: 'Govt Hospital', city: 'Chintamani', lat: 13.4005, lng: 78.0614 },
    { hospital: 'Community Health Centre', city: 'Gudibande', lat: 13.6705, lng: 77.7114 },
    { hospital: 'Taluk Hospital', city: 'Turuvekere', lat: 13.1642, lng: 76.6756 },
    { hospital: 'PHC Hospital', city: 'Kunigal', lat: 13.0242, lng: 77.0356 },
    { hospital: 'District Hospital', city: 'Madhugiri', lat: 13.6542, lng: 77.2156 },
    { hospital: 'Taluk Hospital', city: 'Koratagere', lat: 13.5242, lng: 77.2556 },
    { hospital: 'Govt Hospital', city: 'Pavagada', lat: 14.0992, lng: 77.2906 },
    { hospital: 'Community Health Centre', city: 'Sira', lat: 13.7442, lng: 76.9106 },
    { hospital: 'PHC Hospital', city: 'Gubbi', lat: 13.3142, lng: 76.9406 },
    { hospital: 'Taluk Hospital', city: 'Tiptur', lat: 13.2542, lng: 76.4856 },
    { hospital: 'District Hospital', city: 'Bangarapet', lat: 12.9875, lng: 78.1897 },
    { hospital: 'Taluk Hospital', city: 'Malur', lat: 13.0075, lng: 77.9497 },
    { hospital: 'Community Health Centre', city: 'Mulbagal', lat: 13.1625, lng: 78.4047 },
    { hospital: 'PHC Hospital', city: 'Srinivaspur', lat: 13.3375, lng: 78.2147 },
    { hospital: 'District Hospital', city: 'Ramanagara', lat: 12.7241, lng: 77.2926 },
    { hospital: 'Taluk Hospital', city: 'Channapatna', lat: 12.6513, lng: 77.2167 },
    { hospital: 'Community Health Centre', city: 'Kanakapura', lat: 12.5391, lng: 77.4313 },
    { hospital: 'PHC Hospital', city: 'Magadi', lat: 12.9577, lng: 77.2342 },
    { hospital: 'Taluk Hospital', city: 'Nelamangala', lat: 13.0989, lng: 77.4036 },
    { hospital: 'Community Health Centre', city: 'Doddaballapur', lat: 13.2277, lng: 77.5460 },
    { hospital: 'PHC Hospital', city: 'Devanahalli', lat: 13.2426, lng: 77.7222 },
    { hospital: 'Govt Hospital', city: 'Hoskote', lat: 13.0719, lng: 77.8094 },
    { hospital: 'District Hospital', city: 'Nanjangud', lat: 12.1175, lng: 76.6938 },
    { hospital: 'Taluk Hospital', city: 'HD Kote', lat: 12.0942, lng: 76.3042 },
    { hospital: 'Community Health Centre', city: 'Hunsur', lat: 12.3022, lng: 76.3022 },
    { hospital: 'PHC Hospital', city: 'Periyapatna', lat: 12.3422, lng: 76.1092 },
    { hospital: 'Taluk Hospital', city: 'KR Nagar', lat: 12.4122, lng: 76.7731 },
    { hospital: 'Community Health Centre', city: 'T Narasipura', lat: 12.2122, lng: 76.9161 },
    { hospital: 'PHC Hospital', city: 'Maddur', lat: 12.5834, lng: 77.0538 },
    { hospital: 'District Hospital', city: 'Malavalli', lat: 12.3835, lng: 77.0711 },
    { hospital: 'Taluk Hospital', city: 'Pandavapura', lat: 12.6656, lng: 76.6961 },
    { hospital: 'Community Health Centre', city: 'Srirangapatna', lat: 12.4216, lng: 76.7047 },
    { hospital: 'PHC Hospital', city: 'Nagamangala', lat: 12.8188, lng: 76.7647 },
    { hospital: 'Taluk Hospital', city: 'KR Pet', lat: 12.6656, lng: 76.9961 },
    { hospital: 'District Hospital', city: 'Gundlupet', lat: 11.8097, lng: 76.6947 },
    { hospital: 'Taluk Hospital', city: 'Kollegal', lat: 12.1551, lng: 77.1205 },
    { hospital: 'Community Health Centre', city: 'Yelandur', lat: 12.0451, lng: 77.0405 },
    { hospital: 'PHC Hospital', city: 'Shravanabelagola', lat: 12.8577, lng: 76.4981 },
    { hospital: 'District Hospital', city: 'Holenarasipura', lat: 13.0377, lng: 76.3581 },
    { hospital: 'Taluk Hospital', city: 'Arkalgud', lat: 12.7577, lng: 76.0711 },
    { hospital: 'Community Health Centre', city: 'Channarayapatna', lat: 12.9077, lng: 76.3981 },
    { hospital: 'PHC Hospital', city: 'Belur', lat: 13.1655, lng: 75.8755 },
    { hospital: 'Taluk Hospital', city: 'Sakleshpur', lat: 12.9411, lng: 75.7947 },
    { hospital: 'Community Health Centre', city: 'Alur', lat: 13.0277, lng: 75.9781 },
    { hospital: 'PHC Hospital', city: 'Kadur', lat: 13.5533, lng: 76.0208 },
    { hospital: 'District Hospital', city: 'Tarikere', lat: 13.7097, lng: 75.8247 },
    { hospital: 'Taluk Hospital', city: 'Koppa', lat: 13.5333, lng: 75.3708 },
    { hospital: 'Community Health Centre', city: 'Sringeri', lat: 13.4186, lng: 75.2619 },
    { hospital: 'PHC Hospital', city: 'Mudigere', lat: 13.1333, lng: 75.6447 },
    { hospital: 'Taluk Hospital', city: 'NR Pura', lat: 13.0186, lng: 75.6019 },
    { hospital: 'Community Health Centre', city: 'Bantwal', lat: 12.8947, lng: 75.0447 },
    { hospital: 'PHC Hospital', city: 'Belthangady', lat: 13.0686, lng: 75.3019 },
    { hospital: 'District Hospital', city: 'Puttur', lat: 12.7597, lng: 75.2147 },
    { hospital: 'Taluk Hospital', city: 'Sullia', lat: 12.5597, lng: 75.3947 },
    { hospital: 'Community Health Centre', city: 'Moodabidri', lat: 13.0686, lng: 75.0019 },
    { hospital: 'PHC Hospital', city: 'Kundapura', lat: 13.6275, lng: 74.7014 },
    { hospital: 'District Hospital', city: 'Karkala', lat: 13.2114, lng: 75.0014 },
    { hospital: 'Taluk Hospital', city: 'Brahmavar', lat: 13.4525, lng: 74.7414 },
    { hospital: 'Community Health Centre', city: 'Kumta', lat: 14.4297, lng: 74.4247 },
    { hospital: 'PHC Hospital', city: 'Sirsi', lat: 14.6186, lng: 74.8447 },
    { hospital: 'District Hospital', city: 'Siddapur', lat: 14.3386, lng: 74.9047 },
    { hospital: 'Taluk Hospital', city: 'Haliyal', lat: 15.3186, lng: 74.7647 },
    { hospital: 'Community Health Centre', city: 'Yellapur', lat: 14.9636, lng: 74.7197 },
    { hospital: 'PHC Hospital', city: 'Mundgod', lat: 14.9736, lng: 75.0447 },
    { hospital: 'Taluk Hospital', city: 'Ankola', lat: 14.6597, lng: 74.3147 },
    { hospital: 'Community Health Centre', city: 'Bhatkal', lat: 13.9847, lng: 74.5647 },
    { hospital: 'PHC Hospital', city: 'Honavar', lat: 14.2797, lng: 74.4547 },
    { hospital: 'District Hospital', city: 'Bhadravathi', lat: 13.8486, lng: 75.7147 },
    { hospital: 'Taluk Hospital', city: 'Sagar', lat: 14.1686, lng: 75.0397 },
    { hospital: 'Community Health Centre', city: 'Hosanagara', lat: 13.8186, lng: 75.0747 },
    { hospital: 'PHC Hospital', city: 'Thirthahalli', lat: 13.6886, lng: 75.2547 },
    { hospital: 'Taluk Hospital', city: 'Shikaripura', lat: 14.2686, lng: 75.3647 },
    { hospital: 'Community Health Centre', city: 'Soraba', lat: 14.3786, lng: 75.0947 },
    { hospital: 'PHC Hospital', city: 'Honnali', lat: 14.2344, lng: 75.6567 },
    { hospital: 'District Hospital', city: 'Harihara', lat: 14.5144, lng: 75.8167 },
    { hospital: 'Taluk Hospital', city: 'Channagiri', lat: 14.0244, lng: 75.9367 },
    { hospital: 'Community Health Centre', city: 'Jagalur', lat: 14.5144, lng: 76.3467 },
    { hospital: 'PHC Hospital', city: 'Hiriyur', lat: 13.9425, lng: 76.6308 },
    { hospital: 'District Hospital', city: 'Holalkere', lat: 14.0525, lng: 76.1908 },
    { hospital: 'Taluk Hospital', city: 'Challakere', lat: 14.3125, lng: 76.6608 },
    { hospital: 'Community Health Centre', city: 'Hosadurga', lat: 13.7925, lng: 76.2908 },
    { hospital: 'PHC Hospital', city: 'Molakalmuru', lat: 14.7125, lng: 76.7608 }
  ];

  // module.exports = karnatakaLocations;

  indiaLocations = [
    { hospital: 'AIIMS', city: 'New Delhi', lat: 28.5672, lng: 77.2100 },
    { hospital: 'Tata Memorial Hospital', city: 'Mumbai', lat: 19.0047, lng: 72.8426 },
    { hospital: 'Apollo Hospitals', city: 'Chennai', lat: 13.0604, lng: 80.2496 },
    { hospital: 'NIMS Hospital', city: 'Hyderabad', lat: 17.4126, lng: 78.4596 },
    { hospital: 'AMRI Hospital', city: 'Kolkata', lat: 22.5726, lng: 88.3639 },
    { hospital: 'Sanjay Gandhi Hospital', city: 'Lucknow', lat: 26.8467, lng: 80.9462 },
    { hospital: 'Medanta', city: 'Gurugram', lat: 28.4595, lng: 77.0266 },
    { hospital: 'Ruby Hall Clinic', city: 'Pune', lat: 18.5204, lng: 73.8567 },
    { hospital: 'SMS Hospital', city: 'Jaipur', lat: 26.9124, lng: 75.7873 },
    { hospital: 'PGIMER', city: 'Chandigarh', lat: 30.7333, lng: 76.7794 },
    { hospital: 'IGMC', city: 'Shimla', lat: 31.1048, lng: 77.1734 },
    { hospital: 'AIIMS', city: 'Bhopal', lat: 23.2599, lng: 77.4126 },
    { hospital: 'Civil Hospital', city: 'Ahmedabad', lat: 23.0225, lng: 72.5714 },
    { hospital: 'SCB Medical College', city: 'Cuttack', lat: 20.4625, lng: 85.8830 },
    { hospital: 'GMC', city: 'Nagpur', lat: 21.1458, lng: 79.0882 },
    { hospital: 'RIMS', city: 'Ranchi', lat: 23.3441, lng: 85.3096 },
    { hospital: 'IGIMS', city: 'Patna', lat: 25.5941, lng: 85.1376 },
    { hospital: 'Gauhati Medical College', city: 'Guwahati', lat: 26.1445, lng: 91.7362 },
    { hospital: 'JNIMS', city: 'Imphal', lat: 24.8170, lng: 93.9368 },
    { hospital: 'Civil Hospital', city: 'Dehradun', lat: 30.3165, lng: 78.0322 }
  ];


  constructor(
    private authService: AuthService,
    private apiService: ApiService,
    private router: Router,
    private mapService: MapService
  ) {
    this.allCenters = [...this.karnatakaLocations, ...this.indiaLocations];
  }

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    if (!user || user.role !== 'user') {
      this.router.navigate(['/login']);
      return;
    }
    this.currentUser = user;
    this.userProfile.name = user.name || '';
    this.userProfile.email = user.email || '';
    this.userProfile.bloodType = user.bloodType || '';
    this.userProfile.phone = user.phone || '';
    this.userProfile.address = user.address || '';
    this.loadData();
  }

  ngAfterViewInit(): void {
    // Map will be initialized when search tab is opened
  }

  loadData(): void {
    // Fetch Appointments
    this.apiService.getAppointments().subscribe({
      next: (data) => {
        this.appointments = data.map(app => ({
          id: app._id,
          date: app.date,
          time: app.time,
          location: app.location,
          status: app.status
        }));
      },
      error: (err) => console.error('Error loading appointments', err)
    });

    // Fetch Donation History
    this.apiService.getDonationHistory().subscribe({
      next: (data) => {
        this.donationHistory = data.map(hist => ({
          id: hist._id,
          date: hist.date, // Assuming date is string or needs formatting
          location: hist.location,
          units: hist.units
        }));
      },
      error: (err) => console.error('Error loading donation history', err)
    });

    // Fetch Notifications
    this.apiService.getNotifications().subscribe({
      next: (data) => {
        this.notifications = data;
      },
      error: (err) => console.error('Error loading notifications', err)
    });
  }

  scheduleAppointment(): void {
    if (!this.newAppointment.date || !this.newAppointment.time || !this.newAppointment.location) {
      return;
    }

    const appointmentData = {
      date: this.newAppointment.date,
      time: this.newAppointment.time,
      location: this.newAppointment.location
    };

    this.apiService.scheduleAppointment(appointmentData).subscribe({
      next: (res) => {
        // Add to local list or reload data
        this.appointments.unshift({
          id: res._id,
          date: res.date,
          time: res.time,
          location: res.location,
          status: res.status
        });
        this.newAppointment = { date: '', time: '', location: '' };
        alert('Appointment scheduled successfully!');
      },
      error: (err) => {
        console.error('Error scheduling appointment', err);
        alert('Failed to schedule appointment.');
      }
    });
  }

  cancelAppointment(id: any): void {
    if (confirm('Are you sure you want to cancel this appointment?')) {
      this.apiService.cancelAppointment(id).subscribe({
        next: () => {
          this.appointments = this.appointments.filter(a => a.id !== id);
          alert('Appointment cancelled successfully');
        },
        error: (err) => {
          console.error('Error cancelling appointment', err);
          alert('Failed to cancel appointment');
        }
      });
    }
  }

  updateProfile(): void {
    this.apiService.updateProfile(this.userProfile).subscribe({
      next: (updatedUser) => {
        this.currentUser = updatedUser;
        alert('Profile updated successfully!');
      },
      error: (err) => {
        console.error('Error updating profile', err);
        alert('Failed to update profile.');
      }
    });
  }

  getTotalUnitsDonated(): number {
    return this.donationHistory.reduce((sum, donation) => sum + donation.units, 0);
  }

  logout(): void {
    this.authService.logout();
  }

  initMap(centerLat: number = 20.5937, centerLng: number = 78.9629): void {
    if (!this.mapContainer) return;

    // Clean up existing map
    if (this.map) {
      this.map.remove();
      this.map = null;
    }

    // Initialize Leaflet Map
    this.map = L.map(this.mapContainer.nativeElement).setView([centerLat, centerLng], 5);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);
  }

  debounceTimer: any;
  onSearchInput(event: any): void {
    const query = event.target.value;
    if (query.length < 3) {
      this.suggestions = [];
      return;
    }

    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}&countrycodes=in&limit=5`)
        .then(response => response.json())
        .then(data => {
          this.suggestions = data;
        })
        .catch(err => console.error('Error fetching suggestions:', err));
    }, 300);
  }

  selectSuggestion(suggestion: any): void {
    this.searchLocation = suggestion.display_name;
    this.suggestions = [];

    const lat = parseFloat(suggestion.lat);
    const lon = parseFloat(suggestion.lon);

    this.currentSearchLat = lat;
    this.currentSearchLng = lon;

    this.initMap(lat, lon);
    this.map?.setView([lat, lon], 12);

    // Add marker for selected location
    if (this.map) {
      L.marker([lat, lon], {
        icon: L.icon({
          iconUrl: 'assets/marker-icon.png', // We'll just use default or placeholder
          shadowUrl: 'assets/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41]
        })
      }).addTo(this.map).bindPopup('Search Location').openPopup();
    }

    this.findNearbyCenters(lat, lon);
  }

  searchCenters(): void {
    // If we have a location string but triggered via button/filter
    // We should check if we need to geocode or just use current lat/lng

    if (!this.searchLocation) {
      // If just filters changed, usage current lat/lng
      this.findNearbyCenters(this.currentSearchLat, this.currentSearchLng);
      return;
    }

    // If text search
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${this.searchLocation}&countrycodes=in&limit=1`)
      .then(response => response.json())
      .then(data => {
        if (data && data.length > 0) {
          const lat = parseFloat(data[0].lat);
          const lon = parseFloat(data[0].lon);
          this.currentSearchLat = lat;
          this.currentSearchLng = lon;
          this.initMap(lat, lon);
          this.map?.setView([lat, lon], 12);
          this.findNearbyCenters(lat, lon);
        }
      })
      .catch(err => console.error('Error fetching location:', err));
  }

  useMyLocation(): void {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        this.searchLocation = 'My Location';
        this.currentSearchLat = lat;
        this.currentSearchLng = lng;

        this.initMap(lat, lng);
        this.map?.setView([lat, lng], 12);
        this.findNearbyCenters(lat, lng);
      },
      (error) => {
        console.error('Error getting location', error);
        alert('Unable to retrieve your location');
      }
    );
  }

  findNearbyCenters(lat: number, lng: number): void {
    this.searchPerformed = true;
    this.nearbyCenters = this.allCenters.filter(center => {
      const distance = this.mapService.calculateDistance(lat, lng, center.lat, center.lng);
      return distance <= this.searchRadius;
    }).map(center => ({
      ...center,
      distance: this.mapService.calculateDistance(lat, lng, center.lat, center.lng)
    })).sort((a, b) => a.distance - b.distance);

    this.displayCentersOnMap();
  }

  displayCentersOnMap(): void {
    if (!this.map) return;

    this.nearbyCenters.forEach(center => {
      const marker = L.marker([center.lat, center.lng])
        .addTo(this.map!)
        .bindPopup(`
          <div style="text-align: center;">
            <b>${center.hospital}</b><br>
            ${center.city}<br>
            ${center.distance.toFixed(2)} km away<br>
            <button class="btn-popup" id="btn-${center.hospital.replace(/\s/g, '')}">Request for blood</button>
          </div>
        `);

      marker.on('popupopen', () => {
        const btn = document.getElementById(`btn-${center.hospital.replace(/\s/g, '')}`);
        if (btn) {
          btn.addEventListener('click', () => {
            this.openHospitalDetail(center);
          });
          // Add style manually since style tag might not apply to popup content easily
          btn.style.marginTop = '8px';
          btn.style.backgroundColor = '#667eea';
          btn.style.color = 'white';
          btn.style.border = 'none';
          btn.style.padding = '5px 10px';
          btn.style.borderRadius = '4px';
          btn.style.cursor = 'pointer';
        }
      });

      this.markers.push(marker);
    });

    // Fit bounds
    if (this.nearbyCenters.length > 0) {
      const group = new L.FeatureGroup(this.markers);
      this.map.fitBounds(group.getBounds().pad(0.1));
    }
  }

  openHospitalDetail(center: any): void {
    this.selectedHospital = center;
    this.bloodRequest.hospital = center.hospital;
    this.hospitalInventory = []; // Clear previous data

    // Fetch inventory for this hospital
    this.apiService.getInventory(center.hospital).subscribe({
      next: (data) => {
        this.hospitalInventory = data;
      },
      error: (err) => console.error('Error fetching inventory', err)
    });

    // Force Change Detection/UI Update if needed, but Angular handles this usually
  }

  closeModal(): void {
    this.selectedHospital = null;
    this.hospitalInventory = [];
    this.bloodRequest = {
      patientName: '',
      bloodType: '',
      units: 1,
      hospital: '',
      urgency: 'Medium'
    };
  }

  requestBlood(): void {
    if (!this.bloodRequest.patientName || !this.bloodRequest.bloodType || !this.bloodRequest.units) {
      alert('Please fill in all required fields');
      return;
    }

    this.apiService.createRequest(this.bloodRequest).subscribe({
      next: (res) => {
        alert('Blood request submitted successfully!');
        this.closeModal();
      },
      error: (err) => {
        console.error('Error requesting blood', err);
        // console.log(err.error.message);
        alert(err.error.message || 'Failed to submit request');
      }
    });
  }

  getCurrentLocationForProfile(): void {
    this.mapService.getCurrentLocation().subscribe({
      next: (location: Location) => {
        this.userProfile.address = location.address;
      },
      error: (error) => {
        console.error('Error getting current location:', error);
        alert('Unable to get your current location. Please enter address manually.');
      }
    });
  }
}



