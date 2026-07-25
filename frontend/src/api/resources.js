import { apiFetch } from "../utils/api";

async function handleResponse(response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || "Request failed.");
  }
  return data;
}

export async function fetchFolders() {
  const response = await apiFetch("/resources/folders/");
  return handleResponse(response);
}

export async function createFolder(name, description) {
  const response = await apiFetch("/resources/folders/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, description }),
  });
  return handleResponse(response);
}

export async function fetchFolderDetail(folderId) {
  const response = await apiFetch(`/resources/folders/${folderId}/`);
  return handleResponse(response);
}

export async function deleteFolder(folderId) {
  const response = await apiFetch(`/resources/folders/${folderId}/`, {
    method: "DELETE",
  });
  return handleResponse(response);
}

export async function uploadFilesToFolder(folderId, files, relativePaths) {
  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));
  if (relativePaths) {
    relativePaths.forEach((path) => formData.append("relative_paths", path));
  }
  const response = await apiFetch(`/resources/folders/${folderId}/upload/`, {
    method: "POST",
    body: formData,
  });
  return handleResponse(response);
}

export async function deleteFile(fileId) {
  const response = await apiFetch(`/resources/files/${fileId}/`, {
    method: "DELETE",
  });
  return handleResponse(response);
}

export async function downloadFile(fileId, filename) {
  const response = await apiFetch(`/resources/files/${fileId}/`);
  if (!response.ok) throw new Error("Download failed.");
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}