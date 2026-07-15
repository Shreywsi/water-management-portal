import React, { useState } from 'react';
import {
  Box,
  Typography,
  Stack,
  Card,
  CardContent,
  CardHeader,
  RadioGroup,
  FormControlLabel,
  Radio,
  Switch,
  Divider,
  Snackbar,
  Alert,
  Button,
} from '@mui/material';
import { useSettings } from '../../context/SettingsContext';

export default function SettingsPage() {
  const {
    language,
    setLanguage,
    mode,
    setMode,
    alertsEnabled,
    setAlertsEnabled,
    emailReportsEnabled,
    setEmailReportsEnabled,
  } = useSettings();
  const [toast, setToast] = useState(false);

  return (
    <Stack spacing={3} sx={{ maxWidth: 640 }}>
      <Box>
        <Typography variant="h5">Settings</Typography>
        <Typography variant="body2" color="text.secondary">
          Configure language, appearance, and notification preferences.
        </Typography>
      </Box>

      <Card>
        <CardHeader title="Language Settings" titleTypographyProps={{ variant: 'subtitle1' }} />
        <Divider />
        <CardContent>
          <RadioGroup value={language} onChange={(e) => setLanguage(e.target.value)}>
            <FormControlLabel value="English" control={<Radio />} label="English" />
            <FormControlLabel value="Hindi" control={<Radio />} label="हिंदी (Hindi)" />
            <FormControlLabel value="Gujarati" control={<Radio />} label="ગુજરાતી (Gujarati)" />
          </RadioGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader title="Theme" titleTypographyProps={{ variant: 'subtitle1' }} />
        <Divider />
        <CardContent>
          <RadioGroup value={mode} onChange={(e) => setMode(e.target.value)}>
            <FormControlLabel value="light" control={<Radio />} label="Light Mode" />
            <FormControlLabel value="dark" control={<Radio />} label="Dark Mode" />
          </RadioGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader title="Notification Settings" titleTypographyProps={{ variant: 'subtitle1' }} />
        <Divider />
        <CardContent>
          <Stack spacing={1}>
            <FormControlLabel
              control={<Switch checked={alertsEnabled} onChange={(e) => setAlertsEnabled(e.target.checked)} />}
              label="Enable Alerts"
            />
            <FormControlLabel
              control={
                <Switch checked={emailReportsEnabled} onChange={(e) => setEmailReportsEnabled(e.target.checked)} />
              }
              label="Enable Email Reports"
            />
          </Stack>
        </CardContent>
      </Card>

      <Box>
        <Button variant="contained" onClick={() => setToast(true)}>
          Save preferences
        </Button>
      </Box>

      <Snackbar open={toast} autoHideDuration={2500} onClose={() => setToast(false)}>
        <Alert severity="success">Preferences saved.</Alert>
      </Snackbar>
    </Stack>
  );
}
