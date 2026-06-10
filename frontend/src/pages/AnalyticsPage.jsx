import { useEffect, useState } from "react";

import { api } from "../api/client.js";
import AnalyticsCards from "../components/AnalyticsCards.jsx";
import LoadingState from "../components/LoadingState.jsx";

function BarList({ title, items }) {
  const max = Math.max(1, ...items.map((item) => item.count));

  return (
    <section className="rounded-lg bg-white p-5 shadow-soft">
      <h2 className="text-base font-semibold text-slate-950">{title}</h2>
      <div className="mt-5 space-y-4">
        {items.length === 0 ? (
          <p className="text-sm text-slate-600">No data yet.</p>
        ) : (
          items.map((item) => (
            <div key={item.name}>
              <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                <span className="font-semibold capitalize text-slate-700">{item.name}</span>
                <span className="text-slate-500">{item.count}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-blue-600" style={{ width: `${(item.count / max) * 100}%` }} />
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getAnalytics()
      .then(setAnalytics)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <LoadingState label="Loading analytics" />;
  }

  const riskItems = Object.entries(analytics.risk_distribution).map(([name, count]) => ({ name, count }));

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-200">Patterns</p>
        <h1 className="mt-2 text-3xl font-bold tracking-normal text-white">Analytics</h1>
      </div>

      <AnalyticsCards analytics={analytics} />

      <div className="grid gap-6 xl:grid-cols-3">
        <BarList title="Risk distribution" items={riskItems} />
        <BarList title="Most common scam types" items={analytics.common_categories} />
        <BarList title="Manipulation patterns" items={analytics.common_tactics} />
      </div>
    </div>
  );
}
