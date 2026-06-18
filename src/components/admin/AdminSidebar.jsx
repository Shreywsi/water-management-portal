import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Box,
  Typography,
  Divider,
} from '@mui/material';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined';
import HolidayVillageOutlinedIcon from '@mui/icons-material/HolidayVillageOutlined';
import WaterDropOutlinedIcon from '@mui/icons-material/WaterDropOutlined';
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined';
import MonitorHeartOutlinedIcon from '@mui/icons-material/MonitorHeartOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';

export const SIDEBAR_WIDTH = 248;

const navItems = [
  { label: 'Dashboard', icon: <DashboardOutlinedIcon />, path: '/admin' },
  { label: 'Users', icon: <GroupOutlinedIcon />, path: '/admin/users' },
  { label: 'Villages', icon: <HolidayVillageOutlinedIcon />, path: '/admin/villages' },
  { label: 'Wells', icon: <WaterDropOutlinedIcon />, path: '/admin/wells' },
  { label: 'Audit Logs', icon: <FactCheckOutlinedIcon />, path: '/admin/audit-logs' },
  { label: 'System Health', icon: <MonitorHeartOutlinedIcon />, path: '/admin/system-health' },
  { label: 'Settings', icon: <SettingsOutlinedIcon />, path: '/admin/settings' },
  { label: 'Profile', icon: <PersonOutlineOutlinedIcon />, path: '/admin/profile' },
];

export default function AdminSidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: SIDEBAR_WIDTH,
        flexShrink: 0,
        display: { xs: 'none', md: 'block' },
        '& .MuiDrawer-paper': {
          width: SIDEBAR_WIDTH,
          boxSizing: 'border-box',
        },
      }}
    >
      <Toolbar sx={{ px: 3, py: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
          <Box
            sx={{
              width: 34,
              height: 34,
              borderRadius: '10px',
              bgcolor: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <WaterDropOutlinedIcon sx={{ color: '#fff', fontSize: 20 }} />
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ lineHeight: 1.1 }}>
              AquiferWatch
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Admin Console
            </Typography>
          </Box>
        </Box>
      </Toolbar>
      <Divider />
      <List sx={{ px: 1.5, py: 1.5 }}>
        {navItems.map((item) => {
          const selected =
            item.path === '/admin'
              ? location.pathname === '/admin'
              : location.pathname.startsWith(item.path);
          return (
            <ListItemButton
              key={item.path}
              selected={selected}
              onClick={() => navigate(item.path)}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                '&.Mui-selected': {
                  bgcolor: 'primary.main',
                  color: '#fff',
                  '& .MuiListItemIcon-root': { color: '#fff' },
                  '&:hover': { bgcolor: 'primary.dark' },
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 38 }}>{item.icon}</ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{ fontSize: '0.92rem', fontWeight: selected ? 700 : 500 }}
              />
            </ListItemButton>
          );
        })}
      </List>
    </Drawer>
  );
}
