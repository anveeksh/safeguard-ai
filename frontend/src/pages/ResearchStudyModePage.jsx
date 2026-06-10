import { ArrowRight, Download, FlaskConical, PlayCircle, ShieldCheck, TimerReset } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { api } from "../api/client.js";
import UserBehaviorInsights from "../components/UserBehaviorInsights.jsx";

const conditions = [
  {
    title: "Traditional Warning",
    body: "Simple red danger alert with minimal explanation. This condition represents a baseline warning design.",
  },
  {
    title: "Explainable AI Warning",
    body: "Adds plain-language reasons, detected manipulation tactics, and a recommended safe action.",
  },
  {
    title: "Adaptive Human-Centered Warning",
    body: "Adjusts intervention strength based on risk level and prior unsafe decisions such as ignored warnings or risky clicks.",
  },
];

const metricLabels = ["click intention", "trust", "comprehension", "decision time", "warning fatigue"];

export default function ResearchStudyModePage() {
  const [researchMetrics, setResearchMetrics] = useState(null);

  useEffect(() => {
    api.getResearchMetrics().then(setResearchMetrics).catch(() => setResearchMetrics(null));
  }, []);

  async function handleExport() {
    const blob = await api.exportResearchCsv();
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "safeguard-ai-study-metrics.csv";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6 text-white">
      <div className="rounded-lg border border-white/10 bg-white/10 p-6 shadow-soft backdrop-blur">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-200">Usable security study</p>
        <h1 className="mt-2 text-3xl font-bold tracking-normal">Research Mode</h1>
        <p className="mt-3 max-w-4xl text-sm leading-6 text-slate-200">
          A demo environment for comparing how warning design affects comprehension, trust, warning fatigue, and risky
          click intention across suspicious messages and links.
        </p>
      </div>

      <section className="rounded-lg border border-white/10 bg-navy-950/80 p-6 text-white shadow-soft">
        <div className="flex items-start gap-4">
          <div className="rounded-lg bg-blue-600 p-3">
            <FlaskConical size={24} aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Research question</h2>
            <p className="mt-3 max-w-4xl leading-7 text-slate-200">
              Do human-centered AI explanations improve users' ability to recognize and safely respond to phishing,
              fake job scams, immigration pressure, and other social engineering attacks compared with basic warnings?
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-3">
        {conditions.map((condition, index) => (
          <section key={condition.title} className="rounded-lg border border-white/10 bg-white/10 p-5 shadow-soft backdrop-blur transition duration-200 hover:-translate-y-0.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/25 text-sm font-bold text-blue-100">
              {index + 1}
            </div>
            <h2 className="mt-4 text-lg font-bold">{condition.title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-300">{condition.body}</p>
          </section>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <section className="rounded-lg border border-white/10 bg-white/10 p-5 shadow-soft backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-orange-500/20 p-2 text-orange-100">
              <TimerReset size={20} aria-hidden="true" />
            </div>
            <h2 className="text-base font-semibold">Participant workflow and metrics</h2>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {metricLabels.map((metric) => (
              <div key={metric} className="rounded-lg border border-white/10 bg-slate-950/40 p-4">
                <p className="text-sm font-semibold capitalize text-blue-50">{metric}</p>
              </div>
            ))}
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-4">
            {["Receive scenario", "Choose action", "Read warning", "Complete measures"].map((step, index) => (
              <div key={step} className="rounded-lg border border-white/10 bg-white/5 p-4">
                <p className="text-xs font-bold text-blue-200">Step {index + 1}</p>
                <p className="mt-2 text-sm font-semibold">{step}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-white/10 bg-white/10 p-5 shadow-soft backdrop-blur">
          <h2 className="text-base font-semibold">Study actions</h2>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            Export study assignments, warning mode, decisions, timing, trust, and comprehension metrics.
          </p>
          <button
            type="button"
            onClick={handleExport}
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700"
          >
            <Download size={16} aria-hidden="true" />
            Export CSV
          </button>
          <Link
            to="/analyze"
            className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800"
          >
            <PlayCircle size={16} aria-hidden="true" />
            Start demo study
          </Link>
          <Link
            to="/researcher-dashboard"
            className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-white/20 px-4 py-3 text-sm font-semibold text-white hover:bg-white/10"
          >
            Open researcher dashboard
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </section>
      </div>

      <section className="rounded-lg border border-emerald-300/20 bg-emerald-500/10 p-5 text-emerald-50 shadow-soft backdrop-blur">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 shrink-0" size={20} aria-hidden="true" />
          <p className="text-sm leading-6">
            Ethical note: this is a demo and research prototype. Do not run a real user study, collect participant data,
            or make claims about efficacy without appropriate IRB or institutional approval, consent, data handling, and
            debriefing procedures.
          </p>
        </div>
      </section>

      {researchMetrics && <UserBehaviorInsights summary={researchMetrics.behavior_summary} />}
    </div>
  );
}
