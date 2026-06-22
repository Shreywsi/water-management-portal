// src/data/dataService.js

const API_BASE = "http://127.0.0.1:8000/api";


// ==========================================
// Fetch all module data from Django
// ==========================================
async function fetchAllData() {
  try {
    const [
      pumpingResponse,
      waterTableResponse,
      waterLevelResponse,
      tdsResponse,
      salinityResponse
    ] = await Promise.all([
      fetch(`${API_BASE}/pumping/`),
      fetch(`${API_BASE}/watertable/`),
      fetch(`${API_BASE}/waterlevel/`),
      fetch(`${API_BASE}/tds/`),
      fetch(`${API_BASE}/salinity/`)
    ]);

    const pumping = await pumpingResponse.json();
    const waterTable = await waterTableResponse.json();
    const waterLevel = await waterLevelResponse.json();
    const tds = await tdsResponse.json();
    const salinity = await salinityResponse.json();

    return {
      pumping,
      waterTable,
      waterLevel,
      tds,
      salinity
    };
  } catch (error) {
    console.error("Error fetching data:", error);

    return {
      pumping: [],
      waterTable: [],
      waterLevel: [],
      tds: [],
      salinity: []
    };
  }
}


// ==========================================
// Dashboard Summary
// ==========================================
export async function fetchDashboardSummary() {
  const data = await fetchAllData();

  const totalRecords =
    data.pumping.length +
    data.waterTable.length +
    data.waterLevel.length +
    data.tds.length +
    data.salinity.length;

  return {
    totalUsers: 0,
    totalFarmers: 0,
    totalCRPs: 0,
    totalResearchers: 0,
    totalVillages: 0,
    totalWells: 0,
    totalRecords,
    activeUsers: 0
  };
}


// ==========================================
// Recent Activity Table
// ==========================================
export async function fetchRecentActivity() {
  const data = await fetchAllData();

  let activity = [];

  // Pumping
  data.pumping.forEach((item) => {
    activity.push({
      date: item.date,
      user: item.crop,
      role: "Farmer",
      action: `${item.hours} hours pumping`
    });
  });

  // Water Table
  data.waterTable.forEach((item) => {
    activity.push({
      date: item.date,
      user: "Farmer",
      role: "Farmer",
      action: `Water table = ${item.depth} m`
    });
  });

  // Water Level
  data.waterLevel.forEach((item) => {
    activity.push({
      date: item.date,
      user: "Farmer",
      role: "Farmer",
      action: `Water level = ${item.level}`
    });
  });

  // TDS
  data.tds.forEach((item) => {
    activity.push({
      date: item.date,
      user: "Farmer",
      role: "Farmer",
      action: `TDS = ${item.value}`
    });
  });

  // Salinity
  data.salinity.forEach((item) => {
    activity.push({
      date: item.date,
      user: "Farmer",
      role: "Farmer",
      action: `Salinity = ${item.value}`
    });
  });

  // newest first
  activity.sort((a, b) => new Date(b.date) - new Date(a.date));

  return activity;
}


// ==========================================
// Users
// ==========================================
export async function fetchUsers() {
  return [];
}


// ==========================================
// Villages
// ==========================================
export async function fetchVillages() {
  return [];
}


// ==========================================
// Wells
// ==========================================
export async function fetchWells() {
  return [];
}
export async function fetchPumpingChart() {
  try {
    const response = await fetch(
      "http://127.0.0.1:8000/api/pumping/"
    );

    const data = await response.json();

    return data;

  } catch (error) {
    console.error(error);
    return [];
  }
}
export async function fetchWaterLevelChart() {

  const response = await fetch(
    "http://127.0.0.1:8000/api/waterlevel/"
  );

  return await response.json();
}
export async function fetchTDSChart() {

  const response = await fetch(
    "http://127.0.0.1:8000/api/tds/"
  );

  return await response.json();
}
export async function fetchSalinityChart() {

  const response = await fetch(
    "http://127.0.0.1:8000/api/salinity/"
  );

  return await response.json();
}
export async function fetchPieChart() {

  const [
    pumping,
    waterlevel,
    watertable,
    tds,
    salinity
  ] = await Promise.all([
    fetch("http://127.0.0.1:8000/api/pumping/"),
    fetch("http://127.0.0.1:8000/api/waterlevel/"),
    fetch("http://127.0.0.1:8000/api/watertable/"),
    fetch("http://127.0.0.1:8000/api/tds/"),
    fetch("http://127.0.0.1:8000/api/salinity/")
  ]);

  return [
    {
      name: "Pumping",
      value: (await pumping.json()).length
    },
    {
      name: "Water Level",
      value: (await waterlevel.json()).length
    },
    {
      name: "Water Table",
      value: (await watertable.json()).length
    },
    {
      name: "TDS",
      value: (await tds.json()).length
    },
    {
      name: "Salinity",
      value: (await salinity.json()).length
    }
  ];
}

// ==========================================
// Audit Logs
// ==========================================
export async function fetchAuditLogs() {
  return [];
}


// ==========================================
// System Health
// ==========================================
export async function fetchSystemHealth() {
  return {
    cpu: 0,
    memory: 0,
    storage: 0
  };
}


// ==========================================
// Profile
// ==========================================
export async function fetchProfile() {
  return {
    name: "Admin"
  };
}