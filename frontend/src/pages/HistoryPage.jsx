import { useEffect, useState } from "react";

import { api } from "../api/client.js";
import LoadingState from "../components/LoadingState.jsx";
import ScanHistoryTable from "../components/ScanHistoryTable.jsx";

export default function HistoryPage() {
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getScans()
      .then(setScans)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <LoadingState label="Loading history" />;
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-200">Evidence trail</p>
        <h1 className="mt-2 text-3xl font-bold tracking-normal text-white">History</h1>
      </div>
      <ScanHistoryTable scans={scans} />
    </div>
  );
}
