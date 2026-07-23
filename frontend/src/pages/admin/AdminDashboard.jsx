import { useState } from "react";

import {
  Container,
  Box,
  Typography,
  Stack,
  Card,
} from "@mui/material";
import Button from "@mui/material/Button";
import MapIcon from "@mui/icons-material/Map";
import TerrainIcon from "@mui/icons-material/Terrain";

import WaterBalanceCard from "../../components/WaterBalanceCard.jsx";
import WaterMap from "../../components/WaterMap";
import API_BASE from "../../config/api";

import AIPrediction from "./AIPrediction";

export default function AdminDashboard() {
  const [mapRefreshKey, setMapRefreshKey] = useState(0);
  const [gempyLoading, setGempyLoading] = useState(false);
  const [gempyMessage, setGempyMessage] = useState("");

  const runGemPy = async () => {
    try {
      setGempyLoading(true);
      setGempyMessage("");

      const response = await fetch(`${API_BASE}/run-gempy/`, {
        method: "POST",
      });

      const data = await response.json();

      if (data.success) {
        console.log(data);
        setGempyMessage(`Loaded ${data.well_count} wells from PostgreSQL`);
      } else {
        setGempyMessage("GemPy failed.");
      }
    } catch (error) {
      setGempyMessage("Could not connect to backend.");
    } finally {
      setGempyLoading(false);
    }
  };

  const handleOpenGIS = async () => {
    try {
      // Check if launcher is running
      const statusResponse = await fetch("http://127.0.0.1:5001/status");

      if (!statusResponse.ok) {
        alert("Water Management Launcher is not running.");
        return;
      }

      const status = await statusResponse.json();

      if (!status.installed) {
        alert("QGIS is not installed on this computer.");
        return;
      }

      // Ask launcher to open QGIS
      const response = await fetch("http://127.0.0.1:5001/open-qgis", {
        method: "POST",
      });

      const result = await response.json();

      alert(result.message);
    } catch (error) {
      console.error(error);

      alert(
        "Water Management Launcher is not running.\n\nPlease start the launcher first."
      );
    }
  };

  const runModflow = async () => {
    const response = await fetch(`${API_BASE}/run-modflow/`, {
      method: "POST",
    });

    const data = await response.json();

    if (data.success) {
      alert(
        `✅ MODFLOW simulation completed successfully!\n\nWorkspace:\n${data.workspace}`
      );
    } else {
      alert(`❌ ${data.error}`);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2, sm: 3, md: 4 } }}>
      <Stack spacing={{ xs: 3, md: 5 }}>
        {/* Header */}
        <Box>
          <Typography variant="h4" fontWeight="bold">
            Dashboard Overview
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 1 }}>
            Water balance prediction and GIS integration.
          </Typography>
        </Box>

        {/* AI Prediction */}
        

        {/* Water Balance */}
        <WaterBalanceCard
          initialValues={{
            Rr: 120,
            Re: 30,
            Ri: 15,
            I: 5,
            Si: 8,
            Se: 10,
            O: 12,
            Et: 60,
            Dp: 55,
          }}
          unit="MCM"
          onChange={(values, deltaS) => {
            // e.g. save to backend
            // saveWaterBalance(values, deltaS);
          }}
        />
        <AIPrediction />
        {/* GIS Tools + Map */}
        <Card
          elevation={3}
          sx={{
            p: { xs: 2, sm: 3, md: 4 },
            borderRadius: 3,
          }}
        >
          <Typography variant="h6" mb={2}>
            Water Resources Map
          </Typography>

          <Button
            variant="contained"
            startIcon={<MapIcon />}
            sx={{ mb: 2 }}
            onClick={handleOpenGIS}
          >
            Open GIS Workspace
          </Button>

          <Button
            variant="contained"
            color="secondary"
            startIcon={<TerrainIcon />}
            sx={{ mb: 2, ml: 2 }}
            onClick={runGemPy}
            disabled={gempyLoading}
          >
            {gempyLoading ? "Running..." : "Run GemPy"}
          </Button>

          <Button
            variant="contained"
            color="secondary"
            sx={{ mb: 2, ml: 2 }}
            onClick={runModflow}
          >
            Run MODFLOW
          </Button>

          {gempyMessage && (
            <Typography color="success.main" sx={{ mb: 2 }}>
              {gempyMessage}
            </Typography>
          )}

          <Box
            sx={{
              width: "100%",
              height: 500,
              position: "relative",
            }}
          >
            <WaterMap refreshKey={mapRefreshKey} />
          </Box>
        </Card>
      </Stack>
    </Container>
  );
}