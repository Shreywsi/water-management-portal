import FarmerLayout from "../../layouts/FarmerLayout";
import {
  Typography,
  TextField,
  Button,
  Card,
  CardContent
} from "@mui/material";

function SalinityEntry() {
  return (
    <FarmerLayout>

      <Card>
        <CardContent>

          <Typography variant="h4" gutterBottom>
            🧂 Salinity Entry
          </Typography>

          <TextField
            fullWidth
            label="My Well"
            value="W001"
            margin="normal"
          />

          <TextField
            fullWidth
            label="Salinity"
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

export default SalinityEntry;