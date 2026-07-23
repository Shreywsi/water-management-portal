import { useState, useEffect, useRef } from "react";
import axios from "axios";
import API_BASE from "../../config/api";
import {
  Card,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  Stack,
  IconButton,
  Alert,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

export default function Locations() {
  const [name, setName] = useState("");
  const [locations, setLocations] = useState([]);
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

  useEffect(() => {
    loadLocations();
  }, []);

  const addLocation = async () => {
    if (!name.trim() || submitting) return;
    setSubmitting(true);

    try {
      const res = await axios.post(`${API_BASE}/location/add/`, {
        name: name.trim(),
      });

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
    await axios.delete(`${API_BASE}/location/${id}/`);
    setMessage("Location deleted.");
    setMessageType("success");
    await loadLocations();
  } catch (err) {
    setMessage("Unable to delete location.");
    setMessageType("error");
  }
};

  return (
    <Card sx={{ p: 4 }}>
      <Typography variant="h5" gutterBottom>
        Manage Locations
      </Typography>

      {message && (
        <Alert severity={messageType} sx={{ mb: 2 }}>
          {message}
        </Alert>
      )}

      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
        <TextField
          fullWidth
          label="Enter Location"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <Button variant="contained" onClick={addLocation} disabled={submitting}>
          {submitting ? "Adding..." : "Add"}
        </Button>
      </Stack>

      <List>
        {locations.map((location) => (
          <ListItem
            key={location.id}
            secondaryAction={
              <IconButton color="error" onClick={() => deleteLocation(location.id)}>
                <DeleteIcon />
              </IconButton>
            }
          >
            <ListItemText primary={location.name} />
          </ListItem>
        ))}
      </List>
    </Card>
  );
}