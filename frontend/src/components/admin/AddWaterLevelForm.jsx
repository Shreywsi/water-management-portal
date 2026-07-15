import { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  MenuItem,
  Button,
  Stack,
  Alert,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  CircularProgress
} from "@mui/material";
import API_BASE from "../../config/api";

export default function AddWaterLevelForm({ onDataAdded }) {
  const [wells, setWells] = useState([]);
  const [wellId, setWellId] = useState("");
  const [date, setDate] = useState("");
  const [level, setLevel] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const [monthly, setMonthly] = useState([]);
  const [loadingMonthly, setLoadingMonthly] = useState(false);

  // Load well list once
  useEffect(() => {
    fetch(`${API_BASE}/wells/`)
      .then((res) => res.json())
      .then(setWells)
      .catch((err) => console.error("Failed to load wells:", err));
  }, []);

  // Whenever the selected well changes, load its monthly history
  const loadMonthly = (id) => {
    if (!id) {
      setMonthly([]);
      return;
    }
    setLoadingMonthly(true);
    fetch(`${API_BASE}/wells/${id}/`)
      .then((res) => res.json())
      .then((data) => {
        setMonthly(data?.waterLevelHistory?.monthly ?? []);
        setLoadingMonthly(false);
      })
      .catch((err) => {
        console.error("Failed to load monthly history:", err);
        setLoadingMonthly(false);
      });
  };

  useEffect(() => {
    loadMonthly(wellId);
  }, [wellId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!wellId || !date || level === "") {
      setError("Please fill in well, date, and water level.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/water-level/add/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          well_id: wellId,
          time: date,
          water_level_m: parseFloat(level)
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to add reading.");
      }

      setSuccess(true);
      setDate("");
      setLevel("");
      // Refresh the monthly table to show the new entry
      loadMonthly(wellId);
      // Notify parent (e.g. AdminDashboard) so it can refresh its own charts
      if (onDataAdded) {
        onDataAdded();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3 }}>
      <Typography variant="h6" mb={2}>
        Add Monthly Water Level Reading
      </Typography>

      <Box component="form" onSubmit={handleSubmit}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} mb={2}>
          <Box sx={{ width: "100%" }}>
            <Typography
              variant="caption"
              sx={{ display: "block", mb: 0.5, color: "text.secondary" }}
            >
              Well
            </Typography>
            <TextField
              select
              value={wellId}
              onChange={(e) => setWellId(e.target.value)}
              fullWidth
              size="small"
            >
              {wells.map((w) => (
                <MenuItem key={w.id} value={w.id}>
                  {w.well_name} ({w.village})
                </MenuItem>
              ))}
            </TextField>
          </Box>

          <Box sx={{ width: "100%" }}>
            <Typography
              variant="caption"
              sx={{ display: "block", mb: 0.5, color: "text.secondary" }}
            >
              Date
            </Typography>
            <TextField
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              fullWidth
              size="small"
            />
          </Box>

          <Box sx={{ width: "100%" }}>
            <Typography
              variant="caption"
              sx={{ display: "block", mb: 0.5, color: "text.secondary" }}
            >
              Water Level (m)
            </Typography>
            <TextField
              type="number"
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              inputProps={{ step: "0.01" }}
              fullWidth
              size="small"
            />
          </Box>
        </Stack>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>Reading added successfully.</Alert>}

        <Button type="submit" variant="contained" disabled={submitting} sx={{ mt: 1 }}>
          {submitting ? "Saving..." : "Add Reading"}
        </Button>
      </Box>

      {wellId && (
        <Box mt={3}>
          <Typography variant="subtitle2" mb={1}>
            Monthly variation for selected well
          </Typography>

          {loadingMonthly ? (
            <CircularProgress size={20} />
          ) : monthly.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No monthly data yet.
            </Typography>
          ) : (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Month</TableCell>
                  <TableCell align="right">Avg. Water Level (m)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {monthly.map((m) => (
                  <TableRow key={m.period}>
                    <TableCell>{m.period}</TableCell>
                    <TableCell align="right">{m.level}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Box>
      )}
    </Paper>
  );
}