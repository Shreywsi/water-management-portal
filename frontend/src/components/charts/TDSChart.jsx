import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from "recharts";

function TDSChart({ data }) {

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3"/>

        <XAxis dataKey="date"/>

        <YAxis/>

        <Tooltip/>

        <Line
          type="monotone"
          dataKey="value"
          stroke="#ff9800"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export default TDSChart;