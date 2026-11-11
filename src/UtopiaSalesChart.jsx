import { useId, useState } from "react";
import { utopiaSalesSnapshots } from "./data";
import "./UtopiaSalesChart.css";

const formatSales = (value) => `NT$${value.toLocaleString("en-CA")}`;
const chartPoint = (snapshot, index) => ({
  x: 80 + index * 450 / Math.max(utopiaSalesSnapshots.length - 1, 1),
  y: 218 - snapshot.sales / 10000 * 184,
});

export default function UtopiaSalesChart() {
  const [selected, setSelected] = useState(utopiaSalesSnapshots.length - 1);
  const chartId = useId();
  const snapshot = utopiaSalesSnapshots[selected];
  const active = chartPoint(snapshot, selected);
  const points = utopiaSalesSnapshots.map((item, index) => chartPoint(item, index));

  return (
    <figure className="utopia-sales-chart" aria-labelledby={`${chartId}-title`}>
      <figcaption>
        <p className="utopia-sales-chart-eyebrow">Recorded 30-day sales snapshots</p>
        <h3 id={`${chartId}-title`}>Sales over time.</h3>
        <p>Verified checkpoints · November 2026 · NT$</p>
      </figcaption>

      <div className="utopia-sales-chart-summary" role="status" aria-live="polite" aria-atomic="true">
        <strong>{formatSales(snapshot.sales)}</strong>
        <span>{snapshot.orders} orders · 30 days ending {snapshot.date}</span>
      </div>

      <svg viewBox="0 0 600 250" role="img" aria-labelledby={`${chartId}-chart-title ${chartId}-chart-desc`}>
        <title id={`${chartId}-chart-title`}>Two recorded rolling 30-day sales totals</title>
        <desc id={`${chartId}-chart-desc`}>November 4, 2026: NT$8,590 across 9 orders. November 11, 2026: NT$9,560 across 12 orders. The vertical axis starts at zero. Each point is a separate rolling 30-day total, not daily or cumulative sales.</desc>
        {[0, 5000, 10000].map((value) => {
          const y = 218 - value / 10000 * 184;
          return (
            <g key={value}>
              <line x1="80" x2="550" y1={y} y2={y} className="utopia-sales-gridline" />
              <text x="65" y={y + 6} textAnchor="end">{value.toLocaleString("en-CA")}</text>
            </g>
          );
        })}
        <line x1="80" x2={active.x} y1={active.y} y2={active.y} className="utopia-sales-active-guide" />
        <polyline points={points.map(({ x, y }) => `${x},${y}`).join(" ")} className="utopia-sales-line" />
        {points.map((point, index) => (
          <g key={utopiaSalesSnapshots[index].date}>
            {index === selected && <circle cx={point.x} cy={point.y} r="15" className="utopia-sales-point-halo" />}
            <circle cx={point.x} cy={point.y} r={index === selected ? 7 : 5} className="utopia-sales-point" />
          </g>
        ))}
        <text x="80" y="246" textAnchor="middle">Nov 4</text>
        <text x="530" y="246" textAnchor="middle">Nov 11</text>
      </svg>

      <div className="utopia-sales-snapshot-controls" aria-label="Explore a sales snapshot">
        {utopiaSalesSnapshots.map((item, index) => (
          <button type="button" key={item.date} aria-pressed={index === selected} onMouseEnter={() => setSelected(index)} onFocus={() => setSelected(index)} onClick={() => setSelected(index)}>
            <span>{item.date}</span>
            <strong>{formatSales(item.sales)}</strong>
            <span>{item.orders} orders</span>
          </button>
        ))}
      </div>

      <p className="utopia-sales-chart-note">Each point is a separate rolling 30-day total, rather than daily or cumulative sales. Sources: November 4 project review (page 18); November 11 Orders and Sales & Traffic dashboards.</p>
    </figure>
  );
}
