import api from './api.js';

export async function listRepositories() { return (await api.get('/api/github/repos')).data; }
export async function createPullRequest(approvedPatches) {
  if (!Array.isArray(approvedPatches) || approvedPatches.length === 0) throw new Error('Approve at least one patch before creating a pull request.');
  return (await api.post('/api/github/pull-requests', { patches: approvedPatches })).data;
}
