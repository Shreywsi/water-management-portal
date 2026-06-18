import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Grid,
  IconButton,
} from '@mui/material';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import { mockUsers, mockVillages } from '../../data/mockData';

const emptyForm = {
  owner: '',
  village: mockVillages[0]?.name || '',
  depth: '',
  lat: '',
  lng: '',
  status: 'Active',
};

const farmers = mockUsers.filter((u) => u.role === 'Farmer');

export default function AddWellDialog({ open, onClose, onSave, initialData }) {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const isEdit = Boolean(initialData);

  useEffect(() => {
    if (open) {
      setForm(initialData ? { ...emptyForm, ...initialData } : emptyForm);
      setErrors({});
    }
  }, [open, initialData]);

  const handleChange = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const validate = () => {
    const next = {};
    if (!form.owner) next.owner = 'Select a farmer';
    if (!form.village) next.village = 'Select a village';
    if (!form.depth) next.depth = 'Depth is required';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onSave({ ...form, depth: Number(form.depth), lat: Number(form.lat) || 0, lng: Number(form.lng) || 0 });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {isEdit ? 'Edit Well' : 'Add Well'}
        <IconButton onClick={onClose} size="small">
          <CloseOutlinedIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid item xs={12} sm={6}>
            <TextField
              select
              label="Farmer"
              fullWidth
              value={form.owner}
              onChange={handleChange('owner')}
              error={Boolean(errors.owner)}
              helperText={errors.owner}
            >
              {farmers.map((f) => (
                <MenuItem key={f.id} value={f.name}>
                  {f.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              select
              label="Village"
              fullWidth
              value={form.village}
              onChange={handleChange('village')}
              error={Boolean(errors.village)}
              helperText={errors.village}
            >
              {mockVillages.map((v) => (
                <MenuItem key={v.id} value={v.name}>
                  {v.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              label="Depth (m)"
              type="number"
              fullWidth
              value={form.depth}
              onChange={handleChange('depth')}
              error={Boolean(errors.depth)}
              helperText={errors.depth}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField label="Latitude" type="number" fullWidth value={form.lat} onChange={handleChange('lat')} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField label="Longitude" type="number" fullWidth value={form.lng} onChange={handleChange('lng')} />
          </Grid>
          {isEdit && (
            <Grid item xs={12} sm={6}>
              <TextField select label="Status" fullWidth value={form.status} onChange={handleChange('status')}>
                <MenuItem value="Active">Active</MenuItem>
                <MenuItem value="Under Maintenance">Under Maintenance</MenuItem>
                <MenuItem value="Dry">Dry</MenuItem>
              </TextField>
            </Grid>
          )}
        </Grid>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant="contained">
          {isEdit ? 'Save changes' : 'Add well'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
