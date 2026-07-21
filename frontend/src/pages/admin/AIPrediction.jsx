import { useEffect, useState } from "react";

import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Container,
  Typography,
  Box,
  ToggleButton,
  ToggleButtonGroup,
  CircularProgress,
  Alert,
} from "@mui/material";

import { getForecast } from "../../services/forecastApi";
import { getLocations } from "../../services/locationApi";

import AIPredictionCard from "../../components/admin/AIPredictionCard";

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

            const locationArray = Array.isArray(data)
                ? data
                : data.locations || [];

            setLocations(locationArray);

            if (locationArray.length > 0) {

                setLocation(locationArray[0].id);

            }

        }

        catch (err) {

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

      const data = await getForecast(
        selectedPeriod,
        selectedLocation
      );

      setForecast(data);

    }

    catch (err) {

      console.error(err);

      setError(err.message);

    }

    finally {

      setLoading(false);

    }

  }
console.log(locations);
  return (

    <Container maxWidth="xl">

      <Typography
        variant="h4"
        fontWeight="bold"
        sx={{ mb: 3 }}
      >

        AI Water Balance Forecasting

      </Typography>

      <FormControl
        sx={{
          minWidth: 250,
          mb: 3
        }}
      >

        <InputLabel>

          Location

        </InputLabel>

        <Select
    value={location}
    label="Location"
    onChange={(e) => setLocation(e.target.value)}
>

    {locations.length === 0 ? (

        <MenuItem disabled>
            No Locations Found
        </MenuItem>

    ) : (

        locations.map((loc) => (

            <MenuItem
                key={loc.id}
                value={loc.id}
            >
                {loc.name}
            </MenuItem>

        ))

    )}

</Select>

      </FormControl>

      <ToggleButtonGroup

        exclusive

        value={period}

        onChange={(e, value) => {

          if (value) {

            setPeriod(value);

          }

        }}

        sx={{ mb: 4 }}

      >

        <ToggleButton value="monthly">
          Monthly
        </ToggleButton>

        <ToggleButton value="quarterly">
          Quarterly
        </ToggleButton>

        <ToggleButton value="halfyearly">
          Half-Yearly
        </ToggleButton>

        <ToggleButton value="annual">
          Annual
        </ToggleButton>

        <ToggleButton value="10years">
          10 Years
        </ToggleButton>

        <ToggleButton value="30years">
          30 Years
        </ToggleButton>

      </ToggleButtonGroup>

      {loading && (

        <Box mt={5}>

          <CircularProgress />

        </Box>

      )}

      {error && (

        <Alert severity="error">

          {error}

        </Alert>

      )}

      {!loading &&
        !error &&
        forecast && (

          <AIPredictionCard
            data={forecast}
          />

      )}

    </Container>

  );

}