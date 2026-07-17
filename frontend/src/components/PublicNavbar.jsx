import {
  AppBar,
  Toolbar,
  Typography,
  Box
} from "@mui/material";
import WaterDropOutlinedIcon from "@mui/icons-material/WaterDropOutlined";
import LanguageSelector from "./LanguageSelector";

function PublicNavbar() {
  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        bgcolor: "#1B2A4A",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <Toolbar sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 1,
        py: 1,
      }}>

        {/* Brand */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
          <Box sx={{
            width: 30, height: 30, borderRadius: "50%",
            bgcolor: "rgba(255,255,255,0.10)",
            border: "1px solid rgba(255,255,255,0.18)",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}>
            <WaterDropOutlinedIcon sx={{ color: "#fff", fontSize: 15 }} />
          </Box>
          <Typography variant="h6" sx={{
            fontWeight: 500,
            fontSize: { xs: "0.95rem", sm: "1.05rem", md: "1.1rem" },
            color: "#fff",
            letterSpacing: "0.01em",
          }}>
            Water Management Portal
          </Typography>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center" }}>
          <LanguageSelector />
        </Box>

      </Toolbar>
    </AppBar>
  );
}

export default PublicNavbar;