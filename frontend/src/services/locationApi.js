import config from "../config";

export async function getLocations() {

    const response = await fetch(
        `${config.API_BASE}/location-list/`
    );

    if (!response.ok) {
        throw new Error("Unable to fetch locations.");
    }

    const data = await response.json();

    return data;
}