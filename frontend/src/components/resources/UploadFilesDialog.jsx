import { useRef, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
  LinearProgress,
  Alert,
  Box,
} from "@mui/material";
import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";
import DriveFolderUploadOutlinedIcon from "@mui/icons-material/DriveFolderUploadOutlined";
import CloseIcon from "@mui/icons-material/Close";
import { uploadFilesToFolder } from "../../api/resources";
import { formatBytes } from "../../utils/fileIcons";

export default function UploadFilesDialog({ open, onClose, folderId, onUploaded }) {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const fileInputRef = useRef(null);
  const folderInputRef = useRef(null);

  const handleFilesPicked = (fileList) => {
    setSelectedFiles(Array.from(fileList));
    setError("");
  };

  const removeFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClose = () => {
    setSelectedFiles([]);
    setProgress(0);
    setError("");
    onClose();
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      setError("Choose at least one file.");
      return;
    }
    setUploading(true);
    setError("");
    try {
      const relativePaths = selectedFiles.map((f) => f.webkitRelativePath || f.name);
      await uploadFilesToFolder(folderId, selectedFiles, relativePaths);
      onUploaded();
      handleClose();
    } catch (err) {
      setError(err.message || "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Upload to Folder</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}

          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={<UploadFileOutlinedIcon />}
              onClick={() => fileInputRef.current?.click()}
              fullWidth
            >
              Choose Files
            </Button>
            <Button
              variant="outlined"
              startIcon={<DriveFolderUploadOutlinedIcon />}
              onClick={() => folderInputRef.current?.click()}
              fullWidth
            >
              Choose Folder
            </Button>
          </Stack>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            hidden
            onChange={(e) => handleFilesPicked(e.target.files)}
          />
          <input
            ref={folderInputRef}
            type="file"
            webkitdirectory=""
            directory=""
            multiple
            hidden
            onChange={(e) => handleFilesPicked(e.target.files)}
          />

          {selectedFiles.length > 0 && (
            <Box sx={{ maxHeight: 220, overflowY: "auto", border: "1px solid #e0e0e0", borderRadius: 1 }}>
              <List dense>
                {selectedFiles.map((file, index) => (
                  <ListItem
                    key={`${file.name}-${index}`}
                    secondaryAction={
                      <IconButton size="small" onClick={() => removeFile(index)} disabled={uploading}>
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    }
                  >
                    <ListItemText
                      primary={file.webkitRelativePath || file.name}
                      secondary={formatBytes(file.size)}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}

          {uploading && <LinearProgress />}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} disabled={uploading}>
          Cancel
        </Button>
        <Button variant="contained" onClick={handleUpload} disabled={uploading}>
          {uploading ? "Uploading..." : "Upload"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}