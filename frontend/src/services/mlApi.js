import axios from "axios";

const API = "http://127.0.0.1:8000/api";

export const retrainModel = async () => {
  const res = await axios.post(`${API}/ml/retrain/`);
  return res.data;
};