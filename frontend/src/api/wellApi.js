import axios from "axios";
import API_BASE from "../config/api";

export const getWells = () =>
  axios.get(`${API_BASE}/wells/`);

export const addWell = (data) =>
  axios.post(`${API_BASE}/well/add/`, data);

export const updateWell = (id, data) =>
  axios.put(`${API_BASE}/well/${id}/edit/`, data);

export const deleteWell = (id) =>
  axios.delete(`${API_BASE}/well/${id}/`);

export const exportWells = (filters) => {
  const params = new URLSearchParams();

  if (filters.location)
    params.append("location", filters.location);

  if (filters.start_date)
    params.append("start_date", filters.start_date);

  if (filters.end_date)
    params.append("end_date", filters.end_date);

  if (filters.parameters.length)
    params.append("parameters", filters.parameters.join(","));

  window.open(
    `${API_BASE}/well/export/?${params.toString()}`,
    "_blank"
  );
};