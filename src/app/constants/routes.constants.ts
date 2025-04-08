
// src/app/constants/routes.constants.ts
export const ROUTES = {
    HOME: '',
    AUTH: {
      LOGIN: 'login',
      REGISTER: 'register'
    },
    ADMIN: {
      DASHBOARD: 'admin/dashboard',
      USERS: 'admin/users'
    },
    REMEDIES: {
      LIST: 'remedies',
      DETAILS: 'remedies/:id',
      CREATE: 'remedies/create',
      EDIT: 'remedies/:id/edit'
    },
    INGREDIENTS: {
      LIST: 'ingredients',
      DETAILS: 'ingredients/:id',
      CREATE: 'ingredients/create',
      EDIT: 'ingredients/:id/edit'
    },
    DISEASES: {
      LIST: 'diseases',
      DETAILS: 'diseases/:id',
      CREATE: 'diseases/create',
      EDIT: 'diseases/:id/edit'
    }
  };