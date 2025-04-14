import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Disease } from '../models';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';


@Injectable({
    providedIn: 'root'
  })
@Injectable()
export class IngredientService {
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

    getAllIngredients(): Observable<any> {
        return this.http.get<any>(`${this.baseUrl}/ingredients`, {
          headers: this.getAuthHeaders()
        });
    }

    getAllIngredientsRemedies(): Observable<any> {
        return this.http.get<any>(`${this.baseUrl}/remedy-ingredients`, {
          headers: this.getAuthHeaders()
        });
    }

}
