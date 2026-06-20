import FarmerLayout from "../../layouts/FarmerLayout";
import {
  Typography,
  TextField,
  Button,
  Card,
  CardContent
} from "@mui/material";

function WaterLevelEntry() {
  return (
    <FarmerLayout>

      <Card>
        <CardContent>

          <Typography variant="h4" gutterBottom>
            🌊 Water Level Entry
          </Typography>

          <TextField
            fullWidth
            label="My Well"
            value="W001"
            margin="normal"
          />

          <TextField
            fullWidth
            label="Water Level (m)"
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

export default WaterLevelEntry;