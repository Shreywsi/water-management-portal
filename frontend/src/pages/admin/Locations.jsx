import { useState, useEffect, useRef } from "react";
import axios from "axios";
import API_BASE from "../../config/api";
import { getWells, addWell, updateWell, deleteWell, exportWells } from "../../api/wellApi";
import {
  Container,
  Card,
  CardContent,
  CardHeader,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  Stack,
  IconButton,
  Alert,
  Divider,
  Box,
  InputLabel,
  MenuItem,
  Select,
  FormControl,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import DownloadIcon from "@mui/icons-material/Download";
import CloseIcon from "@mui/icons-material/Close";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import WaterOutlinedIcon from "@mui/icons-material/WaterOutlined";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";

import { useDashboardEdit } from "../../context/DashboardEditContext";
// ^ adjust this relative path to wherever you place DashboardEditContext.jsx

// ---------------------------------------------------------------------
// SHARED DESIGN TOKENS — identical to GISDataManager.jsx, WaterBalance
// pages, and AIPrediction.jsx, so every admin page reads as one site.
// ---------------------------------------------------------------------
const ACCENT = "#1E293B"; // navy, matches sidebar
const ACCENT_TINT = `${ACCENT}1A`; // avatar / icon chip backgrounds
const ACCENT_SOFT_BG = "#F8FAFC"; // very light slate, table headers etc.
const ACCENT_BORDER = "#E2E8F0"; // hairline border colour
const CARD_SHADOW = "0 1px 3px rgba(15,23,42,0.06)";

// Shared card shell used by every card on every admin page.
const cardSx = {
  borderRadius: 3,
  borderColor: "divider",
  boxShadow: CARD_SHADOW,
};

// Shared table header styling, used by every data table on every page.
const tableHeadSx = {
  "& th": { fontWeight: 700, backgroundColor: ACCENT_SOFT_BG, color: ACCENT },
};

// Small reusable "caption above field" wrapper so every input in the form
// shares one consistent label style (no floating MUI labels anywhere).
function FieldLabel({ children }) {
  return (
    <Typography variant="caption" sx={{ color: "text.secondary", mb: 0.5, display: "block" }}>
      {children}
    </Typography>
  );
}

// Small inline notice shown wherever a mutating control is hidden because
// edit mode is off — same visual as the equivalent notice on the GIS page.
function EditModeLockedNotice({ label }) {
  return (
    <Stack
      direction="row"
      spacing={1.5}
      alignItems="center"
      sx={{
        borderStyle: "dashed",
        borderWidth: 1,
        borderColor: "divider",
        borderRadius: 2,
        px: 3,
        py: 3,
        bgcolor: "action.hover",
        color: "text.secondary",
      }}
    >
      <LockOutlinedIcon fontSize="small" />
      <Typography variant="body2">Enable edit mode from the top bar to {label}.</Typography>
    </Stack>
  );
}

export default function Locations() {
  const { editMode, adminPassword } = useDashboardEdit();

  const [name, setName] = useState("");
  const [locations, setLocations] = useState([]);
  const [wells, setWells] = useState([]);

  const [wellData, setWellData] = useState({
    location: "",
    well_id: "",
    observation_date: "",
    latitude: "",
    longitude: "",
  });

  // Free-text custom parameters: [{ parameter_name, parameter_value }]
  // No predefined list — the admin can name any parameter they want.
  const [wellParameters, setWellParameters] = useState([]);

  const [exportLocation, setExportLocation] = useState("");
  const [exportStartDate, setExportStartDate] = useState("");
  const [exportEndDate, setExportEndDate] = useState("");
  const [exportType, setExportType] = useState("research");
  const [selectedParameters, setSelectedParameters] = useState([]);
  const [selectAllParameters, setSelectAllParameters] = useState(true);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [editingWellId, setEditingWellId] = useState(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");
  const [submitting, setSubmitting] = useState(false);

  // Guards against stale GET responses overwriting newer state
  const requestIdRef = useRef(0);

  const loadLocations = async () => {
    const thisRequestId = ++requestIdRef.current;
    try {
      const url = `${API_BASE}/location-list/`;
      const res = await axios.get(url);

      // If a newer request has already started, ignore this stale response
      if (thisRequestId !== requestIdRef.current) return;

      setLocations(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadWells = async () => {
    try {
      const res = await getWells();
      setWells(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadLocations();
    loadWells();
  }, []);

  const addLocation = async () => {
    if (!name.trim() || submitting) return;
    setSubmitting(true);

    try {
      const res = await axios.post(
        `${API_BASE}/location/add/`,
        { name: name.trim() },
        { headers: { "X-Admin-Password": adminPassword } }
      );

      if (res.data.success) {
        setMessage("Location added successfully.");
        setMessageType("success");
        setName("");
        await loadLocations();
      } else {
        setMessage(res.data.message || "Unable to add location.");
        setMessageType("error");
      }
    } catch (err) {
      setMessage(err.response?.data?.message || "Unable to add location.");
      setMessageType("error");
    } finally {
      setSubmitting(false);
    }
  };

  const deleteLocation = async (id) => {
    if (!window.confirm("Delete this location?")) return;

    try {
      await axios.delete(`${API_BASE}/location/${id}/`, {
        headers: { "X-Admin-Password": adminPassword },
      });
      setMessage("Location deleted.");
      setMessageType("success");
      await loadLocations();
    } catch (err) {
      setMessage("Unable to delete location.");
      setMessageType("error");
    }
  };

  const addParameterRow = () => {
    setWellParameters([
      ...wellParameters,
      {
        parameter_name: "",
        parameter_value: "",
      },
    ]);
  };

  const removeParameterRow = (index) => {
    setWellParameters(wellParameters.filter((_, i) => i !== index));
  };

  const updateParameterRow = (index, field, value) => {
    const updated = [...wellParameters];
    updated[index][field] = value;
    setWellParameters(updated);
  };

  const handleWellChange = (field, value) => {
    setWellData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const saveWell = async () => {
    if (!wellData.location || !wellData.well_id || !wellData.observation_date) {
      setMessage("Please fill all required fields.");
      setMessageType("error");
      return;
    }

    try {
      const payload = {
        ...wellData,
        parameters: wellParameters,
      };

      if (editingWellId) {
        await updateWell(editingWellId, payload, adminPassword);
        setMessage("Well updated successfully.");
      } else {
        await addWell(payload, adminPassword);
        setMessage("Well added successfully.");
      }

      setMessageType("success");

      setWellData({
        location: "",
        well_id: "",
        observation_date: "",
        latitude: "",
        longitude: "",
      });

      setWellParameters([]);
      setEditingWellId(null);

      loadWells();
    } catch (err) {
      console.error(err);
      setMessage("Unable to add well.");
      setMessageType("error");
    }
  };
  const editWell = (well) => {
    setEditingWellId(well.id);

    setWellData({
      location: well.location,
      well_id: well.well_id,
      observation_date: well.observation_date,
      latitude: well.latitude,
      longitude: well.longitude,
    });

    setWellParameters(
      well.parameters.map((p) => ({
        parameter_name: p.parameter_name,
        parameter_value: p.parameter_value,
      }))
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };
  const removeWell = async (id) => {
    if (!window.confirm("Delete this well?")) return;

    try {
      await deleteWell(id, adminPassword);
      setMessage("Well deleted.");
      setMessageType("success");
      loadWells();
    } catch (err) {
      console.error(err);
      setMessage("Unable to delete well.");
      setMessageType("error");
    }
  };

  // Export stays open to everyone — no admin password involved.
  const downloadCSV = () => {
    exportWells({
      location: exportLocation,
      start_date: exportStartDate,
      end_date: exportEndDate,
      parameters: selectAllParameters ? [] : selectedParameters,
    });
  };

  const uniqueParameterNames = Array.from(
    new Set(wells.flatMap((well) => well.parameters.map((p) => p.parameter_name)))
  );

  return (
    <Container
      maxWidth="xl"
      sx={{
        py: { xs: 3, sm: 4, md: 5 },
        px: { xs: 2, sm: 3, md: 4 },
      }}
    >
      <Stack spacing={{ xs: 3, md: 4 }}>
        {/* Page header — same pattern as GIS Data Manager */}
        <Box>
          <Stack direction="row" spacing={2} alignItems="center" mb={1}>
            <Avatar
              variant="rounded"
              sx={{
                bgcolor: ACCENT_TINT,
                color: ACCENT,
                width: 48,
                height: 48,
              }}
            >
              <PlaceOutlinedIcon />
            </Avatar>

            <Box>
              <Typography variant="h4" fontWeight={700}>
                Manage Locations
              </Typography>

              <Typography color="text.secondary">
                Add locations, log well observations, and export well data.
              </Typography>
            </Box>
          </Stack>
        </Box>

        {message && (
          <Alert severity={messageType} onClose={() => setMessage("")}>
            {message}
          </Alert>
        )}

        {/* ---------------- Locations card ---------------- */}
        <Card variant="outlined" sx={cardSx}>
          <CardHeader
            avatar={
              <Avatar sx={{ bgcolor: ACCENT_TINT, color: ACCENT }}>
                <PlaceOutlinedIcon fontSize="small" />
              </Avatar>
            }
            title={
              <Typography variant="h6" fontWeight={600}>
                Locations
              </Typography>
            }
            subheader={`${locations.length} location${locations.length === 1 ? "" : "s"} on record`}
            sx={{ pb: 2, alignItems: "center" }}
          />

          <CardContent>
            {editMode ? (
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mb: locations.length ? 3 : 0 }}>
                <TextField fullWidth label="Enter Location" value={name} onChange={(e) => setName(e.target.value)} />

                <Button
                  variant="contained"
                  onClick={addLocation}
                  disabled={submitting}
                  disableElevation
                  sx={{
                    bgcolor: ACCENT,
                    px: 4,
                    whiteSpace: "nowrap",
                    "&:hover": { bgcolor: "#101A30" },
                  }}
                >
                  {submitting ? "Adding..." : "Add"}
                </Button>
              </Stack>
            ) : (
              <Box sx={{ mb: locations.length ? 3 : 0 }}>
                <EditModeLockedNotice label="add a location" />
              </Box>
            )}

            {locations.length > 0 && (
              <List disablePadding>
                {locations.map((location) => (
                  <ListItem
                    key={location.id}
                    divider
                    secondaryAction={
                      editMode && (
                        <IconButton color="error" onClick={() => deleteLocation(location.id)}>
                          <DeleteIcon />
                        </IconButton>
                      )
                    }
                  >
                    <ListItemText primary={location.name} />
                  </ListItem>
                ))}
              </List>
            )}
          </CardContent>
        </Card>

        {/* ---------------- Well form card — add/edit only, edit mode required ---------------- */}
        {editMode ? (
          <Card variant="outlined" sx={cardSx}>
            <CardHeader
              avatar={
                <Avatar sx={{ bgcolor: ACCENT_TINT, color: ACCENT }}>
                  <WaterOutlinedIcon fontSize="small" />
                </Avatar>
              }
              title={
                <Typography variant="h6" fontWeight={600}>
                  {editingWellId ? "Edit Well" : "Add Well"}
                </Typography>
              }
              subheader="Record an observation for a well"
              sx={{ pb: 2, alignItems: "center" }}
            />
            <CardContent>
              {/* Form row 1: Location / Well ID / Observation Date */}
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    md: "repeat(3, 1fr)",
                  },
                  gap: 2,
                  mb: 2,
                }}
              >
                <Box>
                  <FieldLabel>Location</FieldLabel>
                  <FormControl fullWidth sx={{ minWidth: 0 }}>
                    <Select
                      displayEmpty
                      value={wellData.location}
                      onChange={(e) => handleWellChange("location", e.target.value)}
                    >
                      <MenuItem value="" disabled>
                        Select a location
                      </MenuItem>
                      {locations.map((loc) => (
                        <MenuItem key={loc.id} value={loc.id}>
                          {loc.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>

                <Box>
                  <FieldLabel>Well ID</FieldLabel>
                  <TextField
                    fullWidth
                    placeholder="e.g. W001"
                    value={wellData.well_id}
                    onChange={(e) => handleWellChange("well_id", e.target.value)}
                  />
                </Box>

                <Box>
                  <FieldLabel>Observation Date</FieldLabel>
                  <TextField
                    fullWidth
                    type="date"
                    value={wellData.observation_date}
                    onChange={(e) => handleWellChange("observation_date", e.target.value)}
                  />
                </Box>
              </Box>

              {/* Form row 2: Latitude / Longitude */}
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" },
                  gap: 2,
                  mb: 3,
                }}
              >
                <Box>
                  <FieldLabel>Latitude</FieldLabel>
                  <TextField
                    fullWidth
                    value={wellData.latitude}
                    onChange={(e) => handleWellChange("latitude", e.target.value)}
                  />
                </Box>

                <Box>
                  <FieldLabel>Longitude</FieldLabel>
                  <TextField
                    fullWidth
                    value={wellData.longitude}
                    onChange={(e) => handleWellChange("longitude", e.target.value)}
                  />
                </Box>
              </Box>

              <Divider sx={{ mb: 3 }} />

              <Stack direction="row" alignItems="baseline" justifyContent="space-between" sx={{ mb: 1.5 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: ACCENT }}>
                  Parameters
                </Typography>
                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                  No fixed list — add whatever applies to this well
                </Typography>
              </Stack>

              <Stack spacing={2} sx={{ mb: 2 }}>
                {wellParameters.map((row, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: "grid",
                      gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr auto" },
                      gap: 2,
                      alignItems: "end",
                    }}
                  >
                    <Box>
                      <FieldLabel>Parameter Name</FieldLabel>
                      <TextField
                        fullWidth
                        placeholder="e.g. Recharge from rainfall"
                        value={row.parameter_name}
                        onChange={(e) => updateParameterRow(index, "parameter_name", e.target.value)}
                      />
                    </Box>

                    <Box>
                      <FieldLabel>Value</FieldLabel>
                      <TextField
                        fullWidth
                        placeholder="e.g. 150"
                        value={row.parameter_value}
                        onChange={(e) => updateParameterRow(index, "parameter_value", e.target.value)}
                      />
                    </Box>

                    <Button
                      color="error"
                      variant="outlined"
                      onClick={() => removeParameterRow(index)}
                      sx={{ height: "56px", minWidth: { xs: "100%", sm: "110px" } }}
                    >
                      Remove
                    </Button>
                  </Box>
                ))}

                {wellParameters.length === 0 && (
                  <Typography variant="body2" sx={{ color: "text.secondary", fontStyle: "italic" }}>
                    No parameters added yet.
                  </Typography>
                )}
              </Stack>

              <Stack direction={{ xs: "column", sm: "row" }} spacing={2} justifyContent="space-between">
                <Button
                  variant="outlined"
                  onClick={addParameterRow}
                  sx={{
                    borderColor: ACCENT,
                    color: ACCENT,
                    "&:hover": { borderColor: "#101A30", bgcolor: `${ACCENT}0D` },
                  }}
                >
                  Add Parameter
                </Button>

                <Button
                  variant="contained"
                  onClick={saveWell}
                  disableElevation
                  sx={{
                    bgcolor: ACCENT,
                    px: 4,
                    "&:hover": { bgcolor: "#101A30" },
                  }}
                >
                  {editingWellId ? "Update Well" : "Save Well"}
                </Button>
              </Stack>
            </CardContent>
          </Card>
        ) : (
          <Card variant="outlined" sx={cardSx}>
            <CardHeader
              avatar={
                <Avatar sx={{ bgcolor: ACCENT_TINT, color: ACCENT }}>
                  <WaterOutlinedIcon fontSize="small" />
                </Avatar>
              }
              title={
                <Typography variant="h6" fontWeight={600}>
                  Add Well
                </Typography>
              }
              subheader="Record an observation for a well"
              sx={{ pb: 2, alignItems: "center" }}
            />
            <CardContent>
              <EditModeLockedNotice label="add or edit a well" />
            </CardContent>
          </Card>
        )}

        {/* ---------------- Existing wells card ---------------- */}
        <Card variant="outlined" sx={cardSx}>
          <CardHeader
            avatar={
              <Avatar sx={{ bgcolor: ACCENT_TINT, color: ACCENT }}>
                <WaterOutlinedIcon fontSize="small" />
              </Avatar>
            }
            title={
              <Typography variant="h6" fontWeight={600}>
                Existing Wells
              </Typography>
            }
            subheader={`${wells.length} well record${wells.length === 1 ? "" : "s"}`}
            action={
              <Button
                variant="outlined"
                size="small"
                startIcon={<DownloadIcon />}
                onClick={() => setExportDialogOpen(true)}
                sx={{
                  borderColor: ACCENT,
                  color: ACCENT,
                  fontWeight: 600,
                  whiteSpace: "nowrap",
                  "&:hover": { borderColor: "#101A30", bgcolor: `${ACCENT}0D` },
                }}
              >
                Export Data
              </Button>
            }
            sx={{ pb: 2, alignItems: "center" }}
          />
          <CardContent sx={{ p: 0 }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={tableHeadSx}>
                    <TableCell>Well ID</TableCell>
                    <TableCell>Location</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Latitude</TableCell>
                    <TableCell>Longitude</TableCell>
                    <TableCell>Parameters</TableCell>
                    <TableCell align="right" />
                  </TableRow>
                </TableHead>

                <TableBody>
                  {wells.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 5 }}>
                        <Typography variant="body2" color="text.secondary">
                          No wells recorded yet.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}

                  {wells.map((well) => (
                    <TableRow key={well.id} hover>
                      <TableCell>{well.well_id}</TableCell>

                      <TableCell>{locations.find((l) => l.id === well.location)?.name}</TableCell>

                      <TableCell>{well.observation_date}</TableCell>

                      <TableCell>{well.latitude}</TableCell>

                      <TableCell>{well.longitude}</TableCell>

                      <TableCell>
                        {well.parameters.map((p) => (
                          <div key={p.id}>
                            {p.parameter_name}: {p.parameter_value}
                          </div>
                        ))}
                      </TableCell>

                      <TableCell align="right">
                        {editMode && (
                          <>
                            <IconButton color="primary" onClick={() => editWell(well)}>
                              <EditIcon />
                            </IconButton>

                            <IconButton color="error" onClick={() => removeWell(well.id)}>
                              <DeleteIcon />
                            </IconButton>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Stack>

      {/* ---------------- Export dialog — open to everyone, no admin password ---------------- */}
      <Dialog
        open={exportDialogOpen}
        onClose={() => setExportDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            bgcolor: ACCENT_SOFT_BG,
            borderBottom: `1px solid ${ACCENT_BORDER}`,
            py: 2,
          }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Avatar variant="rounded" sx={{ bgcolor: ACCENT, color: "#fff", width: 34, height: 34 }}>
              <FileDownloadOutlinedIcon fontSize="small" />
            </Avatar>
            <Typography variant="h6" fontWeight={700} sx={{ color: ACCENT, fontSize: "1.05rem" }}>
              Export Well Data
            </Typography>
          </Stack>
          <IconButton size="small" onClick={() => setExportDialogOpen(false)}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ pt: 3 }}>
          <Stack spacing={2.5}>
            <FormControl fullWidth>
              <InputLabel>Export Type</InputLabel>
              <Select value={exportType} label="Export Type" onChange={(e) => setExportType(e.target.value)}>
                <MenuItem value="research">Research Dataset (Wide CSV)</MenuItem>
                <MenuItem value="database">PostgreSQL Database Export (ZIP)</MenuItem>
              </Select>
            </FormControl>

            <Box>
              <FieldLabel>Location</FieldLabel>
              <FormControl fullWidth>
                <Select displayEmpty value={exportLocation} onChange={(e) => setExportLocation(e.target.value)}>
                  <MenuItem value="">All Locations</MenuItem>
                  {locations.map((loc) => (
                    <MenuItem key={loc.id} value={loc.id}>
                      {loc.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                gap: 2,
              }}
            >
              <Box>
                <FieldLabel>From Date</FieldLabel>
                <TextField
                  fullWidth
                  type="date"
                  value={exportStartDate}
                  onChange={(e) => setExportStartDate(e.target.value)}
                />
              </Box>

              <Box>
                <FieldLabel>To Date</FieldLabel>
                <TextField
                  fullWidth
                  type="date"
                  value={exportEndDate}
                  onChange={(e) => setExportEndDate(e.target.value)}
                />
              </Box>
            </Box>

            <Divider />

            <Box>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={selectAllParameters}
                    onChange={(e) => setSelectAllParameters(e.target.checked)}
                  />
                }
                label="Export all parameters"
              />

              <FormControl fullWidth disabled={selectAllParameters} sx={{ mt: 1 }}>
                <InputLabel>Parameters</InputLabel>
                <Select
                  multiple
                  label="Parameters"
                  disabled={selectAllParameters}
                  value={selectedParameters}
                  onChange={(e) => setSelectedParameters(e.target.value)}
                >
                  {uniqueParameterNames.map((parameter) => (
                    <MenuItem key={parameter} value={parameter}>
                      {parameter}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5, pt: 1 }}>
          <Button onClick={() => setExportDialogOpen(false)} sx={{ color: "text.secondary" }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            disableElevation
            onClick={() => {
              downloadCSV();
              setExportDialogOpen(false);
            }}
            sx={{
              bgcolor: ACCENT,
              textTransform: "none",
              fontWeight: 600,
              px: 3,
              "&:hover": { bgcolor: "#101A30" },
            }}
          >
            Export
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}