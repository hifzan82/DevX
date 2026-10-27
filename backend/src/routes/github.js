import { Router } from 'express';
import { getAuthStatus, listRepos, getFileContent, createPullRequest } from '../services/github/githubService.js';

const router = Router();

function localDevelopmentOnly(req, res, next) {
  const address = req.ip || req.socket.remoteAddress || '';
  if (process.env.NODE_ENV === 'production' || !['127.0.0.1', '::1', '::ffff:127.0.0.1'].includes(address)) {
    return res.status(403).json({ error: 'Repository access requires authenticated users; local development only.' });
  }
  next();
}

router.get('/auth', (_req, res) => {
  res.json(getAuthStatus());
});

router.get('/repos', localDevelopmentOnly, async (_req, res) => {
  try {
    const result = await listRepos();
    res.json(result);
  } catch (error) {
    res.status(503).json({ error: error.message, configured: false, repos: [] });
  }
});

router.get("/file", localDevelopmentOnly, async (req, res) => {
  try {
    const { repo, branch, path } = req.query;

    if (!repo || !path) {
      return res.status(400).json({
        error: "Repository and file path are required.",
      });
    }
    if (!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repo) || typeof path !== 'string' || path.includes('..') || path.startsWith('/')) {
      return res.status(400).json({ error: 'Invalid repository or file path.' });
    }

    const content = await getFileContent({
      repo,
      branch,
      path,
    });

    res.json({ content });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post("/pull-requests", (_req, res) => {
  res.status(409).json({
    error:
      "Direct pull-request creation is disabled. Propose a source patch, review its diff, approve it, and submit it through the reviewed workflow.",
  });
});

export default router;
