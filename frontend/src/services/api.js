import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Intercepteur pour gérer les erreurs 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/connexion';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  inscription: (data) => api.post('/auth/inscription', data),
  connexion: (data) => api.post('/auth/connexion', data),
  confirmerEmail: (token) => api.post('/auth/confirmer-email', { token }),
  renvoyerConfirmation: (email) => api.post('/auth/renvoyer-confirmation', { email }),
  getMoi: () => api.get('/auth/moi'),
};

export default api;