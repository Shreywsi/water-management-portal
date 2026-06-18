import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Badge,
  Avatar,
  Menu,
  MenuItem,
  Select,
  ListItemIcon,
  Divider,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
} from '@mui/material';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import MenuIcon from '@mui/icons-material/Menu';
import { useSettings } from '../../context/SettingsContext';
import { SIDEBAR_WIDTH } from './AdminSidebar';
import AdminSidebar from './AdminSidebar';

export default function AdminNavbar() {
  const navigate = useNavigate();
  const { language, setLanguage } = useSettings();
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    setAnchorEl(null);
    navigate('/');
  };

  return (
    <>
      <AppBar
        position="fixed"
        color="inherit"
        sx={{
          bgcolor: 'background.paper',
          width: { md: `calc(100% - ${SIDEBAR_WIDTH}px)` },
          ml: { md: `${SIDEBAR_WIDTH}px` },
        }}
      >
        <Toolbar sx={{ gap: 1.5 }}>
          <IconButton
            edge="start"
            onClick={() => setMobileOpen(true)}
            sx={{ display: { xs: 'inline-flex', md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>

          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              AI-Enabled Groundwater Platform
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Community Groundwater Monitoring
            </Typography>
          </Box>

          <Select
            size="small"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            sx={{ minWidth: 110, display: { xs: 'none', sm: 'flex' } }}
          >
            <MenuItem value="English">English</MenuItem>
            <MenuItem value="Hindi">हिंदी</MenuItem>
            <MenuItem value="Gujarati">ગુજરાતી</MenuItem>
          </Select>

          <IconButton onClick={() => navigate('/admin/system-health')}>
            <Badge badgeContent={3} color="warning">
              <NotificationsNoneOutlinedIcon />
            </Badge>
          </IconButton>

          <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ p: 0.4 }}>
            <Avatar sx={{ width: 36, height: 36, bgcolor: 'secondary.main', fontSize: '0.95rem' }}>
              AU
            </Avatar>
          </IconButton>

          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
            <MenuItem
              onClick={() => {
                setAnchorEl(null);
                navigate('/admin/profile');
              }}
            >
              <ListItemIcon>
                <PersonOutlineOutlinedIcon fontSize="small" />
              </ListItemIcon>
              Profile
            </MenuItem>
            <MenuItem
              onClick={() => {
                setAnchorEl(null);
                navigate('/admin/settings');
              }}
            >
              <ListItemIcon>
                <SettingsOutlinedIcon fontSize="small" />
              </ListItemIcon>
              Settings
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <LogoutOutlinedIcon fontSize="small" />
              </ListItemIcon>
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Mobile drawer fallback — permanent sidebar hides below md */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        sx={{ display: { xs: 'block', md: 'none' } }}
      >
        <Box sx={{ width: SIDEBAR_WIDTH }} role="presentation" onClick={() => setMobileOpen(false)}>
          <AdminSidebarMobileList />
        </Box>
      </Drawer>
    </>
  );
}

// Lightweight duplicate of nav items for the temporary mobile drawer,
// reusing the same target paths as AdminSidebar.
function AdminSidebarMobileList() {
  const navigate = useNavigate();
  const items = [
    ['Dashboard', '/admin'],
    ['Users', '/admin/users'],
    ['Villages', '/admin/villages'],
    ['Wells', '/admin/wells'],
    ['Audit Logs', '/admin/audit-logs'],
    ['System Health', '/admin/system-health'],
    ['Settings', '/admin/settings'],
    ['Profile', '/admin/profile'],
  ];
  return (
    <List sx={{ pt: 2 }}>
      {items.map(([label, path]) => (
        <ListItemButton key={path} onClick={() => navigate(path)}>
          <ListItemText primary={label} />
        </ListItemButton>
      ))}
    </List>
  );
}
