import { ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";

import RiskBadge from "./RiskBadge.jsx";

function formatDate(value) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export default function ScanHistoryTable({ scans = [], compact = false }) {
  const navigate = useNavigate();
  const rows = compact ? scans.slice(0, 5) : scans;

  return (
    <section className="overflow-hidden rounded-lg bg-white shadow-soft">
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
        <h2 className="text-base font-semibold text-slate-950">Scan history</h2>
        {compact && (
          <button
            type="button"
            onClick={() => navigate("/history")}
            className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50"
          >
            View all
            <ExternalLink size={15} aria-hidden="true" />
          </button>
        )}
      </div>

      {rows.length === 0 ? (
        <div className="px-5 py-8 text-sm text-slate-600">No scans yet.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-normal text-slate-500">
              <tr>
                <th className="px-5 py-3 font-semibold">Risk</th>
                <th className="px-5 py-3 font-semibold">Category</th>
                <th className="px-5 py-3 font-semibold">Content</th>
                <th className="px-5 py-3 font-semibold">Score</th>
                <th className="px-5 py-3 font-semibold">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((scan) => (
                <tr
                  key={scan.id}
                  className="cursor-pointer hover:bg-slate-50"
                  onClick={() => navigate(`/report/${scan.id}`)}
                >
                  <td className="whitespace-nowrap px-5 py-4">
                    <RiskBadge level={scan.risk_level} />
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 font-medium capitalize text-slate-800">
                    {scan.category}
                  </td>
                  <td className="max-w-xl px-5 py-4 text-slate-600">
                    <span className="line-clamp-2">{scan.input_content}</span>
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 font-semibold text-slate-950">{scan.risk_score}</td>
                  <td className="whitespace-nowrap px-5 py-4 text-slate-500">{formatDate(scan.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
