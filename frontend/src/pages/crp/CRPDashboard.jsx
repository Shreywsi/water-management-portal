import { useState, useEffect } from "react";
import FarmerLayout from "../../layouts/FarmerLayout";
import {
  Container,
  Typography,
  Stack,
  Grid,
  Card,
  CardActionArea,
  CardContent,
  Box,
  Alert,
  Dialog,
  DialogContent,
  IconButton,
  Fab,
  Tooltip
} from "@mui/material";

import {
  Agriculture,
  WaterDrop,
  Science,
  Opacity,
  Mic,
  MicOff,
  WifiOff,
  Wifi,
  Close,
  Waves,
} from "@mui/icons-material";

import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

function FarmerDashboard() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Real connectivity detection — replace with your own hook/context if you have one
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  // Dummy voice recording state — wire to real speech capture later
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  const handleVoiceClick = () => {
    setVoiceOpen(true);
    setIsRecording(false);
  };

  const toggleRecording = () => {
    setIsRecording((prev) => !prev);
    // TODO: hook up actual speech-to-text / audio recording here
  };

  const closeVoiceDialog = () => {
    setVoiceOpen(false);
    setIsRecording(false);
  };

  const cards = [
  {
    title: t("pumping"),
    subtitle: t("pumping_subtitle"),
    icon: Agriculture,
    color: "#ff9800",
    path: "/farmer/pumping"
  },
  {
    title: t("water_table"),
    subtitle: t("water_table_subtitle"),
    icon: WaterDrop,
    color: "#2196f3",
    path: "/farmer/water-table"
  },
  {
    title: t("water_level"),
    subtitle: t("water_level_subtitle"),
    icon: Waves,
    color: "#4caf50",
    path: "/farmer/water-level"
  },
  {
    title: t("tds"),
    subtitle: t("tds_subtitle"),
    icon: Opacity,
    color: "#9c27b0",
    path: "/farmer/tds"
  },
  {
    title: t("salinity"),
    subtitle: t("salinity_subtitle"),
    icon: Science,
    color: "#ff5722",
    path: "/farmer/salinity"
  }
];

  return (
    <FarmerLayout>
      <Container
        maxWidth="xl"
        sx={{
          py: { xs: 2, md: 4 },
          pb: { xs: 10, md: 4 },
          position: "relative",
          minHeight: "calc(100vh - 64px)"
        }}
      >
        <Stack spacing={4}>

          {/* Connectivity status — state indicator, not a card */}
          <Alert
            severity={isOnline ? "success" : "warning"}
            icon={isOnline ? <Wifi fontSize="small" /> : <WifiOff fontSize="small" />}
            sx={{
              "& .MuiAlert-message": {
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                width: "100%"
              }
            }}
          >
            <Box sx={{ display: "flex", flexDirection: "column" }}>
              <Typography variant="body2" fontWeight={500}>
                {isOnline ? t("connected") : t("offline_mode")}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {isOnline ? t("syncing_live") : t("will_sync_when_online")}
              </Typography>
            </Box>
          </Alert>

          {/* Header */}
          <Box>
            <Typography
              variant="h4"
              fontWeight="bold"
              sx={{
                fontSize: {
                  xs: "1.8rem",
                  sm: "2rem",
                  md: "2.3rem"
                }
              }}
            >
              {t("welcome")} 👋
            </Typography>

            <Typography
              color="text.secondary"
              sx={{
                mt: 1,
                fontSize: {
                  xs: "0.95rem",
                  md: "1rem"
                }
              }}
            >
              {t("village_name")}
            </Typography>
          </Box>

          {/* Cards */}
          <Grid container spacing={3}>
            {cards.map((card) => {
              const Icon = card.icon;

              return (
                <Grid
                  item
                  xs={12}
                  sm={6}
                  md={4}
                  key={card.title}
                >
                  <Card
                    sx={{
                      borderRadius: 4,
                      height: "100%",
                      transition: "0.3s",
                      "&:hover": {
                        transform: "translateY(-5px)",
                        boxShadow: 6
                      }
                    }}
                  >
                    <CardActionArea
                      sx={{
                        height: "100%",
                        p: 3
                      }}
                      onClick={() => navigate(card.path)}
                    >
                      <CardContent>

                        <Box
                          sx={{
                            width: 70,
                            height: 70,
                            borderRadius: 3,
                            backgroundColor: `${card.color}20`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            mb: 3
                          }}
                        >
                          <Icon
                            sx={{
                              fontSize: 40,
                              color: card.color
                            }}
                          />
                        </Box>

                        <Typography
                          variant="h6"
                          fontWeight="bold"
                        >
                          {card.title}
                        </Typography>

                        <Typography
                          color="text.secondary"
                          sx={{ mt: 1 }}
                        >
                          {card.subtitle}
                        </Typography>

                      </CardContent>
                    </CardActionArea>
                  </Card>
                </Grid>
              );
            })}
          </Grid>

        </Stack>

        {/* Floating voice entry button — bottom right */}
        <Tooltip title={t("voice_entry")} placement="left">
          <Fab
            onClick={handleVoiceClick}
            sx={{
              position: "fixed",
              bottom: { xs: 24, md: 32 },
              right: { xs: 24, md: 32 },
              bgcolor: "#e91e63",
              color: "#fff",
              width: 64,
              height: 64,
              "&:hover": { bgcolor: "#c2185b" },
              boxShadow: "0 4px 16px rgba(233,30,99,0.4)"
            }}
            aria-label={t("voice_entry")}
          >
            <Mic sx={{ fontSize: 28 }} />
          </Fab>
        </Tooltip>

      </Container>

      {/* Dummy voice recording dialog */}
      <Dialog
        open={voiceOpen}
        onClose={closeVoiceDialog}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 4 } }}
      >
        <DialogContent sx={{ textAlign: "center", py: 5, position: "relative" }}>
          <IconButton
            onClick={closeVoiceDialog}
            sx={{ position: "absolute", top: 8, right: 8 }}
          >
            <Close />
          </IconButton>

          <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
            {t("voice_entry")}
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 4, fontSize: "0.9rem" }}>
            {isRecording ? t("listening") : t("tap_to_record")}
          </Typography>

          <Box sx={{ position: "relative", display: "inline-flex", mb: 3 }}>
            {isRecording && (
              <Box
                sx={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: "50%",
                  bgcolor: "#e91e63",
                  opacity: 0.3,
                  animation: "pulseRing 1.4s ease-out infinite",
                  "@keyframes pulseRing": {
                    "0%": { transform: "scale(1)", opacity: 0.4 },
                    "100%": { transform: "scale(1.8)", opacity: 0 }
                  }
                }}
              />
            )}
            <IconButton
              onClick={toggleRecording}
              sx={{
                width: 90,
                height: 90,
                bgcolor: isRecording ? "#e91e63" : "primary.main",
                color: "#fff",
                "&:hover": {
                  bgcolor: isRecording ? "#c2185b" : "primary.dark"
                }
              }}
            >
              {isRecording ? <MicOff sx={{ fontSize: 40 }} /> : <Mic sx={{ fontSize: 40 }} />}
            </IconButton>
          </Box>

          <Typography variant="caption" color="text.disabled" sx={{ display: "block" }}>
            {t("voice_entry_coming_soon")}
          </Typography>
        </DialogContent>
      </Dialog>
    </FarmerLayout>
  );
}

export default FarmerDashboard;