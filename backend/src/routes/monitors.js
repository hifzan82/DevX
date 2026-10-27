import { Router } from "express";
import { assertPublicUrl } from "../services/publicUrl.js";
import {
  createMonitor,
  listMonitors,
  getMonitor,
  updateMonitor,
  deleteMonitor,
} from "../services/monitors/monitorStore.js";
import {
  registerMonitor,
  toggleMonitor,
  removeMonitor,
  runMonitor,
} from "../services/monitors/monitorScheduler.js";

const router = Router();

function serialize(monitor) {
  return {
    id: monitor.id,
    url: monitor.url,
    frequency: monitor.frequency,
    active: monitor.enabled,
    enabled: monitor.enabled,
    status: monitor.status,
    createdAt: monitor.createdAt,
    updatedAt: monitor.updatedAt,
    lastRunAt: monitor.lastRunAt,
    nextRunAt: monitor.nextRunAt,
    lastError: monitor.lastError,
    results: monitor.results,
  };
}

router.post("/", async (req, res) => {
  try {
    const checkedUrl = await assertPublicUrl(req.body?.url);
    const normalized = new URL(checkedUrl);
    normalized.searchParams.sort();
    const url = normalized.toString();
    const frequency = req.body?.frequency || "daily";

    if (!["daily", "weekly"].includes(frequency)) {
      return res.status(400).json({
        error: "Frequency must be daily or weekly.",
      });
    }

    const monitor = createMonitor({
      url,
      frequency,
      enabled: true,
    });

    registerMonitor(monitor);

    return res.status(201).json(serialize(monitor));
  } catch (error) {
    return res.status(error.statusCode || 400).json({
      error: error.message,
    });
  }
});

router.get("/", (_req, res) => {
  res.json({
    monitors: listMonitors().map(serialize),
    storage: "temporary-memory",
    durable: false,
  });
});

router.get("/:monitorId", (req, res) => {
  const monitor = getMonitor(req.params.monitorId);

  if (!monitor) {
    return res.status(404).json({
      error: "Monitor not found.",
    });
  }

  return res.json(serialize(monitor));
});

router.patch("/:monitorId", (req, res) => {
  const monitor = getMonitor(req.params.monitorId);

  if (!monitor) {
    return res.status(404).json({
      error: "Monitor not found.",
    });
  }

  try {
    const enabled = req.body?.active ?? req.body?.enabled;
    const frequency = req.body?.frequency;

    if (enabled !== undefined && typeof enabled !== "boolean") {
      return res.status(400).json({
        error: "Active must be true or false.",
      });
    }

    if (frequency !== undefined && !["daily", "weekly"].includes(frequency)) {
      return res.status(400).json({
        error: "Invalid monitoring frequency.",
      });
    }

    const updated = updateMonitor(monitor.id, {
      ...(enabled !== undefined ? { enabled } : {}),
      ...(frequency !== undefined ? { frequency } : {}),
    });

    toggleMonitor(updated.id, updated.enabled);

    return res.json(serialize(updated));
  } catch (error) {
    return res.status(400).json({
      error: error.message,
    });
  }
});

router.post("/:monitorId/run", (req, res) => {
  const monitor = getMonitor(req.params.monitorId);

  if (!monitor) {
    return res.status(404).json({
      error: "Monitor not found.",
    });
  }

  if (!monitor.enabled) {
    return res.status(409).json({
      error: "Resume this monitor before scanning.",
    });
  }

  if (monitor.status === "scanning") {
    return res.status(409).json({
      error: "A scan is already running.",
    });
  }

  const started = runMonitor(monitor.id);

  if (!started) {
    return res.status(503).json({
      error: "Monitoring capacity is currently unavailable.",
    });
  }

  return res.status(202).json(serialize(getMonitor(monitor.id)));
});

router.delete("/:monitorId", (req, res) => {
  if (!getMonitor(req.params.monitorId)) {
    return res.status(404).json({
      error: "Monitor not found.",
    });
  }

  removeMonitor(req.params.monitorId);
  deleteMonitor(req.params.monitorId);

  return res.json({ success: true });
});

export default router;
