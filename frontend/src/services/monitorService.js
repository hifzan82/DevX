import api from './api.js';

export async function listMonitors() { return (await api.get('/api/monitors')).data; }
export async function createMonitor(config) { return (await api.post('/api/monitors', config)).data; }
export async function updateMonitor(monitorId, changes) { return (await api.patch(`/api/monitors/${encodeURIComponent(monitorId)}`, changes)).data; }
export async function deleteMonitor(monitorId) { return (await api.delete(`/api/monitors/${encodeURIComponent(monitorId)}`)).data; }
