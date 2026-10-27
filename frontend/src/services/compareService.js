import api from "./api.js";

export async function compareScans(scanId, baselineId) {
  const response = await api.post("/api/compare", {
    beforeScanId: baselineId,
    afterScanId: scanId,
  });

  return response.data;
}

export async function getAvailableScans() {
  const response = await api.get("/api/compare/available");
  return response.data;
}

export async function compareTwoScans(beforeScanId, afterScanId) {
  return compareScans(afterScanId, beforeScanId);
}
