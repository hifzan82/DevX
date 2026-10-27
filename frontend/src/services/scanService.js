import api from './api.js';

export async function createScan(url) {
  const { data } = await api.post('/api/scans', { url });
  const scanId = data.scanId || data.scan_id || data.jobId || data.job_id;
  if (!scanId) throw new Error('The scan API did not return a scan or job ID.');
  return { ...data, scanId };
}

export async function getScan(scanId) {
  const { data } = await api.get(`/api/scans/${encodeURIComponent(scanId)}`);
  return data;
}

export async function getScanIssues(scanId, params) {
  const { data } = await api.get(`/api/scans/${encodeURIComponent(scanId)}/issues`, { params });
  return data;
}
