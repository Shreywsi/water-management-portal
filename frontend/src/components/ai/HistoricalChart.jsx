import {
  Card,
  CardContent,
  Typography,
} from "@mui/material";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts";

export default function HistoricalChart({ prediction }) {
  const forecast = prediction?.predicted_groundwater_depth ?? 6.39;

  const data = [
    { month: "Jan", depth: 15.2 },
    { month: "Feb", depth: 15.0 },
    { month: "Mar", depth: 14.7 },
    { month: "Apr", depth: 14.3 },
    { month: "May", depth: 13.7 },
    { month: "Jun", depth: 12.4 },
    { month: "Jul", depth: 10.5 },
    { month: "Aug", depth: 8.8 },
    { month: "Sep", depth: 7.4 },
    { month: "Forecast", depth: forecast },
  ];

  return (
    <Card elevation={3} sx={{ borderRadius: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          📈 Historical Groundwater vs AI Forecast
        </Typography>

        <ResponsiveContainer width="100%" height={340}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="month" />

            <YAxis
              label={{
                value: "Depth (m)",
                angle: -90,
                position: "insideLeft",
              }}
            />

            <Tooltip />

            <Legend />

            <Line
              type="monotone"
              dataKey="depth"
              strokeWidth={3}
              dot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}