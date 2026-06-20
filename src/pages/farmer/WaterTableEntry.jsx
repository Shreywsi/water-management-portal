import FarmerLayout from "../../layouts/FarmerLayout";
import {
  Typography,
  TextField,
  Button,
  Card,
  CardContent
} from "@mui/material";

function WaterTableEntry() {
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

export default WaterTableEntry;