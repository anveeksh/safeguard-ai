import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

import { api } from "../api/client.js";
import AnalyticsCards from "../components/AnalyticsCards.jsx";
import LoadingState from "../components/LoadingState.jsx";
import ScanHistoryTable from "../components/ScanHistoryTable.jsx";

export default function DashboardPage() {
  const [analytics, setAnalytics] = useState(null);
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getAnalytics(), api.getScans()])
      .then(([analyticsData, scanData]) => {
        setAnalytics(analyticsData);
        setScans(scanData);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <LoadingState label="Loading dashboard" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 rounded-lg bg-navy-950 p-6 text-white sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-200">Command center</p>
          <h1 className="mt-2 text-3xl font-bold tracking-normal">Dashboard</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
            Review scan volume, risky categories, and how messages attempt to influence user decisions.
          </p>
        </div>
        <Link
          to="/analyze"
          className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-500"
        >
          New analysis
        </Link>
      </div>

      <AnalyticsCards analytics={analytics} />
      <ScanHistoryTable scans={scans} compact />
    </div>
  );
}
