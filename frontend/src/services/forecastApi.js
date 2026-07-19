import config from "../config";

export async function getForecast(period) {
  const response = await fetch(
    `${config.API_BASE}/ml/forecast/${period}/`
  );

  if (!response.ok) {
    throw new Error("Unable to fetch prediction");
  }

  return response.json();
}