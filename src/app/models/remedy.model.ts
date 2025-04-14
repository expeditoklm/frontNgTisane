import { Ingredient } from './ingredient.model';
import { Instruction } from './instruction.model';
import { RemedyDisease } from './remedy-disease.model';
import { RemedyIngredient } from './remedy-ingredient.model';

export interface Remedy {
    id?: string;
    name?: string;
    value?: number;
    description?: string;
    instructions?: Instruction[];
    ingredients?: RemedyIngredient[];
    newIngredients?: Ingredient[];
    newInstructions?: Instruction[];
    diseases?: RemedyDisease[];
    createdAt?: Date;
    updatedAt?: Date;
    deleted?: boolean;
}
