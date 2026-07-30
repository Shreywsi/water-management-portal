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
    title: "Locations",
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
      <Typography
        variant="h6"
        sx={{
          p: 3,
          fontWeight: "bold",
        }}
      >
        AI-Enabled Water Portal
      </Typography>

      <List sx={{ flexGrow: 1 }}>
        {menu.map((item) => (
          <ListItemButton
            key={item.title}
            component={Link}
            to={item.path}
            selected={location.pathname === item.path}
            sx={{
              color: "white",
              "&.Mui-selected": {
                bgcolor: "#334155",
              },
              "&:hover": {
                bgcolor: "#475569",
              },
            }}
          >
            <ListItemIcon sx={{ color: "white" }}>
              {item.icon}
            </ListItemIcon>

            <ListItemText primary={item.title} />
          </ListItemButton>
        ))}
            </List>

      <List>
        <ListItemButton
          onClick={handleLogout}
          sx={{
            color: "#ef4444",
            "&:hover": {
              bgcolor: "#334155",
            },
          }}
        >
          <ListItemIcon sx={{ color: "#ef4444" }}>
            <LogoutIcon />
          </ListItemIcon>

          <ListItemText primary="Logout" />
        </ListItemButton>
      </List>
    </Box>
  );
}