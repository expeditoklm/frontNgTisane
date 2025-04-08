export interface Instruction {
    id?: string;
    stepNumber?: number;
    text?: string;
    remedyId?: string;
    createdAt?: Date;
    updatedAt?: Date;
    deleted?: boolean;
}
