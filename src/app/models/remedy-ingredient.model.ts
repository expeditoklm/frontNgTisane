export interface RemedyIngredient {
    remedyId: string;
    ingredientId: string;
    quantity?: string;
    createdAt: Date;
    updatedAt: Date;
    deleted: boolean;
  }