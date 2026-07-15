import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Stack,
  Card,
  TextField,
  InputAdornment,
  MenuItem,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  Grid,
} from '@mui/material';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import { fetchAuditLogs } from '../../data/dataService';
import { roleColors } from '../../data/mockData';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');

  useEffect(() => {
    fetchAuditLogs().then(setLogs);
  }, []);

  const filtered = logs.filter((log) => {
    const matchesQuery = [log.user, log.action, log.role]
      .join(' ')
      .toLowerCase()
      .includes(query.toLowerCase());
    const matchesRole = roleFilter === 'All' || log.role === roleFilter;
    return matchesQuery && matchesRole;
  });

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h5">Audit Logs</Typography>
        <Typography variant="body2" color="text.secondary">
          Full history of actions performed across the platform.
        </Typography>
      </Box>

      <Card>
        <Box sx={{ p: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={8}>
              <TextField
                size="small"
                fullWidth
                placeholder="Search by user or action"
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
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                select
                size="small"
                fullWidth
                label="Role"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                {['All', 'Farmer', 'CRP', 'Researcher', 'Admin'].map((r) => (
                  <MenuItem key={r} value={r}>
                    {r}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
        </Box>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Timestamp</TableCell>
              <TableCell>User</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((log, idx) => (
              <TableRow key={idx} hover>
                <TableCell>{log.timestamp}</TableCell>
                <TableCell>{log.user}</TableCell>
                <TableCell>
                  <Chip size="small" label={log.role} color={roleColors[log.role] || 'default'} variant="outlined" />
                </TableCell>
                <TableCell>{log.action}</TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">No audit log entries match this filter.</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </Stack>
  );
}
