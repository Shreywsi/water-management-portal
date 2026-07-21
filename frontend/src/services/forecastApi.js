import config from "../config";

export async function getForecast(period, location) {

    const response = await fetch(
        `${config.API_BASE}/ml/forecast/${period}/?location=${location}`
    );

    if (!response.ok) {
        throw new Error("Unable to fetch prediction");
    }

    return response.json();
}