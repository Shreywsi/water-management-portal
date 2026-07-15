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

export default function VillageTable({ villages, onView, onEdit, onDelete }) {
  const [query, setQuery] = useState('');
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [active, setActive] = useState(null);

  const filtered = villages.filter((v) =>
    [v.id, v.name, v.district, v.state].join(' ').toLowerCase().includes(query.toLowerCase())
  );

  const openMenu = (e, village) => {
    setMenuAnchor(e.currentTarget);
    setActive(village);
  };
  const closeMenu = () => {
    setMenuAnchor(null);
    setActive(null);
  };

  return (
    <Card>
      <Box sx={{ p: 2 }}>
        <TextField
          size="small"
          fullWidth
          placeholder="Search by village, district, or state"
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
            <TableCell>Village ID</TableCell>
            <TableCell>Village Name</TableCell>
            <TableCell>Number of Farmers</TableCell>
            <TableCell>Number of Wells</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filtered.map((village) => (
            <TableRow key={village.id} hover>
              <TableCell>{village.id}</TableCell>
              <TableCell>{village.name}</TableCell>
              <TableCell>{village.farmers}</TableCell>
              <TableCell>{village.wells}</TableCell>
              <TableCell align="right">
                <Tooltip title="More actions">
                  <IconButton size="small" onClick={(e) => openMenu(e, village)}>
                    <MoreVertOutlinedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
          {filtered.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                <Typography color="text.secondary">No villages match this search.</Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={closeMenu}>
        <MenuItem
          onClick={() => {
            onView(active);
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
            onEdit(active);
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
            onDelete(active);
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
