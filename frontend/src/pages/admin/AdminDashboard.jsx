import { Container, Box, Typography, Stack } from "@mui/material";
//import QuickStats from "../../components/admin/dashboard/QuickStats";
import ToolsInfoSection from "../../components/admin/dashboard/ToolsInfoSection";
import ResourceFoldersSection from "../../components/resources/ResourceFoldersSection";

export default function AdminDashboard() {
  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2, sm: 3, md: 4 } }}>
      <Stack spacing={{ xs: 3, md: 4 }}>
        

        

        <ToolsInfoSection />

        <ResourceFoldersSection />
      </Stack>
    </Container>
  );
}