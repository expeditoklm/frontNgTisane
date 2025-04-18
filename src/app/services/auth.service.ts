import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap, BehaviorSubject } from 'rxjs';
import { SignInCredentials } from '../models/signInCredentials.model';
import { AuthResponse } from '../models/authResponse.model';
import { environment } from '../environments/environment';



@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  
  private tokenKey = 'auth_token';
  private userKey = 'auth_user';

  constructor(private http: HttpClient, private router: Router) {
    // Charger l'utilisateur connecté du localStorage au démarrage
    this.loadCurrentUser();
  }

  private loadCurrentUser(): void {
    const token = localStorage.getItem(this.tokenKey);
    const user = localStorage.getItem(this.userKey);
    
    if (token && user) {
      try {
        this.currentUserSubject.next(JSON.parse(user));
      } catch (error) {
        console.error('Erreur lors du chargement des données utilisateur', error);
        this.logout();
      }
    }
  }

  signIn(credentials: SignInCredentials): Observable<AuthResponse> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/signin`, credentials, { headers })
      .pipe(
        tap((response: AuthResponse) => {
          this.setSession(response);
        })
      );
  }

  private setSession(authResult: AuthResponse): void {
    localStorage.setItem(this.tokenKey, authResult.tohen!);
    localStorage.setItem(this.userKey, JSON.stringify(authResult.user));
    this.currentUserSubject.next(authResult.user);
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    if (!token) return false;
    
    const payload = this.decodeJWT(token);
    const currentTime = Math.floor(Date.now() / 1000);
    
    return payload && payload.exp > currentTime;
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  public decodeJWT(token: string): any {
    try {
      const payloadBase64 = token.split('.')[1];
      const decodedPayload = atob(payloadBase64);
      return JSON.parse(decodedPayload);
    } catch (error) {
      console.error('Erreur lors du décodage du JWT :', error);
      return null;
    }
  }

  getUserRole(): string | null {
    const user = this.currentUserSubject.value;
    return user ? user.role : null;
  }
}