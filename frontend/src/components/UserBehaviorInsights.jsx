import { MousePointerClick, Timer, TrendingDown, UserCheck } from "lucide-react";

const insightCards = [
  { key: "ignored_warnings", label: "Ignored warnings", icon: TrendingDown, tone: "bg-orange-50 text-orange-700" },
  { key: "risky_clicks", label: "Risky clicks", icon: MousePointerClick, tone: "bg-red-50 text-red-700" },
  { key: "average_decision_time", label: "Decision time", icon: Timer, tone: "bg-blue-50 text-blue-700", suffix: "s" },
  { key: "comprehension_score", label: "Comprehension", icon: UserCheck, tone: "bg-emerald-50 text-emerald-700", suffix: "%" },
];

export default function UserBehaviorInsights({ summary }) {
  return (
    <section className="animate-fade-slide rounded-lg bg-white p-5 shadow-soft">
      <div>
        <h2 className="text-base font-semibold text-slate-950">User behavior insights</h2>
        <p className="mt-1 text-sm text-slate-500">Adaptive warnings use these metrics to increase intervention strength.</p>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {insightCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.key} className="rounded-lg border border-slate-200 p-4 transition duration-200 hover:-translate-y-0.5">
              <div className={`inline-flex rounded-lg p-2 ${card.tone}`}>
                <Icon size={18} aria-hidden="true" />
              </div>
              <p className="mt-3 text-sm font-medium text-slate-500">{card.label}</p>
              <p className="mt-1 text-2xl font-bold text-slate-950">
                {summary?.[card.key] ?? 0}
                {card.suffix || ""}
              </p>
            </div>
          );
        })}
      </div>

      <div className="mt-5 rounded-lg border border-blue-100 bg-blue-50 p-4 text-sm leading-6 text-blue-950">
        Dominant condition: <span className="font-bold capitalize">{String(summary?.dominant_warning_mode || "explainable_ai_warning").replaceAll("_", " ")}</span>.
        Repeated ignored warnings and risky clicks increase the adaptive warning from guided caution to a high-friction pause.
      </div>
    </section>
  );
}
