import api from './api.js';

export async function createCrawl({ url, maxPages = 20, maxDepth = 3, sameOrigin = true }) {
  const { data } = await api.post('/api/crawls', { url, maxPages, maxDepth, sameOrigin });
  return data;
}

export async function getCrawl(crawlId) {
  const { data } = await api.get(`/api/crawls/${encodeURIComponent(crawlId)}`);
  return data;
}
