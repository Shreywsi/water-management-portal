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

const statusColor = { Active: 'success', 'Under Maintenance': 'warning', Dry: 'error' };

export default function WellTable({ wells, onView, onEdit, onDelete }) {
  const [query, setQuery] = useState('');
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [active, setActive] = useState(null);

  const filtered = wells.filter((w) =>
    [w.id, w.owner, w.village, w.status].join(' ').toLowerCase().includes(query.toLowerCase())
  );

  const openMenu = (e, well) => {
    setMenuAnchor(e.currentTarget);
    setActive(well);
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
          placeholder="Search by well ID, owner, village, or status"
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
            <TableCell>Well ID</TableCell>
            <TableCell>Owner Name</TableCell>
            <TableCell>Village</TableCell>
            <TableCell>Depth (m)</TableCell>
            <TableCell>Status</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filtered.map((well) => (
            <TableRow key={well.id} hover>
              <TableCell>{well.id}</TableCell>
              <TableCell>{well.owner}</TableCell>
              <TableCell>{well.village}</TableCell>
              <TableCell>{well.depth}</TableCell>
              <TableCell>
                <Chip size="small" label={well.status} color={statusColor[well.status] || 'default'} />
              </TableCell>
              <TableCell align="right">
                <Tooltip title="More actions">
                  <IconButton size="small" onClick={(e) => openMenu(e, well)}>
                    <MoreVertOutlinedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
          {filtered.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                <Typography color="text.secondary">No wells match this search.</Typography>
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
