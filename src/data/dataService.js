// Thin async-wrapper service layer.
// Today this returns mock data with a simulated delay.
// Tomorrow, replace the body of each function with a real fetch()/axios call —
// no page component needs to change since they all call through this file.

import {
  mockUsers,
  mockVillages,
  mockWells,
  mockRecentActivity,
  mockAuditLogs,
  mockSystemHealth,
  mockProfile,
} from './mockData';

const delay = (ms = 250) => new Promise((resolve) => setTimeout(resolve, ms));

let usersStore = [...mockUsers];
let villagesStore = [...mockVillages];
let wellsStore = [...mockWells];

// ---- Users ----
export async function fetchUsers() {
  await delay();
  return [...usersStore];
}
export async function createUser(user) {
  await delay();
  const newUser = { ...user, id: `USR-${1000 + usersStore.length + 1}` };
  usersStore = [newUser, ...usersStore];
  return newUser;
}
export async function updateUser(id, updates) {
  await delay();
  usersStore = usersStore.map((u) => (u.id === id ? { ...u, ...updates } : u));
  return usersStore.find((u) => u.id === id);
}
export async function deleteUser(id) {
  await delay();
  usersStore = usersStore.filter((u) => u.id !== id);
  return true;
}

// ---- Villages ----
export async function fetchVillages() {
  await delay();
  return [...villagesStore];
}
export async function createVillage(village) {
  await delay();
  const newVillage = {
    ...village,
    id: `VLG-${String(villagesStore.length + 1).padStart(2, '0')}`,
    farmers: 0,
    wells: 0,
  };
  villagesStore = [newVillage, ...villagesStore];
  return newVillage;
}
export async function updateVillage(id, updates) {
  await delay();
  villagesStore = villagesStore.map((v) => (v.id === id ? { ...v, ...updates } : v));
  return villagesStore.find((v) => v.id === id);
}
export async function deleteVillage(id) {
  await delay();
  villagesStore = villagesStore.filter((v) => v.id !== id);
  return true;
}

// ---- Wells ----
export async function fetchWells() {
  await delay();
  return [...wellsStore];
}
export async function createWell(well) {
  await delay();
  const newWell = { ...well, id: `WEL-${2000 + wellsStore.length + 1}`, status: well.status || 'Active' };
  wellsStore = [newWell, ...wellsStore];
  return newWell;
}
export async function updateWell(id, updates) {
  await delay();
  wellsStore = wellsStore.map((w) => (w.id === id ? { ...w, ...updates } : w));
  return wellsStore.find((w) => w.id === id);
}
export async function deleteWell(id) {
  await delay();
  wellsStore = wellsStore.filter((w) => w.id !== id);
  return true;
}

// ---- Dashboard / read-only ----
export async function fetchDashboardSummary() {
  await delay();
  return {
    totalUsers: usersStore.length,
    totalFarmers: usersStore.filter((u) => u.role === 'Farmer').length,
    totalCRPs: usersStore.filter((u) => u.role === 'CRP').length,
    totalResearchers: usersStore.filter((u) => u.role === 'Researcher').length,
    totalVillages: villagesStore.length,
    totalWells: wellsStore.length,
    totalRecords: 1284,
    activeUsers: usersStore.filter((u) => u.status === 'Active').length,
  };
}
export async function fetchRecentActivity() {
  await delay();
  return [...mockRecentActivity];
}
export async function fetchAuditLogs() {
  await delay();
  return [...mockAuditLogs];
}
export async function fetchSystemHealth() {
  await delay();
  return { ...mockSystemHealth };
}
export async function fetchProfile() {
  await delay();
  return { ...mockProfile };
}
