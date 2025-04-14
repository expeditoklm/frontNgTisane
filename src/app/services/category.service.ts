import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';
import { Category } from '../models/category.model';


@Injectable({
    providedIn: 'root'
  })
@Injectable()
export class CategoryService {
 private baseUrl = `${environment.apiUrl}`;
    private headers = new HttpHeaders().set('Content-Type', 'application/json');
  

    constructor(
        private http: HttpClient,
        private router: Router
      ) { }


 getAuthHeaders(): HttpHeaders {
        const token = localStorage.getItem('token');
        return new HttpHeaders()
          .set('Content-Type', 'application/json')
          .set('Authorization', `Bearer ${token}`);
      }

    getAllCategories(): Observable<any> {
        return this.http.get<any>(`${this.baseUrl}/categories`, {
          headers: this.getAuthHeaders()
        });
    }

    getAllCategoriesRemedies(): Observable<any> {
        return this.http.get<any>(`${this.baseUrl}/remedy-categories`, {
          headers: this.getAuthHeaders()
        });
    }


    
        // Mettre à jour une campagne existante
      updatedCategorie(id: string, categorie: Category): Observable<any> {
        return this.http.put(`${this.baseUrl}/categories/${id}`, categorie, {
            headers: this.getAuthHeaders()
          });
      }
    
    
       // Mettre à jour une campagne existante
       createcategorie(category: Category): Observable<any> {
        return this.http.post(`${this.baseUrl}/categories`, category, {
            headers: this.getAuthHeaders()
          });
      }
    
      
    
    
    
         // Mettre à jour une campagne existante
         deletedcategorie(id: string): Observable<any> {
            return this.http.delete(`${this.baseUrl}/categories/${id}`, {
                headers: this.getAuthHeaders()
              });
          }

  

}
