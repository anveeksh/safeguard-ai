import { BrainCircuit } from "lucide-react";

export default function ExplanationBreakdown({ items = [] }) {
  return (
    <section className="animate-fade-slide rounded-lg bg-white p-5 shadow-soft">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-blue-50 p-2 text-blue-700">
          <BrainCircuit size={20} aria-hidden="true" />
        </div>
        <h2 className="text-base font-semibold text-slate-950">Explanation breakdown</h2>
      </div>

      <div className="mt-5 space-y-4">
        {items.length === 0 ? (
          <p className="text-sm text-slate-600">No high-impact signals were found.</p>
        ) : (
          items.slice(0, 5).map((item) => (
            <article key={`${item.label}-${item.impact}`} className="rounded-lg border border-slate-200 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-950">{item.label}</h3>
                  {item.tactic && <p className="mt-1 text-xs font-semibold uppercase tracking-normal text-blue-700">{item.tactic}</p>}
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                  Impact {item.impact}
                </span>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-600">{item.reason}</p>
              {item.evidence?.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {item.evidence.map((evidence) => (
                    <span key={evidence} className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">
                      {evidence}
                    </span>
                  ))}
                </div>
              )}
            </article>
          ))
        )}
      </div>
    </section>
  );
}
