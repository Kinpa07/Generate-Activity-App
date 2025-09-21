
const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/+$/, "");

function join(path) {
  return `${API_BASE}${path.startsWith("/") ? "" : "/"}${path}`;
}

/** Fetch that auto-injects token and JSON handling */
export async function apiFetch(path, options = {}) {
  const token = localStorage.getItem("token");
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(join(path), { ...options, headers });
  if (!res.ok) {
  
    const text = await res.text().catch(() => "");
    throw new Error(text || `Request failed: ${res.status}`);
  }

  return res.status === 204 ? null : res.json();
}
