import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000',
  timeout: 12000,
  headers: { Accept: 'application/json' },
});

api.interceptors.response.use(response => response, error => {
  const message = error.response?.data?.message || error.response?.data?.error || error.message || 'The API request failed.';
  return Promise.reject(Object.assign(error, { userMessage: message }));
});

export default api;
