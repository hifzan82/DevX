import { Router } from 'express';
import { fetchPreviewHtml } from '../services/preview/fetchPreview.js';

const router = Router();

router.post('/', async (req, res) => {
  try {
    const result = await fetchPreviewHtml(req.body?.url);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
