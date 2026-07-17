import {
  Grid,
  Card,
  CardContent,
  Typography,
} from "@mui/material";

export default function AIOverviewCards({ prediction }) {
  const cards = [
    {
      title: "Predicted Depth",
      value: `${prediction?.predicted_groundwater_depth ?? "--"} m`,
      color: "#1976d2",
    },
    {
      title: "Trend",
      value: "Stable",
      color: "#2e7d32",
    },
    {
      title: "Model",
      value: prediction?.model || "LSTM",
      color: "#7b1fa2",
    },
    {
      title: "Status",
      value: prediction?.status || "Ready",
      color: "#ef6c00",
    },
  ];

  return (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      {cards.map((card) => (
        <Grid item xs={12} sm={6} md={3} key={card.title}>
          <Card
            elevation={3}
            sx={{
              borderRadius: 3,
              borderLeft: `6px solid ${card.color}`,
              height: "100%",
            }}
          >
            <CardContent>
              <Typography
                variant="body2"
                color="text.secondary"
              >
                {card.title}
              </Typography>

              <Typography
                variant="h4"
                sx={{
                  mt: 1,
                  fontWeight: 700,
                }}
              >
                {card.value}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}