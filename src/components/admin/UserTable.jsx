import React, { useState } from 'react';
import {
  Card,
  Box,
  TextField,
  InputAdornment,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  Typography,
} from '@mui/material';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import MoreVertOutlinedIcon from '@mui/icons-material/MoreVertOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import { roleColors } from '../../data/mockData';

export default function UserTable({ users, onView, onEdit, onDelete }) {
  const [query, setQuery] = useState('');
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [activeUser, setActiveUser] = useState(null);

  const filtered = users.filter((u) =>
    [u.id, u.name, u.role, u.village, u.phone].join(' ').toLowerCase().includes(query.toLowerCase())
  );

  const openMenu = (e, user) => {
    setMenuAnchor(e.currentTarget);
    setActiveUser(user);
  };
  const closeMenu = () => {
    setMenuAnchor(null);
    setActiveUser(null);
  };

  return (
    <Card>
      <Box sx={{ p: 2 }}>
        <TextField
          size="small"
          fullWidth
          placeholder="Search by name, ID, role, village, or phone"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchOutlinedIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
      </Box>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>User ID</TableCell>
            <TableCell>Name</TableCell>
            <TableCell>Role</TableCell>
            <TableCell>Village</TableCell>
            <TableCell>Phone Number</TableCell>
            <TableCell>Status</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filtered.map((user) => (
            <TableRow key={user.id} hover>
              <TableCell>{user.id}</TableCell>
              <TableCell>{user.name}</TableCell>
              <TableCell>
                <Chip size="small" label={user.role} color={roleColors[user.role] || 'default'} variant="outlined" />
              </TableCell>
              <TableCell>{user.village}</TableCell>
              <TableCell>{user.phone}</TableCell>
              <TableCell>
                <Chip
                  size="small"
                  label={user.status}
                  color={user.status === 'Active' ? 'success' : 'default'}
                />
              </TableCell>
              <TableCell align="right">
                <Tooltip title="More actions">
                  <IconButton size="small" onClick={(e) => openMenu(e, user)}>
                    <MoreVertOutlinedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
          {filtered.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                <Typography color="text.secondary">No users match this search.</Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={closeMenu}>
        <MenuItem
          onClick={() => {
            onView(activeUser);
            closeMenu();
          }}
        >
          <ListItemIcon>
            <VisibilityOutlinedIcon fontSize="small" />
          </ListItemIcon>
          View
        </MenuItem>
        <MenuItem
          onClick={() => {
            onEdit(activeUser);
            closeMenu();
          }}
        >
          <ListItemIcon>
            <EditOutlinedIcon fontSize="small" />
          </ListItemIcon>
          Edit
        </MenuItem>
        <MenuItem
          onClick={() => {
            onDelete(activeUser);
            closeMenu();
          }}
          sx={{ color: 'error.main' }}
        >
          <ListItemIcon>
            <DeleteOutlineOutlinedIcon fontSize="small" color="error" />
          </ListItemIcon>
          Delete
        </MenuItem>
      </Menu>
    </Card>
  );
}
