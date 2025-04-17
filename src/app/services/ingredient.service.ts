import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { Ingredient } from '../models';

@Injectable({
  providedIn: 'root'
})
export class IngredientService {
  private baseUrl = `${environment.apiUrl}`;
  private headers = new HttpHeaders().set('Content-Type', 'application/json');

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${token}`);
  }

  // Récupérer tous les ingrédients
  getAllIngredients(): Observable<Ingredient[]> {
    return this.http.get<Ingredient[]>(`${this.baseUrl}/ingredients`, {
      headers: this.getAuthHeaders()
    });
  }

  // Récupérer un ingrédient par ID
  getIngredientById(id: string): Observable<Ingredient> {
    return this.http.get<Ingredient>(`${this.baseUrl}/ingredients/${id}`, {
      headers: this.getAuthHeaders(),
      params: { includePhotos: 'true' } // Pour indiquer au back-end d'inclure les photos
    });
  }

  // Créer un nouvel ingrédient avec des images
  createIngredient(ingredientData: any): Observable<Ingredient> {
    return this.http.post<Ingredient>(`${this.baseUrl}/ingredients`, ingredientData, {
      headers: this.getAuthHeaders()
    });
  }

  // Mettre à jour un ingrédient avec des images
  updateIngredient(id: string, ingredientData: any): Observable<Ingredient> {
    return this.http.patch<Ingredient>(`${this.baseUrl}/ingredients/${id}`, ingredientData, {
      headers: this.getAuthHeaders()
    });
  }

  // Supprimer un ingrédient
  deleteIngredient(id: string): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/ingredients/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  // Récupérer tous les ingrédients de remèdes
  getAllIngredientsRemedies(): Observable<any> {
    return this.http.get(`${this.baseUrl}/remedy-ingredients`, {
      headers: this.getAuthHeaders()
    });
  }
}