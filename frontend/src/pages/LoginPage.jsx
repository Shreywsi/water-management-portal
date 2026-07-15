import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import PublicLayout from "../layouts/PublicLayout";
import {
  Box, Button, Typography, TextField, InputAdornment, Paper
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
//import GrassOutlinedIcon from "@mui/icons-material/GrassOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import ScienceOutlinedIcon from "@mui/icons-material/ScienceOutlined";
import WaterDropOutlinedIcon from "@mui/icons-material/WaterDropOutlined";
import AccountBalanceOutlinedIcon from "@mui/icons-material/AccountBalanceOutlined";

const PANEL   = "#1B2A4A";
const PANEL_DARK = "#152238";
const ACCENT  = "#2A3F6F";
const FORM_BG = "#fdf8f2";

const ROLES = [
  { value: "admin",      label: "Admin",      Icon: ShieldOutlinedIcon },
  { value: "crp",        label: "CRP",        Icon: GroupsOutlinedIcon },
  { value: "researcher", label: "Researcher", Icon: ScienceOutlinedIcon },
];

const STATS = [
  { num: "210+", label: "Reservoirs" },
  { num: "33",   label: "Districts"  },
  { num: "5M+",  label: "Farmers"   },
];

function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [role, setRole] = useState("");
  const [error, setError] = useState("");

  const handleLogin = () => {
    if (!role) { setError("Please select a role."); return; }
    const routes = { admin: "/admin", farmer: "/farmer", crp: "/crp", researcher: "/researcher" };
    navigate(routes[role]);
  };

  return (
    <PublicLayout>
      <Box sx={{ minHeight: "100vh", display: "flex" }}>

        {/* ── Left panel ── */}
        <Box sx={{
          width: { xs: 0, md: "44%" },
          display: { xs: "none", md: "flex" },
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: PANEL,
          p: 5,
          position: "relative",
          overflow: "hidden",
        }}>

          {/* Subtle background circles for depth */}
          <Box sx={{
            position: "absolute", width: 320, height: 320,
            borderRadius: "50%", border: "1px solid rgba(255,255,255,0.05)",
            top: -80, right: -80, pointerEvents: "none",
          }} />
          <Box sx={{
            position: "absolute", width: 220, height: 220,
            borderRadius: "50%", border: "1px solid rgba(255,255,255,0.05)",
            bottom: -60, left: -60, pointerEvents: "none",
          }} />

          {/* Logo circle */}
          <Box sx={{
            width: 76, height: 76, borderRadius: "50%",
            bgcolor: "rgba(255,255,255,0.10)",
            border: "1.5px solid rgba(255,255,255,0.20)",
            display: "flex", alignItems: "center", justifyContent: "center",
            mb: 2.5,
          }}>
            <WaterDropOutlinedIcon sx={{ color: "#fff", fontSize: 34 }} />
          </Box>

          <Typography variant="h5" sx={{
            color: "#fff", fontWeight: 500,
            textAlign: "center", lineHeight: 1.4, mb: 1,
          }}>
             Water<br />Management Portal
          </Typography>

          <Box sx={{
            width: 40, height: 2,
            bgcolor: "rgba(255,255,255,0.20)",
            borderRadius: 1, my: 2,
          }} />

          <Typography sx={{
            color: "rgba(255,255,255,0.55)",
            fontSize: 13, textAlign: "center", lineHeight: 1.8,
            maxWidth: 280, mb: 5,
          }}>
            Integrated platform for water resource monitoring, allocation, and sustainable management across Gujarat
          </Typography>

          {/* Stats row */}
          <Box sx={{
            display: "flex", gap: 0,
            border: "0.5px solid rgba(255,255,255,0.12)",
            borderRadius: 2, overflow: "hidden", width: "100%", maxWidth: 300,
          }}>
            {STATS.map(({ num, label }, i) => (
              <Box key={label} sx={{
                flex: 1, textAlign: "center", py: 1.5,
                borderRight: i < STATS.length - 1 ? "0.5px solid rgba(255,255,255,0.12)" : "none",
                bgcolor: "rgba(255,255,255,0.05)",
              }}>
                <Typography sx={{ color: "#fff", fontSize: 18, fontWeight: 500 }}>{num}</Typography>
                <Typography sx={{ color: "rgba(255,255,255,0.45)", fontSize: 10, mt: 0.25, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  {label}
                </Typography>
              </Box>
            ))}
          </Box>

          {/* Government badge */}
          <Box sx={{
            position: "absolute", bottom: 24,
            display: "flex", alignItems: "center", gap: 0.75,
          }}>
            <AccountBalanceOutlinedIcon sx={{ fontSize: 13, color: "rgba(255,255,255,0.3)" }} />
            <Typography sx={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>
              Government of Gujarat — Water Resources Department
            </Typography>
          </Box>
        </Box>

        {/* ── Right panel ── */}
        <Box sx={{
          flex: 1,
          display: "flex", alignItems: "center", justifyContent: "center",
          bgcolor: FORM_BG,
          p: { xs: 2, sm: 4 },
        }}>
          <Box sx={{ width: "100%", maxWidth: 380 }}>

            {/* Header */}
            <Box sx={{ mb: 3.5 }}>
              <Typography variant="h5" sx={{ fontWeight: 500, color: "#1a1a2e", mb: 0.5 }}>
                Sign in to your account
              </Typography>
              <Typography variant="body2" sx={{ color: "#6b7280" }}>
                Enter your credentials to access the portal
              </Typography>
            </Box>

            {/* Username */}
            <TextField
              fullWidth
              label={t("username")}
              margin="normal"
              sx={{
                "& .MuiOutlinedInput-root": {
                  bgcolor: "#fff",
                  "&.Mui-focused fieldset": { borderColor: ACCENT },
                },
                "& .MuiInputLabel-root.Mui-focused": { color: ACCENT },
              }}
              InputProps={{ startAdornment: (
                <InputAdornment position="start">
                  <PersonIcon fontSize="small" sx={{ color: "#9ca3af" }} />
                </InputAdornment>
              )}}
            />

            {/* Password */}
            <TextField
              fullWidth
              label={t("password")}
              type="password"
              margin="normal"
              sx={{
                "& .MuiOutlinedInput-root": {
                  bgcolor: "#fff",
                  "&.Mui-focused fieldset": { borderColor: ACCENT },
                },
                "& .MuiInputLabel-root.Mui-focused": { color: ACCENT },
              }}
              InputProps={{ startAdornment: (
                <InputAdornment position="start">
                  <LockOutlinedIcon fontSize="small" sx={{ color: "#9ca3af" }} />
                </InputAdornment>
              )}}
            />

            {/* Role selector */}
            <Typography variant="caption" sx={{
              display: "block", mt: 2.5, mb: 1,
              textTransform: "uppercase", letterSpacing: "0.07em",
              color: "#6b7280", fontWeight: 500, fontSize: 11,
            }}>
              Select role
            </Typography>
            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1 }}>
              {ROLES.map(({ value, label, Icon }) => (
                <Paper
                  key={value}
                  variant="outlined"
                  onClick={() => { setRole(value); setError(""); }}
                  sx={{
                    p: 1.5,
                    display: "flex", alignItems: "center", gap: 1,
                    cursor: "pointer", borderRadius: 2,
                    bgcolor: role === value ? "#EEF2FF" : "#fff",
                    borderColor: role === value ? PANEL : "#e5e0d8",
                    borderWidth: role === value ? "1.5px" : "0.5px",
                    color: role === value ? PANEL : "#6b7280",
                    "&:hover": {
                      bgcolor: role === value ? "#EEF2FF" : "#f5f0e8",
                      borderColor: role === value ? PANEL : "#c9c4bc",
                    },
                    transition: "all 0.15s",
                  }}
                >
                  <Icon fontSize="small" />
                  <Typography sx={{ fontSize: 13, fontWeight: role === value ? 500 : 400 }}>
                    {label}
                  </Typography>
                </Paper>
              ))}
            </Box>

            {error && (
              <Typography variant="caption" sx={{ display: "block", mt: 1, color: "#dc2626" }}>
                {error}
              </Typography>
            )}

            {/* Sign in button */}
            <Button
              variant="contained"
              fullWidth
              size="large"
              onClick={handleLogin}
              sx={{
                mt: 3, borderRadius: 2,
                textTransform: "none", fontSize: 15,
                bgcolor: PANEL,
                "&:hover": { bgcolor: PANEL_DARK },
                "&:active": { bgcolor: PANEL_DARK },
                boxShadow: "none",
                py: 1.4,
              }}
            >
              Sign in
            </Button>

            {/* Footer note */}
            <Box sx={{
              display: "flex", alignItems: "center", justifyContent: "center",
              gap: 0.75, mt: 3, pt: 2,
              borderTop: "0.5px solid #e5e0d8",
            }}>
              <AccountBalanceOutlinedIcon sx={{ fontSize: 13, color: "#9ca3af" }} />
              <Typography variant="caption" sx={{ color: "#9ca3af" }}>
                Government of Gujarat — Water Resources Department
              </Typography>
            </Box>

          </Box>
        </Box>

      </Box>
    </PublicLayout>
  );
}

export default LoginPage;