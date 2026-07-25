import { useEffect, useState } from "react";
import { Grid, Card, Box, Typography, Avatar, Skeleton } from "@mui/material";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import LayersOutlinedIcon from "@mui/icons-material/LayersOutlined";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import { fetchDashboardStats } from "../../../api/dashboardStats";

const ACCENT = "#1E293B";

const STAT_CONFIG = [
  { key: "locationsCount", label: "Locations", Icon: PlaceOutlinedIcon },
  { key: "gisLayersCount", label: "GIS Layers", Icon: LayersOutlinedIcon },
  { key: "foldersCount", label: "Resource Folders", Icon: FolderOutlinedIcon },
  { key: "filesCount", label: "Files", Icon: InsertDriveFileOutlinedIcon },
];

export default function QuickStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats()
      .then(setStats)
      .finally(() => setLoading(false));
  }, []);

  return (
    <Grid container spacing={2}>
      {STAT_CONFIG.map(({ key, label, Icon }) => (
        <Grid item xs={6} md={3} key={key}>
          <Card
            variant="outlined"
            sx={{
              p: 2.5,
              borderRadius: 3,
              display: "flex",
              alignItems: "center",
              gap: 2,
              boxShadow: "0 1px 3px rgba(15,23,42,0.06)",
            }}
          >
            <Avatar
              variant="rounded"
              sx={{ bgcolor: `${ACCENT}1A`, color: ACCENT, width: 44, height: 44 }}
            >
              <Icon fontSize="small" />
            </Avatar>
            <Box>
              {loading ? (
                <Skeleton width={36} height={30} />
              ) : (
                <Typography variant="h5" fontWeight={700}>
                  {stats?.[key] ?? 0}
                </Typography>
              )}
              <Typography variant="caption" color="text.secondary">
                {label}
              </Typography>
            </Box>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}