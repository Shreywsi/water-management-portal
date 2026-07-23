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
export async function retrainModel(location) {
    const token = localStorage.getItem("token");

    const response = await fetch(
        `${config.API_BASE}/ml/retrain/`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Token ${token}`,
            },
            body: JSON.stringify({
                location,
            }),
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Training failed");
    }

    return data;
}