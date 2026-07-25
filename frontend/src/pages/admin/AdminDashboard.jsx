import {
  Container,
  Box,
  Typography,
  Stack,
} from "@mui/material";



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

        {/* AI Prediction */}
        
      </Stack>
    </Container>
  );
}