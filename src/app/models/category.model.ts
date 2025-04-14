import { Disease } from './disease.model';

export interface Category {
    id?: string;
    diseases?: Disease[];
    createdAt?: Date;
    updatedAt?: Date;
    deleted?: boolean;
}
