import { useState } from "react";
import FarmerLayout from "../../layouts/FarmerLayout";
import {
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  MenuItem,
} from "@mui/material";
import API_BASE from "../../config/api";

function PumpingEntry() {
  const [crop, setCrop] = useState("");
  const [hours, setHours] = useState("");

  const handleSubmit = async () => {
    try {
      const response = await fetch(
        `${API_BASE}/pumping/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            crop: crop,
            hours: parseFloat(hours),
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to save data");
      }

      const data = await response.json();

      console.log("Saved successfully:", data);

      alert("Pumping data saved successfully!");

      // Clear form after successful submission
      setCrop("");
      setHours("");
    } catch (error) {
      console.error(error);
      alert("Error saving data");
    }
  };

  return (
    <FarmerLayout>
      <Card>
        <CardContent>
          <Typography variant="h4" gutterBottom>
            🚜 Pumping Entry
          </Typography>

          <TextField
            fullWidth
            label="My Well"
            value="W001"
            margin="normal"
            disabled
          />

          <TextField
            select
            fullWidth
            label="Crop"
            margin="normal"
            value={crop}
            onChange={(e) => setCrop(e.target.value)}
          >
            <MenuItem value="Wheat">🌾 Wheat</MenuItem>
            <MenuItem value="Maize">🌽 Maize</MenuItem>
            <MenuItem value="Onion">🧅 Onion</MenuItem>
          </TextField>

          <TextField
            fullWidth
            label="Pumping Hours"
            type="number"
            margin="normal"
            value={hours}
            onChange={(e) => setHours(e.target.value)}
          />

          <Button
            variant="contained"
            size="large"
            sx={{ mt: 3 }}
            onClick={handleSubmit}
          >
            Submit
          </Button>
        </CardContent>
      </Card>
    </FarmerLayout>
  );
}

export default PumpingEntry;