import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import PublicLayout from "../layouts/PublicLayout";
import {
  Box,
  Button,
  Typography,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import WaterDropOutlinedIcon from "@mui/icons-material/WaterDropOutlined";
import AccountBalanceOutlinedIcon from "@mui/icons-material/AccountBalanceOutlined";

import API_BASE from "../config/api";

/* Same tokens as LoginPage — keep both pages visually identical */
const PANEL      = "#1E293B";
const PANEL_DARK = "#152238";
const ACCENT     = "#2A3F6F";
const ACCENT_LT  = "#3B5488";
const FORM_BG    = "#fdf8f2";

const STATS = [
  { num: "210+", label: "Reservoirs" },
  { num: "33",   label: "Districts"  },
  { num: "5M+",  label: "Farmers"    },
];

function SignupPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("crp");
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    setError("");
    setMessage("");

    if (!fullName || !email || !username || !password || !role) {
      setError("Please fill in all fields and select a role.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/auth/register/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          full_name: fullName,
          email,
          username,
          password,
          role,
        }),
      });

      const data = await response.json();
      if (!data.success) {
        setError(data.error || "Registration failed.");
        setLoading(false);
        return;
      }
      setMessage("Registration complete. Redirecting to login...");
      setTimeout(() => navigate("/"), 900);
    } catch (err) {
      setError("Unable to register. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PublicLayout>
      <Box sx={{ minHeight: "100vh", display: "flex" }}>

        {/* ── Left panel — identical to LoginPage ── */}
        <Box sx={{
          width: { xs: 0, md: "44%" },
          display: { xs: "none", md: "flex" },
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: `linear-gradient(150deg, ${PANEL} 0%, ${PANEL_DARK} 100%)`,
          p: 5,
          position: "relative",
          overflow: "hidden",
        }}>

          <Box sx={{
            position: "absolute", width: 420, height: 420,
            borderRadius: "50%", border: `1px solid ${ACCENT_LT}22`,
            top: -140, right: -140, pointerEvents: "none",
          }} />
          <Box sx={{
            position: "absolute", width: 300, height: 300,
            borderRadius: "50%", border: `1px solid ${ACCENT_LT}33`,
            top: -80, right: -80, pointerEvents: "none",
          }} />
          <Box sx={{
            position: "absolute", width: 260, height: 260,
            borderRadius: "50%", border: `1px solid ${ACCENT_LT}22`,
            bottom: -90, left: -90, pointerEvents: "none",
          }} />

          <Box sx={{
            width: 80, height: 80, borderRadius: "20px",
            bgcolor: `${ACCENT_LT}26`,
            border: `1px solid ${ACCENT_LT}55`,
            display: "flex", alignItems: "center", justifyContent: "center",
            mb: 3, position: "relative", zIndex: 1,
            boxShadow: `0 0 40px ${ACCENT}55`,
          }}>
            <WaterDropOutlinedIcon sx={{ color: "#fff", fontSize: 36 }} />
          </Box>

          <Typography variant="h5" sx={{
            color: "#fff", fontWeight: 600,
            textAlign: "center", lineHeight: 1.35, mb: 1,
            letterSpacing: "0.01em",
            position: "relative", zIndex: 1,
          }}>
            AI-Enabled<br />Water Management Portal
          </Typography>

          <Box sx={{
            width: 44, height: 3,
            bgcolor: ACCENT_LT,
            borderRadius: 1, my: 2,
            position: "relative", zIndex: 1,
          }} />

          <Typography sx={{
            color: "rgba(255,255,255,0.6)",
            fontSize: 13.5, textAlign: "center", lineHeight: 1.85,
            maxWidth: 290, mb: 5,
            position: "relative", zIndex: 1,
          }}>
            Register for access to groundwater monitoring, reporting,
            and resource management across Gujarat
          </Typography>

          {/* Stats row — same as LoginPage */}
          <Box sx={{
            display: "flex", gap: 0,
            border: `1px solid ${ACCENT_LT}44`,
            borderRadius: 2, overflow: "hidden", width: "100%", maxWidth: 310,
            position: "relative", zIndex: 1,
            boxShadow: "0 12px 32px -12px rgba(0,0,0,0.4)",
          }}>
            {STATS.map(({ num, label }, i) => (
              <Box key={label} sx={{
                flex: 1, textAlign: "center", py: 1.75,
                borderRight: i < STATS.length - 1 ? `1px solid ${ACCENT_LT}44` : "none",
                bgcolor: `${ACCENT}66`,
              }}>
                <Typography sx={{ color: "#fff", fontSize: 19, fontWeight: 600 }}>
                  {num}
                </Typography>
                <Typography sx={{
                  color: "rgba(255,255,255,0.5)", fontSize: 10, mt: 0.4,
                  textTransform: "uppercase", letterSpacing: "0.07em",
                }}>
                  {label}
                </Typography>
              </Box>
            ))}
          </Box>

          <Box sx={{
            position: "absolute", bottom: 24,
            display: "flex", alignItems: "center", gap: 0.75, zIndex: 1,
          }}>
           
          </Box>
        </Box>

        {/* ── Right panel — card form, identical treatment to LoginPage ── */}
        <Box sx={{
          flex: 1,
          display: "flex", alignItems: "center", justifyContent: "center",
          bgcolor: FORM_BG,
          p: { xs: 2, sm: 4 },
        }}>
          <Box sx={{
            width: "100%", maxWidth: 380,
            bgcolor: "#fff",
            borderRadius: 3,
            border: "1px solid #eee6d8",
            boxShadow: "0 20px 45px -20px rgba(30,41,59,0.22)",
            p: { xs: 3, sm: 4.5 },
          }}>

            <Box sx={{ mb: 3 }}>
              <Typography variant="h5" sx={{ fontWeight: 600, color: "#1a1a2e", mb: 0.5 }}>
                Create your account
              </Typography>
              <Typography variant="body2" sx={{ color: "#6b7280" }}>
                Register and then sign in to access the portal
              </Typography>
            </Box>

            {error && (
              <Typography variant="caption" sx={{ display: "block", mb: 1.5, color: "#dc2626" }}>
                {error}
              </Typography>
            )}
            {message && (
              <Typography variant="caption" sx={{ display: "block", mb: 1.5, color: "#15803d" }}>
                {message}
              </Typography>
            )}

            <TextField
              fullWidth
              label="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              margin="normal"
              sx={{
                "& .MuiOutlinedInput-root": {
                  bgcolor: "#fff",
                  "&.Mui-focused fieldset": { borderColor: ACCENT },
                },
                "& .MuiInputLabel-root.Mui-focused": { color: ACCENT },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon fontSize="small" sx={{ color: "#9ca3af" }} />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="normal"
              sx={{
                "& .MuiOutlinedInput-root": {
                  bgcolor: "#fff",
                  "&.Mui-focused fieldset": { borderColor: ACCENT },
                },
                "& .MuiInputLabel-root.Mui-focused": { color: ACCENT },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailOutlinedIcon fontSize="small" sx={{ color: "#9ca3af" }} />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              label={t("username")}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              margin="normal"
              sx={{
                "& .MuiOutlinedInput-root": {
                  bgcolor: "#fff",
                  "&.Mui-focused fieldset": { borderColor: ACCENT },
                },
                "& .MuiInputLabel-root.Mui-focused": { color: ACCENT },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon fontSize="small" sx={{ color: "#9ca3af" }} />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              label={t("password")}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
              sx={{
                "& .MuiOutlinedInput-root": {
                  bgcolor: "#fff",
                  "&.Mui-focused fieldset": { borderColor: ACCENT },
                },
                "& .MuiInputLabel-root.Mui-focused": { color: ACCENT },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlinedIcon fontSize="small" sx={{ color: "#9ca3af" }} />
                  </InputAdornment>
                ),
              }}
            />

            <FormControl
              fullWidth
              margin="normal"
              sx={{
                "& .MuiOutlinedInput-root": {
                  bgcolor: "#fff",
                  "&.Mui-focused fieldset": { borderColor: ACCENT },
                },
                "& .MuiInputLabel-root.Mui-focused": { color: ACCENT },
              }}
            >
              <InputLabel>Role</InputLabel>
              <Select
                value={role}
                label="Role"
                onChange={(e) => setRole(e.target.value)}
              >
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="crp">Community Resource Person (CRP)</MenuItem>
              </Select>
            </FormControl>

            <Button
              variant="contained"
              fullWidth
              size="large"
              onClick={handleRegister}
              disabled={loading}
              sx={{
                mt: 3, borderRadius: 2,
                textTransform: "none", fontSize: 15, fontWeight: 600,
                bgcolor: PANEL,
                "&:hover": { bgcolor: PANEL_DARK },
                "&:active": { bgcolor: PANEL_DARK },
                boxShadow: `0 8px 20px -8px ${ACCENT}88`,
                py: 1.4,
              }}
            >
              {loading ? "Registering…" : "Register"}
            </Button>

            <Typography sx={{ mt: 2, textAlign: "center", color: "#6b7280", fontSize: 14 }}>
              Already registered?
              <Button
                variant="text"
                onClick={() => navigate("/")}
                sx={{ color: ACCENT, fontWeight: 600, textTransform: "none" }}
              >
                Sign in
              </Button>
            </Typography>

            {/* Footer — same credit line as LoginPage, no duplicate dept. row */}
            <Box sx={{
              display: "flex", flexDirection: "column", alignItems: "center",
              gap: 0.75, mt: 3, pt: 2,
              borderTop: "1px solid #e5e0d8",
            }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                <AccountBalanceOutlinedIcon sx={{ fontSize: 13, color: "#9ca3af" }} />
                <Typography variant="caption" sx={{ color: "#9ca3af" }}>
                  Water Resources Department
                </Typography>
              </Box>
              
            </Box>

          </Box>
        </Box>

      </Box>
    </PublicLayout>
  );
}

export default SignupPage;