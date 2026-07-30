import { Link, useLocation, useNavigate } from "react-router-dom";

import {
  Box,
  Typography,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";

import DashboardIcon from "@mui/icons-material/Dashboard";
import MapIcon from "@mui/icons-material/Map";
import PsychologyIcon from "@mui/icons-material/Psychology";
import LogoutIcon from "@mui/icons-material/Logout";
import WaterDropRoundedIcon from "@mui/icons-material/WaterDropRounded";
import LocationOnIcon from "@mui/icons-material/LocationOn";

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("authUsername");
    localStorage.removeItem("authRole");

    navigate("/", { replace: true });
  };

  const menu = [
    {
      title: "Dashboard",
      icon: <DashboardIcon />,
      path: "/admin",
    },
    {
      title: "GIS Workspace",
      icon: <MapIcon />,
      path: "/admin/gis",
    },
    {
      title: "Field Assets",
      icon: <LocationOnIcon />,
      path: "/admin/locations",
    },
    {
      title: "Water Balance",
      icon: <WaterDropRoundedIcon />,
      path: "/admin/water-history",
    },
    {
      title: "AI Prediction",
      icon: <PsychologyIcon />,
      path: "/admin/ai",
    },
  ];

  return (
    <Box
      sx={{
        width: 260,
        minWidth: 260,
        position: "sticky",
        top: 0,
        height: "100vh",
        bgcolor: "#1E293B",
        color: "white",
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
      }}
    >
      <Box
        sx={{
          px: 3,
          py: 3.5,
          borderBottom: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <Typography
          variant="overline"
          sx={{
            color: "rgba(255,255,255,0.5)",
            letterSpacing: 2.5,
            fontWeight: 700,
            fontSize: 11,
          }}
        >
          Workspace
        </Typography>

        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            mt: 0.25,
            letterSpacing: -0.2,
          }}
        >
          Modules
        </Typography>
      </Box>

      <List sx={{ flexGrow: 1, px: 1.5, py: 2 }}>
        {menu.map((item) => {
          const selected = location.pathname === item.path;
          return (
            <ListItemButton
              key={item.title}
              component={Link}
              to={item.path}
              selected={selected}
              sx={{
                color: "white",
                borderRadius: 2,
                mb: 0.5,
                py: 1.1,
                px: 1.75,
                position: "relative",
                transition: "background-color 0.15s ease",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  left: 0,
                  top: "20%",
                  bottom: "20%",
                  width: 3,
                  borderRadius: 4,
                  bgcolor: selected ? "#38BDF8" : "transparent",
                  transition: "background-color 0.15s ease",
                },
                "&.Mui-selected": {
                  bgcolor: "#334155",
                },
                "&.Mui-selected:hover": {
                  bgcolor: "#334155",
                },
                "&:hover": {
                  bgcolor: "#2C3B52",
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: selected ? "#38BDF8" : "rgba(255,255,255,0.85)",
                  minWidth: 38,
                  transition: "color 0.15s ease",
                }}
              >
                {item.icon}
              </ListItemIcon>

              <ListItemText
                primary={item.title}
                primaryTypographyProps={{
                  fontSize: 14.5,
                  fontWeight: selected ? 600 : 500,
                }}
              />
            </ListItemButton>
          );
        })}
      </List>

      <List sx={{ px: 1.5, pb: 2 }}>
        <ListItemButton
          onClick={handleLogout}
          sx={{
            color: "#ef4444",
            borderRadius: 2,
            py: 1.1,
            px: 1.75,
            "&:hover": {
              bgcolor: "rgba(239,68,68,0.08)",
            },
          }}
        >
          <ListItemIcon sx={{ color: "#ef4444", minWidth: 38 }}>
            <LogoutIcon />
          </ListItemIcon>

          <ListItemText
            primary="Logout"
            primaryTypographyProps={{ fontSize: 14.5, fontWeight: 500 }}
          />
        </ListItemButton>
      </List>
    </Box>
  );
}