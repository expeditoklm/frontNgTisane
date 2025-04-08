import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Remedy } from '../models';

@Injectable()
export class RemedyService {
    constructor(private http: HttpClient) {}

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

    getRemedies(): Promise<Remedy[]> {
        return Promise.resolve(this.getRemediesData());
    }
}
