import Grid from "@mui/material/Grid";
import {
  Card,
  CardContent,
  Box,
  Typography
} from "@mui/material";

import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import AgricultureOutlinedIcon from "@mui/icons-material/AgricultureOutlined";
import EngineeringOutlinedIcon from "@mui/icons-material/EngineeringOutlined";
import ScienceOutlinedIcon from "@mui/icons-material/ScienceOutlined";
import HolidayVillageOutlinedIcon from "@mui/icons-material/HolidayVillageOutlined";
import WaterDropOutlinedIcon from "@mui/icons-material/WaterDropOutlined";
import StorageOutlinedIcon from "@mui/icons-material/StorageOutlined";
import BoltOutlinedIcon from "@mui/icons-material/BoltOutlined";

const cardDefs = [
  {
    key: "totalUsers",
    label: "Total Users",
    sub: "All registered accounts",
    icon: GroupOutlinedIcon,
    color: "#0B4F6C"
  },
  {
    key: "totalFarmers",
    label: "Total Farmers",
    sub: "Active field contributors",
    icon: AgricultureOutlinedIcon,
    color: "#1E8A7A"
  },
  {
    key: "totalCRPs",
    label: "Total CRPs",
    sub: "Community resource persons",
    icon: EngineeringOutlinedIcon,
    color: "#C76B3B"
  },
  {
    key: "totalResearchers",
    label: "Total Researchers",
    sub: "Data & analysis access",
    icon: ScienceOutlinedIcon,
    color: "#6A4C93"
  },
  {
    key: "totalVillages",
    label: "Total Villages",
    sub: "Onboarded communities",
    icon: HolidayVillageOutlinedIcon,
    color: "#9A6B3F"
  },
  {
    key: "totalWells",
    label: "Total Wells",
    sub: "Monitored across villages",
    icon: WaterDropOutlinedIcon,
    color: "#1976D2"
  },
  {
    key: "totalRecords",
    label: "Records Collected",
    sub: "Rainfall, pumping & levels",
    icon: StorageOutlinedIcon,
    color: "#388E3C"
  },
  {
    key: "activeUsers",
    label: "Active Users",
    sub: "Currently enabled accounts",
    icon: BoltOutlinedIcon,
    color: "#D32F2F"
  }
];

export default function DashboardCards({
  summary = {},
  loading
}) {
  return (
    <Grid container spacing={3}>
      {cardDefs.map(
        ({
          key,
          label,
          sub,
          icon: Icon,
          color
        }) => (
          <Grid
            key={key}
            size={{
              xs: 12,
              sm: 6,
              md: 3
            }}
          >
            <Card
              sx={{
                height: "100%",
                borderRadius: 3,
                transition: "0.3s",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: 6
                }
              }}
            >
              <CardContent>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="flex-start"
                >
                  <Box>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      fontWeight={600}
                    >
                      {label}
                    </Typography>

                    <Typography
                      variant="h4"
                      fontWeight="bold"
                      sx={{ mt: 1 }}
                    >
                      {loading
                        ? "..."
                        : summary[key] ?? 0}
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      width: 50,
                      height: 50,
                      borderRadius: "14px",
                      backgroundColor: `${color}20`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}
                  >
                    <Icon
                      sx={{
                        color: color,
                        fontSize: 28
                      }}
                    />
                  </Box>
                </Box>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 2 }}
                >
                  {sub}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        )
      )}
    </Grid>
  );
}