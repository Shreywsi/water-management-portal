import { Box } from "@mui/material";
import { useLocation } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

export default function AdminLayout({ children }) {
  const location = useLocation();

const showBanner =
  location.pathname === "/admin" ||
  location.pathname === "/admin/dashboard";
  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        bgcolor: "#F5F7FB",
      }}
    >
      {/* Left Navigation */}
      <Sidebar />

      {/* Right Side */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Top Navigation */}
        <Topbar showBanner={showBanner} />

        {/* Page Content */}
        <Box
          sx={{
            flex: 1,
            overflow: "auto",
            p: 4,
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}