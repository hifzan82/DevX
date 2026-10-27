import api from './api.js';

export async function fetchPreview(url) {
  const response = await api.post('/api/preview', { url });
  return response.data;
}
