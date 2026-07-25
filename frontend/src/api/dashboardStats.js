import { apiFetch } from "../utils/api";

export async function fetchDashboardStats() {
  const [locationsRes, gisRes, foldersRes] = await Promise.all([
    apiFetch("/location-list/"),
    apiFetch("/gis/layers/"),
    apiFetch("/resources/folders/"),
  ]);

  const locations = locationsRes.ok ? await locationsRes.json() : [];
  const gisLayers = gisRes.ok ? await gisRes.json() : [];
  const folders = foldersRes.ok ? await foldersRes.json() : [];

  const filesCount = Array.isArray(folders)
    ? folders.reduce((sum, f) => sum + (f.file_count || 0), 0)
    : 0;

  return {
    locationsCount: Array.isArray(locations) ? locations.length : 0,
    gisLayersCount: Array.isArray(gisLayers) ? gisLayers.length : 0,
    foldersCount: Array.isArray(folders) ? folders.length : 0,
    filesCount,
  };
}