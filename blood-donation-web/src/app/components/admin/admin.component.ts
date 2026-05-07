import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ApiService } from '../../services/api.service';
import { MapService, Location } from '../../services/map.service';

interface Donor {
  id: string; // Changed from number to string for MongoDB _id
  name: string;
  email: string;
  bloodType: string;
  phone: string;
  lastDonation: string;
  status: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  city?: string;
  state?: string;
  zipCode?: string;
}

interface DonationRequest {
  id: string; // Changed from number to string
  patientName: string;
  bloodType: string;
  units: number;
  hospital: string;
  urgency: string;
  status: string;
}

interface Appointment {
  id: string;
  userId: any; // Using any for flexibility with populated data
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

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="dashboard-container">
      <nav class="navbar">
        <div class="container">
          <div class="nav-content">
            <h1 class="logo">🩸 Admin<span>Center</span></h1>
            <div class="nav-links">
              <div class="user-badge">
                <span class="user-name">Welcome, {{ currentUser?.name || 'Administrator' }}</span>
                <span class="user-role">System Master</span>
              </div>
              <button class="btn btn-outline btn-sm" (click)="logout()">Logout</button>
            </div>
          </div>
        </div>
      </nav>

      <div class="container dashboard-body">
        <div class="dashboard-header">
          <div class="header-text">
            <h2>Management Overview</h2>
            <p>Monitor community health, inventory levels, and vital donation requests.</p>
          </div>
          <div class="stats-grid">
            <div class="stat-card premium-card">
              <div class="stat-icon">👥</div>
              <div class="stat-info">
                <span class="stat-value">{{ donors.length }}</span>
                <span class="stat-label">Total Donors</span>
              </div>
            </div>
            <div class="stat-card premium-card">
              <div class="stat-icon">🆘</div>
              <div class="stat-info">
                <span class="stat-value">{{ requests.length }}</span>
                <span class="stat-label">Active Requests</span>
              </div>
            </div>
            <div class="stat-card premium-card">
              <div class="stat-icon">📦</div>
              <div class="stat-info">
                <span class="stat-value">{{ getTotalUnits() }}</span>
                <span class="stat-label">Available Units</span>
              </div>
            </div>
          </div>
        </div>

        <nav class="dashboard-tabs">
          <button class="tab-item" [class.active]="activeTab === 'donors'" (click)="activeTab = 'donors'">
             <i>👨‍👩‍👧‍👦</i> <span>Donors</span>
          </button>
          <button class="tab-item" [class.active]="activeTab === 'requests'" (click)="activeTab = 'requests'">
             <i>🆘</i> <span>Requests</span>
          </button>
          <button class="tab-item" [class.active]="activeTab === 'inventory'" (click)="activeTab = 'inventory'">
             <i>🏬</i> <span>Inventory</span>
          </button>
          <button class="tab-item" [class.active]="activeTab === 'appointments'" (click)="activeTab = 'appointments'">
             <i>🗓️</i> <span>Appointments</span>
          </button>
          <button class="tab-item" [class.active]="activeTab === 'campaigns'" (click)="activeTab = 'campaigns'">
             <i>📢</i> <span>Campaigns</span>
          </button>
        </nav>

        <main class="dashboard-main">
          <!-- Donors Tab -->
          <div *ngIf="activeTab === 'donors'" class="tab-content animate-in">
            <div class="card glass-panel">
               <div class="card-header-flex">
                 <div class="title-set">
                    <h3>Donor Directory</h3>
                    <p>Manage and verify donor profiles within the system.</p>
                 </div>
                 <button class="btn btn-primary" (click)="showAddDonorForm = !showAddDonorForm">
                    {{ showAddDonorForm ? 'Cancel Operation' : '+ Add New Donor' }}
                 </button>
               </div>

               <div *ngIf="showAddDonorForm" class="form-container-boxed glass-panel animate-in">
                  <form (ngSubmit)="addDonor()" class="premium-form">
                    <div class="form-grid">
                      <div class="form-group">
                        <label>Full Name</label>
                        <input type="text" [(ngModel)]="newDonor.name" name="name" class="form-control" required placeholder="John Doe" />
                      </div>
                      <div class="form-group">
                        <label>Email Address</label>
                        <input type="email" [(ngModel)]="newDonor.email" name="email" class="form-control" required placeholder="john@example.com" />
                      </div>
                      <div class="form-group">
                        <label>Blood Type</label>
                        <select [(ngModel)]="newDonor.bloodType" name="bloodType" class="form-control" required>
                          <option value="">Select Type</option>
                          <option *ngFor="let type of ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']" [value]="type">{{ type }}</option>
                        </select>
                      </div>
                      <div class="form-group">
                        <label>Phone Number</label>
                        <input type="tel" [(ngModel)]="newDonor.phone" name="phone" class="form-control" required placeholder="+1 234..." />
                      </div>
                    </div>
                    <div class="form-group">
                      <label>Primary Address / Location</label>
                      <div class="location-group">
                        <input type="text" [(ngModel)]="newDonor.address" name="address" class="form-control" placeholder="Full residential address" />
                        <button type="button" class="btn btn-outline btn-sm" (click)="getCurrentLocation()">📍 Fetch Location</button>
                      </div>
                    </div>
                    <div *ngIf="locationLoading" class="alert-info">Updating geolocation coordinates...</div>
                    <button type="submit" class="btn btn-success" [disabled]="locationLoading">Register Donor Profile</button>
                  </form>
               </div>

               <div class="table-container">
                  <table class="table">
                    <thead>
                      <tr>
                        <th>Identity</th>
                        <th>Profile Details</th>
                        <th>Involvement</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr *ngFor="let donor of donors">
                        <td>
                           <div class="id-badge">#{{ donor.id.slice(-4) }}</div>
                        </td>
                        <td>
                           <div class="donor-profile-info">
                              <span class="donor-name">{{ donor.name }}</span>
                              <span class="donor-meta">{{ donor.email }} | {{ donor.phone }}</span>
                              <span class="donor-blood-badge badge">{{ donor.bloodType }}</span>
                           </div>
                        </td>
                        <td>
                           <div class="involvement-info">
                              <span class="involvement-date">Last: {{ donor.lastDonation }}</span>
                              <span class="status-chip" [class.active]="donor.status === 'Active'">{{ donor.status }}</span>
                           </div>
                        </td>
                        <td>
                           <button class="btn-icon-danger" (click)="deleteDonor(donor.id)">🗑️</button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
               </div>
            </div>
          </div>

          <!-- Requests Tab -->
          <div *ngIf="activeTab === 'requests'" class="tab-content animate-in">
             <div class="card glass-panel">
               <div class="card-header">
                  <h3>Pending Blood Requests</h3>
                  <p>Process and validate emergency requests from hospitals and patients.</p>
               </div>
               <div class="table-container">
                  <table class="table">
                    <thead>
                      <tr>
                        <th>Patient</th>
                        <th>Request Info</th>
                        <th>Level</th>
                        <th>Operation</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr *ngFor="let request of requests">
                        <td>{{ request.patientName }}</td>
                        <td>
                           <div class="req-info">
                              <span class="badge">{{ request.bloodType }}</span>
                              <span>{{ request.units }} Unit(s) &#64; {{ request.hospital }}</span>
                           </div>
                        </td>
                        <td>
                           <span class="urgency-chip" [class.high]="request.urgency === 'High'">{{ request.urgency }} Priority</span>
                        </td>
                        <td class="action-cell">
                           <button class="btn btn-success btn-xs" (click)="approveRequest(request.id)">Approve</button>
                           <button class="btn btn-outline btn-xs" (click)="rejectRequest(request.id)">Decline</button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
               </div>
             </div>
          </div>

          <!-- Inventory Tab -->
          <div *ngIf="activeTab === 'inventory'" class="tab-content animate-in">
             <div class="card glass-panel">
                <div class="card-header-flex">
                   <div class="title-set">
                      <h3>Stock Control</h3>
                      <p>View and update blood unit counts across different facilities.</p>
                   </div>
                   <div class="selector-box">
                      <select [(ngModel)]="selectedInventoryHospital" (change)="loadInventoryForHospital()" class="form-control">
                        <option value="">Choose Hospital...</option>
                        <option *ngFor="let hospital of uniqueHospitals" [value]="hospital">{{ hospital }}</option>
                      </select>
                   </div>
                </div>

                <div *ngIf="!selectedInventoryHospital" class="empty-state">
                   <div class="empty-icon">🏬</div>
                   <p>Please select a specific hospital center to view localized inventory levels.</p>
                </div>

                <div *ngIf="selectedInventoryHospital" class="inventory-display-body">
                   <h4 class="facility-title">Facility: {{ selectedInventoryHospital }}</h4>
                   <div class="inventory-grid">
                      <div class="inventory-card premium-card" *ngFor="let item of inventory">
                         <div class="inv-top">
                            <span class="inv-badge">{{ item.bloodType }}</span>
                            <span class="inv-status-dot" [class.low]="item.units < 10"></span>
                         </div>
                         <div *ngIf="!item.editing" class="inv-view">
                            <h2 class="units-count">{{ item.units }}</h2>
                            <p class="units-label">Available Units</p>
                            <button class="btn-text-action" (click)="editInventoryItem(item)">Update Count</button>
                         </div>
                         <div *ngIf="item.editing" class="inv-edit-form">
                            <input type="number" [(ngModel)]="item.newUnits" class="form-control compact-input" min="0" />
                            <div class="inv-edit-actions">
                               <button class="btn btn-success btn-xs" (click)="saveInventoryItem(item)">Save</button>
                               <button class="btn btn-outline btn-xs" (click)="cancelEditInventory(item)">X</button>
                            </div>
                         </div>
                      </div>
                   </div>
                </div>
             </div>
          </div>

          <!-- Appointments Tab -->
          <div *ngIf="activeTab === 'appointments'" class="tab-content animate-in">
             <div class="card glass-panel">
                <div class="card-header">
                   <h3>Appointment Queue</h3>
                   <p>Manage scheduled donations and confirm successful contributions.</p>
                </div>
                <div *ngIf="appointments.length === 0" class="empty-state">
                   <p>No active appointments found in the queue.</p>
                </div>
                <div class="table-container" *ngIf="appointments.length > 0">
                   <table class="table">
                    <thead>
                      <tr>
                        <th>Donor Details</th>
                        <th>Schedule</th>
                        <th>Location</th>
                        <th>Protocol</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr *ngFor="let appointment of appointments">
                        <td>
                           <div class="apt-donor">
                              <strong>{{ appointment.userId?.name }}</strong>
                              <span class="sub">{{ appointment.userId?.bloodType }} | {{ appointment.userId?.email }}</span>
                           </div>
                        </td>
                        <td>{{ appointment.date }} &#64; {{ appointment.time }}</td>
                        <td>{{ appointment.location.hospital }}, {{ appointment.location.city }}</td>
                        <td>
                           <div class="status-group">
                              <span class="status-chip" [class.pending]="appointment.status === 'Pending'" [class.active]="appointment.status === 'Confirmed' || appointment.status === 'Completed'">{{ appointment.status }}</span>
                              <div class="action-dropdown" *ngIf="appointment.status === 'Pending'">
                                 <button class="btn btn-success btn-xs" (click)="updateAppointmentStatus(appointment.id, 'Confirmed')">Confirm</button>
                                 <button class="btn btn-outline btn-xs" (click)="updateAppointmentStatus(appointment.id, 'Cancelled')">Reject</button>
                              </div>
                              <div class="action-dropdown" *ngIf="appointment.status === 'Confirmed'">
                                 <button class="btn btn-primary btn-xs" (click)="openCompleteModal(appointment)">Mark Completed</button>
                                 <button class="btn btn-outline btn-xs" (click)="updateAppointmentStatus(appointment.id, 'Cancelled')">Cancel</button>
                              </div>
                           </div>
                        </td>
                      </tr>
                    </tbody>
                   </table>
                </div>
             </div>
          </div>

          <!-- Campaigns Tab -->
          <div *ngIf="activeTab === 'campaigns'" class="tab-content animate-in">
             <div class="card glass-panel">
                <div class="card-header-flex">
                   <div class="title-set">
                      <h3>Public Campaigns</h3>
                      <p>Create and announce community outreach donation drives.</p>
                   </div>
                   <button class="btn btn-primary" (click)="showAddCampaignForm = !showAddCampaignForm">
                      {{ showAddCampaignForm ? 'Cancel Campaign' : '📢 Start Campaign' }}
                   </button>
                </div>

                <div *ngIf="showAddCampaignForm" class="form-container-boxed glass-panel animate-in">
                   <form (ngSubmit)="submitCampaign()" class="premium-form">
                      <div class="form-group">
                        <label>Campaign Title</label>
                        <input type="text" [(ngModel)]="newCampaign.title" name="title" class="form-control" placeholder="Annual Blood Drive 2024" required />
                      </div>
                      <div class="form-group">
                        <label>Engagement Description</label>
                        <textarea [(ngModel)]="newCampaign.description" name="description" class="form-control" rows="3" placeholder="Tell the community why this matters..." required></textarea>
                      </div>
                      <div class="form-grid">
                        <div class="form-group">
                          <label>Event Location Name</label>
                          <input type="text" [(ngModel)]="newCampaign.location" name="location" class="form-control" placeholder="Central Plaza" required />
                        </div>
                        <div class="form-group">
                          <label>Full Event Address</label>
                          <input type="text" [(ngModel)]="newCampaign.address" name="address" class="form-control" placeholder="Street, Mall, etc." required />
                        </div>
                      </div>
                      <button type="submit" class="btn btn-success">Launch & Notify Global Network</button>
                   </form>
                </div>

                <div *ngIf="campaigns.length === 0" class="empty-state">
                   <p>No active campaigns scheduled at this time.</p>
                </div>

                <div class="campaign-grid" *ngIf="campaigns.length > 0">
                   <div class="campaign-card glass-panel" *ngFor="let campaign of campaigns">
                      <div class="camp-meta-top">
                         <span class="camp-date">🗓️ {{ campaign.createdAt | date }}</span>
                         <span class="camp-tag">Live</span>
                      </div>
                      <h4>{{ campaign.title }}</h4>
                      <p class="camp-desc">{{ campaign.description }}</p>
                      <div class="camp-loc">
                         <span>📍 {{ campaign.location }}</span>
                         <span class="sub-addr">{{ campaign.address }}</span>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </main>
      </div>

       <!-- Complete Appointment Modal -->
       <div class="modal-backdrop" *ngIf="showCompleteModal">
          <div class="modal-card glass-panel">
             <div class="modal-top">
                <h3>Log Batch Donation</h3>
                <button class="close-trigger" (click)="closeCompleteModal()">×</button>
             </div>
             <div class="modal-body-content">
                <div class="donor-summary-box">
                   <span class="summary-label">Donor</span>
                   <h5>{{ selectedAppointment?.userId?.name }} ({{ selectedAppointment?.userId?.bloodType }})</h5>
                   <p>Scheduled: {{ selectedAppointment?.date }} at {{ selectedAppointment?.time }}</p>
                </div>
                
                <div class="form-group margin-top">
                  <label>Confirmed Volume (Units Donated) *</label>
                  <input 
                    type="number" 
                    [(ngModel)]="unitsDonated" 
                    name="unitsDonated" 
                    class="form-control big-input" 
                    min="1" 
                    max="10"
                    required
                  />
                  <small class="form-help">Standard: 1 unit per whole blood donation.</small>
                </div>
                
                <div class="modal-action-row">
                  <button class="btn btn-outline" (click)="closeCompleteModal()">Abandone</button>
                  <button class="btn btn-success" (click)="confirmComplete()" [disabled]="!unitsDonated || unitsDonated <= 0">Finalize & Update Inventory</button>
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
    }

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
    .stat-value { font-size: 24px; font-weight: 800; color: var(--text-main); }
    .stat-label { font-size: 12px; color: var(--text-muted); font-weight: 600; }

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

    /* Cards */
    .card { padding: 40px; border-radius: 32px; }
    .card-header-flex { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; gap: 20px; }
    .card-header { margin-bottom: 30px; }
    .title-set h3 { font-size: 24px; font-weight: 800; margin-bottom: 8px; }
    .title-set p { color: var(--text-muted); font-size: 14px; }

    .form-container-boxed { background: rgba(255, 255, 255, 0.5); padding: 30px; border-radius: 20px; margin-bottom: 30px; }
    .premium-form .form-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-bottom: 20px; }
    .location-group { position: relative; }
    .location-group .btn-sm { position: absolute; right: 10px; top: 50%; transform: translateY(-50%); }

    /* Tables Improvement */
    .table-container { overflow-x: auto; }
    .id-badge { font-size: 11px; font-weight: 700; color: var(--text-muted); background: #F1FAEE; padding: 4px 8px; border-radius: 6px; }
    .donor-profile-info { display: flex; flex-direction: column; gap: 4px; }
    .donor-name { font-weight: 700; font-size: 15px; }
    .donor-meta { font-size: 12px; color: var(--text-muted); }
    .involvement-info { display: flex; flex-direction: column; gap: 6px; }
    .involvement-date { font-size: 13px; color: var(--text-muted); }

    .status-chip { 
      padding: 4px 10px; 
      border-radius: 50px; 
      font-size: 10px; 
      font-weight: 700; 
      text-transform: uppercase; 
      background: #DFE3E8; 
      color: #637381; 
      width: fit-content;
    }
    .status-chip.active { background: #E8F5E9; color: #2E7D32; }
    .status-chip.pending { background: #FFF3E0; color: #E65100; }

    .urgency-chip {
      padding: 4px 10px;
      border-radius: 50px;
      font-size: 11px;
      font-weight: 700;
      background: #E3F2FD;
      color: #1976D2;
    }
    .urgency-chip.high { background: #FFEBEE; color: #C62828; }

    .btn-icon-danger { background: none; border: none; cursor: pointer; font-size: 18px; filter: grayscale(1); transition: 0.3s; }
    .btn-icon-danger:hover { filter: grayscale(0); transform: scale(1.2); }

    .btn-xs { padding: 6px 14px; font-size: 12px; font-weight: 700; }
    .action-cell { display: flex; gap: 8px; }

    /* Inventory */
    .facility-title { font-size: 18px; font-weight: 700; margin-bottom: 24px; color: var(--text-main); }
    .inventory-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 16px; }
    .inventory-card { flex-direction: column; padding: 24px; align-items: center; justify-content: center; position: relative; transition: 0.3s; }
    .inventory-card:hover { transform: translateY(-4px); }
    .inv-top { position: absolute; top: 12px; left: 0; right: 0; padding: 0 16px; display: flex; justify-content: space-between; align-items: center; }
    .inv-badge { font-weight: 900; color: var(--text-main); font-size: 13px; }
    .inv-status-dot { width: 8px; height: 8px; border-radius: 50%; background: #28a745; }
    .inv-status-dot.low { background: var(--accent-color); box-shadow: 0 0 8px var(--accent-color); }
    .units-count { font-size: 48px; font-weight: 800; margin: 10px 0 0 0; color: var(--text-main); letter-spacing: -2px; }
    .units-label { font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--text-muted); margin-bottom: 12px; }
    .btn-text-action { background: none; border: none; color: var(--accent-color); font-weight: 700; font-size: 12px; cursor: pointer; }

    .compact-input { padding: 8px; font-size: 18px; font-weight: 700; text-align: center; margin-bottom: 10px; }
    .inv-edit-actions { display: flex; gap: 4px; }

    /* Appointments */
    .apt-donor { display: flex; flex-direction: column; gap: 4px; }
    .apt-donor .sub { font-size: 12px; color: var(--text-muted); }
    .status-group { display: flex; flex-direction: column; gap: 8px; align-items: flex-start; }
    .action-dropdown { display: flex; gap: 4px; }

    /* Campaigns */
    .campaign-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }
    .campaign-card { padding: 30px; border-radius: 24px; }
    .camp-meta-top { display: flex; justify-content: space-between; margin-bottom: 16px; align-items: center; }
    .camp-date { font-size: 12px; font-weight: 600; color: var(--text-muted); }
    .camp-tag { background: #FFEBEE; color: #C62828; font-size: 10px; font-weight: 800; padding: 2px 8px; border-radius: 4px; text-transform: uppercase; }
    .campaign-card h4 { font-size: 18px; font-weight: 800; margin-bottom: 12px; }
    .camp-desc { font-size: 14px; color: var(--text-muted); margin-bottom: 20px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
    .camp-loc { display: flex; flex-direction: column; gap: 4px; font-size: 13px; font-weight: 700; }
    .sub-addr { font-size: 11px; font-weight: 500; color: var(--text-muted); }

    /* Modal Context */
    .modal-backdrop { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.4); backdrop-filter: blur(8px); display: flex; justify-content: center; align-items: center; z-index: 2000; }
    .modal-card { width: 450px; padding: 40px; }
    .donor-summary-box { background: #F1FAEE; padding: 20px; border-radius: 16px; }
    .summary-label { font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--text-muted); margin-bottom: 8px; display: block; }
    .big-input { font-size: 24px; font-weight: 800; padding: 16px; text-align: center; }
    .modal-action-row { display: flex; gap: 12px; margin-top: 30px; }
    .modal-action-row button { flex: 1; }

    .empty-state { text-align: center; padding: 60px; color: var(--text-muted); }
    .empty-icon { font-size: 64px; margin-bottom: 20px; filter: grayscale(1); }

    @media (max-width: 992px) {
      .dashboard-header { flex-direction: column; align-items: flex-start; }
      .stats-grid { width: 100%; }
    }

    @media (max-width: 768px) {
      .premium-form .form-grid { grid-template-columns: 1fr; }
      .dashboard-tabs { width: 100%; overflow-x: auto; }
      .stats-grid { flex-direction: column; }
    }
  `]
})
export class AdminComponent implements OnInit {
  currentUser: any;
  activeTab: string = 'donors';
  showAddDonorForm: boolean = false;
  donors: Donor[] = [];
  requests: DonationRequest[] = [];
  inventory: any[] = [];
  appointments: Appointment[] = [];

  newDonor = {
    name: '',
    email: '',
    bloodType: '',
    phone: '',
    address: ''
  };
  locationLoading: boolean = false;
  showCompleteModal: boolean = false;
  selectedAppointment: any = null;
  unitsDonated: number = 1;
  selectedInventoryHospital: string = '';
  uniqueHospitals: string[] = [];

  campaigns: any[] = [];
  showAddCampaignForm: boolean = false;
  newCampaign = {
    title: '',
    description: '',
    location: '',
    address: ''
  };

  constructor(
    private authService: AuthService,
    private apiService: ApiService,
    private router: Router,
    private mapService: MapService
  ) { }

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    if (!user || user.role !== 'admin') {
      this.router.navigate(['/login']);
      return;
    }
    this.currentUser = user;
    this.loadData();
    this.loadCampaigns();
  }

  loadData(): void {
    // Fetch Donors
    this.apiService.getDonors().subscribe({
      next: (data) => {
        this.donors = data.map(d => ({
          id: d._id,
          name: d.name,
          email: d.email,
          bloodType: d.bloodType,
          phone: d.phone,
          address: d.address,
          lastDonation: d.lastDonation ? new Date(d.lastDonation).toLocaleDateString() : 'Never',
          status: d.status,
          latitude: d.latitude,
          longitude: d.longitude
        }));
      },
      error: (err) => console.error('Error loading donors', err)
    });

    // Fetch Requests
    this.apiService.getRequests().subscribe({
      next: (data) => {
        this.requests = data.map(r => ({
          id: r._id,
          patientName: r.patientName,
          bloodType: r.bloodType,
          units: r.units,
          hospital: r.hospital,
          urgency: r.urgency,
          status: r.status
        }));
      },
      error: (err) => console.error('Error loading requests', err)
    });

    // Fetch Inventory - Don't auto-load, wait for hospital selection
    this.inventory = [];

    // Build unique hospitals list from Karnataka locations
    this.buildUniqueHospitalsList();

    // Fetch Appointments
    this.apiService.getAllAppointments().subscribe({
      next: (data) => {
        this.appointments = data.map(app => ({
          id: app._id,
          userId: app.userId, // Populated from backend
          date: new Date(app.date).toLocaleDateString(),
          time: app.time,
          location: app.location,
          status: app.status
        }));
      },
      error: (err) => console.error('Error loading appointments', err)
    });
  }

  addDonor(): void {
    if (!this.newDonor.name || !this.newDonor.email || !this.newDonor.bloodType || !this.newDonor.phone) {
      return;
    }

    // Geocode address if provided
    if (this.newDonor.address) {
      this.locationLoading = true;
      this.mapService.geocodeAddress(this.newDonor.address).subscribe({
        next: (location: Location) => {
          this.submitDonor({
            ...this.newDonor,
            latitude: location.latitude,
            longitude: location.longitude,
            city: location.city,
            state: location.state,
            zipCode: location.zipCode
          });
          this.locationLoading = false;
        },
        error: (error) => {
          console.error('Geocoding error:', error);
          this.submitDonor(this.newDonor);
          this.locationLoading = false;
        }
      });
    } else {
      this.submitDonor(this.newDonor);
    }
  }

  submitDonor(donorData: any): void {
    this.apiService.addDonor(donorData).subscribe({
      next: (res) => {
        this.donors.push({
          id: res._id,
          name: res.name,
          email: res.email,
          bloodType: res.bloodType,
          phone: res.phone,
          address: res.address,
          lastDonation: 'Never',
          status: res.status,
          latitude: res.latitude,
          longitude: res.longitude
        });
        this.resetDonorForm();
        alert('Donor added successfully');
      },
      error: (err) => {
        console.error('Error adding donor', err);
        alert(err.error?.message || 'Failed to add donor');
      }
    });
  }

  resetDonorForm(): void {
    this.newDonor = { name: '', email: '', bloodType: '', phone: '', address: '' };
    this.showAddDonorForm = false;
  }

  getCurrentLocation(): void {
    this.locationLoading = true;
    this.mapService.getCurrentLocation().subscribe({
      next: (location: Location) => {
        this.newDonor.address = location.address;
        this.locationLoading = false;
      },
      error: (error) => {
        console.error('Error getting current location:', error);
        alert('Unable to get your current location. Please enter address manually.');
        this.locationLoading = false;
      }
    });
  }

  deleteDonor(id: any): void {
    if (confirm('Are you sure you want to delete this donor?')) {
      this.apiService.deleteDonor(id).subscribe({
        next: () => {
          this.donors = this.donors.filter(d => d.id !== id);
          alert('Donor deleted successfully');
        },
        error: (err) => {
          console.error('Error deleting donor', err);
          alert('Failed to delete donor');
        }
      });
    }
  }

  approveRequest(id: any): void {
    this.apiService.updateRequestStatus(id, 'Approved').subscribe({
      next: () => {
        const request = this.requests.find(r => r.id === id);
        if (request) {
          request.status = 'Approved';
          alert(`Request approved. Inventory updated.`);

          // Refresh inventory if we are on the inventory tab and the hospital matches
          if (this.activeTab === 'inventory' || this.selectedInventoryHospital === request.hospital) {
            this.loadInventoryForHospital();
          }
          this.loadData();
        }
      },
      error: (err) => {
        console.error('Error approving request', err);
        alert(err.error?.message || 'Failed to approve request. Please check inventory stock.');
      }
    });
  }

  rejectRequest(id: any): void {
    if (confirm('Are you sure you want to reject this request?')) {
      this.apiService.updateRequestStatus(id, 'Rejected').subscribe({
        next: () => {
          this.requests = this.requests.filter(r => r.id !== id);
        },
        error: (err) => {
          console.error('Error rejecting request', err);
          alert('Failed to reject request');
        }
      });
    }
  }

  getTotalUnits(): number {
    return this.inventory.reduce((sum, item) => sum + item.units, 0);
  }

  updateAppointmentStatus(id: string, status: string): void {
    if (status === 'Rejected' || status === 'Cancelled') {
      if (!confirm(`Are you sure you want to change status to ${status}?`)) {
        return;
      }
    }

    this.apiService.updateAppointmentStatus(id, status).subscribe({
      next: (updatedApp) => {
        const index = this.appointments.findIndex(a => a.id === id);
        if (index !== -1) {
          this.appointments[index].status = status;
        }
        alert(`Appointment ${status.toLowerCase()} successfully`);
      },
      error: (err) => {
        console.error('Error updating appointment status', err);
        alert(err.error?.message || 'Failed to update appointment status');
      }
    });
  }

  openCompleteModal(appointment: any): void {
    this.selectedAppointment = appointment;
    this.unitsDonated = 1; // Default value
    this.showCompleteModal = true;
  }

  closeCompleteModal(): void {
    this.showCompleteModal = false;
    this.selectedAppointment = null;
    this.unitsDonated = 1;
  }

  confirmComplete(): void {
    if (!this.selectedAppointment || !this.unitsDonated || this.unitsDonated <= 0) {
      alert('Please enter a valid number of units donated');
      return;
    }

    this.apiService.updateAppointmentStatus(
      this.selectedAppointment.id,
      'Completed',
      this.unitsDonated,
      this.selectedAppointment.location.hospital
    ).subscribe({
      next: (updatedApp) => {
        const index = this.appointments.findIndex(a => a.id === this.selectedAppointment.id);
        if (index !== -1) {
          this.appointments[index].status = 'Completed';
        }
        alert(`Appointment completed successfully! ${this.unitsDonated} unit(s) recorded.`);
        this.closeCompleteModal();

        // Refresh inventory and stats
        if (this.selectedInventoryHospital === this.selectedAppointment.location.hospital) {
          this.loadInventoryForHospital();
        }
        this.loadData();
      },
      error: (err) => {
        console.error('Error completing appointment', err);
        alert(err.error?.message || 'Failed to complete appointment');
      }
    });
  }

  buildUniqueHospitalsList(): void {
    // Fetch unique hospitals from appointments API
    this.apiService.getUniqueHospitals().subscribe({
      next: (hospitals) => {
        this.uniqueHospitals = hospitals;
        if (this.uniqueHospitals.length === 0) {
          console.warn('No hospitals found in appointments. Please create some appointments first.');
        }
      },
      error: (err) => {
        console.error('Error fetching hospitals', err);
        // Fallback to empty array
        this.uniqueHospitals = [];
      }
    });
  }

  loadInventoryForHospital(): void {
    if (!this.selectedInventoryHospital) {
      this.inventory = [];
      return;
    }

    this.apiService.getInventory(this.selectedInventoryHospital).subscribe({
      next: (data) => {
        if (data.length === 0) {
          // Initialize inventory for this hospital
          this.apiService.initializeInventory(this.selectedInventoryHospital).subscribe({
            next: (initData) => {
              this.inventory = initData.map(item => ({ ...item, editing: false, newUnits: item.units }));
            },
            error: (err) => {
              console.error('Error initializing inventory', err);
              alert('Failed to initialize inventory for this hospital');
            }
          });
        } else {
          this.inventory = data.map(item => ({ ...item, editing: false, newUnits: item.units }));
        }
      },
      error: (err) => {
        console.error('Error loading inventory', err);
        alert('Failed to load inventory');
      }
    });
  }

  editInventoryItem(item: any): void {
    item.editing = true;
    item.newUnits = item.units;
  }

  cancelEditInventory(item: any): void {
    item.editing = false;
    item.newUnits = item.units;
  }

  saveInventoryItem(item: any): void {
    if (item.newUnits < 0) {
      alert('Units cannot be negative');
      return;
    }

    this.apiService.updateInventory(item.bloodType, item.newUnits, this.selectedInventoryHospital).subscribe({
      next: (updatedItem) => {
        item.units = item.newUnits;
        item.editing = false;
        alert('Inventory updated successfully');
      },
      error: (err) => {
        console.error('Error updating inventory', err);
        alert(err.error?.message || 'Failed to update inventory');
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  loadCampaigns(): void {
    this.apiService.getCampaigns().subscribe({
      next: (data) => {
        this.campaigns = data;
      },
      error: (err) => console.error('Error loading campaigns', err)
    });
  }

  submitCampaign(): void {
    if (!this.newCampaign.title || !this.newCampaign.description || !this.newCampaign.location || !this.newCampaign.address) {
      alert('Please fill in all fields');
      return;
    }

    this.apiService.createCampaign(this.newCampaign).subscribe({
      next: (res) => {
        this.campaigns.unshift(res);
        this.newCampaign = { title: '', description: '', location: '', address: '' };
        this.showAddCampaignForm = false;
        alert('Campaign created successfully! Emails and notifications sent to all users.');
      },
      error: (err) => {
        console.error('Error creating campaign', err);
        alert('Failed to create campaign');
      }
    });
  }
}


