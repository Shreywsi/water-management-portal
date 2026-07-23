import {
  Card,
  CardContent,
  Typography,
  Grid,
  Divider,
  Chip,
  Button,
  CircularProgress,
} from "@mui/material";

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
      </CardContent>
    </Card>
  );
}