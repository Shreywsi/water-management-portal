import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Stack, Snackbar, Alert } from '@mui/material';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import WellTable from '../../components/admin/WellTable';
import AddWellDialog from '../../components/admin/AddWellDialog';
import ConfirmDeleteDialog from '../../components/admin/ConfirmDeleteDialog';
import ViewDetailsDialog from '../../components/admin/ViewDetailsDialog';
import { fetchWells, createWell, updateWell, deleteWell } from '../../data/dataService';

export default function WellsPage() {
  const [wells, setWells] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingWell, setEditingWell] = useState(null);
  const [viewingWell, setViewingWell] = useState(null);
  const [deletingWell, setDeletingWell] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchWells().then(setWells);
  }, []);

  const handleSave = async (form) => {
    if (editingWell) {
      const updated = await updateWell(editingWell.id, form);
      setWells((prev) => prev.map((w) => (w.id === updated.id ? updated : w)));
      setToast({ severity: 'success', message: `Updated well ${updated.id}.` });
    } else {
      const created = await createWell(form);
      setWells((prev) => [created, ...prev]);
      setToast({ severity: 'success', message: `Added well ${created.id}.` });
    }
    setDialogOpen(false);
    setEditingWell(null);
  };

  const handleDeleteConfirmed = async () => {
    await deleteWell(deletingWell.id);
    setWells((prev) => prev.filter((w) => w.id !== deletingWell.id));
    setToast({ severity: 'success', message: `Removed well ${deletingWell.id}.` });
    setDeletingWell(null);
  };

  return (
    <Stack spacing={3}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5">Well Management</Typography>
          <Typography variant="body2" color="text.secondary">
            Track every monitored well, its owner, location, and current status.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddOutlinedIcon />}
          onClick={() => {
            setEditingWell(null);
            setDialogOpen(true);
          }}
        >
          Add Well
        </Button>
      </Box>

      <WellTable
        wells={wells}
        onView={setViewingWell}
        onEdit={(well) => {
          setEditingWell(well);
          setDialogOpen(true);
        }}
        onDelete={setDeletingWell}
      />

      <AddWellDialog
        open={dialogOpen}
        initialData={editingWell}
        onClose={() => {
          setDialogOpen(false);
          setEditingWell(null);
        }}
        onSave={handleSave}
      />

      <ConfirmDeleteDialog
        open={Boolean(deletingWell)}
        label="Well"
        onClose={() => setDeletingWell(null)}
        onConfirm={handleDeleteConfirmed}
      />

      <ViewDetailsDialog
        open={Boolean(viewingWell)}
        onClose={() => setViewingWell(null)}
        title="Well Details"
        record={viewingWell}
        fields={[
          ['Well ID', 'id'],
          ['Owner Name', 'owner'],
          ['Village', 'village'],
          ['Depth (m)', 'depth'],
          ['Status', 'status'],
          ['Latitude', 'lat'],
          ['Longitude', 'lng'],
        ]}
      />

      <Snackbar open={Boolean(toast)} autoHideDuration={3000} onClose={() => setToast(null)}>
        {toast && <Alert severity={toast.severity}>{toast.message}</Alert>}
      </Snackbar>
    </Stack>
  );
}
