import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Ingredient } from '../models';

@Injectable()
export class IngredientService {
    constructor(private http: HttpClient) {}

    private getIngredientsData(): Ingredient[] {
        return [
            {
                id: 'd001',
                name: 'Grippe',
                description: 'Grippe',
                photos: [{ id: 'r001', url: 'd001', ingredientId: 'd001', createdAt: new Date(), updatedAt: new Date(), deleted: false }],
                createdAt: new Date(),
                updatedAt: new Date(),
                deleted: false
            },
            {
                id: 'd002',
                name: 'Grippe',
                description: 'Grippe',
                photos: [{ id: 'r001', url: 'd001', ingredientId: 'd001', createdAt: new Date(), updatedAt: new Date(), deleted: false }],
                createdAt: new Date(),
                updatedAt: new Date(),
                deleted: false
            },
            {
                id: 'd003',
                name: 'Grippe',
                description: 'Grippe',
                photos: [{ id: 'r001', url: 'd001', ingredientId: 'd001', createdAt: new Date(), updatedAt: new Date(), deleted: false }],
                createdAt: new Date(),
                updatedAt: new Date(),
                deleted: false
            }
        ];
    }

    getIngredients(): Promise<Ingredient[]> {
        return Promise.resolve(this.getIngredientsData());
    }
}
