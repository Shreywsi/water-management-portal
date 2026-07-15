import { Link, useLocation } from "react-router-dom";

import {
  Box,
  Typography,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";

import DashboardIcon from "@mui/icons-material/Dashboard";
import FolderIcon from "@mui/icons-material/Folder";
import MapIcon from "@mui/icons-material/Map";
import DescriptionIcon from "@mui/icons-material/Description";
import SettingsIcon from "@mui/icons-material/Settings";

export default function Sidebar() {
  const location = useLocation();

  const menu = [
    {
      title: "Dashboard",
      icon: <DashboardIcon />,
      path: "/admin",
    },
    {
      title: "My Workspace",
      icon: <FolderIcon />,
      path: "/admin/workspace",
    },
    {
      title: "GIS Workspace",
      icon: <MapIcon />,
      path: "/admin/gis",
    },
    {
      title: "Reports",
      icon: <DescriptionIcon />,
      path: "/admin/reports",
    },
    {
      title: "Settings",
      icon: <SettingsIcon />,
      path: "/admin/settings",
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
        Water Portal
      </Typography>

      <List>
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
    </Box>
  );
}