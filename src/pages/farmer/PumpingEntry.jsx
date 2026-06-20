import FarmerLayout from "../../layouts/FarmerLayout";
import {
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  MenuItem
} from "@mui/material";

function PumpingEntry() {
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
          />

          <TextField
            select
            fullWidth
            label="Crop"
            margin="normal"
          >
            <MenuItem>🌾 Wheat</MenuItem>
            <MenuItem>🌽 Maize</MenuItem>
            <MenuItem>🧅 Onion</MenuItem>
          </TextField>

          <TextField
            fullWidth
            label="Pumping Hours"
            margin="normal"
          />

          <Button
            variant="contained"
            size="large"
            sx={{ mt: 3 }}
          >
            Submit
          </Button>

        </CardContent>
      </Card>

    </FarmerLayout>
  );
}

export default PumpingEntry;