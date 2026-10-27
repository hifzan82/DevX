import { randomUUID } from 'node:crypto';
import { Worker } from 'node:worker_threads';

const jobs = new Map();
const waiting = [];
let active = false;

setInterval(() => {
  for (const [id, job] of jobs) {
    if (job.finishedAt && Date.now() - job.finishedAt > 60 * 60 * 1000) jobs.delete(id);
  }
}, 60_000).unref();

function runNext() {
  if (active || !waiting.length) return;
  active = true;
  const job = waiting.shift();
  job.status = 'processing';
  const worker = new Worker(new URL('../workers/crawlWorker.js', import.meta.url), { workerData: { url: job.url, config: job.config } });
  let finished = false;
  const timeout = setTimeout(() => { void worker.terminate(); }, 5 * 60_000);
  const finish = (status, payload) => {
    if (finished) return;
    finished = true;
    clearTimeout(timeout);
    void worker.terminate();
    job.status = status;
    job.finishedAt = Date.now();
    if (payload?.pages) {
      job.result = payload;
      job.progress = { ...payload.summary, queuedPages: 0, totalPages: payload.summary.completedPages + payload.summary.failedPages };
    }
    if (status === 'failed') job.error = typeof payload === 'string' ? payload : payload?.pages?.find(page => page.status === 'failed')?.error || 'No pages could be scanned.';
    active = false;
    runNext();
  };
  worker.on('message', message => {
    if (message.type === 'progress') job.progress = message.progress;
    if (message.type === 'result') finish(message.result.summary.completedPages ? 'completed' : 'failed', message.result);
    if (message.type === 'error') finish('failed', message.error);
  });
  worker.on('error', () => finish('failed', 'The crawl worker failed.'));
  worker.on('exit', () => { if (!finished) finish('failed', 'The crawl ended before completion.'); });
}

export function enqueueCrawl(url, config) {
  if (waiting.length >= 5) throw new Error('The crawl queue is full. Please try again shortly.');
  const crawlId = randomUUID();
  jobs.set(crawlId, { crawlId, url, config, status: 'queued', progress: { completedPages: 0, failedPages: 0, skippedPages: 0, queuedPages: 1, totalPages: 1 } });
  waiting.push(jobs.get(crawlId));
  runNext();
  return crawlId;
}

export function getCrawl(crawlId) { return jobs.get(crawlId); }
