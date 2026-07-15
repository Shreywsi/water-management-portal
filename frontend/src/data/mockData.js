// Centralized mock data for the Admin Dashboard.
// Swap the functions in dataService.js for real API calls later —
// every page imports through that layer, never this file directly.

export const mockUsers = [
  { id: 'USR-1001', name: 'Ramesh Patel', role: 'Farmer', village: 'Vavdi', phone: '+91 98250 11223', email: 'ramesh.patel@example.com', status: 'Active' },
  { id: 'USR-1002', name: 'Suresh Bhai', role: 'CRP', village: 'Vavdi', phone: '+91 98250 33445', email: 'suresh.bhai@example.com', status: 'Active' },
  { id: 'USR-1003', name: 'Dr. Anjali Mehta', role: 'Researcher', village: 'N/A', phone: '+91 79265 67788', email: 'anjali.mehta@example.com', status: 'Active' },
  { id: 'USR-1004', name: 'Kiran Solanki', role: 'Farmer', village: 'Sherthala', phone: '+91 98240 99887', email: 'kiran.solanki@example.com', status: 'Inactive' },
  { id: 'USR-1005', name: 'Bharat Joshi', role: 'CRP', village: 'Adalaj', phone: '+91 98980 11456', email: 'bharat.joshi@example.com', status: 'Active' },
  { id: 'USR-1006', name: 'Priya Chauhan', role: 'Farmer', village: 'Adalaj', phone: '+91 99090 22113', email: 'priya.chauhan@example.com', status: 'Active' },
  { id: 'USR-1007', name: 'Admin User', role: 'Admin', village: 'N/A', phone: '+91 90990 00001', email: 'admin@gwplatform.in', status: 'Active' },
  { id: 'USR-1008', name: 'Manoj Vyas', role: 'Farmer', village: 'Sherthala', phone: '+91 98760 55432', email: 'manoj.vyas@example.com', status: 'Active' },
];

export const mockVillages = [
  { id: 'VLG-01', name: 'Vavdi', district: 'Gandhinagar', state: 'Gujarat', farmers: 42, wells: 18, description: 'Semi-arid village with declining water table over the last decade.' },
  { id: 'VLG-02', name: 'Sherthala', district: 'Ahmedabad', state: 'Gujarat', farmers: 35, wells: 14, description: 'Mixed cropping village relying on borewells for irrigation.' },
  { id: 'VLG-03', name: 'Adalaj', district: 'Gandhinagar', state: 'Gujarat', farmers: 58, wells: 27, description: 'Large farming community, historically rich groundwater zone.' },
  { id: 'VLG-04', name: 'Kalol Rural', district: 'Gandhinagar', state: 'Gujarat', farmers: 21, wells: 9, description: 'Small village piloting community recharge structures.' },
];

export const mockWells = [
  { id: 'WEL-2001', owner: 'Ramesh Patel', village: 'Vavdi', depth: 62, status: 'Active', lat: 23.2156, lng: 72.6369 },
  { id: 'WEL-2002', owner: 'Kiran Solanki', village: 'Sherthala', depth: 78, status: 'Active', lat: 23.0395, lng: 72.5066 },
  { id: 'WEL-2003', owner: 'Priya Chauhan', village: 'Adalaj', depth: 45, status: 'Under Maintenance', lat: 23.1700, lng: 72.5797 },
  { id: 'WEL-2004', owner: 'Manoj Vyas', village: 'Sherthala', depth: 91, status: 'Dry', lat: 23.0410, lng: 72.5100 },
  { id: 'WEL-2005', owner: 'Bharat Joshi', village: 'Adalaj', depth: 53, status: 'Active', lat: 23.1685, lng: 72.5810 },
];

export const mockRecentActivity = [
  { date: '12 Jul 2025', user: 'Ramesh Patel', role: 'Farmer', action: 'Added rainfall record' },
  { date: '13 Jul 2025', user: 'Suresh Bhai', role: 'CRP', action: 'Validated pumping data' },
  { date: '14 Jul 2025', user: 'Dr. Anjali Mehta', role: 'Researcher', action: 'Exported quarterly report' },
  { date: '14 Jul 2025', user: 'Bharat Joshi', role: 'CRP', action: 'Validated groundwater record' },
  { date: '15 Jul 2025', user: 'Priya Chauhan', role: 'Farmer', action: 'Updated well status' },
];

export const mockAuditLogs = [
  { timestamp: '14 Jul 2025, 09:12', user: 'Ramesh Patel', role: 'Farmer', action: 'Added rainfall data' },
  { timestamp: '15 Jul 2025, 11:40', user: 'CRP-001', role: 'CRP', action: 'Validated groundwater record' },
  { timestamp: '15 Jul 2025, 14:02', user: 'Admin User', role: 'Admin', action: 'Created new village: Kalol Rural' },
  { timestamp: '16 Jul 2025, 08:55', user: 'Kiran Solanki', role: 'Farmer', action: 'Reported well WEL-2004 as dry' },
  { timestamp: '16 Jul 2025, 16:21', user: 'Dr. Anjali Mehta', role: 'Researcher', action: 'Downloaded village dataset' },
  { timestamp: '17 Jul 2025, 10:05', user: 'Admin User', role: 'Admin', action: 'Deactivated user USR-1004' },
];

export const mockSystemHealth = {
  database: { status: 'Connected', healthy: true },
  api: { status: 'Running', healthy: true },
  pendingSync: 14,
  storageUsedGb: 6.4,
  storageTotalGb: 20,
  activeSessions: 23,
};

export const mockProfile = {
  name: 'Admin User',
  email: 'admin@gwplatform.in',
  phone: '+91 90990 00001',
  role: 'Administrator',
};

export const roleColors = {
  Farmer: 'success',
  CRP: 'info',
  Researcher: 'secondary',
  Admin: 'warning',
};
