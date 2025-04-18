import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const loggerInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  
  // Récupérer le token d'authentification
  const token = authService.getToken();
  
  if (token) {
    // Vérifier si le token est expiré
    const payload = authService.decodeJWT(token);
    const currentTime = Math.floor(Date.now() / 1000);

    if (payload && payload.exp <= currentTime) {
      // Token expiré, déconnecter l'utilisateur
      authService.logout();
      return next(req);
    }

    // Ajouter le header Authorization avec le token
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Gérer les erreurs d'authentification (401)
      if (error.status === 401) {
        authService.logout();
      }
      
      // Gérer les erreurs d'accès non autorisé (403)
      if (error.status === 403) {
        router.navigate(['/notfound']); // Rediriger vers une page d'erreur appropriée
      }
      
      return throwError(() => error);
    })
  );
};