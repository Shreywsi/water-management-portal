import API_BASE from "../config/api";

export async function apiFetch(url, options = {}) {
  const token = localStorage.getItem("authToken");

  const headers = {
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Token ${token}`;
  }

  return fetch(`${API_BASE}${url}`, {
    ...options,
    headers,
  });
}