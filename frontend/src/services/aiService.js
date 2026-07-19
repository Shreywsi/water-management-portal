const API = "http://127.0.0.1:8000/api";

export async function getAIDashboard() {
    const response = await fetch(`${API}/ml/dashboard/`);

    if (!response.ok) {
        throw new Error("Failed to load AI dashboard.");
    }

    return await response.json();
}