// Pure SVG charts — no client JS needed.

export function Sparkline({
  data,
  color,
  width = 70,
  height = 26,
}: {
  data: number[];
  color: string;
  width?: number;
  height?: number;
}) {
  if (data.length < 2) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const pts = data
    .map(
      (v, i) =>
        `${(i / (data.length - 1)) * width},${
          height - ((v - min) / range) * (height - 4) - 2
        }`,
    )
    .join(" ");
  return (
    <svg width={width} height={height}>
      <polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.85}
      />
    </svg>
  );
}

export function AreaChart({
  sales,
  orders,
  labels,
}: {
  sales: number[];
  orders: number[];
  labels: string[];
}) {
  const W = 640;
  const H = 230;
  const pad = 30;
  const maxVal = Math.max(10, ...sales, ...orders) * 1.15;
  const x = (i: number) => pad + i * ((W - pad * 2) / (sales.length - 1 || 1));
  const y = (v: number) => H - pad - (v / maxVal) * (H - pad * 2);
  const line = (d: number[]) => d.map((v, i) => `${x(i)},${y(v)}`).join(" ");
  const area =
    `M${x(0)},${y(sales[0])} ` +
    sales.map((v, i) => `L${x(i)},${y(v)}`).join(" ") +
    ` L${x(sales.length - 1)},${H - pad} L${x(0)},${H - pad} Z`;

  return (
    <svg
      width="100%"
      height={H}
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      style={{ overflow: "visible" }}
    >
      <defs>
        <linearGradient id="afArea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2dd4bf" stopOpacity="0.28" />
          <stop offset="1" stopColor="#2dd4bf" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0, 1, 2, 3].map((i) => {
        const gy = pad + i * ((H - pad * 2) / 3);
        return (
          <line
            key={i}
            x1={pad}
            y1={gy}
            x2={W - pad}
            y2={gy}
            stroke="#243149"
            strokeWidth={1}
            strokeDasharray="4 5"
          />
        );
      })}
      <path d={area} fill="url(#afArea)" />
      <polyline
        points={line(sales)}
        fill="none"
        stroke="#2dd4bf"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <polyline
        points={line(orders)}
        fill="none"
        stroke="#3b82f6"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {sales.map((v, i) => (
        <circle
          key={i}
          cx={x(i)}
          cy={y(v)}
          r={3.5}
          fill="#0a0f1c"
          stroke="#2dd4bf"
          strokeWidth={2}
        />
      ))}
      {labels.map((l, i) => (
        <text
          key={i}
          x={x(i)}
          y={H - 8}
          fill="#5f7091"
          fontSize={11}
          textAnchor="middle"
        >
          {l}
        </text>
      ))}
    </svg>
  );
}
