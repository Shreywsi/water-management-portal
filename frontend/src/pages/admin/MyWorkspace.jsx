import { Box, Typography } from "@mui/material";

export default function MyWorkspace() {
  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" mb={2}>
        My Workspace
      </Typography>

      <Typography color="text.secondary">
        Your saved GIS projects and uploaded datasets will appear here.
      </Typography>
    </Box>
  );
}