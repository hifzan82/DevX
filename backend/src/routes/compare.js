import { Router } from "express";
import { getScan, listCompletedScans, } from "../queues/scanQueue.js";
import { compareScans } from "../services/compareScans.js";

const router = Router();

router.get("/available", (_req, res) => {
  res.json({
    scans: listCompletedScans(),
    retention: "temporary",
    historyAvailable: false,
  });
});

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

router.post("/", (req, res) => {
  const beforeScanId = req.body?.beforeScanId || req.body?.baselineScanId;

  const afterScanId = req.body?.afterScanId || req.body?.currentScanId;

  if (
    !UUID_PATTERN.test(beforeScanId || "") ||
    !UUID_PATTERN.test(afterScanId || "")
  ) {
    return res.status(400).json({
      error: "Two valid scan IDs are required.",
    });
  }

  if (beforeScanId === afterScanId) {
    return res.status(400).json({
      error: "Choose two different scans.",
    });
  }

  const before = getScan(beforeScanId);
  const after = getScan(afterScanId);

  if (!before || !after) {
    return res.status(410).json({
      error:
        "One or both scan results are unavailable or have expired. Run fresh scans to compare them.",
      baselineAvailable: Boolean(before?.result),
      currentAvailable: Boolean(after?.result),
    });
  }

  if (before.status !== "completed" || after.status !== "completed") {
    return res.status(409).json({
      error: "Both scans must complete successfully before comparison.",
      beforeStatus: before.status,
      afterStatus: after.status,
    });
  }

  if (!before.result || !after.result) {
    return res.status(410).json({
      error: "One or both scan results are no longer available.",
      baselineAvailable: Boolean(before.result),
      currentAvailable: Boolean(after.result),
    });
  }

  try {
    const comparison = compareScans(before.result, after.result);

    return res.json({
      beforeScanId,
      afterScanId,
      ...comparison,
    });
  } catch (error) {
    return res.status(400).json({
      error: error.message,
    });
  }
});

export default router;
