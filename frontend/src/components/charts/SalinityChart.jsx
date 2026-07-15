import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from "recharts";

function SalinityChart({ data }) {

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
          stroke="#e91e63"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export default SalinityChart;