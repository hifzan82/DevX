import { Router } from 'express';
import { generateRoadmap } from '../services/fixes/generateFix.js';
import { getScan } from '../queues/scanQueue.js';

const router = Router();

router.get('/:scanId', (req, res) => {
  try {
    const scan = getScan(req.params.scanId);
    if (!scan) return res.status(404).json({ error: 'Scan not found or expired.' });
    if (scan.status !== 'completed') return res.status(409).json({ error: 'Scan has not completed.' });
    res.json(generateRoadmap(scan.result?.issues || []));
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
