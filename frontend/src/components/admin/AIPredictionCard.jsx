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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import TrendingFlatIcon from "@mui/icons-material/TrendingFlat";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import LightbulbIcon from "@mui/icons-material/Lightbulb";

import { useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

import { retrainModel } from "../../services/forecastApi";

function KpiCard({ label, value, sub, icon }) {
  return (
    <Card variant="outlined" sx={{ borderRadius: 3, height: "100%" }}>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              {label}
            </Typography>
            <Typography variant="h5" fontWeight="bold" sx={{ mt: 0.5 }}>
              {value}
            </Typography>
            {sub && (
              <Typography variant="caption" color="text.secondary">
                {sub}
              </Typography>
            )}
          </Box>
          {icon}
        </Stack>
      </CardContent>
    </Card>
  );
}

export default function AIPredictionCard({ data, location, period, onRetrained }) {
  const [training, setTraining] = useState(false);

  if (!data) return null;

  const handleRetrain = async () => {
    try {
      setTraining(true);
      await retrainModel(location);
      alert("Model retrained successfully.");
      if (onRetrained) onRetrained();
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
        .map((row) => row.map((val) => `"${String(val ?? "").replace(/"/g, '""')}"`).join(","))
        .join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `ai-forecast-${data.location}-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (err) {
      console.error("CSV download failed:", err);
      alert("Couldn't generate the CSV. Check the console for details.");
    }
  };

  // ---- Derived data ----
  const historical = data.historical || [];
  const forecastSteps = data.forecast || [];
  const avgDeltaS =
    historical.length > 0
      ? historical.reduce((sum, h) => sum + h.actual, 0) / historical.length
      : 0;

  const trendPct = data.trend_pct ?? 0;
  const TrendIcon =
    trendPct > 10 ? TrendingUpIcon : trendPct < -10 ? TrendingDownIcon : TrendingFlatIcon;
  const trendColor = trendPct > 10 ? "success.main" : trendPct < -10 ? "error.main" : "text.secondary";
  const trendLabel =
    trendPct > 10 ? `Rising ${trendPct}%` : trendPct < -10 ? `Falling ${trendPct}%` : "Stable";

  // Merge historical + forecast into one chart dataset
  const chartData = [
    ...historical.map((h) => ({ date: h.date, actual: h.actual, predicted: null })),
    ...forecastSteps.map((val, i) => ({
      date: `+${i + 1}`,
      actual: null,
      predicted: val,
    })),
  ];

  return (
    <Stack spacing={3} sx={{ mt: 3 }}>
      {/* KPI Row */}
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={2.4}>
          <KpiCard
            label="Current Prediction"
            value={Number(data.prediction).toFixed(2)}
            sub="Water balance"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <KpiCard label="Average ΔS" value={avgDeltaS.toFixed(2)} sub="Historical average" />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <KpiCard
            label="Trend"
            value={trendLabel}
            icon={<TrendIcon sx={{ color: trendColor }} />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <KpiCard
            label="Confidence"
            value={`${data.confidence ?? "—"}%`}
            sub={data.confidence_level}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <KpiCard
            label="Model Status"
            value={data.model_ready ? "Ready" : "Not Trained"}
            icon={
              data.model_ready ? (
                <CheckCircleIcon color="success" />
              ) : (
                <WarningAmberIcon color="warning" />
              )
            }
          />
        </Grid>
      </Grid>

      {/* Chart */}
      <Card sx={{ borderRadius: 3, boxShadow: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Historical vs Predicted Water Balance
          </Typography>
          <Box sx={{ width: "100%", height: 320 }}>
            <ResponsiveContainer>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="actual"
                  name="Historical"
                  stroke="#1976d2"
                  connectNulls={false}
                  dot={{ r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="predicted"
                  name="Predicted"
                  stroke="#ed6c02"
                  strokeDasharray="5 5"
                  connectNulls={false}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {/* AI Insights */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3, boxShadow: 4, height: "100%" }}>
            <CardContent>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                <LightbulbIcon color="warning" />
                <Typography variant="h6">AI Insights</Typography>
              </Stack>
              <List dense>
                {(data.insights || []).map((msg, i) => (
                  <ListItem key={i} disableGutters>
                    <ListItemIcon sx={{ minWidth: 28 }}>•</ListItemIcon>
                    <ListItemText primary={msg} />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Model Information */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3, boxShadow: 4, height: "100%" }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Model Information
              </Typography>
              <Stack spacing={1}>
                <Typography variant="body2">
                  <b>Last Retrained:</b> {data.last_training || "Never"}
                </Typography>
                <Typography variant="body2">
                  <b>Status:</b>{" "}
                  <Chip
                    size="small"
                    label={data.model_ready ? "Ready" : "Needs Training"}
                    color={data.model_ready ? "success" : "warning"}
                  />
                </Typography>
                <Typography variant="body2">
                  <b>Years of History:</b> {data.years_of_history}
                </Typography>
                <Divider sx={{ my: 1 }} />
                <Grid container spacing={2}>
                  <Grid item xs={4}>
                    <Typography color="text.secondary" variant="caption">RMSE</Typography>
                    <Typography variant="subtitle1">
                      {Number(data.model_metrics.rmse).toFixed(3)}
                    </Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography color="text.secondary" variant="caption">MAE</Typography>
                    <Typography variant="subtitle1">
                      {Number(data.model_metrics.mae).toFixed(3)}
                    </Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography color="text.secondary" variant="caption">R²</Typography>
                    <Typography variant="subtitle1">
                      {Number(data.model_metrics.r2).toFixed(3)}
                    </Typography>
                  </Grid>
                </Grid>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Forecast Table */}
      

      {/* Actions */}
      <Card sx={{ borderRadius: 3, boxShadow: 4 }}>
        <CardContent>
          <Stack direction="row" spacing={2}>
            <Button variant="contained" fullWidth disabled={training} onClick={handleRetrain}>
              {training ? (
                <>
                  <CircularProgress size={20} sx={{ mr: 1, color: "white" }} />
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
    </Stack>
  );
}