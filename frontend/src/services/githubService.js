import api from './api.js';

export async function getGitHubAuth() {
  const response = await api.get('/api/github/auth');
  return response.data;
}

export async function listGitHubRepos() {
  const response = await api.get('/api/github/repos');
  return response.data;
}

export async function listRepositories() {
  const result = await listGitHubRepos();
  if (result.error) throw new Error(result.error);
  return result;
}

export async function createPullRequest(data) {
  const response = await api.post('/api/github/pull-requests', data);
  return response.data;
}

export async function getFileContent({ repo, branch, path }) {
  const { data } = await api.get("/api/github/file", {
    params: { repo, branch, path },
  });

  return data;
}
