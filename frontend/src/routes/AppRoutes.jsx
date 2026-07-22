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
import RegisterPage from "../pages/SignupPage";

import AdminLayout from "../layouts/AdminLayout";


import AIPrediction from "../pages/admin/AIPrediction";

import SignupPage from "../pages/SignupPage"

import WaterBalanceHistory from "../pages/admin/WaterBalanceHistory";
import Locations from "../pages/admin/Locations";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/admin"
        element={
          <AdminLayout>
            <AdminDashboard />
          </AdminLayout>
        }
      />
      
      <Route
        path="/admin/gis"
        element={
          <AdminLayout>
            <GISDataManager />
          </AdminLayout>
        }
      />
      <Route
        path="/admin/ai"
        element={
          <AdminLayout>
            <AIPrediction />
          </AdminLayout>
        }
      />
      
      

        <Route path="/farmer" element={<FarmerDashboard />} />
        <Route path="/farmer/water-table" element={<WaterTableEntry />} />
        <Route path="/farmer/pumping" element={<PumpingEntry />} />
        <Route path="/farmer/water-level" element={<WaterLevelEntry />} />
        <Route path="/farmer/tds" element={<TDSEntry />} />
        <Route path="/farmer/salinity" element={<SalinityEntry />} />
        <Route
        path="/admin/locations"
        element={
          <AdminLayout>
            <Locations />
          </AdminLayout>
        }
      />

        <Route path="/crp" element={<CRPDashboard />} />
        <Route
            path="/admin/water-history"
            element={<WaterBalanceHistory />}
        />

        <Route path="/signup" element={<SignupPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;