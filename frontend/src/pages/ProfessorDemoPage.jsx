import { ArrowRight, BrainCircuit, Layers3, Microscope, ShieldCheck, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

import Footer from "../components/Footer.jsx";

const architecture = ["React + Vite evidence intake", "FastAPI research API", "SQLite scan and behavior metrics", "Rule-based NLP analyzer"];
const researchQuestions = [
  "Do explainable warnings improve user comprehension compared with basic warnings?",
  "Can adaptive interventions reduce repeated unsafe decisions?",
  "Which manipulation tactics are easiest or hardest for users to recognize?",
];
const futureWork = ["OCR and email header parsing", "Longitudinal user study instrumentation", "ML-assisted risk scoring", "IRB-ready study protocol and consent flow"];
const demoFlows = [
  {
    title: "Evidence Intake",
    body: "Structured forms capture sender details, source context, message text, and screenshot metadata before analysis.",
  },
  {
    title: "Risk Report",
    body: "Reports combine risk level, scam category, manipulation signals, explanation quality, and recommended safe action.",
  },
  {
    title: "Researcher Dashboard",
    body: "Research views compare warning conditions, behavior trends, trust, comprehension, and phishing susceptibility.",
  },
];

export default function ProfessorDemoPage({ token }) {
  return (
    <div className="flex min-h-screen flex-col bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.22),transparent_30%),linear-gradient(135deg,#07111f_0%,#0b1728_46%,#111827_100%)] text-white">
      <div className="mx-auto w-full max-w-7xl flex-1 space-y-8 px-5 py-8 sm:px-8">
        <nav className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 font-bold">
            <span className="rounded-lg bg-blue-600 p-2">
              <ShieldCheck size={20} aria-hidden="true" />
            </span>
            SafeGuard AI
          </Link>
          <Link to={token ? "/demo" : "/login"} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold hover:bg-blue-500">
            Launch demo
          </Link>
        </nav>

        <section className="rounded-lg border border-white/10 bg-white/10 p-7 shadow-soft backdrop-blur">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-200">Professor Demo</p>
          <h1 className="mt-3 max-w-4xl text-4xl font-bold tracking-normal sm:text-5xl">SafeGuard AI as a usable security research prototype</h1>
          <p className="mt-5 max-w-3xl text-base leading-8 text-slate-200">
            SafeGuard AI studies how human-centered AI explanations can help people understand phishing, scams, and
            social engineering attempts before they click, pay, or share sensitive information.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link to={token ? "/demo" : "/login"} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 font-semibold hover:bg-blue-500">
              Launch Demo Mode
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
            <Link to={token ? "/research-mode" : "/login"} className="rounded-lg border border-white/20 px-5 py-3 font-semibold hover:bg-white/10">
              View Research Mode
            </Link>
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-3">
          {[
            ["Research motivation", "People often need help understanding why a message is risky, not only whether it is risky.", BrainCircuit],
            ["Human-centered contribution", "Reports explain urgency, fear, authority pressure, reward bait, suspicious links, and coercion in plain language.", Sparkles],
            ["Usable security platform", "The system compares traditional, explainable, and adaptive warnings with behavior metrics.", Microscope],
          ].map(([title, body, Icon]) => (
            <article key={title} className="rounded-lg border border-white/10 bg-white/10 p-5 shadow-soft backdrop-blur">
              <Icon size={24} className="text-blue-200" aria-hidden="true" />
              <h2 className="mt-4 text-lg font-bold">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-300">{body}</p>
            </article>
          ))}
        </section>

        <section className="rounded-lg border border-white/10 bg-white/10 p-6 shadow-soft backdrop-blur">
          <div className="flex items-center gap-3">
            <Layers3 className="text-blue-200" size={24} aria-hidden="true" />
            <h2 className="text-xl font-bold">System architecture</h2>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-4">
            {architecture.map((item, index) => (
              <div key={item} className="rounded-lg border border-white/10 bg-slate-950/40 p-4">
                <p className="text-xs font-bold text-blue-200">Layer {index + 1}</p>
                <p className="mt-2 text-sm font-semibold">{item}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-3">
          {demoFlows.map((flow) => (
            <article key={flow.title} className="rounded-lg border border-white/10 bg-slate-950/50 p-5 shadow-soft">
              <div className="h-32 rounded-lg border border-blue-300/20 bg-[radial-gradient(circle_at_top,rgba(37,99,235,0.35),transparent_55%),rgba(255,255,255,0.06)]" />
              <h2 className="mt-4 text-lg font-bold">{flow.title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                {flow.body}
              </p>
            </article>
          ))}
        </section>

        <section className="grid gap-5 lg:grid-cols-2">
          <article className="rounded-lg border border-white/10 bg-white/10 p-6 shadow-soft backdrop-blur">
            <h2 className="text-xl font-bold">Research questions</h2>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-300">
              {researchQuestions.map((item) => (
                <li key={item}>- {item}</li>
              ))}
            </ul>
          </article>
          <article className="rounded-lg border border-white/10 bg-white/10 p-6 shadow-soft backdrop-blur">
            <h2 className="text-xl font-bold">Future work</h2>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-300">
              {futureWork.map((item) => (
                <li key={item}>- {item}</li>
              ))}
            </ul>
          </article>
        </section>

        <section className="rounded-lg border border-emerald-300/20 bg-emerald-500/10 p-6 shadow-soft">
          <h2 className="text-xl font-bold">Project Impact</h2>
          <p className="mt-3 max-w-4xl text-sm leading-7 text-emerald-50">
            SafeGuard AI helps protect users from phishing, fake jobs, immigration scams, financial scams, and social
            engineering by explaining manipulation tactics in human language. It also supports usable security research
            through warning-condition comparison and behavior metrics.
          </p>
        </section>
      </div>
      <Footer />
    </div>
  );
}
