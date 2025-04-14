import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Remedy } from '../models';
import { environment } from '../environments/environment';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';



@Injectable({
    providedIn: 'root'
  })
@Injectable()
export class RemedyService {
    private baseUrl = `${environment.apiUrl}`;
    private headers = new HttpHeaders().set('Content-Type', 'application/json');
  

    constructor(
        private http: HttpClient,
        private router: Router
      ) { }

    private getRemediesData(): Remedy[] {
        return [
            {
                id: 'd001',
                name: 'Grippe',
                value: 45,
                description: 'Grippe',
                instructions: [
                    { id: 'r002', stepNumber: 2, text: 'd001', remedyId: 'd001', createdAt: new Date(), updatedAt: new Date(), deleted: false },
                    { id: 'r001', stepNumber: 2, text: 'd001', remedyId: 'd001', createdAt: new Date(), updatedAt: new Date(), deleted: false },
                    { id: 'r003', stepNumber: 2, text: 'd001', remedyId: 'd001', createdAt: new Date(), updatedAt: new Date(), deleted: false },
                    { id: 'r008', stepNumber: 2, text: 'd001', remedyId: 'd001', createdAt: new Date(), updatedAt: new Date(), deleted: false }
                ],
                ingredients: [
                    { remedyId: 'r005', ingredientId: '2', quantity: 'd001', createdAt: new Date(), updatedAt: new Date(), deleted: false },
                    { remedyId: 'r0014', ingredientId: '2', quantity: 'd001', createdAt: new Date(), updatedAt: new Date(), deleted: false },
                    { remedyId: 'r0012', ingredientId: '2', quantity: 'd001', createdAt: new Date(), updatedAt: new Date(), deleted: false }
                ],
                diseases: [
                    { remedyId: 'r05205', diseaseId: '2', createdAt: new Date(), updatedAt: new Date(), deleted: false },
                    { remedyId: 'r0505', diseaseId: '2', createdAt: new Date(), updatedAt: new Date(), deleted: false },
                    { remedyId: 'r0605', diseaseId: '2', createdAt: new Date(), updatedAt: new Date(), deleted: false }
                ],
                createdAt: new Date(),
                updatedAt: new Date(),
                deleted: false
            }
        ];
    }
 getAuthHeaders(): HttpHeaders {
        const token = localStorage.getItem('token');
        return new HttpHeaders()
          .set('Content-Type', 'application/json')
          .set('Authorization', `Bearer ${token}`);
      }

    getAllRemidies(): Observable<any> {
        return this.http.get<any>(`${this.baseUrl}/remedies`, {
          headers: this.getAuthHeaders()
        });
    }

    getAllDiseasesRemedies(): Observable<any> {
        return this.http.get<any>(`${this.baseUrl}/remedy-diseases`, {
          headers: this.getAuthHeaders()
        });
    }

    // Mettre à jour une campagne existante
  updateRemedy(id: string, remedy: Remedy): Observable<any> {
    return this.http.put(`${this.baseUrl}/remedies/${id}`, remedy, {
        headers: this.getAuthHeaders()
      });
  }


   // Mettre à jour une campagne existante
   createRemedy(remedy: Remedy): Observable<any> {
    return this.http.post(`${this.baseUrl}/remedies`, remedy, {
        headers: this.getAuthHeaders()
      });
  }

  



     // Mettre à jour une campagne existante
     deletedRemedy(id: string): Observable<any> {
        return this.http.delete(`${this.baseUrl}/remedies/${id}`, {
            headers: this.getAuthHeaders()
          });
      }
    
      

}
