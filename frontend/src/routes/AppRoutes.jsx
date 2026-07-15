import { BrowserRouter, Routes, Route } from "react-router-dom";

import LoginPage from "../pages/LoginPage";
import AdminDashboard from "../pages/admin/AdminDashboard";
import GISDataManager from "../pages/admin/GISDataManager";
import FarmerDashboard from "../pages/farmer/FarmerDashboard";
import PumpingEntry from "../pages/crp/PumpingEntry";
import WaterTableEntry from "../pages/crp/WaterTableEntry";
import WaterLevelEntry from "../pages/farmer/WaterLevelEntry";
import TDSEntry from "../pages/crp/TDSEntry";
import SalinityEntry from "../pages/crp/SalinityEntry";

import CRPDashboard from "../pages/crp/CRPDashboard";
import ResearcherDashboard from "../pages/researcher/ResearcherDashboard";

import AdminLayout from "../layouts/AdminLayout";
import MyWorkspace from "../pages/admin/MyWorkspace";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<LoginPage />} />
      <Route
        path="/admin"
        element={
          <AdminLayout>
            <AdminDashboard />
          </AdminLayout>
        }
      />
<Route path="/admin/workspace" element={<MyWorkspace />} />
      <Route
        path="/admin/gis"
        element={
          <AdminLayout>
            <GISDataManager />
          </AdminLayout>
        }
      />

        <Route path="/farmer" element={<FarmerDashboard />} />
        <Route path="/farmer/water-table" element={<WaterTableEntry />} />
        <Route path="/farmer/pumping" element={<PumpingEntry />} />
        <Route path="/farmer/water-level" element={<WaterLevelEntry />} />
        <Route path="/farmer/tds" element={<TDSEntry />} />
        <Route path="/farmer/salinity" element={<SalinityEntry />} />
    

        <Route path="/crp" element={<CRPDashboard />} />

        <Route path="/researcher" element={<ResearcherDashboard />} />

      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;