import { Photo } from './photo.model';
import { RemedyIngredient } from './remedy-ingredient.model';

export interface Ingredient {
    id?: string;
    name?: string;
    description?: string;
    photos?: Photo[];
    createdAt?: Date;
    updatedAt?: Date;
    deleted?: boolean;
    image?: string;
}
