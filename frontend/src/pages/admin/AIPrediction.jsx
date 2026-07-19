import { useEffect, useState } from "react";

import {
  Container,
  Typography,
  Box,
  ToggleButton,
  ToggleButtonGroup,
  CircularProgress,
  Alert,
} from "@mui/material";

import { getForecast } from "../../services/forecastApi";

import AIPredictionCard from "../../components/admin/AIPredictionCard";

export default function AIPrediction() {

  const [period, setPeriod] = useState("monthly");

  const [forecast, setForecast] = useState(null);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  useEffect(() => {

    loadForecast(period);

  }, [period]);

  async function loadForecast(selectedPeriod) {

    try {

      setLoading(true);

      setError("");

      const data = await getForecast(selectedPeriod);

      setForecast(data);

    }

    catch (err) {

      setError(err.message);

    }

    finally {

      setLoading(false);

    }

  }

  return (

    <Container maxWidth="xl">

      <Typography
        variant="h4"
        fontWeight="bold"
        sx={{ mb: 3 }}
      >

        AI Water Balance Forecasting

      </Typography>

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