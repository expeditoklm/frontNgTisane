import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Disease } from '../models';

@Injectable()
export class DiseaseService {
    constructor(private http: HttpClient) {}

    private getDiseasesData(): Disease[] {
        return [
            {
                id: 'd001',
                name: 'Grippe',
                remedies: [
                    { remedyId: 'r001', diseaseId: 'd001', createdAt: new Date(), updatedAt: new Date(), deleted: false }
                ],
                categoryId: 'Grippe',
                createdAt: new Date(),
                updatedAt: new Date(),
                deleted: false
            },
            {
                id: 'd002',
                name: 'Fièvre',
                remedies: [
                    { remedyId: 'r002', diseaseId: 'd002', createdAt: new Date(), updatedAt: new Date(), deleted: false },
                    { remedyId: 'r003', diseaseId: 'd002', createdAt: new Date(), updatedAt: new Date(), deleted: false }
                ],
                categoryId: 'Grippe',

                createdAt: new Date(),
                updatedAt: new Date(),
                deleted: false
            },
            {
                id: 'd003',
                name: 'Maux de tête',
                remedies: [],
                categoryId: 'Grippe',

                createdAt: new Date(),
                updatedAt: new Date(),
                deleted: false
            }
        ];
    }

    getDiseases(): Promise<Disease[]> {
        return Promise.resolve(this.getDiseasesData());
    }
}
