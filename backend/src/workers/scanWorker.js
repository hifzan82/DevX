import { parentPort, workerData } from 'node:worker_threads';
import { scanWebsite } from '../services/scanWebsite.js';

try {
  const result = await scanWebsite(workerData.url, (stage, percent) => {
    parentPort.postMessage({ type: 'progress', stage, percent });
  });
  parentPort.postMessage({ type: 'result', result });
} catch (error) {
  const message = error.name === 'TimeoutError' || error.message?.includes('timeout')
    ? 'The website did not respond before the scan timeout.'
    : error.message?.includes('private') || error.message?.includes('reserved')
      ? 'The destination is not a public website.'
      : error.message?.startsWith('The website requires a browser challenge') || /^The website returned HTTP [45]\d\d\.$/.test(error.message || '')
        ? error.message
      : 'The website could not be scanned. Check that it is public and reachable.';
  parentPort.postMessage({ type: 'error', error: message });
}
