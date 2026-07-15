import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Stack,
  Card,
  CardContent,
  Avatar,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  Alert,
} from '@mui/material';
import { fetchProfile } from '../../data/dataService';

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const [pwdOpen, setPwdOpen] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '' });
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchProfile().then((p) => {
      setProfile(p);
      setForm({ name: p.name, email: p.email, phone: p.phone });
    });
  }, []);

  if (!profile) return null;

  const handleSaveProfile = () => {
    setProfile((p) => ({ ...p, ...form }));
    setEditOpen(false);
    setToast({ severity: 'success', message: 'Profile updated.' });
  };

  const handleChangePassword = () => {
    setPwdOpen(false);
    setToast({ severity: 'success', message: 'Password changed successfully.' });
  };

  return (
    <Stack spacing={3} sx={{ maxWidth: 640 }}>
      <Box>
        <Typography variant="h5">Profile</Typography>
        <Typography variant="body2" color="text.secondary">
          View and manage your administrator account.
        </Typography>
      </Box>

      <Card>
        <CardContent>
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
            <Avatar sx={{ width: 64, height: 64, bgcolor: 'secondary.main', fontSize: '1.5rem' }}>
              {profile.name
                .split(' ')
                .map((p) => p[0])
                .join('')}
            </Avatar>
            <Box>
              <Typography variant="h6">{profile.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                {profile.role}
              </Typography>
            </Box>
          </Stack>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="caption" color="text.secondary">
                Email
              </Typography>
              <Typography variant="body1">{profile.email}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="caption" color="text.secondary">
                Phone Number
              </Typography>
              <Typography variant="body1">{profile.phone}</Typography>
            </Grid>
          </Grid>

          <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
            <Button variant="contained" onClick={() => setEditOpen(true)}>
              Edit Profile
            </Button>
            <Button variant="outlined" onClick={() => setPwdOpen(true)}>
              Change Password
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* Edit Profile dialog */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Profile</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ mt: 0.5 }}>
            <TextField
              label="Name"
              fullWidth
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
            <TextField
              label="Email"
              fullWidth
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            />
            <TextField
              label="Phone Number"
              fullWidth
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setEditOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button variant="contained" onClick={handleSaveProfile}>
            Save changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Change Password dialog */}
      <Dialog open={pwdOpen} onClose={() => setPwdOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ mt: 0.5 }}>
            <TextField label="Current Password" type="password" fullWidth />
            <TextField label="New Password" type="password" fullWidth />
            <TextField label="Confirm New Password" type="password" fullWidth />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setPwdOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button variant="contained" onClick={handleChangePassword}>
            Update Password
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={Boolean(toast)} autoHideDuration={3000} onClose={() => setToast(null)}>
        {toast && <Alert severity={toast.severity}>{toast.message}</Alert>}
      </Snackbar>
    </Stack>
  );
}
