import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  Typography,
} from "@mui/material";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

import API_BASE from "../../config/api";

export default function WellWaterLevelChart() {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch(`${API_BASE}/waterlevel/`)
      .then((res) => res.json())
      .then((result) => {
        setData(result);
      })
      .catch(console.error);
  }, []);

  return (
    <Card
      elevation={3}
      sx={{
        mt: 4,
        borderRadius: 3,
      }}
    >
      <CardContent>

        <Typography variant="h6" gutterBottom>
          🌊 Current Groundwater Levels (Live Database)
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mb: 3 }}
        >
          Live groundwater measurements retrieved from PostgreSQL.
        </Typography>

        <ResponsiveContainer width="100%" height={380}>

          <BarChart data={data}>

            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="well_name" />

            <YAxis
              label={{
                value: "Water Level (m)",
                angle: -90,
                position: "insideLeft",
              }}
            />

            <Tooltip />

            <Bar
              dataKey="water_level_m"
              radius={[6,6,0,0]}
            />

          </BarChart>

        </ResponsiveContainer>

      </CardContent>
    </Card>
  );
}