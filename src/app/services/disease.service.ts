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
export class DiseaseService {
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

    getAllDiseases(): Observable<any> {
        return this.http.get<any>(`${this.baseUrl}/diseases`, {
          headers: this.getAuthHeaders()
        });
    }

    getAllDiseasesRemedies(): Observable<any> {
        return this.http.get<any>(`${this.baseUrl}/remedy-diseases`, {
          headers: this.getAuthHeaders()
        });
    }


    
        // Mettre à jour une campagne existante
      updateDisease(id: string, disease: Disease): Observable<any> {
        return this.http.put(`${this.baseUrl}/diseases/${id}`, disease, {
            headers: this.getAuthHeaders()
          });
      }
    
    
       // Mettre à jour une campagne existante
       createDisease(disease: Disease): Observable<any> {
        return this.http.post(`${this.baseUrl}/diseases`, disease, {
            headers: this.getAuthHeaders()
          });
      }
    
      
    
    
    
         // Mettre à jour une campagne existante
         deleteDisease(id: string): Observable<any> {
            return this.http.delete(`${this.baseUrl}/diseases/${id}`, {
                headers: this.getAuthHeaders()
              });
          }

  

}
