import { useEffect, useState } from "react";
import {
  Card,
  Box,
  Typography,
  Button,
  Grid,
  Avatar,
  CircularProgress,
  Alert,
  Stack,
} from "@mui/material";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import { fetchFolders } from "../../api/resources";
import FolderCard from "./FolderCard";
import CreateFolderDialog from "./CreateFolderDialog";
import FolderDetailDialog from "./FolderDetailDialog";

const ACCENT = "#1E293B";

export default function ResourceFoldersSection() {
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [activeFolderId, setActiveFolderId] = useState(null);

  const loadFolders = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchFolders();
      setFolders(data);
    } catch (err) {
      setError("Unable to load folders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFolders();
  }, []);

  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 4,
        borderColor: "rgba(15,23,42,0.08)",
        boxShadow: "0 1px 3px rgba(15,23,42,0.06)",
        p: { xs: 2.5, sm: 3.5 },
      }}
    >
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar
            variant="rounded"
            sx={{ bgcolor: `${ACCENT}12`, color: ACCENT, width: 46, height: 46, borderRadius: 2.5 }}
          >
            <FolderOutlinedIcon fontSize="small" />
          </Avatar>
          <Box>
            <Typography variant="h6" fontWeight={700} sx={{ color: "#0f172a" }}>
              Resource Library
            </Typography>
            <Typography variant="body2" sx={{ color: "#64748b" }}>
              Guides, tools, and shared files
            </Typography>
          </Box>
        </Stack>

        <Button
          variant="contained"
          startIcon={<AddOutlinedIcon />}
          onClick={() => setCreateOpen(true)}
          disableElevation
          sx={{
            bgcolor: ACCENT,
            textTransform: "none",
            fontWeight: 600,
            borderRadius: 2,
            px: 2.5,
            py: 1,
            "&:hover": { bgcolor: "#0f172a" },
          }}
        >
          New Folder
        </Button>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress size={28} sx={{ color: ACCENT }} />
        </Box>
      ) : folders.length === 0 ? (
        <Box
          sx={{
            textAlign: "center",
            py: 6,
            borderRadius: 3,
            border: "1px dashed rgba(15,23,42,0.15)",
            bgcolor: "rgba(15,23,42,0.02)",
          }}
        >
          <FolderOutlinedIcon sx={{ fontSize: 34, color: "#cbd5e1", mb: 1 }} />
          <Typography variant="body2" sx={{ color: "#64748b" }}>
            No folders yet. Create one to get started.
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={2.5}>
          {folders.map((folder) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={folder.id}>
              <FolderCard folder={folder} onOpen={(f) => setActiveFolderId(f.id)} />
            </Grid>
          ))}
        </Grid>
      )}

      <CreateFolderDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={loadFolders}
      />

      <FolderDetailDialog
        open={Boolean(activeFolderId)}
        folderId={activeFolderId}
        onClose={() => setActiveFolderId(null)}
        onFolderDeleted={loadFolders}
      />
    </Card>
  );
}