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

function WaterTableEntry() {
  const [depth, setDepth] = useState("");

  const handleSubmit = async () => {
    try {
      const response = await fetch(
        `${API_BASE}/watertable/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            depth: parseFloat(depth),
          }),
        }
      );

      if (response.ok) {
        alert("Water table data saved successfully!");
        setDepth("");
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
            💧 Water Table Entry
          </Typography>

          <TextField
            fullWidth
            label="My Well"
            value="W001"
            margin="normal"
          />

          <TextField
            fullWidth
            label="Water Table (m)"
            margin="normal"
            value={depth}
            onChange={(e) => setDepth(e.target.value)}
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

export default WaterTableEntry;