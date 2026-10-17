import { useState } from "react";
// Add a metric or period here without changing the table rendering.
export const metrics = [
  {
    name: "Revenue",
    values: [148, 94, 61, 32],
    format: (n: number) => `$${n.toLocaleString()}`,
  },
  {
    name: "Tokens burned",
    values: [24, 38, 16, 9],
    format: (n: number) => `${n.toLocaleString()}M`,
  },
  {
    name: "Token cost",
    values: [7, 12, 5, 3],
    format: (n: number) => `$${n.toLocaleString()}`,
  },
];
export const periods = [
  { name: "Day", factor: 1 },
  { name: "Week", factor: 6 },
  { name: "Month", factor: 24 },
  { name: "All time", factor: 127 },
];
const factories = [
  "Moonshot stationery",
  "The midnight crew",
  "Tiny useful things",
  "Your little factory",
];
export default function Leaderboard() {
  const [metricIndex, setMetric] = useState(0);
  const [periodIndex, setPeriod] = useState(2);
  const metric = metrics[metricIndex];
  const rows = factories
    .map((name, index) => ({
      name,
      value: metric.values[index] * periods[periodIndex].factor,
    }))
    .sort((a, b) => b.value - a.value);
  return (
    <>
      <p className="eyebrow">LITTLE FACTORIES. BIG ENERGY.</p>
      <h2>The factory league</h2>
      <p>
        Three ways to tell the story. All figures below are synthetic demo data.
      </p>
      <div className="tabs" role="group" aria-label="Leaderboard metric">
        {metrics.map((m, i) => (
          <button
            key={m.name}
            aria-pressed={metricIndex === i}
            className={metricIndex === i ? "active" : ""}
            onClick={() => setMetric(i)}
          >
            {m.name}
          </button>
        ))}
      </div>
      <label className="period">
        Time window
        <select
          value={periodIndex}
          onChange={(e) => setPeriod(Number(e.target.value))}
        >
          {periods.map((p, i) => (
            <option key={p.name} value={i}>
              {p.name}
            </option>
          ))}
        </select>
      </label>
      <div className="rank-list">
        {rows.map((r, i) => (
          <div className="rank" key={r.name}>
            <b>{String(i + 1).padStart(2, "0")}</b>
            <span>
              {r.name}
              <small>SYNTHETIC FACTORY</small>
            </span>
            <strong>{metric.format(r.value)}</strong>
          </div>
        ))}
      </div>
      <aside className="note">
        Tokens and token cost measure activity, not product quality or profit.
        Real rankings will require verified sources and your sharing choice.
      </aside>
    </>
  );
}
