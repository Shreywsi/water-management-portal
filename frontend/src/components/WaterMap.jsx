import { useEffect, useRef, useState } from "react";

import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import { GeoJSON } from "react-leaflet";
//import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
} from "react-leaflet";

import L from "leaflet";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

import {
  Box,
  Paper,
  Typography,
  IconButton,
  Skeleton,
  Fade
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import PlaceIcon from "@mui/icons-material/Place";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import API_BASE from "../config/api";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Filler,
  Tooltip as ChartTooltip
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Filler, ChartTooltip);

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});
const wellDotIcon = L.divIcon({
  className: "",
  html: `
    <div style="
      width:8px;
      height:8px;
      background:#0C447C;
      border:2px solid white;
      border-radius:50%;
      box-shadow:0 0 3px rgba(0,0,0,0.35);
    "></div>
  `,
  iconSize: [8, 8],
  iconAnchor: [4, 4],
});
const ACCENT = "#0C447C";

function MapClickTester() {
  useMapEvents({
    click(e) {
      console.log("Map clicked:", e.latlng);
    },
  });
  return null;
}

// ──────────────────────────────────────────────
// Small metric tile — used in the 2x2 grid
// ──────────────────────────────────────────────
function MetricTile({ label, value, loading, valueColor, dot }) {
  return (
    <Box sx={{ bgcolor: "action.hover", borderRadius: 1.5, px: 1.5, py: 1 }}>
      <Typography sx={{ fontSize: 11, color: "text.secondary", textTransform: "uppercase", letterSpacing: "0.04em", mb: 0.4 }}>
        {label}
      </Typography>
      {loading ? (
        <Skeleton width={60} height={18} />
      ) : (
        <Typography sx={{ fontSize: 13, fontWeight: 500, color: valueColor || "text.primary", display: "flex", alignItems: "center", gap: 0.5 }}>
          {dot && <Box component="span" sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: valueColor }} />}
          {value}
        </Typography>
      )}
    </Box>
  );
}

// ──────────────────────────────────────────────
// Property panel
// ──────────────────────────────────────────────
function WellPropertyPanel({ wellId, onClose }) {
  const [period, setPeriod] = useState("monthly");
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!wellId) return;
    let mounted = true;
    setLoading(true);
    setError(null);
    setDetail(null);

    fetch(`${API_BASE}/wells/${wellId}/`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load well details");
        return res.json();
      })
      .then((data) => {
        if (mounted) {
          setDetail(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (mounted) {
          setError("Couldn't load well details. Try again.");
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [wellId]);

  if (!wellId) return null;

  const history = detail?.waterLevelHistory?.[period] ?? [];
  const hasHistory = history.length > 0;
  const lulcClass = detail?.lulc?.class ?? "Unknown";
  const lulcArea = detail?.lulc?.areaHectares;

  const trend = hasHistory
  ? +(history[history.length - 1].level - history[0].level).toFixed(2)
  : null;

const trendLabel =
  trend > 0
    ? `+${trend.toFixed(2)} m`
    : trend < 0
    ? `${trend.toFixed(2)} m`
    : "0.00 m";

  const chartData = {
    labels: history.map((h) => h.period),
    datasets: [
      {
        data: history.map((h) => h.level),
        borderColor: ACCENT,
        backgroundColor: "rgba(12,68,124,0.06)",
        fill: true,
        tension: 0.35,
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 4,
        pointHoverBackgroundColor: ACCENT,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#1B2A4A",
        padding: 8,
        cornerRadius: 6,
        titleFont: { size: 11 },
        bodyFont: { size: 12 },
        callbacks: { label: (ctx) => `${ctx.parsed.y.toFixed(2)} m` }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { size: 10 }, maxRotation: 0, autoSkip: true, maxTicksLimit: 6 }
      },
      y: {
        grid: { color: "rgba(0,0,0,0.06)" },
        ticks: { font: { size: 10 }, callback: (v) => `${Number(v).toFixed(1)}m` }
      }
    }
  };

  return (
    <Fade in>
      <Paper
        elevation={6}
        sx={{
          position: "absolute",
          top: 16,
          right: 16,
          width: { xs: "calc(100% - 32px)", sm: 360 },
          maxHeight: { xs: "calc(100vh - 120px)", sm: "calc(100% - 32px)" },
          overflowY: "auto",
          zIndex: 1000,
          borderRadius: 3
        }}
      >
        {/* Header */}
        <Box sx={{
          px: 2.25, py: 1.75,
          borderBottom: "0.5px solid",
          borderColor: "divider",
          display: "flex", alignItems: "flex-start", justifyContent: "space-between"
        }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
            <Box sx={{
              width: 36, height: 36, borderRadius: 1.5,
              bgcolor: "info.light",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0
            }}>
              <PlaceIcon sx={{ fontSize: 18, color: "info.dark" }} />
            </Box>
            <Box>
              <Typography sx={{ fontSize: 15, fontWeight: 500 }}>
                {loading ? <Skeleton width={80} /> : detail?.well?.well_name}
              </Typography>
              <Typography sx={{ fontSize: 12.5, color: "text.secondary" }}>
                {loading ? <Skeleton width={70} /> : detail?.well?.village}
              </Typography>
            </Box>
          </Box>
          <IconButton size="small" onClick={onClose} aria-label="Close well details" sx={{ mt: -0.5, mr: -0.5 }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        {error && (
          <Typography color="error" variant="body2" sx={{ px: 2.25, py: 2 }}>
            {error}
          </Typography>
        )}

        {/* Metric grid */}
        <Box sx={{ p: 2.25, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.25 }}>
          <MetricTile
            label="LULC"
            loading={loading}
            value={!loading && detail ? (lulcArea ? `${lulcClass} • ${lulcArea} ha` : lulcClass) : null}
          />
          <MetricTile
            label="Coordinates"
            loading={loading}
            value={
              !loading && detail
                ? `${detail.well.latitude.toFixed(3)}, ${detail.well.longitude.toFixed(3)}`
                : null
            }
          />
          <MetricTile
            label="Well depth"
            loading={loading}
            value={!loading && detail ? `${detail.well.depth_m} m` : null}
          />
          <MetricTile
            label="Water level"
            loading={loading}
            value={
              !loading && detail
                ? (detail.well.water_level_m !== null ? `${detail.well.water_level_m} m` : "No data")
                : null
            }
          />
          <MetricTile
            label="Status"
            loading={loading}
            dot
            valueColor={detail?.well?.status === "active" ? "success.main" : "text.disabled"}
            value={!loading && detail ? (detail.well.status === "active" ? "Active" : "Inactive") : null}
          />
        </Box>

        {/* Trend section */}
        <Box sx={{ px: 2.25, pb: 2.25 }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
            <Typography sx={{ fontSize: 13, fontWeight: 500 }}>
              Water level trend
            </Typography>
            {hasHistory && trend !== null && (
              <Typography
  sx={{
    fontSize: 12,
    fontWeight: 600,
    color:
      trend > 0
        ? "success.main"
        : trend < 0
        ? "error.main"
        : "text.secondary",
    display: "flex",
    alignItems: "center",
    gap: 0.5,
  }}
>
  {trend > 0 && <TrendingUpIcon sx={{ fontSize: 15 }} />}
  {trend < 0 && <TrendingDownIcon sx={{ fontSize: 15 }} />}

  {trend > 0 && `Increased +${trend.toFixed(2)} m`}
  {trend < 0 && `Decreased ${trend.toFixed(2)} m`}
  {trend === 0 && "No change (0.00 m)"}
</Typography>
            )}
          </Box>

          {/* Period toggle */}
          <Box sx={{ display: "flex", gap: 0.5, bgcolor: "action.hover", borderRadius: 1.5, p: 0.4, mb: 1.5 }}>
            {["monthly", "quarterly", "yearly"].map((p) => (
              <Box
                key={p}
                onClick={() => setPeriod(p)}
                sx={{
                  flex: 1, textAlign: "center", py: 0.6, borderRadius: 1,
                  fontSize: 12.5, cursor: "pointer", textTransform: "capitalize",
                  fontWeight: period === p ? 500 : 400,
                  bgcolor: period === p ? "background.paper" : "transparent",
                  color: period === p ? "text.primary" : "text.secondary",
                  boxShadow: period === p ? 1 : "none",
                  transition: "all 0.15s"
                }}
              >
                {p}
              </Box>
            ))}
          </Box>

          {/* Chart */}
          <Box sx={{ width: "100%", height: 140, position: "relative", pb: 1 }}>
            {loading ? (
              <Skeleton variant="rounded" width="100%" height="100%" />
            ) : !hasHistory ? (
              <Box sx={{
                height: "100%", display: "flex", alignItems: "center", justifyContent: "center",
                color: "text.secondary", fontSize: 13
              }}>
                No history available for this period.
              </Box>
            ) : (
              <Line data={chartData} options={chartOptions} />
            )}
          </Box>
        </Box>
      </Paper>
    </Fade>
  );
}

// ──────────────────────────────────────────────
// Main map
// ──────────────────────────────────────────────
export default function WaterMap({ refreshKey }) {
  const [wells, setWells] = useState([]);
const [clusters, setClusters] = useState(null);
const [loading, setLoading] = useState(true);
const [selectedWellId, setSelectedWellId] = useState(null);
  useEffect(() => {
  fetch(`${API_BASE}/wells/`)
    .then((res) => res.json())
    .then((data) => {
      setWells(data);
      setLoading(false);
    })
    .catch((err) => {
      console.error(err);
      setLoading(false);
    });

  fetch(`${API_BASE}/village-clusters/`)
    .then((res) => res.json())
    .then((data) => {
      setClusters(data);
    })
    .catch((err) => console.error(err));
}, [refreshKey]);

  return (
    <Box sx={{ position: "relative", width: "100%", height: "100%" }}>
      <MapContainer
        center={[22.83, 69.72]}
        zoom={11}
        style={{ height: "500px", width: "100%", borderRadius: "10px" }}
      >
        <MapClickTester />
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
       {/* Village Clusters */}
{clusters && (
  <GeoJSON
    data={clusters}
    style={() => ({
      color: "#1565C0",
      weight: 2,
      fillColor: "#42A5F5",
      fillOpacity: 0.25,
    })}
    onEachFeature={(feature, layer) => {
      layer.bindPopup(
        `<b>Village Cluster</b><br>ID: ${
          feature.properties?.ogc_fid ?? "Unknown"
        }`
      );

      layer.on({
        mouseover: (e) => {
          e.target.setStyle({
            weight: 3,
            fillOpacity: 0.5,
          });
        },
        mouseout: (e) => {
          e.target.setStyle({
            weight: 2,
            fillOpacity: 0.25,
          });
        },
      });
    }}
  />
)}

{/* Wells */}
{!loading &&
  wells.map((well) => (
    <Marker
      key={well.id}
      position={[well.latitude, well.longitude]}
      icon={wellDotIcon}
      eventHandlers={{
        click: () => setSelectedWellId(well.id),
      }}
    />
  ))}
      </MapContainer>

      <WellPropertyPanel wellId={selectedWellId} onClose={() => setSelectedWellId(null)} />
    </Box>
  );
}