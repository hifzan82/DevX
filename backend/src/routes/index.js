import previewRoutes from './preview.js';
import fixesRoutes from './fixes.js';
import compareRoutes from './compare.js';
import monitorsRoutes from './monitors.js'
import githubRoutes from './github.js';
import roadmapRoutes from './roadmap.js';
import { Router } from 'express';
import { assertPublicUrl } from '../services/publicUrl.js';
import { enqueueScan, getScan } from '../queues/scanQueue.js';
import { enqueueCrawl, getCrawl } from '../queues/crawlQueue.js';
import { validateCrawlOptions } from '../services/crawlWebsite.js';

const router = Router();

router.use("/fixes", fixesRoutes);
router.use("/roadmap", roadmapRoutes);

router.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

router.post('/scans', async (req, res) => {
  let url;
  try { url = await assertPublicUrl(req.body?.url); }
  catch (error) { return res.status(400).json({ error: error.message }); }
  try {
    const scanId = enqueueScan(url);
    return res.status(202).json({ scanId, status: 'queued' });
  } catch (error) { return res.status(503).json({ error: error.message }); }
});

async function readScan(req, res) {
  const { scanId } = req.params;
  if (!/^[0-9a-f-]{36}$/i.test(scanId)) { res.status(400).json({ error: 'Invalid scan ID.' }); return null; }
  const job = getScan(scanId);
  if (!job) { res.status(404).json({ error: 'Scan not found or expired.' }); return null; }
  return job;
}

router.get('/scans/:scanId', async (req, res) => {
  const scan = await readScan(req, res);
  if (!scan) return;
  res.json({ scanId: scan.scanId, status: scan.status, stage: scan.stage,
    progress: scan.progress, error: scan.status === 'failed' ? scan.error : undefined,
    ...(scan.status === 'completed' ? scan.result : {}) });
});

router.get('/scans/:scanId/issues', async (req, res) => {
  const scan = await readScan(req, res);
  if (!scan) return;
  res.json({ scanId: scan.scanId, status: scan.status, issues: scan.status === 'completed' ? scan.result.issues : [] });
});

router.post('/crawls', async (req, res) => {
  let url, config;
  try {
    url = await assertPublicUrl(req.body?.url);
    config = validateCrawlOptions(req.body);
  } catch (error) { return res.status(400).json({ error: error.message }); }
  try {
    const crawlId = enqueueCrawl(url, config);
    return res.status(202).json({ crawlId, status: 'queued' });
  } catch (error) { return res.status(503).json({ error: error.message }); }
});

function readCrawl(req, res) {
  if (!/^[0-9a-f-]{36}$/i.test(req.params.crawlId)) { res.status(400).json({ error: 'Invalid crawl ID.' }); return null; }
  const crawl = getCrawl(req.params.crawlId);
  if (!crawl) { res.status(404).json({ error: 'Crawl not found or expired.' }); return null; }
  return crawl;
}

router.get('/crawls/:crawlId', (req, res) => {
  const crawl = readCrawl(req, res);
  if (!crawl) return;
  res.json({ crawlId: crawl.crawlId, url: crawl.url, status: crawl.status,
    stage: crawl.status === 'processing' ? 'crawling' : crawl.status,
    progress: crawl.progress, error: crawl.error,
    ...(crawl.result || {}) });
});

router.get('/crawls/:crawlId/pages', (req, res) => {
  const crawl = readCrawl(req, res);
  if (!crawl) return;
  res.json({ crawlId: crawl.crawlId, status: crawl.status, pages: crawl.result?.pages || [] });
});

router.use('/preview', previewRoutes);

router.use("/monitors", monitorsRoutes);

router.use("/compare", compareRoutes);
router.use('/github', githubRoutes);

export default router;
