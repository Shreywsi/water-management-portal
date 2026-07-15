import React from 'react';
import { Grid, Card, CardContent, Box, Typography, LinearProgress, Chip } from '@mui/material';
import StorageOutlinedIcon from '@mui/icons-material/StorageOutlined';
import CloudOutlinedIcon from '@mui/icons-material/CloudOutlined';
import SyncProblemOutlinedIcon from '@mui/icons-material/SyncProblemOutlined';
import DnsOutlinedIcon from '@mui/icons-material/DnsOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';

export default function SystemHealthCards({ health }) {
  if (!health) return null;
  const storagePct = Math.round((health.storageUsedGb / health.storageTotalGb) * 100);

  return (
    <Grid container spacing={2.5}>
      <Grid item xs={12} sm={6} md={4}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
              <StorageOutlinedIcon color="primary" />
              <Typography variant="subtitle1">Database Status</Typography>
            </Box>
            <Chip
              label={health.database.status}
              color={health.database.healthy ? 'success' : 'error'}
              size="small"
            />
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={4}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
              <CloudOutlinedIcon color="primary" />
              <Typography variant="subtitle1">API Status</Typography>
            </Box>
            <Chip label={health.api.status} color={health.api.healthy ? 'success' : 'error'} size="small" />
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={4}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
              <SyncProblemOutlinedIcon color="warning" />
              <Typography variant="subtitle1">Pending Sync Records</Typography>
            </Box>
            <Typography variant="h5">{health.pendingSync}</Typography>
            <Typography variant="caption" color="text.secondary">
              Records waiting to sync from offline field devices
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={4}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
              <DnsOutlinedIcon color="primary" />
              <Typography variant="subtitle1">Storage Usage</Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={storagePct}
              sx={{ height: 8, borderRadius: 4, mb: 1 }}
              color={storagePct > 85 ? 'error' : 'primary'}
            />
            <Typography variant="caption" color="text.secondary">
              {health.storageUsedGb} GB of {health.storageTotalGb} GB used ({storagePct}%)
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={4}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
              <GroupsOutlinedIcon color="primary" />
              <Typography variant="subtitle1">Active Sessions</Typography>
            </Box>
            <Typography variant="h5">{health.activeSessions}</Typography>
            <Typography variant="caption" color="text.secondary">
              Users currently signed in across all roles
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}
