import { Box } from "@mui/material";
import Sidebar from "../components/Sidebar";

export default function AdminLayout({ children }) {
  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        backgroundColor: "#f4f6f8",
      }}
    >
      <Sidebar />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 4,
          overflowX: "hidden",
        }}
      >
        {children}
      </Box>
    </Box>
  );
}