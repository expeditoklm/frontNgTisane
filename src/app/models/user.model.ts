export interface User {
    userId: string;
    userName: string;
    email: string;
    password?: string; // Optionnel car ne devrait pas être retourné par l'API
    created_at: Date;
    updated_at: Date;
  }
  