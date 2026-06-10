import { AlertTriangle, BadgeDollarSign, Building2, Clock3, Link2, MessageCircleWarning, UserRoundSearch } from "lucide-react";

const icons = {
  urgency_language: Clock3,
  impersonation: UserRoundSearch,
  suspicious_links: Link2,
  financial_coercion: BadgeDollarSign,
  authority_pressure: Building2,
  emotional_manipulation: MessageCircleWarning,
};

const severityStyles = {
  high: "border-red-200 bg-red-50 text-red-700",
  medium: "border-orange-200 bg-orange-50 text-orange-700",
  low: "border-slate-200 bg-slate-50 text-slate-500",
};

export default function ThreatIndicatorsPanel({ indicators = [] }) {
  return (
    <section className="animate-fade-slide rounded-lg bg-white p-5 shadow-soft">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-red-50 p-2 text-red-700">
          <AlertTriangle size={20} aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-slate-950">Why This Was Flagged</h2>
          <p className="text-sm text-slate-500">Threat indicators mapped to social engineering tactics.</p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {indicators.map((indicator) => {
          const Icon = icons[indicator.key] || AlertTriangle;
          return (
            <article
              key={indicator.key}
              className={`rounded-lg border p-4 transition duration-200 hover:-translate-y-0.5 ${
                indicator.detected ? severityStyles[indicator.severity] : severityStyles.low
              }`}
            >
              <div className="flex items-start gap-3">
                <Icon className="mt-0.5 shrink-0" size={18} aria-hidden="true" />
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-950">{indicator.label}</h3>
                    <span className="rounded-full bg-white/80 px-2 py-0.5 text-xs font-semibold capitalize">
                      {indicator.detected ? indicator.severity : "not detected"}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-700">{indicator.reason}</p>
                  {indicator.evidence?.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {indicator.evidence.slice(0, 4).map((item) => (
                        <span key={item} className="rounded-full bg-white px-2 py-1 text-xs font-semibold text-slate-700">
                          {item}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
