import { useState } from "react";
import FarmerLayout from "../../layouts/FarmerLayout";
import {
  Typography,
  TextField,
  Button,
  Card,
  CardContent
} from "@mui/material";
import API_BASE from "../../config/api";

function WaterLevelEntry() {
  const [level, setLevel] = useState("");

  const handleSubmit = async () => {
    try {
      const response = await fetch(
        `${API_BASE}/waterlevel/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            level: parseFloat(level),
          }),
        }
      );

      if (response.ok) {
        alert("Water level data saved successfully!");
        setLevel("");
      } else {
        alert("Error saving data");
      }
    } catch (error) {
      console.error(error);
      alert("Failed to connect to backend");
    }
  };

  return (
    <FarmerLayout>
      <Card>
        <CardContent>

          <Typography variant="h4" gutterBottom>
            🌊 Water Level Entry
          </Typography>

          <TextField
            fullWidth
            label="Water Level (m)"
            margin="normal"
            value={level}
            onChange={(e) => setLevel(e.target.value)}
          />

          <Button
            variant="contained"
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

export default WaterLevelEntry;