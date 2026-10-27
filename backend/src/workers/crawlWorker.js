import { parentPort, workerData } from 'node:worker_threads';
import { crawlWebsite } from '../services/crawlWebsite.js';

try {
  const result = await crawlWebsite(workerData.url, workerData.config, progress => {
    parentPort.postMessage({ type: 'progress', progress });
  });
  parentPort.postMessage({ type: 'result', result });
} catch {
  parentPort.postMessage({ type: 'error', error: 'The crawl could not be completed.' });
}
