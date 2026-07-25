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
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
//import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
//import ScienceOutlinedIcon from "@mui/icons-material/ScienceOutlined";
import WaterDropOutlinedIcon from "@mui/icons-material/WaterDropOutlined";
import AccountBalanceOutlinedIcon from "@mui/icons-material/AccountBalanceOutlined";

import API_BASE from "../config/api";

const PANEL = "#1E293B";
const PANEL_DARK = "#152238";
const ACCENT = "#2A3F6F";
const FORM_BG = "#fdf8f2";

const ROLES = [
  {
    value: "crp",
    label: "CRP",
    Icon: GroupsOutlinedIcon,
  },
];

function SignupPage()  {
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
        <Box
          sx={{
            width: { xs: 0, md: "44%" },
            display: { xs: "none", md: "flex" },
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: PANEL,
            p: 5,
            position: "relative",
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              position: "absolute",
              width: 320,
              height: 320,
              borderRadius: "50%",
              border: "1px solid rgba(255,255,255,0.05)",
              top: -80,
              right: -80,
              pointerEvents: "none",
            }}
          />
          <Box
            sx={{
              position: "absolute",
              width: 220,
              height: 220,
              borderRadius: "50%",
              border: "1px solid rgba(255,255,255,0.05)",
              bottom: -60,
              left: -60,
              pointerEvents: "none",
            }}
          />

          <Box
            sx={{
              width: 76,
              height: 76,
              borderRadius: "50%",
              bgcolor: "rgba(255,255,255,0.10)",
              border: "1.5px solid rgba(255,255,255,0.20)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mb: 2.5,
            }}
          >
            <WaterDropOutlinedIcon sx={{ color: "#fff", fontSize: 34 }} />
          </Box>

          <Typography
            variant="h5"
            sx={{
              color: "#fff",
              fontWeight: 500,
              textAlign: "center",
              lineHeight: 1.4,
              mb: 1,
            }}
          >
            Water<br />Management Portal
          </Typography>

          <Box
            sx={{
              width: 40,
              height: 2,
              bgcolor: "rgba(255,255,255,0.20)",
              borderRadius: 1,
              my: 2,
            }}
          />

          <Typography
            sx={{
              color: "rgba(255,255,255,0.55)",
              fontSize: 13,
              textAlign: "center",
              lineHeight: 1.8,
              maxWidth: 280,
              mb: 5,
            }}
          >
            Register for access to groundwater monitoring, reporting, and resource management.
          </Typography>

          <Box
            sx={{
              position: "absolute",
              bottom: 24,
              display: "flex",
              alignItems: "center",
              gap: 0.75,
            }}
          >
            <AccountBalanceOutlinedIcon sx={{ fontSize: 13, color: "rgba(255,255,255,0.3)" }} />
            <Typography sx={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>
              Water Resources Department
            </Typography>
          </Box>
        </Box>

        <Box
          sx={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: FORM_BG,
            p: { xs: 2, sm: 4 },
          }}
        >
          <Box sx={{ width: "100%", maxWidth: 380 }}>
            <Box sx={{ mb: 3.5 }}>
              {error && (
  <Typography color="error" sx={{ mb: 2 }}>
    {error}
  </Typography>
)}

{message && (
  <Typography color="success.main" sx={{ mb: 2 }}>
    {message}
  </Typography>
)}
              <Typography variant="h5" sx={{ fontWeight: 500, color: "#1a1a2e", mb: 0.5 }}>
                Create your account
              </Typography>
              <Typography variant="body2" sx={{ color: "#6b7280" }}>
                Register and then sign in to access the portal.
              </Typography>
            </Box>

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

            <FormControl fullWidth margin="normal">
              <InputLabel>Role</InputLabel>

              <Select
                value={role}
                label="Role"
                onChange={(e) => setRole(e.target.value)}
              >
                <MenuItem value="admin">Admin</MenuItem>

                <MenuItem value="crp">
                  Community Resource Person (CRP)
                </MenuItem>
              </Select>
            </FormControl>
          

            <Button
              variant="contained"
              fullWidth
              size="large"
              onClick={handleRegister}
              disabled={loading}
              sx={{
                mt: 3,
                borderRadius: 2,
                textTransform: "none",
                fontSize: 15,
                bgcolor: PANEL,
                "&:hover": { bgcolor: PANEL_DARK },
                "&:active": { bgcolor: PANEL_DARK },
                boxShadow: "none",
                py: 1.4,
              }}
            >
              {loading ? "Registering..." : "Register"}
            </Button>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 0.75,
                mt: 3,
                pt: 2,
                borderTop: "0.5px solid #e5e0d8",
              }}
            >
              <AccountBalanceOutlinedIcon sx={{ fontSize: 13, color: "#9ca3af" }} />
              <Typography variant="caption" sx={{ color: "#9ca3af" }}>
                Already registered?
              </Typography>
              <Button
                variant="text"
                size="small"
                onClick={() => navigate("/")}
                sx={{ textTransform: "none", color: PANEL }}
              >
                Sign in
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>
    </PublicLayout>
  );
}

export default SignupPage;
