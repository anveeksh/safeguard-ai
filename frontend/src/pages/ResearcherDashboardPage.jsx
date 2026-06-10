import { RefreshCw, RotateCcw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

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
  const [refreshing, setRefreshing] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState("");

  const loadMetrics = useCallback(async ({ showLoader = false } = {}) => {
    setError("");
    if (showLoader) setLoading(true);
    else setRefreshing(true);
    try {
      setMetrics(await api.getResearchMetrics());
    } catch (err) {
      setError(err.message);
    } finally {
      if (showLoader) setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadMetrics({ showLoader: true });
    const refreshOnFocus = () => loadMetrics();
    const interval = window.setInterval(() => loadMetrics(), 15000);
    window.addEventListener("focus", refreshOnFocus);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener("focus", refreshOnFocus);
    };
  }, [loadMetrics]);

  async function handleExport() {
    setExporting(true);
    setError("");
    try {
      const blob = await api.exportResearchCsv();
      downloadBlob(blob, "safeguard-ai-study-metrics.csv");
    } catch (err) {
      setError(err.message);
    } finally {
      setExporting(false);
    }
  }

  async function handleResetDemoData() {
    setResetting(true);
    setError("");
    try {
      setMetrics(await api.resetResearchDemoData());
    } catch (err) {
      setError(err.message);
    } finally {
      setResetting(false);
    }
  }

  if (loading) {
    return <LoadingState label="Loading research metrics" />;
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg bg-navy-950 p-6 text-white shadow-soft">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-200">Research console</p>
            <h1 className="mt-2 text-3xl font-bold tracking-normal">Researcher Dashboard</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">
              Compare warning conditions, click-through behavior, trust, comprehension, and manipulation tactics for usable
              security study demonstrations.
            </p>
            <p className="mt-4 inline-flex rounded-lg border border-blue-300/20 bg-blue-500/10 px-3 py-2 text-xs font-semibold text-blue-100">
              Metrics shown are based on demo-study events unless real study mode is enabled.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => loadMetrics()}
              disabled={refreshing || resetting}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/20 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw size={16} aria-hidden="true" className={refreshing ? "animate-spin" : ""} />
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>
            <button
              type="button"
              onClick={handleResetDemoData}
              disabled={resetting || refreshing}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-3 text-sm font-semibold text-navy-950 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RotateCcw size={16} aria-hidden="true" />
              {resetting ? "Resetting..." : "Reset demo data"}
            </button>
          </div>
        </div>
      </div>

      {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      <UserBehaviorInsights summary={metrics?.behavior_summary} />
      <ResearchMetricsDashboard metrics={metrics} onExport={exporting ? undefined : handleExport} />
    </div>
  );
}
