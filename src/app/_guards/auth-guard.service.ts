import { Injectable, inject } from '@angular/core';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardService {
  constructor(private router: Router, private authService: AuthService) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (this.authService.isLoggedIn()) {
      // L'utilisateur est connecté
      
      // Si un rôle est requis pour cette route
      if (route.data['roles'] && route.data['roles'].length) {
        const userRole = this.authService.getUserRole();
        
        // Vérifier si l'utilisateur a le rôle requis
        if (userRole && route.data['roles'].includes(userRole)) {
          return true;
        } else {
          // L'utilisateur n'a pas le rôle requis
          this.router.navigate(['/notfound']);
          return false;
        }
      }
      
      // Pas de rôle requis, l'utilisateur est authentifié
      return true;
    }
    
    // L'utilisateur n'est pas connecté, rediriger vers la page de connexion
    this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }
}

@Injectable({
  providedIn: 'root'
})
export class GuestGuardService {
  constructor(private router: Router, private authService: AuthService) {}
  
  canActivate(): boolean {
    // Vérifier si l'utilisateur est déjà connecté
    if (!this.authService.isLoggedIn()) {
      // L'utilisateur n'est pas connecté, autorise l'accès aux pages d'authentification
      return true;
    }
    
    // L'utilisateur est déjà connecté, rediriger vers l'app principale
    this.router.navigate(['/']);
    return false;
  }
}

// Utiliser les fonctions CanActivate pour les routes
export const AuthGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean => {
  return inject(AuthGuardService).canActivate(route, state);
};

export const GuestGuard: CanActivateFn = (): boolean => {
  return inject(GuestGuardService).canActivate();
};