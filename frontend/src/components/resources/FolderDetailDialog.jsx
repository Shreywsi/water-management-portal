import { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Stack,
  Box,
  CircularProgress,
  Alert,
} from "@mui/material";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlineOutlined";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import { fetchFolderDetail, deleteFile, downloadFile, deleteFolder } from "../../api/resources";
import { getFileIcon, formatBytes } from "../../utils/fileIcons";
import UploadFilesDialog from "./UploadFilesDialog";

export default function FolderDetailDialog({ open, folderId, onClose, onFolderDeleted }) {
  const [folder, setFolder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [uploadOpen, setUploadOpen] = useState(false);

  const loadFolder = async () => {
    if (!folderId) return;
    setLoading(true);
    setError("");
    try {
      const data = await fetchFolderDetail(folderId);
      setFolder(data);
    } catch (err) {
      setError("Unable to load folder.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) loadFolder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, folderId]);

  const handleDownload = async (file) => {
    try {
      await downloadFile(file.id, file.filename.split("/").pop());
    } catch (err) {
      setError("Download failed.");
    }
  };

  const handleDeleteFile = async (fileId) => {
    if (!window.confirm("Delete this file?")) return;
    try {
      await deleteFile(fileId);
      await loadFolder();
    } catch (err) {
      setError("Unable to delete file.");
    }
  };

  const handleDeleteFolder = async () => {
    if (!window.confirm(`Delete the entire folder "${folder?.name}" and all its files?`)) return;
    try {
      await deleteFolder(folderId);
      onFolderDeleted();
      onClose();
    } catch (err) {
      setError("Unable to delete folder.");
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
        <DialogTitle>{folder?.name || "Folder"}</DialogTitle>
        <DialogContent dividers>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress size={28} />
            </Box>
          ) : (
            <>
              {folder?.description && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {folder.description}
                </Typography>
              )}

              {folder?.files?.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: "center" }}>
                  No files in this folder yet.
                </Typography>
              ) : (
                <List>
                  {folder?.files?.map((file) => {
                    const { Icon, color } = getFileIcon(file.filename);
                    return (
                      <ListItem
                        key={file.id}
                        secondaryAction={
                          <Stack direction="row" spacing={0.5}>
                            <IconButton size="small" onClick={() => handleDownload(file)}>
                              <DownloadOutlinedIcon fontSize="small" />
                            </IconButton>
                            <IconButton size="small" color="error" onClick={() => handleDeleteFile(file.id)}>
                              <DeleteOutlineIcon fontSize="small" />
                            </IconButton>
                          </Stack>
                        }
                      >
                        <ListItemIcon>
                          <Icon sx={{ color }} />
                        </ListItemIcon>
                        <ListItemText
                          primary={file.filename}
                          secondary={formatBytes(file.size)}
                        />
                      </ListItem>
                    );
                  })}
                </List>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 1.5, justifyContent: "space-between" }}>
          <Button color="error" onClick={handleDeleteFolder}>
            Delete Folder
          </Button>
          <Stack direction="row" spacing={1}>
            <Button onClick={onClose}>Close</Button>
            <Button variant="contained" startIcon={<AddOutlinedIcon />} onClick={() => setUploadOpen(true)}>
              Upload
            </Button>
          </Stack>
        </DialogActions>
      </Dialog>

      <UploadFilesDialog
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        folderId={folderId}
        onUploaded={loadFolder}
      />
    </>
  );
}