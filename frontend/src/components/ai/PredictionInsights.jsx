import {
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  LinearProgress,
  Box,
  Divider,
} from "@mui/material";

export default function PredictionInsights({ prediction }) {
  return (
    <Card
      elevation={3}
      sx={{
        borderRadius: 3,
        height: "100%",
      }}
    >
      <CardContent>
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          🔍 Prediction Insights
        </Typography>

        <Typography color="text.secondary" sx={{ mb: 3 }}>
          AI explanation of the latest groundwater forecast.
        </Typography>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="body2" color="text.secondary">
              Predicted Water Balance
            </Typography>

            <Typography
              variant="h3"
              color="primary"
              fontWeight="bold"
            >
              {prediction?.predicted_groundwater_depth ?? "--"} m
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="body2" color="text.secondary">
              Model
            </Typography>

            <Chip
              label={prediction?.model || "LSTM"}
              color="secondary"
              sx={{ mt: 1 }}
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          Factors considered
        </Typography>

        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 3 }}>
          <Chip label="Rainfall" color="success" />
          <Chip label="Historical Trend" color="primary" />
          <Chip label="Seasonality" color="warning" />
          <Chip label="Recharge Pattern" color="info" />
        </Box>

        <Typography variant="subtitle1" fontWeight="bold">
          Model Confidence
        </Typography>

        <LinearProgress
          variant="determinate"
          value={96}
          sx={{
            height: 10,
            borderRadius: 5,
            mt: 1,
            mb: 1,
          }}
        />

        <Typography variant="body2" color="text.secondary">
          Estimated confidence: <strong>96%</strong>
        </Typography>

        <Divider sx={{ my: 3 }} />

        <Grid container spacing={2}>
          <Grid size={{ xs: 6 }}>
            <Typography variant="body2" color="text.secondary">
              Forecast Horizon
            </Typography>

            <Typography fontWeight="bold">
              Next Month
            </Typography>
          </Grid>

          <Grid size={{ xs: 6 }}>
            <Typography variant="body2" color="text.secondary">
              Status
            </Typography>

            <Chip
              color="success"
              label={prediction?.status || "Success"}
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}