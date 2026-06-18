import React, { useEffect, useState } from 'react';
import { Box, Typography, Stack } from '@mui/material';
import SystemHealthCards from '../../components/admin/SystemHealthCards';
import { fetchSystemHealth } from '../../data/dataService';

export default function SystemHealthPage() {
  const [health, setHealth] = useState(null);

  useEffect(() => {
    fetchSystemHealth().then(setHealth);
  }, []);

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h5">System Health</Typography>
        <Typography variant="body2" color="text.secondary">
          Live status of the platform's core infrastructure.
        </Typography>
      </Box>

      <SystemHealthCards health={health} />
    </Stack>
  );
}
