import { useState, useEffect } from "react";
import axios from "axios";

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

  const loadLocations = async () => {
    try {
      const res = await axios.get(
        "http://127.0.0.1:8000/api/location-list/"
      );

      setLocations(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadLocations();
  }, []);

  const addLocation = async () => {
    if (!name.trim()) return;

    try {
      const res = await axios.post(
        "http://127.0.0.1:8000/api/location/add/",
        {
          name: name.trim(),
        }
      );

      if (res.data.success) {
        setMessage("Location added successfully.");
        setMessageType("success");
        setName("");
        loadLocations();
      }
    } catch (err) {
      setMessage(
        err.response?.data?.message || "Unable to add location."
      );
      setMessageType("error");
    }
  };

  const deleteLocation = async (id) => {
    if (!window.confirm("Delete this location?")) return;

    try {
      await axios.delete(
        `http://127.0.0.1:8000/api/location/${id}/`
      );

      setMessage("Location deleted.");
      setMessageType("success");

      loadLocations();
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
        <Alert
          severity={messageType}
          sx={{ mb: 2 }}
        >
          {message}
        </Alert>
      )}

      <Stack
        direction="row"
        spacing={2}
        sx={{ mb: 3 }}
      >
        <TextField
          fullWidth
          label="Enter Location"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <Button
          variant="contained"
          onClick={addLocation}
        >
          Add
        </Button>
      </Stack>

      <List>
        {locations.map((location) => (
          <ListItem
            key={location.id}
            secondaryAction={
              <IconButton
                color="error"
                onClick={() =>
                  deleteLocation(location.id)
                }
              >
                <DeleteIcon />
              </IconButton>
            }
          >
            <ListItemText
              primary={location.name}
            />
          </ListItem>
        ))}
      </List>
    </Card>
  );
}