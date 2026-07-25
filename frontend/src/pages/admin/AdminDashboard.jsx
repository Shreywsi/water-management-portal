import {
  Container,
  Box,
  Typography,
  Stack,
} from "@mui/material";

import WaterBalanceCard from "../../components/WaterBalanceCard.jsx";
import AIPrediction from "./AIPrediction";

export default function AdminDashboard() {
  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2, sm: 3, md: 4 } }}>
      <Stack spacing={{ xs: 3, md: 5 }}>
        {/* Header */}
        <Box>
          <Typography variant="h4" fontWeight="bold">
            Dashboard Overview
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 1 }}>
            Water balance prediction and GIS integration.
          </Typography>
        </Box>

        {/* Water Balance */}
        <WaterBalanceCard
          initialValues={{
            Rr: 120,
            Re: 30,
            Ri: 15,
            I: 5,
            Si: 8,
            Se: 10,
            O: 12,
            Et: 60,
            Dp: 55,
          }}
          unit="MCM"
          onChange={() => {
            // e.g. save to backend
            // saveWaterBalance(values, deltaS);
          }}
        />

        {/* AI Prediction */}
        <AIPrediction />
      </Stack>
    </Container>
  );
}