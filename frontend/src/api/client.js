const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

function authHeaders(extraHeaders = {}) {
  const token = localStorage.getItem("safeguard_token");
  const headers = {
    "Content-Type": "application/json",
    ...extraHeaders,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: authHeaders(options.headers || {}),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.detail || "Request failed.");
  }
  return data;
}

export const api = {
  register: (payload) => request("/auth/register", { method: "POST", body: JSON.stringify(payload) }),
  login: (payload) => request("/auth/login", { method: "POST", body: JSON.stringify(payload) }),
  analyze: (payload) => request("/analyze", { method: "POST", body: JSON.stringify(payload) }),
  getScans: () => request("/scans"),
  getScan: (id) => request(`/scans/${id}`),
  getAnalytics: () => request("/analytics"),
  getResearchMetrics: () => request("/research/metrics"),
  exportResearchCsv: async () => {
    const response = await fetch(`${API_URL}/research/export.csv`, {
      headers: authHeaders({ Accept: "text/csv" }),
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.detail || "CSV export failed.");
    }
    return response.blob();
  },
};
