import { Box, Toolbar } from "@mui/material";
import DashboardNavbar from "../components/DashboardNavbar";

function FarmerLayout({ children }) {
  return (
    <Box
      sx={{
        backgroundColor: "#f5f7fa",
        minHeight: "100vh"
      }}
    >

      <DashboardNavbar />

      {/* Push page below navbar */}
      <Toolbar />

      <Box sx={{ p: 4 }}>
        {children}
      </Box>

    </Box>
  );
}

export default FarmerLayout;