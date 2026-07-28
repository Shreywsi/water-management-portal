import {
  Card,
  CardContent,
  Typography,
  Grid,
  Divider,
  Chip,
  Button,
  CircularProgress,
  Stack,
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";

import { useState } from "react";
import { retrainModel } from "../../services/forecastApi";

export default function AIPredictionCard({
    data,
    location,
    onRetrained,
  }) {
  const [training, setTraining] = useState(false);

  if (!data) return null;

  const handleRetrain = async () => {
    try {
      setTraining(true);

      await retrainModel(location);

      alert("Model retrained successfully.");

      if (onRetrained) {
        onRetrained();
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setTraining(false);
    }
  };

  const handleDownloadCSV = () => {
    if (!data) return;

    try {
      const rows = [
        ["Field", "Value"],
        ["Location", data.location],
        ["Predicted Water Balance", Number(data.prediction).toFixed(2)],
        ["Confidence (%)", data.confidence],
        ["Confidence Level", data.confidence_level],
        ["Prediction Range Lower", Number(data.prediction_range.lower).toFixed(2)],
        ["Prediction Range Upper", Number(data.prediction_range.upper).toFixed(2)],
        ["RMSE", Number(data.model_metrics.rmse).toFixed(3)],
        ["MAE", Number(data.model_metrics.mae).toFixed(3)],
        ["R² Score", Number(data.model_metrics.r2).toFixed(3)],
        ["Train Samples", data.model_metrics.train_samples],
        ["Test Samples", data.model_metrics.test_samples],
      ];

      const csvContent = rows
        .map((row) =>
          row.map((val) => `"${String(val ?? "").replace(/"/g, '""')}"`).join(",")
        )
        .join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = `ai-forecast-${data.location}-${new Date()
        .toISOString()
        .slice(0, 10)}.csv`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // delay revoke so the browser has time to start the download
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (err) {
      console.error("CSV download failed:", err);
      alert("Couldn't generate the CSV. Check the console for details.");
    }
  };

  return (
    <Card
      sx={{
        mt: 3,
        borderRadius: 3,
        boxShadow: 4,
      }}
    >
      <CardContent>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          AI Water Balance Forecast
        </Typography>

        <Typography color="text.secondary" sx={{ mb: 3 }}>
          Location: <b>{data.location}</b>
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle2" color="text.secondary">
              Predicted Water Balance
            </Typography>

            <Typography variant="h3" color="primary">
              {Number(data.prediction).toFixed(2)}
            </Typography>
          </Grid>

          <Grid item xs={12} md={4}>
            <Typography variant="subtitle2" color="text.secondary">
              Confidence
            </Typography>

            <Typography variant="h4">
              {data.confidence}%
            </Typography>

            <Chip
              label={data.confidence_level}
              color="success"
              sx={{ mt: 1 }}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <Typography variant="subtitle2" color="text.secondary">
              Prediction Range
            </Typography>

            <Typography variant="h5">
              {Number(data.prediction_range.lower).toFixed(2)}
              {"  —  "}
              {Number(data.prediction_range.upper).toFixed(2)}
            </Typography>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4 }} />

        <Typography variant="h6" gutterBottom>
          Model Performance
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={6} md={3}>
            <Typography color="text.secondary">
              RMSE
            </Typography>

            <Typography variant="h6">
              {Number(data.model_metrics.rmse).toFixed(3)}
            </Typography>
          </Grid>

          <Grid item xs={6} md={3}>
            <Typography color="text.secondary">
              MAE
            </Typography>

            <Typography variant="h6">
              {Number(data.model_metrics.mae).toFixed(3)}
            </Typography>
          </Grid>

          <Grid item xs={6} md={3}>
            <Typography color="text.secondary">
              R² Score
            </Typography>

            <Typography variant="h6">
              {Number(data.model_metrics.r2).toFixed(3)}
            </Typography>
          </Grid>

          <Grid item xs={6} md={3}>
            <Typography color="text.secondary">
              Samples
            </Typography>

            <Typography variant="h6">
              {data.model_metrics.train_samples}
              {" / "}
              {data.model_metrics.test_samples}
            </Typography>
          </Grid>
        </Grid>
        <Divider sx={{ my: 3 }} />

        <Stack direction="row" spacing={2}>
          <Button
            variant="contained"
            fullWidth
            disabled={training}
            onClick={handleRetrain}
          >
            {training ? (
              <>
                <CircularProgress
                  size={20}
                  sx={{ mr: 1, color: "white" }}
                />
                Retraining...
              </>
            ) : (
              "Retrain Model"
            )}
          </Button>

          <Button
            variant="outlined"
            endIcon={<DownloadIcon />}
            onClick={handleDownloadCSV}
            sx={{ whiteSpace: "nowrap", textTransform: "none", fontWeight: 600 }}
          >
            Download CSV
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}