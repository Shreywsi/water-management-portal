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
  CircularProgress,
} from "@mui/material";
import API_BASE from "../../config/api";

export default function AddWellDepthForm({ onDataAdded }) {
  const [wells, setWells] = useState([]);
  const [wellId, setWellId] = useState("");
  const [date, setDate] = useState("");
  const [depth, setDepth] = useState("");

  const [currentDepth, setCurrentDepth] = useState(null);
  const [loadingDepth, setLoadingDepth] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Load wells
  useEffect(() => {
    fetch(`${API_BASE}/wells/`)
      .then((res) => res.json())
      .then(setWells)
      .catch((err) => console.error(err));
  }, []);

  // Load selected well details
  const loadDepth = (id) => {
    if (!id) {
      setCurrentDepth(null);
      return;
    }

    setLoadingDepth(true);

    fetch(`${API_BASE}/wells/${id}/`)
      .then((res) => res.json())
      .then((data) => {
        setCurrentDepth(data.well.depth_m);
        setLoadingDepth(false);
      })
      .catch((err) => {
        console.error(err);
        setLoadingDepth(false);
      });
  };

  useEffect(() => {
    loadDepth(wellId);
  }, [wellId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError(null);
    setSuccess(false);

    if (!wellId || !date || depth === "") {
      setError("Please fill in all fields.");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch(`${API_BASE}/wells/update-depth/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          well_id: wellId,
          depth_m: parseFloat(depth),
          measurement_date: date,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update depth.");
      }

      setSuccess(true);
      setDepth("");
      setDate("");

      loadDepth(wellId);

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
    <Paper
      elevation={3}
      sx={{
        p: { xs: 2, sm: 3 },
        borderRadius: 3,
        mt: 3,
      }}
    >
      <Typography variant="h6" mb={2}>
        Add Well Depth
      </Typography>

      <Box component="form" onSubmit={handleSubmit}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          mb={2}
        >
          <Box sx={{ width: "100%" }}>
            <Typography
              variant="caption"
              sx={{
                display: "block",
                mb: 0.5,
                color: "text.secondary",
              }}
            >
              Well
            </Typography>

            <TextField
              select
              fullWidth
              size="small"
              value={wellId}
              onChange={(e) => setWellId(e.target.value)}
            >
              {wells.map((well) => (
                <MenuItem
                  key={well.id}
                  value={well.id}
                >
                  {well.well_name} ({well.village})
                </MenuItem>
              ))}
            </TextField>
          </Box>

          <Box sx={{ width: "100%" }}>
            <Typography
              variant="caption"
              sx={{
                display: "block",
                mb: 0.5,
                color: "text.secondary",
              }}
            >
              Measurement Date
            </Typography>

            <TextField
              type="date"
              fullWidth
              size="small"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </Box>

          <Box sx={{ width: "100%" }}>
            <Typography
              variant="caption"
              sx={{
                display: "block",
                mb: 0.5,
                color: "text.secondary",
              }}
            >
              Well Depth (m)
            </Typography>

            <TextField
              type="number"
              fullWidth
              size="small"
              inputProps={{ step: "0.01" }}
              value={depth}
              onChange={(e) => setDepth(e.target.value)}
            />
          </Box>
        </Stack>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Well depth updated successfully.
          </Alert>
        )}

        <Button
          variant="contained"
          type="submit"
          disabled={submitting}
        >
          {submitting ? "Saving..." : "Update Well Depth"}
        </Button>
      </Box>

      {wellId && (
        <Box mt={3}>
          <Typography variant="subtitle2" gutterBottom>
            Current Well Depth
          </Typography>

          {loadingDepth ? (
            <CircularProgress size={20} />
          ) : (
            <Typography variant="body1">
              <strong>
                {currentDepth ?? "Not Available"} m
              </strong>
            </Typography>
          )}
        </Box>
      )}
    </Paper>
  );
}