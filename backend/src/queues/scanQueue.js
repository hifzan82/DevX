import { randomUUID } from "node:crypto";
import { Worker } from "node:worker_threads";

const jobs = new Map();
const waiting = [];
let active = 0;
const MAX_ACTIVE = 2;
const MAX_WAITING = 20;
const RETENTION_MS = 60 * 60 * 1000;

setInterval(() => {
  for (const [id, job] of jobs) {
    if (
      ["completed", "failed"].includes(job.status) &&
      Date.now() - job.finishedAt > RETENTION_MS
    )
      jobs.delete(id);
  }
}, 60_000).unref();

function runNext() {
  while (active < MAX_ACTIVE && waiting.length) {
    const job = waiting.shift();
    active += 1;
    job.status = "processing";
    job.stage = "launching";
    const worker = new Worker(
      new URL("../workers/scanWorker.js", import.meta.url),
      { workerData: { url: job.url } },
    );
    let finished = false;
    const timeout = setTimeout(() => worker.terminate(), 90_000);
    const finish = (status, payload) => {
      if (finished) return;
      finished = true;
      clearTimeout(timeout);
      void worker.terminate();
      job.status = status;
      job.finishedAt = Date.now();
      if (status === "completed") {
        job.result = payload;
        job.stage = "completed";
        job.progress = 100;
      } else {
        job.error = payload || "The scan could not be completed.";
        job.stage = "failed";
      }
      active -= 1;
      runNext();
    };
    worker.on("message", (message) => {
      if (message.type === "progress") {
        job.stage = message.stage;
        job.progress = message.percent;
      }
      if (message.type === "result") finish("completed", message.result);
      if (message.type === "error") finish("failed", message.error);
    });
    worker.on("error", () => finish("failed", "The scan worker failed."));
    worker.on("exit", (code) => {
      if (!finished)
        finish(
          "failed",
          code
            ? "The scan worker stopped unexpectedly."
            : "The scan ended without results.",
        );
    });
  }
}

export function enqueueScan(url) {
  if (waiting.length >= MAX_WAITING)
    throw new Error("The scan queue is full. Please try again shortly.");
  const scanId = randomUUID();
  jobs.set(scanId, {
    scanId,
    url,
    status: "queued",
    stage: "queued",
    progress: 0,
  });
  waiting.push(jobs.get(scanId));
  runNext();
  return scanId;
}

export function getScan(scanId) {
  return jobs.get(scanId);
}

export function listCompletedScans() {
  return [...jobs.values()]
    .filter((job) => job.status === "completed" && job.result)
    .map((job) => ({
      scanId: job.scanId,
      url: job.result.url || job.url,
      scannedAt:
        job.result.scannedAt ||
        (job.finishedAt ? new Date(job.finishedAt).toISOString() : null),
      summary: job.result.summary || {},
    }))
    .sort(
      (a, b) => (Date.parse(b.scannedAt) || 0) - (Date.parse(a.scannedAt) || 0),
    );
}