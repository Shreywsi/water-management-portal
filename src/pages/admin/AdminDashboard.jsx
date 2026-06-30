import { useEffect, useState } from "react";

import {
  Container,
  Box,
  Typography,
  Stack,
  Card,
  Grid,
  useTheme,
  useMediaQuery
} from "@mui/material";
import Button from "@mui/material/Button";
import MapIcon from "@mui/icons-material/Map";
import DashboardCards from "../../components/admin/DashboardCards";
import RecentActivityTable from "../../components/admin/RecentActivityTable";

import PumpingChart from "../../components/charts/PumpingChart";
import RecordPieChart from "../../components/charts/RecordPieChart";
import WaterLevelChart from "../../components/charts/WaterLevelChart";
import TDSChart from "../../components/charts/TDSChart";
import SalinityChart from "../../components/charts/SalinityChart";
import AddWaterLevelForm from "../../components/admin/AddWaterLevelForm";
import WaterMap from "../../components/WaterMap";

import {
  fetchDashboardSummary,
  fetchRecentActivity,
  fetchPumpingChart,
  fetchPieChart,
  fetchWaterLevelChart,
  fetchTDSChart,
  fetchSalinityChart
} from "../../data/dataService";

export default function AdminDashboard() {
  const theme = useTheme();
  const isSmDown = useMediaQuery(theme.breakpoints.down("sm"));
  const isMdDown = useMediaQuery(theme.breakpoints.down("md"));

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
  const [chartData, setChartData] = useState([]);
  const [pieData, setPieData] = useState([]);
  const [waterLevelData, setWaterLevelData] = useState([]);
  const [tdsData, setTdsData] = useState([]);
  const [salinityData, setSalinityData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    Promise.all([
      fetchDashboardSummary(),
      fetchRecentActivity(),
      fetchPumpingChart(),
      fetchPieChart(),
      fetchWaterLevelChart(),
      fetchTDSChart(),
      fetchSalinityChart()
    ]).then(([s, a, chart, pie, waterLevel, tds, salinity]) => {
      if (!mounted) return;

      setSummary(s);
      setActivity(a);
      setChartData(chart);
      setPieData(pie);
      setWaterLevelData(waterLevel);
      setTdsData(tds);
      setSalinityData(salinity);
      setLoading(false);
    });

    return () => {
      mounted = false;
    };
  }, []);

  // Re-fetch water level + pie chart data after an admin adds a new
  // reading via AddWaterLevelForm, so the dashboard charts update
  // without requiring a full page reload.
  const refreshWaterData = () => {
    Promise.all([
      fetchWaterLevelChart(),
      fetchPieChart()
    ]).then(([waterLevel, pie]) => {
      setWaterLevelData(waterLevel);
      setPieData(pie);
    });
  };

  /* Responsive chart heights */
  const barChartHeight = isSmDown ? 260 : isMdDown ? 300 : 340;
  const lineChartHeight = isSmDown ? 220 : 280;
  const pieChartHeight = isSmDown ? 280 : isMdDown ? 300 : 340;

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2, sm: 3, md: 4 } }}>
      <Stack spacing={{ xs: 3, md: 5 }}>

        {/* Header */}
        <Box>
          <Typography
            variant={isSmDown ? "h5" : "h4"}
            fontWeight="bold"
          >
            Dashboard Overview
          </Typography>
          <Typography
            color="text.secondary"
            sx={{ mt: 1, fontSize: { xs: "0.875rem", sm: "1rem" } }}
          >
            Platform-wide snapshot across users, villages and wells.
          </Typography>
        </Box>

        {/* Summary cards */}
        <DashboardCards summary={summary} loading={loading} />

        {/* Charts */}
        <Grid container spacing={{ xs: 2, sm: 3, md: 4 }}>

          {/* Pumping Chart — takes full width on mobile/tablet, 8 cols on large */}
          <Grid item xs={12} lg={8}>
            <Card
              elevation={3}
              sx={{
                p: { xs: 2, sm: 3, md: 4 },
                borderRadius: 3,
                height: "100%",
                boxSizing: "border-box"
              }}
            >
              <Typography variant="h6" mb={2}>
                Pumping Hours by Crop
              </Typography>

              <Box sx={{ width: "100%", height: barChartHeight, minHeight: 0 }}>
                <PumpingChart data={chartData} />
              </Box>
            </Card>
          </Grid>

          {/* Pie Chart — full width on mobile/tablet, 4 cols on large */}
          <Grid item xs={12} lg={4}>
            <Card
              elevation={3}
              sx={{
                p: { xs: 2, sm: 3, md: 4 },
                borderRadius: 3,
                height: "100%",
                boxSizing: "border-box",
                /*
                 * Explicit min-height prevents the card from collapsing
                 * before the pie chart has room to render fully.
                 */
                minHeight: pieChartHeight + 80
              }}
            >
              <Typography variant="h6" mb={2}>
                Record Distribution
              </Typography>

              {/*
               * Key fix: constrain the pie chart wrapper to a known height
               * so Recharts / Chart.js can measure the container correctly.
               * Without a fixed height the parent card grows infinitely and
               * the chart gets clipped or cut in half.
               */}
              <Box
                sx={{
                  width: "100%",
                  height: pieChartHeight,
                  minHeight: pieChartHeight,
                  position: "relative"
                }}
              >
                <RecordPieChart data={pieData} />
              </Box>
            </Card>
          </Grid>

          {/* Water Level — full width */}
          <Grid item xs={12}>
            <Card
              elevation={3}
              sx={{
                p: { xs: 2, sm: 3, md: 4 },
                borderRadius: 3
              }}
            >
              <Typography variant="h6" mb={2}>
                Water Level Trend
              </Typography>

              <Box sx={{ width: "100%", height: lineChartHeight, minHeight: 0 }}>
                <WaterLevelChart data={waterLevelData} />
              </Box>
            </Card>
          </Grid>

          {/* TDS — full width */}
          <Grid item xs={12}>
            <Card
              elevation={3}
              sx={{
                p: { xs: 2, sm: 3, md: 4 },
                borderRadius: 3
              }}
            >
              <Typography variant="h6" mb={2}>
                TDS Trend
              </Typography>

              <Box sx={{ width: "100%", height: lineChartHeight, minHeight: 0 }}>
                <TDSChart data={tdsData} />
              </Box>
            </Card>
          </Grid>

          {/* Salinity — full width */}
          <Grid item xs={12}>
            <Card
              elevation={3}
              sx={{
                p: { xs: 2, sm: 3, md: 4 },
                borderRadius: 3
              }}
            >
              <Typography variant="h6" mb={2}>
                Salinity Trend
              </Typography>

              <Box sx={{ width: "100%", height: lineChartHeight, minHeight: 0 }}>
                <SalinityChart data={salinityData} />
              </Box>
            </Card>
          </Grid>

        </Grid>
        {/* GIS Map */}
<Card
  elevation={3}
  sx={{
    p: { xs: 2, sm: 3, md: 4 },
    borderRadius: 3
  }}
>
  <Typography variant="h6" mb={2}>
    Water Resources Map
  </Typography>

  <Box
    sx={{
      width: "100%",
      height: 500
    }}
  >
    <Button
  variant="contained"
  startIcon={<MapIcon />}
  sx={{ mb: 2 }}
  onClick={async () => {
    await fetch("http://127.0.0.1:8000/api/open-qgis/", {
      method: "POST",
    });
  }}
>
  Open GIS Workspace
</Button>
    <WaterMap />
  </Box>
</Card>

<AddWaterLevelForm onDataAdded={refreshWaterData} />

        {/* Recent Activity */}
        <Box sx={{ overflowX: "auto" }}>
          <RecentActivityTable activity={activity} />
        </Box>

      </Stack>
    </Container>
  );
}