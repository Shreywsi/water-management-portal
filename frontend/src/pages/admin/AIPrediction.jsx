import { useEffect, useState } from "react";

import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Container,
  Card,
  CardHeader,
  CardContent,
  Typography,
  Box,
  Stack,
  Avatar,
  ToggleButton,
  ToggleButtonGroup,
  CircularProgress,
  Alert,
} from "@mui/material";
import PsychologyOutlinedIcon from "@mui/icons-material/PsychologyOutlined";

import { getForecast } from "../../services/forecastApi";
import { getLocations } from "../../services/locationApi";

import AIPredictionCard from "../../components/admin/AIPredictionCard";

// ---------------------------------------------------------------------
// SHARED DESIGN TOKENS — identical to Locations.jsx, GISDataManager.jsx,
// and the Water Balance pages, so every admin page reads as one site.
// ---------------------------------------------------------------------
const ACCENT = "#1E293B"; // navy, matches sidebar
const ACCENT_TINT = `${ACCENT}1A`;
const CARD_SHADOW = "0 1px 3px rgba(15,23,42,0.06)";

const cardSx = {
  borderRadius: 3,
  borderColor: "divider",
  boxShadow: CARD_SHADOW,
};

// Shared "segmented control" look for the toggle group, so its selected
// state uses the same navy as every primary button on the other pages.
const toggleGroupSx = {
  flexWrap: "wrap",
  "& .MuiToggleButton-root": {
    textTransform: "none",
    fontWeight: 600,
    borderColor: "divider",
    color: ACCENT,
    "&.Mui-selected": {
      bgcolor: ACCENT,
      color: "#fff",
      "&:hover": { bgcolor: "#101A30" },
    },
    "&:hover": { bgcolor: `${ACCENT}0D` },
  },
};

export default function AIPrediction() {
  const [locations, setLocations] = useState([]);

  const [location, setLocation] = useState("");

  const [period, setPeriod] = useState("monthly");

  const [forecast, setForecast] = useState(null);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  // -------------------------
  // Load Locations
  // -------------------------

  useEffect(() => {
    async function fetchLocations() {
      try {
        const data = await getLocations();

        console.log("Locations API:", data);

        const locationArray = Array.isArray(data) ? data : data.locations || [];

        setLocations(locationArray);

        if (locationArray.length > 0) {
          setLocation(locationArray[0].id);
        }
      } catch (err) {
        console.error(err);

        setError("Unable to load locations.");
      }
    }

    fetchLocations();
  }, []);

  // -------------------------
  // Load Forecast
  // -------------------------

  useEffect(() => {
    if (location) {
      loadForecast(period, location);
    }
  }, [period, location]);

  async function loadForecast(selectedPeriod, selectedLocation) {
    try {
      setLoading(true);
      setError("");

      const data = await getForecast(selectedPeriod, selectedLocation);

      if (!data.success) {
        setForecast(null);
        setError(data.message || "Not enough historical data is available to train the AI model.");
        return;
      }

      setForecast(data);
    } catch (err) {
      console.error(err);

      setForecast(null);

      setError(err.response?.data?.message || err.message || "Unable to fetch prediction.");
    } finally {
      setLoading(false);
    }
  }
  console.log(locations);

  return (
    <Container
      maxWidth="xl"
      sx={{
        py: { xs: 3, sm: 4, md: 5 },
        px: { xs: 2, sm: 3, md: 4 },
      }}
    >
      <Stack spacing={{ xs: 3, md: 4 }}>
        {/* Page header — same pattern as every other admin page */}
        <Box>
          <Stack direction="row" spacing={2} alignItems="center" mb={1}>
            <Avatar
              variant="rounded"
              sx={{
                bgcolor: ACCENT_TINT,
                color: ACCENT,
                width: 48,
                height: 48,
              }}
            >
              <PsychologyOutlinedIcon />
            </Avatar>

            <Box>
              <Typography variant="h4" fontWeight={700}>
                AI Water Balance Forecasting
              </Typography>

              <Typography color="text.secondary">
                Forecast future water balance using the trained model for each location.
              </Typography>
            </Box>
          </Stack>
        </Box>

        {/* Forecast controls */}
        <Card variant="outlined" sx={cardSx}>
          <CardHeader
            avatar={
              <Avatar sx={{ bgcolor: ACCENT_TINT, color: ACCENT }}>
                <PsychologyOutlinedIcon fontSize="small" />
              </Avatar>
            }
            title={
              <Typography variant="h6" fontWeight={600}>
                Forecast Settings
              </Typography>
            }
            subheader="Choose a location and a forecast horizon"
            sx={{ pb: 2, alignItems: "center" }}
          />

          <CardContent>
            <Stack spacing={3}>
              <FormControl sx={{ minWidth: 260 }}>
                <InputLabel>Location</InputLabel>
                <Select value={location} label="Location" onChange={(e) => setLocation(e.target.value)}>
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

              <Box>
                <Typography variant="caption" sx={{ color: "text.secondary", mb: 1, display: "block" }}>
                  Forecast Horizon
                </Typography>
                <ToggleButtonGroup
                  exclusive
                  value={period}
                  onChange={(e, value) => {
                    if (value) {
                      setPeriod(value);
                    }
                  }}
                  sx={toggleGroupSx}
                >
                  <ToggleButton value="monthly">Monthly</ToggleButton>
                  <ToggleButton value="quarterly">Quarterly</ToggleButton>
                  <ToggleButton value="halfyearly">Half-Yearly</ToggleButton>
                  <ToggleButton value="annual">Annual</ToggleButton>
                  <ToggleButton value="10years">10 Years</ToggleButton>
                  <ToggleButton value="30years">30 Years</ToggleButton>
                </ToggleButtonGroup>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        {/* Result state */}
        {loading && (
          <Box display="flex" justifyContent="center" py={5}>
            <CircularProgress sx={{ color: ACCENT }} />
          </Box>
        )}

        {error && <Alert severity="error">{error}</Alert>}

        {!loading && !error && forecast && (
          <AIPredictionCard data={forecast} location={location} onRetrained={() => loadForecast(period, location)} />
        )}
      </Stack>
    </Container>
  );
}