import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Stack, Snackbar, Alert } from '@mui/material';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import UserTable from '../../components/admin/UserTable';
import AddUserDialog from '../../components/admin/AddUserDialog';
import ConfirmDeleteDialog from '../../components/admin/ConfirmDeleteDialog';
import ViewDetailsDialog from '../../components/admin/ViewDetailsDialog';
import { fetchUsers, createUser, updateUser, deleteUser } from '../../data/dataService';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [viewingUser, setViewingUser] = useState(null);
  const [deletingUser, setDeletingUser] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchUsers().then((data) => {
      setUsers(data);
      setLoading(false);
    });
  }, []);

  const handleSave = async (form) => {
    if (editingUser) {
      const updated = await updateUser(editingUser.id, form);
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
      setToast({ severity: 'success', message: `Updated ${updated.name}.` });
    } else {
      const created = await createUser(form);
      setUsers((prev) => [created, ...prev]);
      setToast({ severity: 'success', message: `Added ${created.name}.` });
    }
    setDialogOpen(false);
    setEditingUser(null);
  };

  const handleDeleteConfirmed = async () => {
    await deleteUser(deletingUser.id);
    setUsers((prev) => prev.filter((u) => u.id !== deletingUser.id));
    setToast({ severity: 'success', message: `Removed ${deletingUser.name}.` });
    setDeletingUser(null);
  };

  return (
    <Stack spacing={3}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5">User Management</Typography>
          <Typography variant="body2" color="text.secondary">
            Manage farmers, CRPs, researchers, and admins across the platform.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddOutlinedIcon />}
          onClick={() => {
            setEditingUser(null);
            setDialogOpen(true);
          }}
        >
          Add User
        </Button>
      </Box>

      <UserTable
        users={users}
        onView={setViewingUser}
        onEdit={(user) => {
          setEditingUser(user);
          setDialogOpen(true);
        }}
        onDelete={setDeletingUser}
      />

      <AddUserDialog
        open={dialogOpen}
        initialData={editingUser}
        onClose={() => {
          setDialogOpen(false);
          setEditingUser(null);
        }}
        onSave={handleSave}
      />

      <ConfirmDeleteDialog
        open={Boolean(deletingUser)}
        label="User"
        onClose={() => setDeletingUser(null)}
        onConfirm={handleDeleteConfirmed}
      />

      <ViewDetailsDialog
        open={Boolean(viewingUser)}
        onClose={() => setViewingUser(null)}
        title="User Details"
        record={viewingUser}
        fields={[
          ['User ID', 'id'],
          ['Name', 'name'],
          ['Role', 'role'],
          ['Village', 'village'],
          ['Phone Number', 'phone'],
          ['Email', 'email'],
          ['Status', 'status'],
        ]}
      />

      <Snackbar open={Boolean(toast)} autoHideDuration={3000} onClose={() => setToast(null)}>
        {toast && <Alert severity={toast.severity}>{toast.message}</Alert>}
      </Snackbar>
    </Stack>
  );
}
