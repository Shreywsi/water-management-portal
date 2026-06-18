import { useEffect, useState } from "react";
import {
  Container,
  Box,
  Typography,
  Stack
} from "@mui/material";

import DashboardCards from "../../components/admin/DashboardCards";
import RecentActivityTable from "../../components/admin/RecentActivityTable";

import {
  fetchDashboardSummary,
  fetchRecentActivity
} from "../../data/dataService";

export default function AdminDashboard() {

  const [summary, setSummary] = useState({
  totalUsers: 0,
  totalFarmers: 0,
  totalCRPs: 0,
  totalResearchers: 0,
  totalVillages: 0,
  totalWells: 0,
  totalRecords: 0,
  activeUsers: 0
  });
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    Promise.all([
      fetchDashboardSummary(),
      fetchRecentActivity()
    ]).then(([s, a]) => {
      if (!mounted) return;

      setSummary(s);
      setActivity(a);
      setLoading(false);
    });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <Container
      maxWidth="xl"
      sx={{
        py: { xs: 2, md: 4 }
      }}
    >
      <Stack spacing={4}>

        <Box>

          <Typography
            variant="h4"
            fontWeight="bold"
            sx={{
              fontSize: {
                xs: "1.7rem",
                sm: "2rem",
                md: "2.3rem"
              }
            }}
          >
            Dashboard Overview
          </Typography>

          <Typography
            color="text.secondary"
            sx={{
              mt: 1,
              fontSize: {
                xs: "0.9rem",
                md: "1rem"
              }
            }}
          >
            Platform-wide snapshot across users,
            villages and wells.
          </Typography>

        </Box>

        <DashboardCards
          summary={summary}
          loading={loading}
        />

        <Box
          sx={{
            overflowX: "auto"
          }}
        >
          <RecentActivityTable activity={activity} />
        </Box>

      </Stack>
    </Container>
  );
}