import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Stack, Snackbar, Alert } from '@mui/material';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import VillageTable from '../../components/admin/VillageTable';
import AddVillageDialog from '../../components/admin/AddVillageDialog';
import ConfirmDeleteDialog from '../../components/admin/ConfirmDeleteDialog';
import ViewDetailsDialog from '../../components/admin/ViewDetailsDialog';
import { fetchVillages, createVillage, updateVillage, deleteVillage } from '../../data/dataService';

export default function VillagesPage() {
  const [villages, setVillages] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingVillage, setEditingVillage] = useState(null);
  const [viewingVillage, setViewingVillage] = useState(null);
  const [deletingVillage, setDeletingVillage] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchVillages().then(setVillages);
  }, []);

  const handleSave = async (form) => {
    if (editingVillage) {
      const updated = await updateVillage(editingVillage.id, form);
      setVillages((prev) => prev.map((v) => (v.id === updated.id ? updated : v)));
      setToast({ severity: 'success', message: `Updated ${updated.name}.` });
    } else {
      const created = await createVillage(form);
      setVillages((prev) => [created, ...prev]);
      setToast({ severity: 'success', message: `Added ${created.name}.` });
    }
    setDialogOpen(false);
    setEditingVillage(null);
  };

  const handleDeleteConfirmed = async () => {
    await deleteVillage(deletingVillage.id);
    setVillages((prev) => prev.filter((v) => v.id !== deletingVillage.id));
    setToast({ severity: 'success', message: `Removed ${deletingVillage.name}.` });
    setDeletingVillage(null);
  };

  return (
    <Stack spacing={3}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5">Village Management</Typography>
          <Typography variant="body2" color="text.secondary">
            Onboard and manage villages participating in the monitoring program.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddOutlinedIcon />}
          onClick={() => {
            setEditingVillage(null);
            setDialogOpen(true);
          }}
        >
          Add Village
        </Button>
      </Box>

      <VillageTable
        villages={villages}
        onView={setViewingVillage}
        onEdit={(village) => {
          setEditingVillage(village);
          setDialogOpen(true);
        }}
        onDelete={setDeletingVillage}
      />

      <AddVillageDialog
        open={dialogOpen}
        initialData={editingVillage}
        onClose={() => {
          setDialogOpen(false);
          setEditingVillage(null);
        }}
        onSave={handleSave}
      />

      <ConfirmDeleteDialog
        open={Boolean(deletingVillage)}
        label="Village"
        onClose={() => setDeletingVillage(null)}
        onConfirm={handleDeleteConfirmed}
      />

      <ViewDetailsDialog
        open={Boolean(viewingVillage)}
        onClose={() => setViewingVillage(null)}
        title="Village Details"
        record={viewingVillage}
        fields={[
          ['Village ID', 'id'],
          ['Village Name', 'name'],
          ['District', 'district'],
          ['State', 'state'],
          ['Number of Farmers', 'farmers'],
          ['Number of Wells', 'wells'],
          ['Description', 'description'],
        ]}
      />

      <Snackbar open={Boolean(toast)} autoHideDuration={3000} onClose={() => setToast(null)}>
        {toast && <Alert severity={toast.severity}>{toast.message}</Alert>}
      </Snackbar>
    </Stack>
  );
}
