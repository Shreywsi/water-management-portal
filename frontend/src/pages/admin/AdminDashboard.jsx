import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  Container,
  Box,
  Typography,
  Stack,
  Paper,
  Avatar,
  Button,
  Chip,
} from "@mui/material";

import WavesIcon from "@mui/icons-material/Waves";
import MapIcon from "@mui/icons-material/Map";
import AppsIcon from "@mui/icons-material/Apps";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward"; // still used on the "Open Resource Library" card link

//import QuickStats from "../../components/admin/dashboard/QuickStats";
import ToolsInfoSection from "../../components/admin/dashboard/ToolsInfoSection";
import ResourceFoldersSection from "../../components/resources/ResourceFoldersSection";

// Brand navy, matches sidebar / GIS Data Manager
const ACCENT = "#1B2A4A";
// Water-themed teal used only in the hero gradient
const TEAL = "#2250b3";

// Each prerequisite card gets its own accent color so they read as distinct,
// scannable items rather than a uniform gray list.
const PREREQUISITES = [
  {
    key: "qgis",
    icon: MapIcon,
    title: "QGIS",
    description:
      "Required to open the QGIS Workspace. Install it on this computer before launching.",
    color: "#2250b3", 
  },
  {
    key: "modelmuse",
    icon: AppsIcon,
    title: "ModelMuse",
    description:
      "Required to open ModelMuse. Install it on this computer before launching.",
    color: "#2250b3", 
  },
  {
    key: "guide",
    icon: MenuBookIcon,
    title: "Setup Guide",
    description:
      "Walks you through installing and connecting each tool, step by step.",
    color: "#2250b3", 
    highlight: true,
  },
];

const scrollToResources = () => {
  document
    .getElementById("resources")
    ?.scrollIntoView({ behavior: "smooth", block: "start" });
};

export default function AdminDashboard() {
  const location = useLocation();

  // Lets links like /admin#resources jump straight to the Resources section below.
  useEffect(() => {
    if (location.hash === "#resources") {
      scrollToResources();
    }
  }, [location]);

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2, sm: 3, md: 4 } }}>
      <Stack spacing={{ xs: 3, md: 4 }}>
        {/* Hero / welcome */}
        <Paper
          elevation={0}
          sx={{
            position: "relative",
            overflow: "hidden",
            borderRadius: 5,
            p: { xs: 3, sm: 4, md: 5 },
            color: "#fff",
            background: `linear-gradient(135deg, ${ACCENT} 0%, #164E63 55%, ${TEAL} 100%)`,
            boxShadow: "0 12px 32px rgba(15,23,42,0.18)",
          }}
        >
          {/* Decorative soft glow accents — purely visual, no layout impact */}
          <Box
            sx={{
              position: "absolute",
              top: -60,
              right: -60,
              width: 260,
              height: 260,
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0) 70%)",
              pointerEvents: "none",
            }}
          />
          <Box
            sx={{
              position: "absolute",
              bottom: -80,
              left: "20%",
              width: 220,
              height: 220,
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(56,189,248,0.18) 0%, rgba(56,189,248,0) 70%)",
              pointerEvents: "none",
            }}
          />

          <Stack
            direction="row"
            spacing={2.5}
            alignItems="flex-start"
            sx={{ position: "relative" }}
          >
            <Avatar
              variant="rounded"
              sx={{
                bgcolor: "rgba(255,255,255,0.14)",
                color: "#fff",
                width: 56,
                height: 56,
                borderRadius: 3,
                border: "1px solid rgba(255,255,255,0.2)",
              }}
            >
              <WavesIcon fontSize="medium" />
            </Avatar>

            <Box>
              <Typography variant="h4" fontWeight={700} sx={{ letterSpacing: -0.3 }}>
                Welcome to the AI-Enabled Water Management Portal
              </Typography>
              <Typography sx={{ mt: 0.75, color: "rgba(255,255,255,0.82)" }}>
                Manage GIS layers, groundwater models, and water resource
                data — all from one workspace.
              </Typography>
            </Box>
          </Stack>
        </Paper>

        {/* Before you get started */}
        <Box>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
            Before you get started
          </Typography>

          <Stack direction={{ xs: "column", md: "row" }} spacing={2.5}>
            {PREREQUISITES.map(({ key, icon: Icon, title, description, color, highlight }) => (
              <Paper
                key={key}
                variant="outlined"
                sx={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  borderRadius: 4,
                  borderColor: "divider",
                  boxShadow: "0 1px 3px rgba(15,23,42,0.06)",
                  overflow: "hidden",
                }}
              >
                <Box sx={{ height: 4, bgcolor: color }} />

                <Box sx={{ p: 2.75, display: "flex", flexDirection: "column", flex: 1 }}>
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    sx={{ mb: 1.5 }}
                  >
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Avatar sx={{ bgcolor: `${color}1A`, color, width: 40, height: 40 }}>
                        <Icon fontSize="small" />
                      </Avatar>
                      <Typography variant="subtitle1" fontWeight={600}>
                        {title}
                      </Typography>
                    </Stack>

                    {highlight && (
                      <Chip
                        label="Start here"
                        size="small"
                        sx={{
                          bgcolor: `${color}1A`,
                          color,
                          fontWeight: 600,
                          border: "none",
                        }}
                      />
                    )}
                  </Stack>

                  <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>
                    {description}
                  </Typography>

                  {highlight && (
                    <Button
                      onClick={scrollToResources}
                      size="small"
                      endIcon={<ArrowForwardIcon fontSize="small" />}
                      sx={{
                        alignSelf: "flex-start",
                        mt: 1.5,
                        color,
                        fontWeight: 600,
                        px: 0,
                        "&:hover": { bgcolor: "transparent", opacity: 0.8 },
                      }}
                    >
                      Open Resource Library
                    </Button>
                  )}
                </Box>
              </Paper>
            ))}
          </Stack>
        </Box>

        <ToolsInfoSection />

        <Box id="resources">
          <ResourceFoldersSection />
        </Box>
      </Stack>
    </Container>
  );
}