import { useEffect, useState } from 'react';
import GitHubIntegration from './GitHubIntegration.jsx';
import { getGitHubAuth, listGitHubRepos, createPullRequest } from '../../services/githubService.js';

export default function GitHubIntegrationConnected({ onToast }) {
  const [auth, setAuth] = useState({ configured: false });
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(false);

  const refresh = async () => {
    setLoading(true);
    try {
      const a = await getGitHubAuth();
      setAuth(a);
      try {
        const r = await listGitHubRepos();
        setRepos(r.repos || []);
        if (r.error) onToast?.(r.error);
      } catch (e) {
        // Leave empty if not configured
      }
    } catch (e) {
      onToast?.(e.userMessage || e.message || 'Failed to load GitHub status');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refresh(); }, []);

  const handleCreatePR = async (data) => {
    try {
      await createPullRequest(data);
      onToast?.('Pull request creation attempted');
    } catch (e) {
      onToast?.(e.userMessage || e.message || 'PR creation failed');
    }
  };

  return <GitHubIntegration auth={auth} repos={repos} onRefresh={refresh} onCreatePR={handleCreatePR} loading={loading} />;
}
