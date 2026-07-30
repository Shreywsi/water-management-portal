import API_BASE from "../config/api";

export async function apiFetch(url, options = {}, adminPassword = null) {
  const token = localStorage.getItem("authToken");

  const headers = {
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Token ${token}`;
  }

  if (adminPassword) {
    headers["X-Admin-Password"] = adminPassword;
  }

  return fetch(`${API_BASE}${url}`, {
    ...options,
    headers,
  });
}