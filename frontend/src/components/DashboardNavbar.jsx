import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton
} from "@mui/material";

import NotificationsIcon from "@mui/icons-material/Notifications";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";

import LanguageSelector from "./LanguageSelector";

function DashboardNavbar() {
  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        bgcolor: "#1B2A4A",   // Same as sidebar
        color: "#fff",
        borderBottom: "1px solid rgba(255,255,255,0.08)"
      }}
    >
      <Toolbar
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 1
        }}
      >
        {/* Title */}
        <Typography
          variant="h6"
          sx={{
            flexGrow: 1,
            fontWeight: 700,
            fontSize: {
              xs: "1rem",
              sm: "1.2rem",
              md: "1.4rem"
            }
          }}
        >
          {/* Desktop */}
          <Box
            component="span"
            sx={{
              display: {
                xs: "none",
                sm: "inline"
              }
            }}
          >
            Groundwater Management Portal
          </Box>

          {/* Mobile */}
          <Box
            component="span"
            sx={{
              display: {
                xs: "inline",
                sm: "none"
              }
            }}
          >
            GW Portal
          </Box>
        </Typography>

        {/* Right section */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: {
              xs: 0.5,
              sm: 1.5
            }
          }}
        >
          <LanguageSelector />

          <IconButton color="inherit" size="small">
            <NotificationsIcon />
          </IconButton>

          <IconButton color="inherit" size="small">
            <AccountCircleIcon />
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default DashboardNavbar;