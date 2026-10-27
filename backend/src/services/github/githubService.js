function getConfig() { return {
  appId: process.env.GITHUB_APP_ID || '',
  privateKey: process.env.GITHUB_PRIVATE_KEY || '',
  clientId: process.env.GITHUB_CLIENT_ID || '',
  clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
  token: process.env.GITHUB_TOKEN || '',
}; }

export function getAuthStatus() {
  const config = getConfig();
  return {
    configured: Boolean(config.token),
    appIdConfigured: Boolean(config.appId && config.privateKey),
    tokenConfigured: Boolean(config.token),
  };
}

function githubRequest(path, options = {}) {
  const config = getConfig();
  if (!config.token) throw new Error('GitHub token is required. Set GITHUB_TOKEN in backend environment.');
  const opts = { ...options, headers: { Accept: 'application/vnd.github+json', Authorization: `Bearer ${config.token}`, ...options.headers } };
  return fetch(`https://api.github.com${path}`, opts);
}

export async function listRepos() {
  const status = getAuthStatus();
  if (!status.configured) {
    throw new Error('GitHub integration not configured. Set GITHUB_TOKEN on the server.');
  }
  try {
    const res = await githubRequest('/user/repos?per_page=100');
    if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);
    const data = await res.json();
    return { repos: data.map(r => ({ id: r.id, name: r.full_name, defaultBranch: r.default_branch, url: r.html_url })) };
  } catch (e) {
    return { repos: [], error: e.message };
  }
}

export async function getFileContent({ repo, branch, path }) {
  const res = await githubRequest(`/repos/${repo}/contents/${encodeURIComponent(path)}?ref=${encodeURIComponent(branch)}`);
  if (!res.ok) throw new Error(`Failed to fetch file: ${res.status}`);
  const data = await res.json();
  return Buffer.from(data.content, data.encoding).toString('utf8');
}

export async function createPullRequest({ repo, branch, baseBranch, title, body, patch, path }) {
  const config = getConfig();
  if (!config.token) throw new Error('GitHub token required. Configure GITHUB_TOKEN on the server.');
  if (!repo || !branch || !patch) {
    throw new Error('repo, branch, title, and patch are required.');
  }
  // 1. Get base branch SHA
  const baseRes = await githubRequest(`/repos/${repo}/git/ref/heads/${encodeURIComponent(baseBranch || 'main')}`);
  if (!baseRes.ok) throw new Error(`Base branch not found: ${baseRes.status}`);
  const baseRef = await baseRes.json();
  const baseTree = baseRef.data?.object?.sha;

  // 2. Get current file SHA
  let fileContent, currentSha;
  if (path) {
    try {
      const fc = await getFileContent({ repo, branch: baseBranch, path });
      const fileRes = await githubRequest(`/repos/${repo}/contents/${encodeURIComponent(path)}?ref=${encodeURIComponent(baseBranch || 'main')}`);
      const fdata = await fileRes.json();
      fileContent = fc;
      currentSha = fdata.sha;
    } catch {}
  }

  // 3. Create new branch
  try {
    await githubRequest(`/repos/${repo}/git/refs`, {
      method: 'POST',
      body: JSON.stringify({ ref: `refs/heads/${branch}`, sha: baseTree }),
    });
  } catch (e) {
    if (e.message.includes('already exists') || e.message.includes('422')) {
      // Branch exists - update it to base
      await githubRequest(`/repos/${repo}/git/refs/heads/${encodeURIComponent(branch)}`, {
        method: 'PATCH',
        body: JSON.stringify({ sha: baseTree, force: false }),
      });
    } else {
      throw e;
    }
  }

  // 4. Create blob with patched content
  const newContent = patch;
  const blobRes = await githubRequest(`/repos/${repo}/git/blobs`, {
    method: 'POST',
    body: JSON.stringify({ content: Buffer.from(newContent).toString('base64'), encoding: 'base64' }),
  });
  if (!blobRes.ok) throw new Error(`Failed to create blob: ${blobRes.status}`);
  const blobData = await blobRes.json();

  // 5. Get tree and create new tree
  const treeRes = await githubRequest(`/repos/${repo}/git/trees/${encodeURIComponent(baseBranch || 'main')}`);
  if (!treeRes.ok) throw new Error('Failed to fetch tree');
  // Create blob for our file
  const treeEntry = path ? { path, mode: '100644', type: 'blob', sha: blobData.sha } : null;
  const treeData = await treeRes.json();
  
  const newTree = await githubRequest(`/repos/${repo}/git/trees`, {
    method: 'POST',
    body: JSON.stringify({
      base_tree: treeData.sha,
      tree: treeEntry ? [treeEntry] : [],
    }),
  });
  if (!newTree.ok) throw new Error('Failed to create tree');
  const newTreeData = await newTree.json();

  // 6. Create commit
  const commitRes = await githubRequest(`/repos/${repo}/git/commits`, {
    method: 'POST',
    body: JSON.stringify({
      message: title,
      tree: newTreeData.sha,
      parents: [baseTree],
    }),
  });
  if (!commitRes.ok) throw new Error('Failed to create commit');
  const commitData = await commitRes.json();

  // 7. Update branch ref
  const updateRes = await githubRequest(`/repos/${repo}/git/refs/heads/${encodeURIComponent(branch)}`, {
    method: 'PATCH',
    body: JSON.stringify({ sha: commitData.sha, force: false }),
  });

  // 8. Create PR
  const prRes = await githubRequest(`/repos/${repo}/pulls`, {
    method: 'POST',
    body: JSON.stringify({
      title,
      head: branch,
      base: baseBranch || 'main',
      body,
    }),
  });
  if (!prRes.ok) throw new Error(`Failed to create PR: ${prRes.status}`);
  const prData = await prRes.json();
  return { success: true, pullRequest: prData.html_url, number: prData.number, branch, status: 'open', needsApproval: true };
}
