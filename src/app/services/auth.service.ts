import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';


@Injectable({
  providedIn: 'root'
})

export class AuthService {
  constructor(private http: HttpClient, private router: Router) {}

  private registerUrl = `${environment.apiUrl}/auth/signin`;

  // Fonction pour se connecter

//   signIn(userDto: SignInCredentials): Observable<AuthResponse> {
//     const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
//     return this.http.post<AuthResponse>(this.registerUrl, userDto);
//   }

  // Fonction pour décoder le JWT et extraire les données
  public decodeJWT(token: any) {
    try {
      const payloadBase64 = token.split(".")[1];
      const decodedPayload = atob(payloadBase64);
      return JSON.parse(decodedPayload);
    } catch (error) {
      console.error("Erreur lors du décodage du JWT :", error);
      return null;
    }
  }

}