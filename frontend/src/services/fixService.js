import api from './api.js';

export async function generateFix(issue) {
  const response = await api.post('/api/fixes/generate', { issue });
  return response.data;
}

export async function getRoadmap(issues) {
  const response = await api.post('/api/fixes/roadmap', { issues });
  return response.data;
}

export async function verifyFix(payload) {
  const response = await api.post('/api/fixes/verify', payload);
  return response.data;
}

export async function verifyFixById(fixId, payload) {
  const response = await api.post(`/api/fixes/${fixId}/verify`, payload);
  return response.data;
}

export async function generateFixForId(fixId, issue) {
  const response = await api.post(`/api/fixes/${fixId}/generate`, { issue });
  return response.data;
}

export async function suggestFix(issue) {
  const response = await api.post('/api/fixes/suggest', { issue });
  return response.data;
}

export async function getRoadmapDetailed(issues) {
  const response = await api.post('/api/fixes/roadmap/detailed', { issues });
  return response.data;
}

export async function previewFix(payload) {
  const response = await api.post('/api/fixes/preview', payload);
  return response.data;
}

export async function verifyFixDetailed(payload) {
  const response = await api.post('/api/fixes/verify/detailed', payload);
  return response.data;
}
