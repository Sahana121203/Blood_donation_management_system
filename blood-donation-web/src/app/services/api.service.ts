import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface User {
    id?: string;
    name: string;
    email: string;
    role: 'user' | 'admin';
    bloodType?: string;
    phone?: string;
    address?: string;
    latitude?: number;
    longitude?: number;
}

export interface LoginResponse {
    token: string;
    user: User;
}

@Injectable({
    providedIn: 'root'
})
export class ApiService {
    private apiUrl = environment.apiUrl;
    private currentUserSubject = new BehaviorSubject<User | null>(null);
    public currentUser$ = this.currentUserSubject.asObservable();

    constructor(private http: HttpClient) {
        // Check if user is logged in and restore from localStorage
        const token = this.getToken();
        const storedUser = this.getStoredUser();
        if (token && storedUser) {
            this.currentUserSubject.next(storedUser);
        }
    }

    private getHeaders(): HttpHeaders {
        const token = this.getToken();
        return new HttpHeaders({
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : ''
        });
    }

    private getToken(): string | null {
        return localStorage.getItem('token');
    }

    private setToken(token: string): void {
        localStorage.setItem('token', token);
    }

    private removeToken(): void {
        localStorage.removeItem('token');
    }

    private getStoredUser(): User | null {
        const userJson = localStorage.getItem('currentUser');
        if (userJson) {
            try {
                return JSON.parse(userJson);
            } catch (e) {
                return null;
            }
        }
        return null;
    }

    private setStoredUser(user: User): void {
        localStorage.setItem('currentUser', JSON.stringify(user));
    }

    private removeStoredUser(): void {
        localStorage.removeItem('currentUser');
    }

    // Authentication
    login(email: string, password: string, role: 'user' | 'admin'): Observable<LoginResponse> {
        return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, { email, password, role })
            .pipe(
                tap(response => {
                    this.setToken(response.token);
                    this.setStoredUser(response.user);
                    this.currentUserSubject.next(response.user);
                })
            );
    }

    register(userData: any): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/auth/register`, userData);
    }

    verifyOtp(email: string, otp: string): Observable<LoginResponse> {
        return this.http.post<LoginResponse>(`${this.apiUrl}/auth/verify-otp`, { email, otp })
            .pipe(
                tap(response => {
                    this.setToken(response.token);
                    this.setStoredUser(response.user);
                    this.currentUserSubject.next(response.user);
                })
            );
    }

    resendOtp(email: string): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/auth/resend-otp`, { email });
    }

    loadCurrentUser(): void {
        // Load user from localStorage instead of making API call
        const storedUser = this.getStoredUser();
        if (storedUser) {
            this.currentUserSubject.next(storedUser);
        } else {
            this.logout();
        }
    }

    logout(): void {
        this.removeToken();
        this.removeStoredUser();
        this.currentUserSubject.next(null);
    }

    getCurrentUser(): User | null {
        return this.currentUserSubject.value;
    }

    updateProfile(userData: any): Observable<User> {
        return this.http.put<User>(`${this.apiUrl}/auth/profile`, userData, { headers: this.getHeaders() })
            .pipe(
                tap(user => {
                    this.setStoredUser(user);
                    this.currentUserSubject.next(user);
                })
            );
    }

    // Donors
    getDonors(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/donors`, { headers: this.getHeaders() });
    }

    addDonor(donor: any): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/donors`, donor, { headers: this.getHeaders() });
    }

    updateDonor(id: string, donor: any): Observable<any> {
        return this.http.put<any>(`${this.apiUrl}/donors/${id}`, donor, { headers: this.getHeaders() });
    }

    deleteDonor(id: string): Observable<any> {
        return this.http.delete<any>(`${this.apiUrl}/donors/${id}`, { headers: this.getHeaders() });
    }

    searchDonors(params: any): Observable<any[]> {
        const queryParams = new URLSearchParams(params).toString();
        return this.http.get<any[]>(`${this.apiUrl}/donors/search/location?${queryParams}`, { headers: this.getHeaders() });
    }

    // Appointments
    getAppointments(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/appointments`, { headers: this.getHeaders() });
    }

    getAllAppointments(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/appointments/all`, { headers: this.getHeaders() });
    }

    scheduleAppointment(appointment: any): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/appointments`, appointment, { headers: this.getHeaders() });
    }

    cancelAppointment(id: string): Observable<any> {
        return this.http.delete<any>(`${this.apiUrl}/appointments/${id}`, { headers: this.getHeaders() });
    }

    updateAppointmentStatus(id: string, status: string, unitsDonated?: number, hospital?: string): Observable<any> {
        const body: any = { status };
        if (unitsDonated !== undefined) body.unitsDonated = unitsDonated;
        if (hospital !== undefined) body.hospital = hospital;

        return this.http.put<any>(`${this.apiUrl}/appointments/${id}`, body, { headers: this.getHeaders() });
    }

    getUniqueHospitals(): Observable<string[]> {
        return this.http.get<string[]>(`${this.apiUrl}/appointments/hospitals`, { headers: this.getHeaders() });
    }

    // Donation History
    getDonationHistory(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/donations`, { headers: this.getHeaders() });
    }

    getAllDonations(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/donations/all`, { headers: this.getHeaders() });
    }

    addDonation(donation: any): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/donations`, donation, { headers: this.getHeaders() });
    }

    // Donation Requests
    getRequests(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/requests`, { headers: this.getHeaders() });
    }

    createRequest(request: any): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/requests`, request, { headers: this.getHeaders() });
    }

    updateRequestStatus(id: string, status: string): Observable<any> {
        return this.http.put<any>(`${this.apiUrl}/requests/${id}`, { status }, { headers: this.getHeaders() });
    }

    deleteRequest(id: string): Observable<any> {
        return this.http.delete<any>(`${this.apiUrl}/requests/${id}`, { headers: this.getHeaders() });
    }

    // Inventory
    getInventory(hospital?: string): Observable<any[]> {
        let url = `${this.apiUrl}/inventory`;
        if (hospital) {
            url += `?hospital=${encodeURIComponent(hospital)}`;
        }
        return this.http.get<any[]>(url, { headers: this.getHeaders() });
    }

    updateInventory(bloodType: string, units: number, hospital: string): Observable<any> {
        return this.http.put<any>(`${this.apiUrl}/inventory/${bloodType}`, { units, hospital }, { headers: this.getHeaders() });
    }

    initializeInventory(hospital: string): Observable<any[]> {
        return this.http.post<any[]>(`${this.apiUrl}/inventory/initialize`, { hospital }, { headers: this.getHeaders() });
    }

    // Campaigns
    getCampaigns(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/campaigns`, { headers: this.getHeaders() });
    }

    createCampaign(campaign: any): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/campaigns`, campaign, { headers: this.getHeaders() });
    }

    // Notifications
    getNotifications(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/notifications`, { headers: this.getHeaders() });
    }
}
