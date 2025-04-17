import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { AuthService } from '../services/auth.service'; // Importation du service d'authentification

export const loggerInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router); // Injection du routeur
  const authService = inject(AuthService); // Injection du service de login
//   const token = localStorage.getItem('user_session_token'); // Récupérer le token
  const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiZW1haWwiOiJva2xtQGdtYWlsLmNvbSIsImlhdCI6MTc0NDkwMDkxMywiZXhwIjoxNzQ0OTg3MzEzfQ.naS-x4SfmBh6k_QLyTnDIqYLW9GpXE7XMStI3ltq9A4' // Récupérer le token
  // console.log('Token récupéré :', token); // Afficher le token dans la console

  // Vérification de l'expiration du token
  if (token) {
    const payload = authService.decodeJWT(token);
    const currentTime = Math.floor(Date.now() / 1000); // Temps actuel en secondes

    if (payload && payload.exp <= currentTime) {
      localStorage.removeItem('user_session_token'); // Supprimer le token expiré
      router.navigate(['/login']); // Rediriger vers la page de connexion
      return next(req); // Stopper la requête ici si nécessaire
    }

    // Ajouter le header Authorization
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  return next(req).pipe(
    tap({
      error: (err:any) => {
        if (err.status === 401) {
          localStorage.removeItem('user_session_token'); // Supprimer le token
          router.navigate(['/login']); // Rediriger vers la page de connexion
        }
      },
    })
  );
};