import { useEffect, useState } from "react";
import { Card, Typography, Box, CircularProgress } from "@mui/material";
import API_BASE from "../../config/api";

export default function AIPredictionCard() {
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrediction = async () => {
      try {
        const response = await fetch(`${API_BASE}/predict/`);
        const data = await response.json();

        setPrediction(data);
      } catch (error) {
        console.error("Prediction API error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPrediction();
  }, []);

  return (
    <Card
      elevation={3}
      sx={{
        p: 3,
        borderRadius: 3,
        height: "100%",
      }}
    >
      <Typography variant="h6" gutterBottom>
        🧠 AI Groundwater Forecast
      </Typography>

      {loading ? (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Typography variant="body2" color="text.secondary">
            Predicted Groundwater Depth
          </Typography>

          <Typography
            variant="h3"
            fontWeight="bold"
            sx={{ mt: 1 }}
          >
            {prediction?.predicted_groundwater_depth} m
          </Typography>

          <Typography sx={{ mt: 2 }}>
            <strong>Model:</strong> {prediction?.model}
          </Typography>

          <Typography color="success.main">
            Status: {prediction?.status}
          </Typography>
        </>
      )}
    </Card>
  );
}