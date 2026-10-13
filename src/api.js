import { DEMO_MODE, requestDemo } from "./demoData";

const API_BASE = import.meta.env.VITE_API_BASE || "/api";

export async function api(path, options = {}) {
  if (DEMO_MODE) return requestDemo(path, options);
  const token = localStorage.getItem("foodlink_token");
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;
  const response = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || `Request failed (${response.status})`);
  return data;
}
