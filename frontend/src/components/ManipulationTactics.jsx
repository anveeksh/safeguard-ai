import { BadgeAlert, Clock3, Crown, Gift, Link2, Receipt, UserRoundSearch } from "lucide-react";

const tacticMeta = {
  urgency: { icon: Clock3, style: "bg-orange-50 text-orange-700 border-orange-200" },
  fear: { icon: BadgeAlert, style: "bg-red-50 text-red-700 border-red-200" },
  "authority pressure": { icon: Crown, style: "bg-blue-50 text-blue-700 border-blue-200" },
  "reward bait": { icon: Gift, style: "bg-amber-50 text-amber-700 border-amber-200" },
  "financial coercion": { icon: Receipt, style: "bg-rose-50 text-rose-700 border-rose-200" },
  impersonation: { icon: UserRoundSearch, style: "bg-purple-50 text-purple-700 border-purple-200" },
  "suspicious link": { icon: Link2, style: "bg-cyan-50 text-cyan-700 border-cyan-200" },
};

export default function ManipulationTactics({ tactics = [] }) {
  if (!tactics.length) {
    return (
      <section className="rounded-lg bg-white p-5 shadow-soft">
        <h2 className="text-base font-semibold text-slate-950">Manipulation tactics</h2>
        <p className="mt-3 text-sm text-slate-600">No strong manipulation pattern was detected.</p>
      </section>
    );
  }

  return (
    <section className="rounded-lg bg-white p-5 shadow-soft">
      <h2 className="text-base font-semibold text-slate-950">Manipulation tactics</h2>
      <div className="mt-4 flex flex-wrap gap-2">
        {tactics.map((tactic) => {
          const meta = tacticMeta[tactic] || tacticMeta.fear;
          const Icon = meta.icon;
          return (
            <span
              key={tactic}
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-semibold ${meta.style}`}
            >
              <Icon size={15} aria-hidden="true" />
              {tactic}
            </span>
          );
        })}
      </div>
    </section>
  );
}
