import { Box } from "@mui/material";

import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

export default function AdminLayout({ children }) {
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
        <Topbar />

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