// src/app/_guards/auth-guard.service.ts
import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    // Vérifiez si l'utilisateur est connecté (par exemple, en vérifiant la présence d'un token)
    const token = localStorage.getItem('auth_token');
    
    if (token) {
      // L'utilisateur est connecté, autorisez l'accès
      return true;
    }

    // L'utilisateur n'est pas connecté, redirigez vers la page de connexion
    this.router.navigate(['/login']);
    return false;
  }
}

@Injectable({
  providedIn: 'root'
})
export class GuestGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(): boolean {
    // Vérifiez si l'utilisateur est déjà connecté
    const token = localStorage.getItem('auth_token');
    
    if (!token) {
      // L'utilisateur n'est pas connecté, autorisez l'accès à la page de connexion
      return true;
    }

    // L'utilisateur est déjà connecté, redirigez vers l'application principale
    this.router.navigate(['/app/home']);
    return false;
  }
}