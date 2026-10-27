import api from "./api.js";

const BASE = "/api/monitors";

export async function listMonitors() {
  const { data } = await api.get(BASE);
  return data;
}

export async function createMonitor(payload) {
  const { data } = await api.post(BASE, payload);
  return data;
}

export async function getMonitor(id) {
  const { data } = await api.get(`${BASE}/${encodeURIComponent(id)}`);
  return data;
}

export async function updateMonitor(id, updates) {
  const { data } = await api.patch(
    `${BASE}/${encodeURIComponent(id)}`,
    updates,
  );
  return data;
}

export async function deleteMonitor(id) {
  const { data } = await api.delete(`${BASE}/${encodeURIComponent(id)}`);
  return data;
}

export async function runMonitorNow(id) {
  const { data } = await api.post(`${BASE}/${encodeURIComponent(id)}/run`);
  return data;
}
