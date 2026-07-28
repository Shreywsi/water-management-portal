import { useEffect, useState } from "react";
import {
  Container,
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Button,
  Stack,
  Divider,
  Avatar,
  Alert,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
} from "@mui/material";

import UploadFileIcon from "@mui/icons-material/UploadFile";
import MapIcon from "@mui/icons-material/Map";
import TerrainIcon from "@mui/icons-material/Terrain";
import LayersIcon from "@mui/icons-material/Layers";
import WaterDropIcon from "@mui/icons-material/WaterDrop";
import AppsIcon from "@mui/icons-material/Apps";

import { apiFetch } from "../../utils/api";
import WaterMap from "../../components/WaterMap";
import DownloadIcon from "@mui/icons-material/Download";
import DeleteIcon from "@mui/icons-material/Delete";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

const ACCENT = "#1E293B"; // navy, matches sidebar

export default function GISDataManager() {
  const [uploading, setUploading] = useState(false);
  const [mapRefreshKey, setMapRefreshKey] = useState(0);
  const [gempyLoading, setGempyLoading] = useState(false);
  const [gempyMessage, setGempyMessage] = useState("");
  const [gisFiles, setGisFiles] = useState([]);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];

    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploading(true);

      const response = await apiFetch("/gis/upload/", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      console.log(data);

      if (response.ok) {
  alert(`Uploaded: ${data.filename}`);
  setMapRefreshKey((prev) => prev + 1);
  loadGISFiles();
} else {
  alert(data.error || "Upload failed.");
}
    } catch (error) {
      console.error(error);
      alert("Upload failed.");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };
  const loadGISFiles = async () => {
    console.log("Loading GIS files...");
    try {
      const response = await apiFetch("/gis/files/");

      if (!response.ok) return;

      const data = await response.json();

      console.log("Received:", data);
      setGisFiles(data);
    } catch (err) {
      console.error(err);
    }
  };
  useEffect(() => {
  loadGISFiles();
}, []);

useEffect(() => {
  console.log("GIS Files state updated:", gisFiles);
}, [gisFiles]);

const downloadFile = async (id, filename) => {
  try {
    const response = await apiFetch(`/gis/files/${id}/download/`);

    if (!response.ok) {
      alert("Download failed.");
      return;
    }

    const blob = await response.blob();

    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = filename;

    document.body.appendChild(a);
    a.click();
    a.remove();

    window.URL.revokeObjectURL(url);
  } catch (err) {
    console.error(err);
    alert("Download failed.");
  }
};
const deleteFile = async (id, filename) => {
  const confirmed = window.confirm(
    `Delete "${filename}"?\n\nThis will permanently remove the uploaded file and its GIS layer.`
  );

  if (!confirmed) return;

  try {
    const response = await apiFetch(`/gis/files/${id}/`, {
      method: "DELETE",
    });

    if (!response.ok) {
      alert("Delete failed.");
      return;
    }

    alert("File deleted successfully.");

    loadGISFiles();
    setMapRefreshKey((prev) => prev + 1);

  } catch (err) {
    console.error(err);
    alert("Delete failed.");
  }
};

  const runGemPy = async () => {
    try {
      setGempyLoading(true);
      setGempyMessage("");

      const response = await apiFetch("/run-gempy/", {
        method: "POST",
      });

      const data = await response.json();

      if (data.success) {
        console.log(data);
        setGempyMessage(`Loaded ${data.well_count} wells from PostgreSQL`);
      } else {
        setGempyMessage("GemPy failed.");
      }
    } catch {
      setGempyMessage("Could not connect to backend.");
    } finally {
      setGempyLoading(false);
    }
  };

  const handleOpenGIS = async () => {
    try {
      // Check if launcher is running
      const statusResponse = await fetch("http://127.0.0.1:5001/status");

      if (!statusResponse.ok) {
        alert("Water Management Launcher is not running.");
        return;
      }

      const status = await statusResponse.json();

      if (!status.installed) {
        alert("QGIS is not installed on this computer.");
        return;
      }

      // Ask launcher to open QGIS
      const response = await fetch("http://127.0.0.1:5001/open-qgis", {
        method: "POST",
      });

      const result = await response.json();

      alert(result.message);
    } catch (error) {
      console.error(error);

      alert(
        "Water Management Launcher is not running.\n\nPlease start the launcher first."
      );
    }
  };

  const handleOpenModelMuse = async () => {
    try {
      // Check if launcher is running
      const statusResponse = await fetch("http://127.0.0.1:5001/modelmuse-status");

      if (!statusResponse.ok) {
        alert("Water Management Launcher is not running.");
        return;
      }

      const status = await statusResponse.json();

      if (!status.installed) {
        alert("ModelMuse is not installed on this computer.");
        return;
      }

      // Ask launcher to open ModelMuse
      const response = await fetch("http://127.0.0.1:5001/open-modelmuse", {
        method: "POST",
      });

      const result = await response.json();

      alert(result.message);
    } catch (error) {
      console.error(error);

      alert(
        "Water Management Launcher is not running.\n\nPlease start the launcher first."
      );
    }
  };

  return (
    <Container
      maxWidth="xl"
      sx={{
        py: { xs: 3, sm: 4, md: 5 },
        px: { xs: 2, sm: 3, md: 4 },
      }}
    >
      <Stack spacing={{ xs: 3, md: 4 }}>
        {/* Page header */}
        <Box>
          <Stack direction="row" spacing={2} alignItems="center" mb={1}>
            <Avatar
              variant="rounded"
              sx={{
                bgcolor: `${ACCENT}1A`,
                color: ACCENT,
                width: 48,
                height: 48,
              }}
            >
              <LayersIcon />
            </Avatar>

            <Box>
              <Typography variant="h4" fontWeight={700}>
                GIS Data Manager
              </Typography>

              <Typography color="text.secondary">
                Import GIS layers and manage them from one place.
              </Typography>
            </Box>
          </Stack>
        </Box>

        {/* Import card */}
        <Card
          variant="outlined"
          sx={{
            borderRadius: 3,
            borderColor: "divider",
            boxShadow: "0 1px 3px rgba(15,23,42,0.06)",
          }}
        >
          <CardHeader
            avatar={
              <Avatar sx={{ bgcolor: `${ACCENT}1A`, color: ACCENT }}>
                <UploadFileIcon fontSize="small" />
              </Avatar>
            }
            title={
              <Typography variant="h6" fontWeight={600}>
                Import GIS Layer
              </Typography>
            }
            subheader="Add a new layer to your workspace"
            sx={{
              pb: 2,
              alignItems: "center",
            }}
          />

          <CardContent>
            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={3}
              alignItems={{ xs: "stretch", md: "center" }}
              divider={
                <Divider
                  orientation="vertical"
                  flexItem
                  sx={{ display: { xs: "none", md: "block" } }}
                />
              }
            >
              {/* Left: upload button + helper text */}
              <Paper
                variant="outlined"
                sx={{
                  flex: 1,
                  borderStyle: "dashed",
                  borderColor: "divider",
                  borderRadius: 2,
                  px: 3,
                  py: 3,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: "action.hover",
                }}
              >
                <input
                  id="gis-upload"
                  type="file"
                  hidden
                  accept=".zip,.geojson,.kml,.csv"
                  onChange={handleFileUpload}
                />

                <label htmlFor="gis-upload">
                  <Button
                    variant="contained"
                    component="span"
                    startIcon={<UploadFileIcon />}
                    disabled={uploading}
                    disableElevation
                    sx={{
                      bgcolor: ACCENT,
                      "&:hover": { bgcolor: "#101A30" },
                    }}
                  >
                    {uploading ? "Uploading…" : "Upload GIS File"}
                  </Button>
                </label>

                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                  mt={1.5}
                >
                  Drop a file on the button above or click to browse
                </Typography>
              </Paper>

              
            </Stack>
          </CardContent>
        </Card>
        <Accordion
  defaultExpanded={false}
  sx={{
    borderRadius: 3,
    overflow: "hidden",
    boxShadow: "0 1px 3px rgba(15,23,42,0.06)",
    "&:before": {
      display: "none",
    },
  }}
>
  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
    <Box>
      <Typography variant="h6" fontWeight={600}>
        Manage Uploaded GIS Datasets
      </Typography>

      <Typography variant="body2" color="text.secondary">
        {gisFiles.length} uploaded file{gisFiles.length !== 1 ? "s" : ""}
      </Typography>
    </Box>
  </AccordionSummary>

  <AccordionDetails>

    <TableContainer>

      <Table>

        <TableHead>
          <TableRow>
            <TableCell><strong>File</strong></TableCell>
            <TableCell><strong>Layer</strong></TableCell>
            <TableCell><strong>Size</strong></TableCell>
            <TableCell><strong>Status</strong></TableCell>
            <TableCell align="center"><strong>Actions</strong></TableCell>
          </TableRow>
        </TableHead>

        <TableBody>

          {gisFiles.map((file) => (

            <TableRow key={file.id}>

              <TableCell>
                {file.original_filename || "-"}
              </TableCell>

              <TableCell>
                {file.layer_name}
              </TableCell>

              <TableCell>
                {(file.file_size / 1024).toFixed(1)} KB
              </TableCell>

              <TableCell>
                {file.has_file ? (
                  <Chip
                    label="Available"
                    color="success"
                    size="small"
                  />
                ) : (
                  <Chip
                    label="Missing"
                    color="error"
                    size="small"
                  />
                )}
              </TableCell>

              <TableCell align="center">

                <IconButton
  onClick={() =>
    downloadFile(file.id, file.original_filename)
  }
>
  <DownloadIcon />
</IconButton>

                <IconButton
                  color="error"
                  onClick={() =>
  deleteFile(file.id, file.original_filename)
}
                >
                  <DeleteIcon />
                </IconButton>

              </TableCell>

            </TableRow>

          ))}

        </TableBody>

      </Table>

    </TableContainer>

  </AccordionDetails>

</Accordion>
        {/* GIS Tools + Map */}
        <Card
          variant="outlined"
          sx={{
            borderRadius: 3,
            borderColor: "divider",
            boxShadow: "0 1px 3px rgba(15,23,42,0.06)",
          }}
        >
          <CardHeader
            avatar={
              <Avatar sx={{ bgcolor: `${ACCENT}1A`, color: ACCENT }}>
                <WaterDropIcon fontSize="small" />
              </Avatar>
            }
            title={
              <Typography variant="h6" fontWeight={600}>
                Water Resources Map
              </Typography>
            }
            subheader="Launch modeling tools and view spatial data"
            sx={{
              pb: 2,
              alignItems: "center",
            }}
          />

          <CardContent>
            <Stack spacing={2.5}>
              <Stack
                direction="row"
                spacing={2}
                flexWrap="wrap"
                useFlexGap
                alignItems="center"
              >
                <Button
                  variant="contained"
                  startIcon={<MapIcon />}
                  disableElevation
                  onClick={handleOpenGIS}
                  sx={{
                    bgcolor: ACCENT,
                    "&:hover": { bgcolor: "#101A30" },
                  }}
                >
                  Open QGIS Workspace
                </Button>

                <Button
                  variant="outlined"
                  startIcon={<AppsIcon />}
                  onClick={handleOpenModelMuse}
                  sx={{
                    borderColor: ACCENT,
                    color: ACCENT,
                    "&:hover": {
                      borderColor: "#101A30",
                      bgcolor: `${ACCENT}0D`,
                    },
                  }}
                >
                  Open ModelMuse
                </Button>

                <Button
                  variant="outlined"
                  startIcon={<TerrainIcon />}
                  onClick={runGemPy}
                  disabled={gempyLoading}
                  sx={{
                    borderColor: ACCENT,
                    color: ACCENT,
                    "&:hover": {
                      borderColor: "#101A30",
                      bgcolor: `${ACCENT}0D`,
                    },
                  }}
                >
                  {gempyLoading ? "Running…" : "Run GemPy"}
                </Button>
              </Stack>

              {gempyMessage && (
                <Alert
                  severity={
                    gempyMessage.toLowerCase().includes("fail") ||
                    gempyMessage.toLowerCase().includes("could not")
                      ? "error"
                      : "success"
                  }
                  variant="outlined"
                  sx={{ borderRadius: 2 }}
                >
                  {gempyMessage}
                </Alert>
              )}

              <Box
                sx={{
                  width: "100%",
                  height: 550,
                  position: "relative",
                  borderRadius: 2,
                  overflow: "hidden",
                  border: "1px solid",
                  borderColor: "divider",
                }}
              >
                <WaterMap refreshKey={mapRefreshKey} />
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </Container>
  );
}