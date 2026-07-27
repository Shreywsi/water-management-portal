// toolCardApi.js
// Talks to the endpoints defined in groundwater/urls.py

const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

export async function verifyAdminPassword(password) {
  const res = await fetch(`${API_BASE}/verify-admin-password/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password }),
  });
  return res.ok;
}

export async function fetchToolCards() {
  const res = await fetch(`${API_BASE}/tools/`);
  if (!res.ok) throw new Error("Failed to load tool cards");
  return res.json();
}

export async function createToolCard({ title, description }, password) {
  const res = await fetch(`${API_BASE}/tools/add/`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Admin-Password": password },
    body: JSON.stringify({ title, description }),
  });
  if (!res.ok) throw new Error("Failed to create tool card");
  return res.json();
}

export async function updateToolCard(id, { title, description }, password) {
  const res = await fetch(`${API_BASE}/tools/${id}/edit/`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", "X-Admin-Password": password },
    body: JSON.stringify({ title, description }),
  });
  if (!res.ok) throw new Error("Failed to update tool card");
  return res.json();
}

export async function deleteToolCard(id, password) {
  const res = await fetch(`${API_BASE}/tools/${id}/delete/`, {
    method: "DELETE",
    headers: { "X-Admin-Password": password },
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || "Failed to delete tool card");
  }
}

export async function addToolCardImage(cardId, imageFile, password) {
  const formData = new FormData();
  formData.append("image", imageFile);
  const res = await fetch(`${API_BASE}/tools/${cardId}/images/add/`, {
    method: "POST",
    headers: { "X-Admin-Password": password },
    body: formData,
  });
  if (!res.ok) throw new Error("Failed to upload image");
  return res.json();
}

export async function deleteToolCardImage(cardId, imageId, password) {
  const res = await fetch(`${API_BASE}/tools/images/${imageId}/delete/`, {
    method: "DELETE",
    headers: { "X-Admin-Password": password },
  });
  if (!res.ok) throw new Error("Failed to delete image");
}