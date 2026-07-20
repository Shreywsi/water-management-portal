import axios from "axios";
import { useMemo, useState } from "react";
import {
  Box,
  Card,
  Switch,
  FormControlLabel,
  Typography,
  Button,
  Collapse,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Stack,
  Divider,
  Chip,
  Grid,
  InputAdornment
} from "@mui/material";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import ArrowDownwardRoundedIcon from "@mui/icons-material/ArrowDownwardRounded";
import ArrowUpwardRoundedIcon from "@mui/icons-material/ArrowUpwardRounded";
import WaterDropRoundedIcon from "@mui/icons-material/WaterDropRounded";

/*
 * Water Balance Equation:
 *   Rr + Re + Ri + I + Si  =  Se + O + Et + Dp + ΔS
 *   (Inflow terms)             (Outflow terms)   (Change in storage)
 *
 * => ΔS = (Rr + Re + Ri + I + Si) - (Se + O + Et + Dp)
 *
 * ΔS > 0  → storage is increasing (net recharge)
 * ΔS < 0  → storage is decreasing (net depletion)
 */

// ---- Design tokens -------------------------------------------------------
// A hydrology-appropriate palette: teal for water gained (recharge),
// a dry terracotta/rust for water lost (depletion), and a warm neutral
// canvas rather than a generic grey, since this sits on top of field data.
const PALETTE = {
  ink: "#1D2A2B",
  inkMuted: "#5B6B6C",
  canvas: "#F6F4EE",
  border: "#E4E0D3",
  recharge: "#0E6E76", // teal — inflow / net gain
  rechargeSoft: "rgba(14, 110, 118, 0.08)",
  depletion: "#B24A28", // rust — outflow / net loss
  depletionSoft: "rgba(178, 74, 40, 0.08)"
};

const NUMERIC_FONT =
  '"IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';

// Definitions for each term — used for labels + tooltips in the table
const INFLOW_FIELDS = [
  { key: "Rr", label: "Recharge from rainfall" },
  { key: "Re", label: "Recharge from canal seepage" },
  { key: "Ri", label: "Recharge from return flow of applied irrigation" },
  { key: "I", label: "Inflow from outside the basin" },
  { key: "Si", label: "Recharge from seepage (rivers, streams, reservoirs, ponds)" }
];

const OUTFLOW_FIELDS = [
  { key: "Se", label: "Groundwater flow from effluent seepage" },
  { key: "O", label: "Outflow to areas outside the basin" },
  { key: "Et", label: "Evapo-transpiration losses" },
  { key: "Dp", label: "Groundwater draft (pumpage)" }
];

const DEFAULT_VALUES = {
  Rr: 0,
  Re: 0,
  Ri: 0,
  I: 0,
  Si: 0,
  Se: 0,
  O: 0,
  Et: 0,
  Dp: 0
};

// Small helper: format numbers with 2 decimals, no trailing junk
const fmt = (n) => {
  if (Number.isNaN(n)) return "0.00";
  return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

function computeTotals(v) {
  const inflow = INFLOW_FIELDS.reduce((sum, f) => sum + (Number(v[f.key]) || 0), 0);
  const outflow = OUTFLOW_FIELDS.reduce((sum, f) => sum + (Number(v[f.key]) || 0), 0);
  return { inflow, outflow, deltaS: inflow - outflow };
}

// Signature element: a horizontal gauge that shows inflow and outflow as
// proportional bars meeting at a center line, so the balance (or imbalance)
// is legible at a glance before anyone reads a single number.
function BalanceGauge({ inflow, outflow }) {
  const max = Math.max(inflow, outflow, 1);
  const inflowPct = (inflow / max) * 100;
  const outflowPct = (outflow / max) * 100;

  return (
    <Box sx={{ width: "100%" }}>
      <Stack
        direction="row"
        spacing={2} // increase to 3 or 4 if you want more space
        sx={{ mb: 0.5 }}
      >
        <Typography
          variant="caption"
          sx={{
            color: PALETTE.recharge,
            fontWeight: 700,
            letterSpacing: 0.4
          }}
        >
          INFLOW
        </Typography>

        <Typography
          variant="caption"
          sx={{
            ml: 2, // 16px gap
            color: PALETTE.depletion,
            fontWeight: 700,
            letterSpacing: 0.4
          }}
        >
          OUTFLOW
        </Typography>
      </Stack>
      <Box
        sx={{
          position: "relative",
          height: 10,
          borderRadius: 999,
          bgcolor: PALETTE.border,
          overflow: "hidden",
          display: "flex"
        }}
      >
        <Box
          sx={{
            width: `${inflowPct / 2}%`,
            ml: `${50 - inflowPct / 2}%`,
            bgcolor: PALETTE.recharge,
            borderRadius: 999,
            transition: "width 200ms ease, margin-left 200ms ease"
          }}
        />
        <Box
          sx={{
            width: `${outflowPct / 2}%`,
            bgcolor: PALETTE.depletion,
            borderRadius: 999,
            transition: "width 200ms ease"
          }}
        />
      </Box>
    </Box>
  );
}

function ComponentTable({ title, icon, fields, values, onFieldChange, accent, accentSoft, total }) {
  return (
    <Box
      sx={{
        border: `1px solid ${PALETTE.border}`,
        borderRadius: 2.5,
        overflow: "hidden",
        height: "100%"
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        spacing={1}
        sx={{ px: 2, py: 1.25, bgcolor: accentSoft, borderBottom: `1px solid ${PALETTE.border}` }}
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
            color: "#fff"
          }}
        >
          {icon}
        </Box>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: PALETTE.ink }}>
          {title}
        </Typography>
      </Stack>

      <TableContainer>
        <Table size="small">
          <TableBody>
            {fields.map((f) => (
              <TableRow key={f.key} sx={{ "&:last-of-type td": { borderBottom: 0 } }}>
                <TableCell sx={{ color: PALETTE.inkMuted, fontSize: 13.5, py: 1 }}>
                  <Box component="span" sx={{ fontFamily: NUMERIC_FONT, fontWeight: 700, color: PALETTE.ink, mr: 0.75 }}>
                    {f.key}
                  </Box>
                  {f.label}
                </TableCell>
                <TableCell align="right" sx={{ py: 0.75, width: 132 }}>
                  <TextField
                    size="small"
                    type="number"
                    variant="outlined"
                    value={values[f.key]}
                    onChange={(e) => onFieldChange(f.key, e.target.value)}
                    inputProps={{
                      style: { textAlign: "right", fontFamily: NUMERIC_FONT, fontSize: 13.5 },
                      step: "any"
                    }}
                    sx={{
                      width: 116,
                      "& .MuiOutlinedInput-root": { borderRadius: 1.5 }
                    }}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ px: 2, py: 1.1, bgcolor: PALETTE.canvas, borderTop: `1px solid ${PALETTE.border}` }}
      >
        <Typography variant="caption" sx={{ fontWeight: 700, color: PALETTE.ink, letterSpacing: 0.3 }}>
          TOTAL
        </Typography>
        <Typography variant="body2" sx={{ fontFamily: NUMERIC_FONT, fontWeight: 700, color: accent }}>
          {fmt(total)}
        </Typography>
      </Stack>
    </Box>
  );
}

export default function WaterBalanceCard({
  initialValues = DEFAULT_VALUES,
  unit = "MCM", // e.g. Million Cubic Meters — change to match your data's unit
  onChange // optional callback(values, deltaS) if the parent wants to persist data
}) {
  const [values, setValues] = useState({ ...DEFAULT_VALUES, ...initialValues });
  const [expanded, setExpanded] = useState(false);
  const [saving, setSaving] = useState(false);

  const totals = useMemo(() => computeTotals(values), [values]);
  const isSurplus = totals.deltaS >= 0;
  const accent = isSurplus ? PALETTE.recharge : PALETTE.depletion;

  const handleFieldChange = (key, raw) => {
    // Allow empty string while typing, otherwise parse as float
    const next = { ...values, [key]: raw === "" ? "" : Number(raw) };
    setValues(next);
    if (onChange) onChange(next, computeTotals(next).deltaS);
  };

  const saveWaterBalance = async () => {
    try {
      setSaving(true);

      const response = await axios.post("http://127.0.0.1:8000/api/water-balance/add/", {
        ...values
      });

      alert(`Water Balance Saved\nΔS = ${response.data.delta_s}`);
    } catch (err) {
      console.error(err);
      alert("Failed to save water balance.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card
      elevation={0}
      sx={{
        p: { xs: 2.5, sm: 3.5 },
        borderRadius: 3,
        border: `1px solid ${PALETTE.border}`,
        bgcolor: "#FFFFFF"
      }}
    >
      {/* Header row: title + the headline balance value */}
      <Stack
        direction={{ xs: "column", md: "row" }}
        justifyContent="space-between"
        alignItems="flex-start"
        spacing={2.5}
      >
        <Stack direction="row" alignItems="center" spacing={1}>
          <WaterDropRoundedIcon sx={{ color: PALETTE.recharge, fontSize: 20 }} />
          <Typography variant="h6" sx={{ fontWeight: 700, color: PALETTE.ink }}>
            Water Balance
          </Typography>
        </Stack>

        <Box sx={{ minWidth: { xs: "100%", md: 220 } }}>
          <Stack direction="row" spacing={1.25} alignItems="baseline" justifyContent={{ xs: "flex-start", md: "flex-end" }}>
            <Typography
              variant="h3"
              sx={{ fontFamily: NUMERIC_FONT, fontWeight: 700, color: accent, lineHeight: 1 }}
            >
              {isSurplus ? "+" : ""}
              {fmt(totals.deltaS)}
            </Typography>
            <Typography variant="body2" sx={{ color: PALETTE.inkMuted, fontWeight: 600 }}>
              {unit}
            </Typography>
          </Stack>
          <Stack direction="row" justifyContent={{ xs: "flex-start", md: "flex-end" }} sx={{ mt: 0.75, mb: 1.5 }}>
            <Chip
              size="small"
              icon={
                isSurplus ? (
                  <ArrowUpwardRoundedIcon sx={{ fontSize: 15, color: `${PALETTE.recharge} !important` }} />
                ) : (
                  <ArrowDownwardRoundedIcon sx={{ fontSize: 15, color: `${PALETTE.depletion} !important` }} />
                )
              }
              label={isSurplus ? "Net recharge" : "Net depletion"}
              sx={{
                bgcolor: isSurplus ? PALETTE.rechargeSoft : PALETTE.depletionSoft,
                color: accent,
                fontWeight: 700,
                fontSize: 12
              }}
            />
          </Stack>
          <BalanceGauge inflow={totals.inflow} outflow={totals.outflow} />
        </Box>
      </Stack>

      <Box sx={{ mt: 2.5 }}>
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
            color: PALETTE.ink,
            px: 0,
            "&:hover": { bgcolor: "transparent", color: PALETTE.recharge }
          }}
        >
          {expanded ? "Hide component breakdown" : "See component breakdown"}
        </Button>
      </Box>

      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <Divider sx={{ mt: 2, mb: 3, borderColor: PALETTE.border }} />

        <Grid container spacing={2.5}>
          <Grid item xs={12} md={6}>
            <ComponentTable
              title="Inflow components"
              icon={<ArrowDownwardRoundedIcon sx={{ fontSize: 15 }} />}
              fields={INFLOW_FIELDS}
              values={values}
              onFieldChange={handleFieldChange}
              accent={PALETTE.recharge}
              accentSoft={PALETTE.rechargeSoft}
              total={totals.inflow}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <ComponentTable
              title="Outflow components"
              icon={<ArrowUpwardRoundedIcon sx={{ fontSize: 15 }} />}
              fields={OUTFLOW_FIELDS}
              values={values}
              onFieldChange={handleFieldChange}
              accent={PALETTE.depletion}
              accentSoft={PALETTE.depletionSoft}
              total={totals.outflow}
            />
          </Grid>
        </Grid>

        {/* Save button */}
        <Stack direction="row" justifyContent="flex-end" sx={{ mt: 3 }}>
          <Button variant="contained" color="primary" onClick={saveWaterBalance} disabled={saving}>
            {saving ? "Saving..." : "Save Water Balance"}
          </Button>
        </Stack>

        {/* Summary line */}
        <Box
          sx={{
            mt: 2.5,
            p: 2,
            borderRadius: 2,
            bgcolor: isSurplus ? PALETTE.rechargeSoft : PALETTE.depletionSoft,
            border: `1px solid ${isSurplus ? PALETTE.recharge : PALETTE.depletion}33`
          }}
        >
          <Typography variant="body2" sx={{ color: PALETTE.ink, fontFamily: NUMERIC_FONT, fontSize: 13 }}>
            {fmt(totals.inflow)} − {fmt(totals.outflow)} ={" "}
            <Box component="span" sx={{ fontWeight: 700, color: accent }}>
              {fmt(totals.deltaS)} {unit}
            </Box>
          </Typography>
          <Typography variant="caption" sx={{ color: PALETTE.inkMuted }}>
            {isSurplus ? "Groundwater storage is increasing" : "Groundwater storage is decreasing"}
          </Typography>
        </Box>
      </Collapse>
    </Card>
  );
}