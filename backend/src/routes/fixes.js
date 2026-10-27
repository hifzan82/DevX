import { Router } from 'express';
import { generateFix, generateRoadmap } from '../services/fixes/generateFix.js';

const router = Router();

router.post('/generate', (req, res) => {
  try {
    const fix = generateFix(req.body?.issue || req.body);
    res.json({ fix, status: 'suggested' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/roadmap', (req, res) => {
  try {
    const roadmap = generateRoadmap(req.body?.issues || []);
    res.json(roadmap);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;

import { verifyFix } from '../services/fixes/verifyFix.js';

router.post('/verify', async (req, res) => {
  try {
    const result = await verifyFix(req.body || {});
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/:fixId/verify', async (req, res) => {
  try {
    const result = await verifyFix(req.body || {});
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/:fixId/generate', (req, res) => {
  try {
    const fix = generateFix(req.body?.issue || {});
    res.json({ fix, status: 'suggested' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

import { generateAIFix, buildRoadmapDetailed } from '../services/fixes/aiFix.js';

router.post('/suggest', async (req, res) => {
  try {
    const fix = await generateAIFix(req.body?.issue || {});
    res.json({ fix, status: 'suggested', unverified: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/roadmap/detailed', (req, res) => {
  try {
    const roadmap = buildRoadmapDetailed(req.body?.issues || []);
    res.json(roadmap);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

import { previewFix, verifyFixDetailed } from '../services/fixes/previewVerify.js';

router.post('/preview', async (req, res) => {
  try {
    const result = await previewFix(req.body || {});
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/verify/detailed', async (req, res) => {
  try {
    const result = await verifyFixDetailed(req.body || {});
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
