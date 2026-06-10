import { AlertTriangle, BarChart3, Gauge, ShieldCheck } from "lucide-react";

const cards = [
  { key: "total_scans", label: "Total scans", icon: BarChart3, tone: "bg-blue-50 text-blue-700" },
  { key: "high_risk_scans", label: "High-risk scans", icon: AlertTriangle, tone: "bg-orange-50 text-orange-700" },
  { key: "critical_scans", label: "Critical scans", icon: ShieldCheck, tone: "bg-red-50 text-red-700" },
  { key: "average_risk_score", label: "Average score", icon: Gauge, tone: "bg-emerald-50 text-emerald-700" },
];

export default function AnalyticsCards({ analytics }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <section key={card.key} className="rounded-lg bg-white p-5 shadow-soft">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-slate-500">{card.label}</p>
                <p className="mt-2 text-3xl font-bold text-slate-950">{analytics?.[card.key] ?? 0}</p>
              </div>
              <div className={`rounded-lg p-3 ${card.tone}`}>
                <Icon size={22} aria-hidden="true" />
              </div>
            </div>
          </section>
        );
      })}
    </div>
  );
}
