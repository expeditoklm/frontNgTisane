import { RemedyDisease } from './remedy-disease.model';

export interface Disease {
    id?: string;
    name?: string;
    categoryId?: string;
    image?: string;
    description?: string;
    remedies?: RemedyDisease[];
    createdAt?: Date;
    updatedAt?: Date;
    deleted?: boolean;
}
