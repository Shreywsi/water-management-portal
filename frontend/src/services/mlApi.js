import axios from "axios";
import API_BASE from "../config/api";

const API = API_BASE;

export const retrainModel = async (location) => {
  const token = localStorage.getItem("token");

  const res = await axios.post(
    `${API}/ml/retrain/`,
    {
      location,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  return res.data;
};