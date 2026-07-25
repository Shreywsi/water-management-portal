import { Grid, Card, CardContent, Box, Typography, Button, Avatar, Stack } from "@mui/material";
import { useNavigate } from "react-router-dom";
import TerrainOutlinedIcon from "@mui/icons-material/TerrainOutlined";
import WaterDropOutlinedIcon from "@mui/icons-material/WaterDropOutlined";
import MapOutlinedIcon from "@mui/icons-material/MapOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

const ACCENT = "#1E293B";

const TOOLS = [
  {
    key: "lstm",
    Icon: TerrainOutlinedIcon,
    title: "AI Prediction (LSTM)",
    description:
      "A Long Short-Term Memory neural network trained on historical water balance data. It forecasts future water levels so the team can plan ahead instead of reacting after the fact.",
    action: "Open AI Prediction",
    path: "/admin/ai",
  },
  {
    key: "waterBalance",
    Icon: WaterDropOutlinedIcon,
    title: "Water Balance",
    description:
      "Tracks rainfall, recharge, evapotranspiration, and extraction for each location, and computes the water balance equation over time to show whether storage is rising or falling.",
    action: "View Water Balance History",
    path: "/admin/water-history",
  },
  {
    key: "qgis",
    Icon: MapOutlinedIcon,
    title: "QGIS Workspace",
    description:
      "The shared QGIS desktop project — wells, village clusters, and boundaries — synced live with the database. Upload new layers or open the workspace directly from here.",
    action: "Open GIS Data Manager",
    path: "/admin/gis",
  },
];

export default function ToolsInfoSection() {
  const navigate = useNavigate();

  return (
    <Box>
      <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
        Tools & How They Work
      </Typography>

      <Grid container spacing={2}>
        {TOOLS.map(({ key, Icon, title, description, action, path }) => (
          <Grid item xs={12} md={4} key={key}>
            <Card
              variant="outlined"
              sx={{
                height: "100%",
                borderRadius: 3,
                boxShadow: "0 1px 3px rgba(15,23,42,0.06)",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <CardContent sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
                <Avatar
                  variant="rounded"
                  sx={{ bgcolor: `${ACCENT}1A`, color: ACCENT, width: 44, height: 44, mb: 2 }}
                >
                  <Icon fontSize="small" />
                </Avatar>

                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
                  {title}
                </Typography>

                <Typography variant="body2" color="text.secondary" sx={{ flex: 1, mb: 2 }}>
                  {description}
                </Typography>

                <Stack direction="row">
                  <Button
                    size="small"
                    endIcon={<ArrowForwardIcon fontSize="small" />}
                    onClick={() => navigate(path)}
                    sx={{ color: ACCENT, textTransform: "none", fontWeight: 600, pl: 0 }}
                  >
                    {action}
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}