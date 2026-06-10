import { Download, LineChart, ShieldAlert, Target } from "lucide-react";

function maxValue(items, key = "count") {
  return Math.max(1, ...items.map((item) => Number(item[key] || 0)));
}

function BarChart({ title, items, valueKey = "count", color = "bg-blue-600" }) {
  const max = maxValue(items, valueKey);
  return (
    <section className="rounded-lg bg-white p-5 shadow-soft">
      <h2 className="text-base font-semibold text-slate-950">{title}</h2>
      <div className="mt-5 space-y-4">
        {items.length === 0 ? (
          <p className="text-sm text-slate-600">No data yet.</p>
        ) : (
          items.map((item) => {
            const value = Number(item[valueKey] || 0);
            return (
              <div key={item.name || item.label || item.warning_mode_used}>
                <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                  <span className="font-semibold text-slate-700">{item.name || item.label}</span>
                  <span className="text-slate-500">{value}</span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                  <div className={`h-full rounded-full ${color} transition-all duration-700`} style={{ width: `${(value / max) * 100}%` }} />
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}

function TrendChart({ points = [] }) {
  const chartWidth = 520;
  const chartHeight = 180;
  const max = Math.max(1, ...points.map((point) => point.risky_clicks + point.ignored_warnings));
  const coords = points.map((point, index) => {
    const x = points.length <= 1 ? 0 : (index / (points.length - 1)) * chartWidth;
    const y = chartHeight - ((point.risky_clicks + point.ignored_warnings) / max) * chartHeight;
    return `${x},${y}`;
  });

  return (
    <section className="rounded-lg bg-white p-5 shadow-soft">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-cyan-50 p-2 text-cyan-700">
          <LineChart size={20} aria-hidden="true" />
        </div>
        <h2 className="text-base font-semibold text-slate-950">User behavior trends</h2>
      </div>
      <div className="mt-5 overflow-hidden rounded-lg border border-slate-200 bg-slate-50 p-4">
        {points.length === 0 ? (
          <p className="text-sm text-slate-600">No trend data yet.</p>
        ) : (
          <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="h-48 w-full" role="img" aria-label="User behavior trend line">
            <polyline points={coords.join(" ")} fill="none" stroke="#2563eb" strokeWidth="4" strokeLinecap="round" />
            {points.map((point, index) => {
              const [x, y] = coords[index].split(",");
              return <circle key={`${point.label}-${index}`} cx={x} cy={y} r="5" fill="#0f172a" />;
            })}
          </svg>
        )}
      </div>
      <p className="mt-3 text-sm text-slate-500">Line height combines ignored warnings and risky clicks per study event.</p>
    </section>
  );
}

function ConditionTable({ rows = [] }) {
  return (
    <section className="overflow-hidden rounded-lg bg-white shadow-soft">
      <div className="border-b border-slate-200 px-5 py-4">
        <h2 className="text-base font-semibold text-slate-950">Warning condition comparison</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-normal text-slate-500">
            <tr>
              <th className="px-5 py-3 font-semibold">Condition</th>
              <th className="px-5 py-3 font-semibold">Sessions</th>
              <th className="px-5 py-3 font-semibold">Click-through</th>
              <th className="px-5 py-3 font-semibold">Trust</th>
              <th className="px-5 py-3 font-semibold">Comprehension</th>
              <th className="px-5 py-3 font-semibold">Effectiveness</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row) => (
              <tr key={row.warning_mode_used} className="hover:bg-slate-50">
                <td className="px-5 py-4 font-semibold text-slate-950">{row.label}</td>
                <td className="px-5 py-4 text-slate-600">{row.total_sessions}</td>
                <td className="px-5 py-4 text-slate-600">{row.click_through_rate}%</td>
                <td className="px-5 py-4 text-slate-600">{row.average_trust_score}%</td>
                <td className="px-5 py-4 text-slate-600">{row.average_comprehension_score}%</td>
                <td className="px-5 py-4 font-semibold text-emerald-700">{row.warning_effectiveness}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default function ResearchMetricsDashboard({ metrics, onExport }) {
  const comparisonBars = metrics?.condition_comparison || [];
  const effectiveness = comparisonBars.map((item) => ({ name: item.label, count: item.warning_effectiveness }));
  const susceptibility = comparisonBars.map((item) => ({ name: item.label, count: item.phishing_susceptibility }));

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-3">
        <section className="rounded-lg bg-navy-950 p-5 text-white shadow-soft">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-blue-200">Warning effectiveness</p>
              <p className="mt-2 text-3xl font-bold">{Math.round(effectiveness[2]?.count || effectiveness[1]?.count || 0)}%</p>
            </div>
            <Target className="text-blue-200" size={30} aria-hidden="true" />
          </div>
        </section>
        <section className="rounded-lg bg-white p-5 shadow-soft">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-slate-500">Risky clicks</p>
              <p className="mt-2 text-3xl font-bold text-slate-950">{metrics?.behavior_summary?.risky_clicks || 0}</p>
            </div>
            <ShieldAlert className="text-red-600" size={30} aria-hidden="true" />
          </div>
        </section>
        <section className="rounded-lg bg-white p-5 shadow-soft">
          <p className="text-sm font-semibold text-slate-500">CSV export</p>
          <button
            type="button"
            onClick={onExport}
            disabled={!onExport}
            className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Download size={16} aria-hidden="true" />
            Export study CSV
          </button>
        </section>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <BarChart title="Warning effectiveness" items={effectiveness} color="bg-emerald-600" />
        <BarChart title="Phishing susceptibility" items={susceptibility} color="bg-red-600" />
        <TrendChart points={metrics?.user_behavior_trends || []} />
        <BarChart title="Most common manipulation tactics" items={metrics?.common_tactics || []} color="bg-blue-600" />
      </div>

      <ConditionTable rows={metrics?.condition_comparison || []} />
    </div>
  );
}
