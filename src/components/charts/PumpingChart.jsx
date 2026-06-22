import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
  LabelList,
} from "recharts";

const COLORS = [
  "#1976d2",
  "#2196f3",
  "#42a5f5",
  "#64b5f6",
  "#90caf9",
];

function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div
        className="bg-white shadow-lg rounded-xl border p-3"
        style={{
          borderColor: "#e5e7eb",
        }}
      >
        <p className="font-semibold text-gray-800">
          {label}
        </p>
        <p className="text-blue-600">
          Pumping Hours:{" "}
          <strong>{payload[0].value}</strong>
        </p>
      </div>
    );
  }

  return null;
}

function PumpingChart({ data }) {
  return (
    <div className="bg-white rounded-2xl shadow-md p-5">
      

      <ResponsiveContainer width="100%" height={350}>
        <BarChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 10,
            bottom: 20,
          }}
        >
          <defs>
            <linearGradient
              id="barGradient"
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop
                offset="0%"
                stopColor="#1976d2"
              />
              <stop
                offset="100%"
                stopColor="#64b5f6"
              />
            </linearGradient>
          </defs>

          <CartesianGrid
            strokeDasharray="4 4"
            stroke="#e5e7eb"
            vertical={false}
          />

          <XAxis
            dataKey="crop"
            tick={{
              fill: "#6b7280",
              fontSize: 12,
            }}
            axisLine={false}
            tickLine={false}
          />

          <YAxis
            tick={{
              fill: "#6b7280",
              fontSize: 12,
            }}
            axisLine={false}
            tickLine={false}
          />

          <Tooltip content={<CustomTooltip />} />

          <Bar
            dataKey="hours"
            fill="url(#barGradient)"
            radius={[10, 10, 0, 0]}
            animationDuration={1200}
          >
            <LabelList
              dataKey="hours"
              position="top"
              style={{
                fill: "#374151",
                fontSize: 12,
                fontWeight: 600,
              }}
            />

            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={
                  COLORS[index % COLORS.length]
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default PumpingChart;