import { Lightbulb, ShieldCheck } from "lucide-react";

export default function ReportExplanation({ report }) {
  return (
    <section className="rounded-lg bg-white p-5 shadow-soft">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-blue-50 p-2 text-blue-700">
          <Lightbulb size={20} aria-hidden="true" />
        </div>
        <h2 className="text-base font-semibold text-slate-950">Human-centered explanation</h2>
      </div>
      <p className="mt-4 leading-7 text-slate-700">{report?.explanation}</p>

      <div className="mt-5 rounded-lg border border-blue-100 bg-blue-50 p-4">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 shrink-0 text-blue-700" size={20} aria-hidden="true" />
          <div>
            <p className="text-sm font-semibold text-blue-950">Recommended safe action</p>
            <p className="mt-1 text-sm leading-6 text-blue-900">{report?.recommended_action}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
