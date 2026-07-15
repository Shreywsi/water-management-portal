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

function TDSEntry() {
  const [value, setValue] = useState("");

  const handleSubmit = async () => {
    try {
      const response = await fetch(
        `${API_BASE}/tds/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            value: parseFloat(value),
          }),
        }
      );

      if (response.ok) {
        alert("TDS data saved successfully!");
        setValue("");
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
            🧪 TDS Entry
          </Typography>

          <TextField
            fullWidth
            label="TDS Value"
            margin="normal"
            value={value}
            onChange={(e) => setValue(e.target.value)}
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

export default TDSEntry;