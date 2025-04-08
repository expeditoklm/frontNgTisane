// src/app/constants/api.constants.ts
export const API_BASE_URL = 'http://localhost:3000/api';

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: `${API_BASE_URL}/auth/login`,
    REGISTER: `${API_BASE_URL}/auth/register`,
    LOGOUT: `${API_BASE_URL}/auth/logout`
  },
  USERS: `${API_BASE_URL}/users`,
  REMEDIES: `${API_BASE_URL}/remedies`,
  INGREDIENTS: `${API_BASE_URL}/ingredients`,
  DISEASES: `${API_BASE_URL}/diseases`,
  INSTRUCTIONS: `${API_BASE_URL}/instructions`
};