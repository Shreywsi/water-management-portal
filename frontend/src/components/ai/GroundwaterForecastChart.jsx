import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";

import { Card, CardContent, Typography } from "@mui/material";

const historicalData = [
  { month: "Jan", depth: 15.2 },
  { month: "Feb", depth: 15.0 },
  { month: "Mar", depth: 14.6 },
  { month: "Apr", depth: 14.2 },
  { month: "May", depth: 13.5 },
  { month: "Jun", depth: 12.4 },
  { month: "Jul", depth: 10.6 },
  { month: "Aug", depth: 8.8 },
  { month: "Sep", depth: 7.4 },
];

export default function GroundwaterForecastChart({ prediction }) {
  const data = [
    ...historicalData,
    {
      month: "Forecast",
      depth: prediction?.predicted_groundwater_depth,
    },
  ];

  return (
    <Card elevation={3} sx={{ mt: 4, borderRadius: 3 }}>
      <CardContent>

        <Typography variant="h6" gutterBottom>
          📈 Historical Groundwater vs AI Forecast
        </Typography>

        <ResponsiveContainer width="100%" height={400}>
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
              stroke="#1976d2"
              strokeWidth={3}
              dot={{ r: 4 }}
            />

          </LineChart>
        </ResponsiveContainer>

      </CardContent>
    </Card>
  );
}