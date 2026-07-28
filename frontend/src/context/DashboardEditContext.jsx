import { createContext, useContext, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
} from "@mui/material";

import { verifyAdminPassword } from "../api/toolCardApi";
// ^ adjust this relative path to wherever verifyAdminPassword actually lives

const DashboardEditContext = createContext(null);

export function DashboardEditProvider({ children }) {
  const [editMode, setEditMode] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [verifying, setVerifying] = useState(false);

  function requestEditToggle() {
    if (editMode) {
      setEditMode(false);
      setAdminPassword("");
      return;
    }
    setPasswordInput("");
    setPasswordError("");
    setPasswordDialogOpen(true);
  }

  async function handleUnlockSubmit() {
    setVerifying(true);
    setPasswordError("");
    try {
      const ok = await verifyAdminPassword(passwordInput);
      if (ok) {
        setAdminPassword(passwordInput);
        setEditMode(true);
        setPasswordDialogOpen(false);
      } else {
        setPasswordError("Incorrect password.");
      }
    } catch {
      setPasswordError("Couldn't verify password. Try again.");
    } finally {
      setVerifying(false);
    }
  }

  return (
    <DashboardEditContext.Provider value={{ editMode, adminPassword, requestEditToggle }}>
      {children}

      <Dialog open={passwordDialogOpen} onClose={() => setPasswordDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Enter admin password</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            type="password"
            label="Password"
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleUnlockSubmit()}
            error={!!passwordError}
            helperText={passwordError}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPasswordDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleUnlockSubmit} disabled={verifying}>
            {verifying ? "Checking..." : "Unlock"}
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardEditContext.Provider>
  );
}

export function useDashboardEdit() {
  const ctx = useContext(DashboardEditContext);
  if (!ctx) throw new Error("useDashboardEdit must be used within a DashboardEditProvider");
  return ctx;
}