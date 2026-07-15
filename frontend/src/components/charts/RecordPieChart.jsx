import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

const COLORS = [
  "#1976d2",
  "#4caf50",
  "#ff9800",
  "#e91e63",
  "#9c27b0"
];

function RecordPieChart({ data }) {
  return (
    /*
     * Key fixes:
     * 1. height="100%" lets the parent <Box> in AdminDashboard control the size
     *    instead of the chart forcing its own fixed height.
     * 2. outerRadius reduced + cx/cy centered so the pie never touches the edges.
     * 3. Labels replaced with a Legend below — labels outside the pie were
     *    the main cause of clipping because Recharts doesn't account for them
     *    when calculating overflow.
     */
    <ResponsiveContainer width="100%" height="100%">
      <PieChart margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="42%"
          outerRadius="80%"
          labelLine={false}
          label={({ cx, cy, midAngle, innerRadius, outerRadius, value }) => {
            const RADIAN = Math.PI / 180;
            const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
            const x = cx + radius * Math.cos(-midAngle * RADIAN);
            const y = cy + radius * Math.sin(-midAngle * RADIAN);
            return (
              <text
                x={x}
                y={y}
                fill="#fff"
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={13}
                fontWeight={600}
              >
                {value}
              </text>
            );
          }}
        >
          {data.map((entry, index) => (
            <Cell
              key={index}
              fill={COLORS[index % COLORS.length]}
            />
          ))}
        </Pie>

        <Tooltip formatter={(value, name) => [value, name]} />

        <Legend
          layout="horizontal"
          verticalAlign="bottom"
          align="center"
          iconType="circle"
          iconSize={10}
          wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

export default RecordPieChart;