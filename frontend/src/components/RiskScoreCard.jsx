import { AlertTriangle, CheckCircle2, ShieldAlert, ShieldCheck } from "lucide-react";

import RiskBadge from "./RiskBadge.jsx";

const iconMap = {
  Low: CheckCircle2,
  Medium: ShieldCheck,
  High: AlertTriangle,
  Critical: ShieldAlert,
};

const barMap = {
  Low: "bg-emerald-500",
  Medium: "bg-yellow-500",
  High: "bg-orange-500",
  Critical: "bg-red-600",
};

function humanize(value) {
  return String(value || "").replaceAll("_", " ");
}

export default function RiskScoreCard({ report }) {
  const Icon = iconMap[report?.risk_level] || ShieldCheck;
  const score = report?.risk_score ?? 0;

  return (
    <section className="rounded-lg bg-white p-5 shadow-soft">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">Risk score</p>
          <div className="mt-2 flex items-end gap-3">
            <span className="text-5xl font-bold tracking-normal text-slate-950">{score}</span>
            <span className="pb-2 text-sm font-semibold text-slate-500">/ 100</span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-3">
          <div className="rounded-lg bg-slate-100 p-3 text-slate-700">
            <Icon size={24} aria-hidden="true" />
          </div>
          <RiskBadge level={report?.risk_level || "Low"} />
        </div>
      </div>

      <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full ${barMap[report?.risk_level] || barMap.Low}`}
          style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
        />
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-lg border border-slate-200 p-3">
          <p className="text-slate-500">Category</p>
          <p className="mt-1 font-semibold capitalize text-slate-950">{report?.category || "safe"}</p>
        </div>
        <div className="rounded-lg border border-slate-200 p-3">
          <p className="text-slate-500">Input</p>
          <p className="mt-1 font-semibold capitalize text-slate-950">{humanize(report?.input_type || "text")}</p>
        </div>
      </div>
    </section>
  );
}
