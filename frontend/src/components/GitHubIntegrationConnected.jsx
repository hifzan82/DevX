import { useEffect, useState } from 'react';
import GitHubIntegration from './GitHubIntegration.jsx';
import { getGitHubAuth, listGitHubRepos, createPullRequest } from '../services/githubService.js';

export default function GitHubIntegrationConnected({ onToast }) {
  const [auth, setAuth] = useState({ configured: false });
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRepo, setSelectedRepo] = useState('');

  const refresh = async () => {
    setLoading(true);
    try {
      const a = await getGitHubAuth();
      setAuth(a);
      try {
        const r = await listGitHubRepos();
        setRepos(r?.repos || []);
      } catch {}
    } catch (e) {
      onToast?.(e.userMessage || e.message || 'Failed to load GitHub status');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refresh(); }, []);

  const handleCreatePR = async (data) => {
    try {
      const res = await createPullRequest(data);
      onToast?.(`PR created: ${res.pullRequest || 'success'} — explicit review required before merge`);
    } catch (e) {
      onToast?.(e.userMessage || e.message || 'PR creation failed — configure GITHUB_TOKEN on server');
    }
  };

  return <GitHubIntegration
    auth={auth}
    repos={repos}
    selectedRepo={selectedRepo}
    onSelectRepo={setSelectedRepo}
    onCreatePR={handleCreatePR}
    onRefresh={refresh}
    loading={loading}
  />;
}
