import { useEffect, useState } from "react";

import { api } from "../api/client.js";
import LoadingState from "../components/LoadingState.jsx";
import ResearchMetricsDashboard from "../components/ResearchMetricsDashboard.jsx";
import UserBehaviorInsights from "../components/UserBehaviorInsights.jsx";

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export default function ResearcherDashboardPage() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    api
      .getResearchMetrics()
      .then(setMetrics)
      .finally(() => setLoading(false));
  }, []);

  async function handleExport() {
    setExporting(true);
    try {
      const blob = await api.exportResearchCsv();
      downloadBlob(blob, "safeguard-ai-study-metrics.csv");
    } finally {
      setExporting(false);
    }
  }

  if (loading) {
    return <LoadingState label="Loading research metrics" />;
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg bg-navy-950 p-6 text-white shadow-soft">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-200">Research console</p>
        <h1 className="mt-2 text-3xl font-bold tracking-normal">Researcher Dashboard</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">
          Compare warning conditions, click-through behavior, trust, comprehension, and manipulation tactics for usable
          security study demonstrations.
        </p>
      </div>

      <UserBehaviorInsights summary={metrics?.behavior_summary} />
      <ResearchMetricsDashboard metrics={metrics} onExport={exporting ? undefined : handleExport} />
    </div>
  );
}
