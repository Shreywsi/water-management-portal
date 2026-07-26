import { useEffect, useState } from "react";
import axios from "axios";
import API_BASE from "../../config/api";
import Sidebar from "../../components/Sidebar";
import WaterBalanceCard from "../../components/WaterBalanceCard.jsx";
import {
  Card,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Chip,
  Grid,
  TextField,
  Paper,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar,
  Stack,
  InputAdornment,
  Alert,
  AlertTitle,
  Button,
} from "@mui/material";

import HistoryIcon from "@mui/icons-material/History";
import SearchIcon from "@mui/icons-material/Search";
import DescriptionIcon from "@mui/icons-material/Description";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import WaterDropIcon from "@mui/icons-material/WaterDrop";
import PlaceIcon from "@mui/icons-material/Place";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";

const NAVY = "#1E293B"; // matches sidebar
const NAVY_SOFT = "#1E293B14";

export default function WaterBalanceHistory() {
  const [history, setHistory] = useState([]);
  const [summary, setSummary] = useState({});
  const [search, setSearch] = useState("");
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [staleLocations, setStaleLocations] = useState([]);
  const [retraining, setRetraining] = useState(false);

  // Load list of locations once, on page load
  useEffect(() => {
    const loadLocations = async () => {
      try {
        const res = await axios.get(`${API_BASE}/location-list/`);
        setLocations(res.data);
        if (res.data.length > 0) {
          setSelectedLocation(res.data[0].id);
        }
      } catch (err) {
        console.error(err);
      }
    };
    loadLocations();
  }, []);

  // Check for stale (needs-retrain) models once, on page load
  useEffect(() => {
    loadStaleLocations();
  }, []);

  // Reload history whenever the selected location changes
  useEffect(() => {
    if (selectedLocation) {
      loadHistory(selectedLocation);
    }
  }, [selectedLocation]);

  const loadHistory = async (locationId) => {
    try {
      const res = await axios.get(`${API_BASE}/water-balance/history/`, {
        params: { location: locationId },
      });

      setHistory(res.data.records);
      setSummary(res.data.summary);
    } catch (err) {
      console.error(err);
      setHistory([]);
      setSummary({});
    }
  };

  const loadStaleLocations = async () => {
    try {
      const res = await axios.get(`${API_BASE}/ml/stale-locations/`);
      setStaleLocations(res.data.stale_locations || []);
    } catch (err) {
      console.error("Stale locations check failed:", err);
    }
  };

  const handleRetrainAll = async () => {
    try {
      setRetraining(true);
      const res = await axios.post(`${API_BASE}/ml/retrain-all-stale/`);
      alert(res.data.message);
      loadStaleLocations(); // refresh the banner after retraining
    } catch (err) {
      alert(err.response?.data?.message || "Retrain failed.");
    } finally {
      setRetraining(false);
    }
  };

  const filteredHistory = history.filter((item) =>
    `${item.date} ${item.time}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>

      <Sidebar />

      <Box
        sx={{
          flex: 1,
          p: { xs: 2.5, md: 4 },
          bgcolor: "#f5f7fb",
        }}
      >

        {/* ============================================================
            STALE MODEL BANNER (only renders when something is stale)
        ============================================================ */}

        {staleLocations.length > 0 && (
          <Alert
            severity="warning"
            icon={<WarningAmberIcon fontSize="inherit" />}
            sx={{
              mb: 3,
              borderRadius: 2.5,
              alignItems: "center",
              "& .MuiAlert-message": { width: "100%" },
            }}
            action={
              <Button
                color="inherit"
                size="small"
                variant="outlined"
                onClick={handleRetrainAll}
                disabled={retraining}
                sx={{ textTransform: "none", fontWeight: 600, whiteSpace: "nowrap" }}
              >
                {retraining ? "Retraining..." : "Retrain All"}
              </Button>
            }
          >
            <AlertTitle sx={{ fontWeight: 700 }}>
              {staleLocations.length} location{staleLocations.length > 1 ? "s" : ""} need model retraining
            </AlertTitle>
            {staleLocations.map((loc) => loc.location_name).join(", ")} — forecasts for{" "}
            {staleLocations.length > 1 ? "these locations" : "this location"} may be unavailable until retrained.
          </Alert>
        )}

        {/* ============================================================
            WATER BALANCE ENTRY
        ============================================================ */}

        <Box
          sx={{
            mb: 4,
            p: 3,
            borderRadius: 3,
            bgcolor: "#FFFFFF",
            border: "1px solid",
            borderColor: "divider",
            boxShadow: "0 2px 8px rgba(15,23,42,0.05)",
          }}
        >
          

          <Box sx={{ mb: 1 }}>
            <WaterBalanceCard unit="MCM" />
          </Box>
        </Box>

        {/* ============================================================
            HISTORY & ANALYTICS
        ============================================================ */}

        <Box
          sx={{
            mt: 5,
            p: 3,
            borderRadius: 3,
            bgcolor: "#FFFFFF",
            border: "1px solid",
            borderColor: "divider",
            boxShadow: "0 2px 8px rgba(15,23,42,0.05)",
          }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center" mb={3}>
            <Avatar
              variant="rounded"
              sx={{
                bgcolor: NAVY_SOFT,
                color: NAVY,
                width: 40,
                height: 40,
              }}
            >
              <HistoryIcon fontSize="small" />
            </Avatar>

            <Box>
              <Typography variant="h5" fontWeight={700}>
                Water Balance History & Analytics
              </Typography>

              <Typography variant="body2" color="text.secondary">
                Review previously saved records, analyse trends, and monitor water
                balance changes over time.
              </Typography>
            </Box>
          </Stack>

          {/* LOCATION SELECTOR */}
          <FormControl
  sx={{
    minWidth: 260,
    mt: 3,
    mb: 3,
    bgcolor: "#fff",
    borderRadius: 1.5,
  }}
>
            <InputLabel>Location</InputLabel>
            <Select
              value={selectedLocation}
              label="Location"
              onChange={(e) => setSelectedLocation(e.target.value)}
              startAdornment={
                <InputAdornment position="start" sx={{ ml: 1 }}>
                  <PlaceIcon fontSize="small" sx={{ color: NAVY }} />
                </InputAdornment>
              }
              sx={{
                borderRadius: 1.5,
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "divider",
                },
              }}
            >
              {locations.length === 0 ? (
                <MenuItem disabled>No Locations Found</MenuItem>
              ) : (
                locations.map((loc) => (
                  <MenuItem key={loc.id} value={loc.id}>
                    {loc.name}
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>

          {/* SUMMARY CARDS */}

          <Grid container spacing={2} sx={{ mb: 3 }}>

            <Grid item xs={12} sm={6} md={3}>
              <Paper
                variant="outlined"
                sx={{
                  p: 2.5,
                  borderRadius: 2.5,
                  borderColor: "divider",
                  boxShadow: "0 1px 3px rgba(15,23,42,0.06)",
                }}
              >
                <Stack direction="row" spacing={1.5} alignItems="center" mb={1}>
                  <Avatar
                    variant="rounded"
                    sx={{ bgcolor: NAVY_SOFT, color: NAVY, width: 34, height: 34 }}
                  >
                    <DescriptionIcon fontSize="small" />
                  </Avatar>
                  <Typography color="text.secondary" variant="body2" fontWeight={500}>
                    Total Records
                  </Typography>
                </Stack>

                <Typography variant="h4" fontWeight={700}>
                  {summary.total_records ?? 0}
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Paper
                variant="outlined"
                sx={{
                  p: 2.5,
                  borderRadius: 2.5,
                  borderColor: "divider",
                  boxShadow: "0 1px 3px rgba(15,23,42,0.06)",
                }}
              >
                <Stack direction="row" spacing={1.5} alignItems="center" mb={1}>
                  <Avatar
                    variant="rounded"
                    sx={{ bgcolor: "success.50", color: "success.main", width: 34, height: 34 }}
                  >
                    <TrendingUpIcon fontSize="small" />
                  </Avatar>
                  <Typography color="text.secondary" variant="body2" fontWeight={500}>
                    Net Recharge
                  </Typography>
                </Stack>

                <Typography variant="h4" fontWeight={700} color="success.main">
                  {summary.recharge_days ?? 0}
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Paper
                variant="outlined"
                sx={{
                  p: 2.5,
                  borderRadius: 2.5,
                  borderColor: "divider",
                  boxShadow: "0 1px 3px rgba(15,23,42,0.06)",
                }}
              >
                <Stack direction="row" spacing={1.5} alignItems="center" mb={1}>
                  <Avatar
                    variant="rounded"
                    sx={{ bgcolor: "error.50", color: "error.main", width: 34, height: 34 }}
                  >
                    <TrendingDownIcon fontSize="small" />
                  </Avatar>
                  <Typography color="text.secondary" variant="body2" fontWeight={500}>
                    Net Depletion
                  </Typography>
                </Stack>

                <Typography variant="h4" fontWeight={700} color="error.main">
                  {summary.depletion_days ?? 0}
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Paper
                variant="outlined"
                sx={{
                  p: 2.5,
                  borderRadius: 2.5,
                  borderColor: "divider",
                  boxShadow: "0 1px 3px rgba(15,23,42,0.06)",
                }}
              >
                <Stack direction="row" spacing={1.5} alignItems="center" mb={1}>
                  <Avatar
                    variant="rounded"
                    sx={{ bgcolor: NAVY_SOFT, color: NAVY, width: 34, height: 34 }}
                  >
                    <WaterDropIcon fontSize="small" />
                  </Avatar>
                  <Typography color="text.secondary" variant="body2" fontWeight={500}>
                    Latest ΔS
                  </Typography>
                </Stack>

                <Typography
                  variant="h4"
                  fontWeight={700}
                  color={
                    summary.average_delta_s?.toFixed(2) ?? "--" >= 0
                      ? "success.main"
                      : "error.main"
                  }
                >
                  {history[0]?.delta_s ?? "--"}
                </Typography>
              </Paper>
            </Grid>

          </Grid>

          {/* SEARCH */}

          <TextField
            fullWidth
            label="Search by Date / Timestamp"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{
              mb: 3,
              bgcolor: "#fff",
              borderRadius: 1.5,
              "& .MuiOutlinedInput-root": { borderRadius: 1.5 },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" sx={{ color: "text.secondary" }} />
                </InputAdornment>
              ),
            }}
          />

          {/* TABLE */}

          <Card
            variant="outlined"
            sx={{
              borderRadius: 2.5,
              borderColor: "divider",
              boxShadow: "0 1px 3px rgba(15,23,42,0.06)",
              overflow: "hidden",
            }}
          >

            <TableContainer>

              <Table>

                <TableHead>

                  <TableRow sx={{ bgcolor: NAVY }}>

                    <TableCell sx={{ color: "#fff", fontWeight: 600 }}>ID</TableCell>

                    <TableCell sx={{ color: "#fff", fontWeight: 600 }}>Date</TableCell>

                    <TableCell sx={{ color: "#fff", fontWeight: 600 }}>Time</TableCell>

                    <TableCell sx={{ color: "#fff", fontWeight: 600 }}>Timestamp</TableCell>

                    <TableCell align="center" sx={{ color: "#fff", fontWeight: 600 }}>ΔS</TableCell>

                    <TableCell sx={{ color: "#fff", fontWeight: 600 }}>Status</TableCell>

                  </TableRow>

                </TableHead>

                <TableBody>

                  {filteredHistory.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                        <Typography color="text.secondary" variant="body2">
                          No records match your search.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}

                  {filteredHistory.map((item, index) => (

                    <TableRow
                      key={item.id}
                      hover
                      sx={{
                        backgroundColor:
                          index === 0 ? "#E3F2FD" : "inherit",
                        "&:last-child td": { borderBottom: 0 },
                      }}
                    >

                      <TableCell sx={{ color: "text.secondary" }}>{item.id}</TableCell>

                      <TableCell>
                        {item.date}
                      </TableCell>

                      <TableCell>
                        {item.time}
                      </TableCell>

                      <TableCell sx={{ color: "text.secondary" }}>
                        {`${item.date} ${item.time}`}
                      </TableCell>

                      <TableCell
                        align="center"
                        sx={{
                          fontWeight: 700,
                          color:
                            item.delta_s >= 0
                              ? "success.main"
                              : "error.main",
                        }}
                      >
                        {item.delta_s >= 0 ? "⬆ " : "⬇ "}
                        {item.delta_s}
                      </TableCell>

                      <TableCell>

                        <Stack direction="row" spacing={1} alignItems="center">
                          <Chip
                            color={
                              item.delta_s >= 0
                                ? "success"
                                : "error"
                            }
                            size="small"
                            label={
                              item.delta_s >= 0
                                ? "Net Recharge"
                                : "Net Depletion"
                            }
                            sx={{ fontWeight: 500 }}
                          />

                          {index === 0 && (
                            <Chip
                              label="Latest"
                              size="small"
                              sx={{
                                bgcolor: NAVY,
                                color: "#fff",
                                fontWeight: 500,
                              }}
                            />
                          )}
                        </Stack>

                      </TableCell>

                    </TableRow>

                  ))}

                </TableBody>

              </Table>

            </TableContainer>

          </Card>

        </Box>

      </Box>

    </Box>
  );
}