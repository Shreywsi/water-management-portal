import API_BASE from "../config/api";

const BASE = `${API_BASE}/dashboard/banner`;

export async function fetchBannerImages() {
  const res = await fetch(`${BASE}/`);

  if (!res.ok) {
    throw new Error("Failed to fetch banner");
  }

  return await res.json();
}

export async function addBannerImage(file, adminPassword) {
  const formData = new FormData();
  formData.append("image", file);

  const res = await fetch(`${BASE}/upload/`, {
    method: "POST",
    headers: {
      "X-Admin-Password": adminPassword,
    },
    body: formData,
  });

  if (!res.ok) {
    throw new Error("Failed to upload banner");
  }

  return res.json();
}

export async function deleteBannerImage(imageId, adminPassword) {
  const res = await fetch(`${BASE}/delete/${imageId}/`, {
    method: "DELETE",
    headers: {
      "X-Admin-Password": adminPassword,
    },
  });

  if (!res.ok) {
    throw new Error(await res.text());
  }

  return await res.json();
}