import { useEffect, useState } from "react";
import axios from "axios";

import {
  Card,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Chip,
  Grid,
  TextField,
  Paper,
  Box,
} from "@mui/material";

export default function WaterBalanceHistory() {
  const [history, setHistory] = useState([]);
    const [summary, setSummary] = useState({});
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
  try {
    const res = await axios.get(
      "http://127.0.0.1:8000/api/water-balance/history/"
    );

    setHistory(res.data.records);
    setSummary(res.data.summary);

  } catch (err) {
    console.error(err);
    setHistory([]);
    setSummary({});
  }
};

  const filteredHistory = history.filter((item) =>
  `${item.date} ${item.time}`
    .toLowerCase()
    .includes(search.toLowerCase())
);

  return (
    <Box sx={{ p: 3 }}>

      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Water Balance History
      </Typography>

      {/* SUMMARY CARDS */}

      <Grid container spacing={2} sx={{ mb: 3 }}>

        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography color="text.secondary">
              Total Records
            </Typography>

            <Typography variant="h4">
              {summary.total_records ?? 0}
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography color="text.secondary">
              Net Recharge
            </Typography>

            <Typography variant="h4" color="success.main">
              {summary.recharge_days ?? 0}
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography color="text.secondary">
              Net Depletion
            </Typography>

            <Typography variant="h4" color="error.main">
              {summary.depletion_days ?? 0}
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2 }}>
            <Typography color="text.secondary">
              Latest ΔS
            </Typography>

            <Typography
              variant="h4"
              color={
               summary.average_delta_s?.toFixed(2) ?? "--" >= 0
                  ? "success.main"
                  : "error.main"
              }
            >
              {history[0]?.delta_s ?? "--"}
            </Typography>
          </Paper>
        </Grid>

      </Grid>

      {/* SEARCH */}

      <TextField
        fullWidth
        label="Search by Date / Timestamp"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ mb: 3 }}
      />

      {/* TABLE */}

      <Card>

        <TableContainer>

          <Table>

            <TableHead>

              <TableRow>

                <TableCell>ID</TableCell>

                <TableCell>Date</TableCell>

                <TableCell>Time</TableCell>

                <TableCell>Timestamp</TableCell>

                <TableCell align="center">ΔS</TableCell>

                <TableCell>Status</TableCell>

              </TableRow>

            </TableHead>

            <TableBody>

              {filteredHistory.map((item, index) => (

                <TableRow
                  key={item.id}
                  sx={{
                    backgroundColor:
                      index === 0 ? "#E3F2FD" : "inherit",
                  }}
                >

                  <TableCell>{item.id}</TableCell>

                  <TableCell>
                    {item.date}
                  </TableCell>

                  <TableCell>
                    {item.date}
                  </TableCell>

                  <TableCell>
                    {`${item.date} ${item.time}`}
                  </TableCell>

                  <TableCell
                    align="center"
                    sx={{
                      fontWeight: "bold",
                      color:
                        item.delta_s >= 0
                          ? "green"
                          : "red",
                    }}
                  >
                    {item.delta_s >= 0 ? "⬆ " : "⬇ "}
                    {item.delta_s}
                  </TableCell>

                  <TableCell>

                    <Chip
                      color={
                        item.delta_s >= 0
                          ? "success"
                          : "error"
                      }
                      label={
                        item.delta_s >= 0
                          ? "Net Recharge"
                          : "Net Depletion"
                      }
                    />

                    {index === 0 && (
                      <Chip
                        label="Latest"
                        color="primary"
                        size="small"
                        sx={{ ml: 1 }}
                      />
                    )}

                  </TableCell>

                </TableRow>

              ))}

            </TableBody>

          </Table>

        </TableContainer>

      </Card>

    </Box>
  );
}