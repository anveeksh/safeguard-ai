import { ArrowLeft, Camera, Database, FileSearch } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";

import { api } from "../api/client.js";
import ExplanationBreakdown from "../components/ExplanationBreakdown.jsx";
import LoadingState from "../components/LoadingState.jsx";
import ManipulationTactics from "../components/ManipulationTactics.jsx";
import ReportExplanation from "../components/ReportExplanation.jsx";
import RiskScoreCard from "../components/RiskScoreCard.jsx";
import ThreatIndicatorsPanel from "../components/ThreatIndicatorsPanel.jsx";

export default function ReportPage() {
  const { id } = useParams();
  const location = useLocation();
  const [report, setReport] = useState(location.state?.scan || null);
  const [researchMetrics, setResearchMetrics] = useState(null);
  const [loading, setLoading] = useState(!location.state?.scan);

  useEffect(() => {
    if (report) return;
    api
      .getScan(id)
      .then(setReport)
      .finally(() => setLoading(false));
  }, [id, report]);

  useEffect(() => {
    api.getResearchMetrics().then(setResearchMetrics).catch(() => setResearchMetrics(null));
  }, []);

  if (loading) {
    return <LoadingState label="Loading report" />;
  }

  const metadata = report?.structured_metadata || {};
  const fields = metadata.fields || {};
  const sourceFields = Object.entries(fields).filter(
    ([key, value]) => value && !["message_content", "email_body", "caption_message"].includes(key)
  );

  return (
    <div className="space-y-6 text-white">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <Link to="/history" className="inline-flex items-center gap-2 text-sm font-semibold text-blue-200">
            <ArrowLeft size={16} aria-hidden="true" />
            Back to history
          </Link>
          <h1 className="mt-3 text-3xl font-bold tracking-normal">Risk report</h1>
        </div>
        <Link
          to="/analyze"
          className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Analyze another
        </Link>
      </div>

      <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
        <div className="space-y-6">
          <RiskScoreCard report={report} />
          <section className="rounded-lg border border-white/10 bg-white/10 p-5 shadow-soft backdrop-blur">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-500/20 p-2 text-blue-100">
                <FileSearch size={20} aria-hidden="true" />
              </div>
              <div>
                <h2 className="text-base font-semibold">Input summary</h2>
                <p className="text-sm text-slate-300">{metadata.evidence_label || report?.input_type}</p>
              </div>
            </div>
            <dl className="mt-4 space-y-3 text-sm">
              {sourceFields.slice(0, 7).map(([key, value]) => (
                <div key={key} className="rounded-lg bg-slate-950/40 p-3">
                  <dt className="font-semibold capitalize text-slate-300">{key.replaceAll("_", " ")}</dt>
                  <dd className="mt-1 break-words text-white">{String(value)}</dd>
                </div>
              ))}
              {sourceFields.length === 0 && <p className="text-sm text-slate-300">No structured source metadata was provided.</p>}
            </dl>
          </section>
          {metadata.screenshot?.dataUrl && (
            <section className="rounded-lg border border-white/10 bg-white/10 p-5 shadow-soft backdrop-blur">
              <div className="mb-4 flex items-center gap-3">
                <Camera size={18} className="text-blue-200" aria-hidden="true" />
                <h2 className="text-base font-semibold">Screenshot preview</h2>
              </div>
              <img src={metadata.screenshot.dataUrl} alt="Uploaded evidence screenshot" className="max-h-72 w-full rounded-lg object-cover" />
            </section>
          )}
          <ManipulationTactics tactics={report?.tactics} />
          <section className={`rounded-lg p-5 shadow-soft ${
            report?.warning_condition?.tone === "danger"
              ? "bg-red-600 text-white risk-pulse"
              : report?.warning_condition?.tone === "adaptive"
                ? "bg-navy-950 text-white"
                : "bg-blue-600 text-white"
          }`}>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/75">Warning condition</p>
            <h2 className="mt-2 text-lg font-bold">{report?.warning_condition?.title}</h2>
            <p className="mt-2 text-sm leading-6 text-white/85">{report?.warning_condition?.primary_message}</p>
            <div className="mt-4 rounded-lg bg-white/10 p-3 text-sm font-semibold">
              {report?.warning_condition?.intervention_level}
            </div>
          </section>
        </div>
        <div className="space-y-6">
          <ThreatIndicatorsPanel indicators={report?.threat_indicators} />
          <ReportExplanation report={report} />
          <ExplanationBreakdown items={report?.explanation_breakdown} />
          <section className="rounded-lg bg-white p-5 shadow-soft">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-slate-100 p-2 text-slate-700">
                <Database size={20} aria-hidden="true" />
              </div>
              <h2 className="text-base font-semibold text-slate-950">Research metrics</h2>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                ["Warning mode", report?.warning_condition?.title || "Explainable AI Warning"],
                ["Study sessions", researchMetrics?.behavior_summary?.total_sessions ?? 0],
                ["Ignored warnings", researchMetrics?.behavior_summary?.ignored_warnings ?? 0],
                ["Risky clicks", researchMetrics?.behavior_summary?.risky_clicks ?? 0],
              ].map(([label, value]) => (
                <div key={label} className="rounded-lg border border-slate-200 p-3">
                  <p className="text-xs font-semibold uppercase tracking-normal text-slate-500">{label}</p>
                  <p className="mt-2 text-sm font-bold text-slate-950">{value}</p>
                </div>
              ))}
            </div>
          </section>
          <section className="rounded-lg bg-white p-5 shadow-soft">
            <h2 className="text-base font-semibold text-slate-950">Original content</h2>
            <pre className="mt-4 max-h-80 overflow-auto whitespace-pre-wrap rounded-lg bg-slate-950 p-4 text-sm leading-6 text-slate-100 scrollbar-soft">
              {report?.input_content}
            </pre>
          </section>
        </div>
      </div>
    </div>
  );
}
