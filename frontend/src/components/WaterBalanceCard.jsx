import axios from "axios";
import { useMemo, useState, useEffect } from "react";
import API_BASE from "../config/api";
import {
  Box,
  Card,
  CardHeader,
  CardContent,
  Typography,
  Button,
  IconButton,
  Collapse,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  TextField,
  Stack,
  Divider,
  Chip,
  Grid,
  Avatar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import ArrowDownwardRoundedIcon from "@mui/icons-material/ArrowDownwardRounded";
import ArrowUpwardRoundedIcon from "@mui/icons-material/ArrowUpwardRounded";
import WaterDropRoundedIcon from "@mui/icons-material/WaterDropRounded";
import AddCircleOutlineRoundedIcon from "@mui/icons-material/AddCircleOutlineRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";

import { useDashboardEdit } from "../context/DashboardEditContext";
// ^ adjust this relative path to wherever you place DashboardEditContext.jsx

/*
 * Water Balance Equation (dynamic parameter set):
 *   sum(inflow parameters) - sum(outflow parameters) = ΔS
 *
 * Parameters are fetched from the backend (Parameter table) and can
 * be added/removed live from this screen - nothing is hardcoded here.
 * Each entry is also tagged with a date representing the period the
 * values are about (entry_date), separate from when it was saved.
 */

// ---------------------------------------------------------------------
// SHARED DESIGN TOKENS — identical to Locations.jsx, GISDataManager.jsx,
// WaterBalanceHistory.jsx, and AIPrediction.jsx, so every admin page
// (including this card, wherever it's embedded) reads as one site.
// Inflow/outflow keep their own semantic colours (success/error) — the
// same green/red already used for "Net Recharge" / "Net Depletion" on
// the Water Balance History page — instead of the previous one-off
// teal/terracotta palette.
// ---------------------------------------------------------------------
const ACCENT = "#1E293B";
const ACCENT_TINT = `${ACCENT}1A`;
const ACCENT_SOFT_BG = "#F8FAFC";
const ACCENT_BORDER = "#E2E8F0";
const CARD_SHADOW = "0 1px 3px rgba(15,23,42,0.06)";

const RECHARGE = "#2E7D32"; // MUI success.main
const RECHARGE_SOFT = "rgba(46, 125, 50, 0.08)";
const DEPLETION = "#D32F2F"; // MUI error.main
const DEPLETION_SOFT = "rgba(211, 47, 47, 0.08)";

const fmt = (n) => {
  if (Number.isNaN(n)) return "0.00";
  return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const todayISO = () => new Date().toISOString().slice(0, 10);

function computeTotals(parameters, values) {
  let inflow = 0;
  let outflow = 0;

  for (const p of parameters) {
    const v = Number(values[p.key]) || 0;
    if (p.category === "inflow") inflow += v;
    else if (p.category === "outflow") outflow += v;
  }

  return { inflow, outflow, deltaS: inflow - outflow };
}

function BalanceGauge({ inflow, outflow }) {
  const max = Math.max(inflow, outflow, 1);
  const inflowPct = (inflow / max) * 100;
  const outflowPct = (outflow / max) * 100;

  return (
    <Box sx={{ width: "100%" }}>
      <Stack direction="row" spacing={2} sx={{ mb: 0.5 }}>
        <Typography variant="caption" sx={{ color: RECHARGE, fontWeight: 700, letterSpacing: 0.4 }}>
          INFLOW
        </Typography>
        <Typography variant="caption" sx={{ ml: 2, color: DEPLETION, fontWeight: 700, letterSpacing: 0.4 }}>
          OUTFLOW
        </Typography>
      </Stack>
      <Box
        sx={{
          position: "relative",
          height: 10,
          borderRadius: 999,
          bgcolor: ACCENT_BORDER,
          overflow: "hidden",
          display: "flex",
        }}
      >
        <Box
          sx={{
            width: `${inflowPct / 2}%`,
            ml: `${50 - inflowPct / 2}%`,
            bgcolor: RECHARGE,
            borderRadius: 999,
            transition: "width 200ms ease, margin-left 200ms ease",
          }}
        />
        <Box
          sx={{
            width: `${outflowPct / 2}%`,
            bgcolor: DEPLETION,
            borderRadius: 999,
            transition: "width 200ms ease",
          }}
        />
      </Box>
    </Box>
  );
}

function ComponentTable({
  title,
  icon,
  category,
  parameters,
  values,
  onFieldChange,
  onDeleteParameter,
  onAddParameter,
  accent,
  accentSoft,
  total,
  editMode,
}) {
  const [addingOpen, setAddingOpen] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newKey, setNewKey] = useState("");

  const fields = parameters.filter((p) => p.category === category);

  const submitAdd = () => {
    if (!newLabel.trim()) return;
    const key = (newKey.trim() || newLabel.trim())
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "");
    onAddParameter({ key, label: newLabel.trim(), category });
    setNewLabel("");
    setNewKey("");
    setAddingOpen(false);
  };

  return (
    <Box sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2.5, overflow: "hidden", height: "100%" }}>
      <Stack
        direction="row"
        alignItems="center"
        spacing={1}
        sx={{ px: 2, py: 1.25, bgcolor: accentSoft, borderBottom: "1px solid", borderColor: "divider" }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 24,
            height: 24,
            borderRadius: "50%",
            bgcolor: accent,
            color: "#fff",
          }}
        >
          {icon}
        </Box>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: ACCENT }}>
          {title}
        </Typography>
      </Stack>

      <TableContainer>
        <Table size="small">
          <TableBody>
            {fields.map((f) => (
              <TableRow key={f.key} sx={{ "&:last-of-type td": { borderBottom: addingOpen ? undefined : 0 } }}>
                <TableCell sx={{ color: "text.secondary", fontSize: 13.5, py: 1 }}>
                  <Box component="span" sx={{ fontWeight: 700, color: ACCENT, mr: 0.75 }}>
                    {f.key}
                  </Box>
                  {f.label}
                </TableCell>
                <TableCell align="right" sx={{ py: 0.75, width: 132 }}>
                  <TextField
                    size="small"
                    type="number"
                    variant="outlined"
                    value={values[f.key] ?? ""}
                    onChange={(e) => onFieldChange(f.key, e.target.value)}
                    inputProps={{
                      style: { textAlign: "right", fontSize: 13.5 },
                      step: "any",
                    }}
                    sx={{ width: 116, "& .MuiOutlinedInput-root": { borderRadius: 1.5 } }}
                  />
                </TableCell>
                {editMode && (
                  <TableCell align="center" sx={{ py: 0.75, width: 40, pl: 0 }}>
                    <IconButton
                      size="small"
                      onClick={() => onDeleteParameter(f)}
                      sx={{ color: "text.secondary", "&:hover": { color: DEPLETION } }}
                    >
                      <DeleteOutlineRoundedIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                )}
              </TableRow>
            ))}

            {fields.length === 0 && !addingOpen && (
              <TableRow>
                <TableCell colSpan={3} sx={{ color: "text.secondary", fontSize: 13, py: 1.5, fontStyle: "italic" }}>
                  No parameters yet — add one below.
                </TableCell>
              </TableRow>
            )}

            {addingOpen && editMode && (
              <TableRow>
                <TableCell colSpan={3} sx={{ py: 1.25 }}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <TextField
                      size="small"
                      label="Label"
                      placeholder="e.g. Recharge from tank overflow"
                      value={newLabel}
                      onChange={(e) => setNewLabel(e.target.value)}
                      sx={{ flex: 1 }}
                    />
                    <TextField
                      size="small"
                      label="Key (optional)"
                      placeholder="auto from label"
                      value={newKey}
                      onChange={(e) => setNewKey(e.target.value)}
                      sx={{ width: 140 }}
                    />
                    <Button size="small" variant="contained" disableElevation onClick={submitAdd} sx={{ bgcolor: accent, "&:hover": { bgcolor: accent } }}>
                      Add
                    </Button>
                    <Button size="small" onClick={() => setAddingOpen(false)}>
                      Cancel
                    </Button>
                  </Stack>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {editMode && !addingOpen && (
        <Box sx={{ px: 2, py: 1 }}>
          <Button
            size="small"
            startIcon={<AddCircleOutlineRoundedIcon sx={{ fontSize: 16 }} />}
            onClick={() => setAddingOpen(true)}
            sx={{ textTransform: "none", fontWeight: 600, color: accent, px: 0, "&:hover": { bgcolor: "transparent" } }}
          >
            Add parameter
          </Button>
        </Box>
      )}

      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ px: 2, py: 1.1, bgcolor: ACCENT_SOFT_BG, borderTop: "1px solid", borderColor: "divider" }}
      >
        <Typography variant="caption" sx={{ fontWeight: 700, color: ACCENT, letterSpacing: 0.3 }}>
          TOTAL
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: 700, color: accent }}>
          {fmt(total)}
        </Typography>
      </Stack>
    </Box>
  );
}

export default function WaterBalanceCard({ unit = "MCM" }) {
  const { editMode, adminPassword } = useDashboardEdit();

  const [parameters, setParameters] = useState([]); // [{id, key, label, category}]
  const [values, setValues] = useState({}); // {key: number}
  const [entryDate, setEntryDate] = useState(todayISO());
  const [expanded, setExpanded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [clusters, setClusters] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [loadError, setLoadError] = useState("");

  const totals = useMemo(() => computeTotals(parameters, values), [parameters, values]);
  const isSurplus = totals.deltaS >= 0;
  const accent = isSurplus ? RECHARGE : DEPLETION;

  const fetchParameters = () => {
    axios
      .get(`${API_BASE}/parameters/`)
      .then((res) => {
        setParameters(res.data);
        // Ensure a values entry exists for every parameter, without
        // clobbering anything the user has already typed.
        setValues((prev) => {
          const next = { ...prev };
          for (const p of res.data) {
            if (!(p.key in next)) next[p.key] = "";
          }
          return next;
        });
      })
      .catch((err) => {
        console.error("Parameter list error:", err);
        setLoadError("Could not load parameters from the server.");
      });
  };

  useEffect(() => {
    axios
      .get(`${API_BASE}/location-list/`)
      .then((res) => setClusters(res.data))
      .catch((err) => console.error("Location error:", err));

    fetchParameters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFieldChange = (key, raw) => {
    setValues((prev) => ({ ...prev, [key]: raw === "" ? "" : Number(raw) }));
  };

  const handleAddParameter = async ({ key, label, category }) => {
    try {
      await axios.post(
        `${API_BASE}/parameters/`,
        { key, label, category },
        { headers: { "X-Admin-Password": adminPassword } }
      );
      fetchParameters();
    } catch (err) {
      alert(err.response?.data?.error || "Could not add parameter.");
    }
  };

  const handleDeleteParameter = async (param) => {
    if (!window.confirm(`Delete parameter "${param.label}"? Past records keep their saved values.`)) return;
    try {
      await axios.delete(`${API_BASE}/parameters/${param.id}/`, {
        headers: { "X-Admin-Password": adminPassword },
      });
      setValues((prev) => {
        const next = { ...prev };
        delete next[param.key];
        return next;
      });
      fetchParameters();
    } catch (err) {
      alert(err.response?.data?.error || "Could not delete parameter.");
    }
  };

  const saveWaterBalance = async () => {
    if (!selectedLocation) {
      alert("Please select a village/cluster.");
      return;
    }
    if (!entryDate) {
      alert("Please select a date.");
      return;
    }

    // Only send parameters that currently exist, coerced to numbers
    // (blank -> 0), so the payload always matches active parameters.
    const payloadValues = {};
    for (const p of parameters) {
      payloadValues[p.key] = Number(values[p.key]) || 0;
    }

    try {
      setSaving(true);
      const response = await axios.post(
        `${API_BASE}/water-balance/add/`,
        {
          location: selectedLocation,
          date: entryDate,
          values: payloadValues,
        },
        { headers: { "X-Admin-Password": adminPassword } }
      );
      alert(`Water Balance Saved (${response.data.date})\nΔS = ${response.data.delta_s}`);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || JSON.stringify(err.response?.data) || err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card variant="outlined" sx={{ borderRadius: 3, borderColor: "divider", boxShadow: CARD_SHADOW }}>
      <CardHeader
        avatar={
          <Avatar sx={{ bgcolor: ACCENT_TINT, color: ACCENT }}>
            <WaterDropRoundedIcon fontSize="small" />
          </Avatar>
        }
        title={
          <Typography variant="h6" fontWeight={600}>
            Water Balance
          </Typography>
        }
        subheader="Live inflow / outflow accounting for the selected village"
        action={
          <Box sx={{ textAlign: "right", pr: 1, pt: 0.5 }}>
            <Stack direction="row" spacing={1} alignItems="baseline" justifyContent="flex-end">
              <Typography variant="h4" sx={{ fontWeight: 700, color: accent, lineHeight: 1 }}>
                {isSurplus ? "+" : ""}
                {fmt(totals.deltaS)}
              </Typography>
              <Typography variant="body2" sx={{ color: "text.secondary", fontWeight: 600 }}>
                {unit}
              </Typography>
            </Stack>
            <Chip
              size="small"
              icon={
                isSurplus ? (
                  <ArrowUpwardRoundedIcon sx={{ fontSize: 15, color: `${RECHARGE} !important` }} />
                ) : (
                  <ArrowDownwardRoundedIcon sx={{ fontSize: 15, color: `${DEPLETION} !important` }} />
                )
              }
              label={isSurplus ? "Net recharge" : "Net depletion"}
              sx={{
                mt: 0.75,
                bgcolor: isSurplus ? RECHARGE_SOFT : DEPLETION_SOFT,
                color: accent,
                fontWeight: 700,
                fontSize: 12,
              }}
            />
          </Box>
        }
        sx={{ pb: 2, alignItems: "flex-start" }}
      />

      <CardContent sx={{ pt: 0 }}>
        <Box sx={{ mb: 2.5 }}>
          <BalanceGauge inflow={totals.inflow} outflow={totals.outflow} />
        </Box>

        {/* Location + Date row - CSS Grid with minmax so Location always
            keeps a guaranteed share of the row and can never get squeezed
            down by the Date field next to it. */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "minmax(0, 2fr) minmax(160px, 1fr)" },
            gap: 2,
            mb: 2,
          }}
        >
          <FormControl fullWidth sx={{ minWidth: 0 }}>
            <InputLabel>Location</InputLabel>
            <Select value={selectedLocation} label="Location" onChange={(e) => setSelectedLocation(e.target.value)}>
              {clusters.map((cluster) => (
                <MenuItem key={cluster.id} value={cluster.id} sx={{ whiteSpace: "normal" }}>
                  {cluster.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label="Date"
            type="date"
            value={entryDate}
            onChange={(e) => setEntryDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            inputProps={{ max: todayISO() }}
            helperText="Which period these values are about"
          />
        </Box>

        {loadError && (
          <Typography variant="caption" sx={{ color: DEPLETION }}>
            {loadError}
          </Typography>
        )}

        <Box sx={{ mt: 1 }}>
          <Button
            size="small"
            onClick={() => setExpanded((e) => !e)}
            endIcon={
              <ExpandMoreRoundedIcon
                sx={{ transform: expanded ? "rotate(180deg)" : "none", transition: "transform 200ms ease" }}
              />
            }
            sx={{
              textTransform: "none",
              fontWeight: 600,
              color: ACCENT,
              px: 0,
              "&:hover": { bgcolor: "transparent", color: "#101A30" },
            }}
          >
            {expanded ? "Hide component breakdown" : "See component breakdown"}
          </Button>
        </Box>

        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <Divider sx={{ mt: 2, mb: 3 }} />

          <Grid container spacing={2.5}>
            <Grid item xs={12} md={6}>
              <ComponentTable
                title="Inflow components"
                icon={<ArrowDownwardRoundedIcon sx={{ fontSize: 15 }} />}
                category="inflow"
                parameters={parameters}
                values={values}
                onFieldChange={handleFieldChange}
                onDeleteParameter={handleDeleteParameter}
                onAddParameter={handleAddParameter}
                accent={RECHARGE}
                accentSoft={RECHARGE_SOFT}
                total={totals.inflow}
                editMode={editMode}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <ComponentTable
                title="Outflow components"
                icon={<ArrowUpwardRoundedIcon sx={{ fontSize: 15 }} />}
                category="outflow"
                parameters={parameters}
                values={values}
                onFieldChange={handleFieldChange}
                onDeleteParameter={handleDeleteParameter}
                onAddParameter={handleAddParameter}
                accent={DEPLETION}
                accentSoft={DEPLETION_SOFT}
                total={totals.outflow}
                editMode={editMode}
              />
            </Grid>
          </Grid>

          <Box
            sx={{
              mt: 2.5,
              p: 2,
              borderRadius: 2,
              bgcolor: isSurplus ? RECHARGE_SOFT : DEPLETION_SOFT,
              border: "1px solid",
              borderColor: isSurplus ? "success.light" : "error.light",
            }}
          >
            <Typography variant="body2" sx={{ color: ACCENT, fontSize: 13 }}>
              {fmt(totals.inflow)} − {fmt(totals.outflow)} ={" "}
              <Box component="span" sx={{ fontWeight: 700, color: accent }}>
                {fmt(totals.deltaS)} {unit}
              </Box>
            </Typography>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              {isSurplus ? "Groundwater storage is increasing" : "Groundwater storage is decreasing"}
            </Typography>
          </Box>

          <Stack direction="row" justifyContent="flex-end" alignItems="center" spacing={2} sx={{ mt: 3 }}>
            {!editMode && (
              <Stack direction="row" spacing={1} alignItems="center" sx={{ color: "text.secondary" }}>
                <LockOutlinedIcon fontSize="small" />
                <Typography variant="caption">Enable edit mode from the top bar to save</Typography>
              </Stack>
            )}
            {editMode && (
              <Button
                variant="contained"
                disableElevation
                onClick={saveWaterBalance}
                disabled={saving}
                sx={{
                  bgcolor: ACCENT,
                  "&:hover": { bgcolor: "#101A30" },
                  "&:disabled": { bgcolor: "#94A3B8", color: "#FFFFFF" },
                }}
              >
                {saving ? "Saving..." : "Save Water Balance"}
              </Button>
            )}
          </Stack>
        </Collapse>
      </CardContent>
    </Card>
  );
}