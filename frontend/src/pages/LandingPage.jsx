import { ArrowRight, BarChart3, BrainCircuit, GraduationCap, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";

import Footer from "../components/Footer.jsx";
import LandingNavbar from "../components/LandingNavbar.jsx";

export default function LandingPage({ token }) {
  return (
    <div className="flex min-h-screen flex-col bg-navy-950 text-white">
      <div className="flex-1">
        <section className="relative min-h-screen overflow-hidden">
          <img
            src="/assets/hero-security-workspace.png"
            alt="Cybersecurity analysis workspace"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(7,17,31,0.88)_0%,rgba(7,17,31,0.72)_42%,rgba(7,17,31,0.38)_100%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,17,31,0.72)_0%,rgba(7,17,31,0.20)_35%,rgba(7,17,31,0.84)_100%)]" />
          <LandingNavbar token={token} />

          <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl items-center px-4 pb-14 pt-24 sm:px-6 sm:pt-28 lg:px-8">
            <div className="w-full max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-200 sm:text-sm">
                Security warnings people can use
              </p>
              <h1 className="mt-5 text-[clamp(2.5rem,7vw,5rem)] font-bold leading-[0.96] tracking-normal text-white">
                SafeGuard AI
              </h1>
              <p className="mt-6 max-w-xl text-[clamp(1rem,2vw,1.25rem)] leading-8 text-slate-200">
                Human-centered AI defense against phishing, scams, and social engineering.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Link
                  to={token ? "/demo" : "/login"}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white shadow-lg shadow-blue-950/30 transition hover:-translate-y-0.5 hover:bg-blue-500"
                >
                  Try Demo
                  <ArrowRight size={18} aria-hidden="true" />
                </Link>
                <Link
                  to={token ? "/research-mode" : "/login"}
                  className="inline-flex items-center justify-center rounded-lg border border-white/30 px-5 py-3 font-semibold text-white transition hover:bg-white/10"
                >
                  View Research Mode
                </Link>
                <Link
                  to="/professor-demo"
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/30 px-5 py-3 font-semibold text-white transition hover:bg-white/10"
                >
                  Professor Demo
                  <GraduationCap size={18} aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
        </section>

      <section id="study" className="bg-white py-14 text-slate-950">
        <div className="mx-auto grid max-w-7xl gap-5 px-4 sm:px-6 md:grid-cols-3 lg:px-8">
          <article className="rounded-lg border border-slate-200 p-5">
            <BrainCircuit className="text-blue-600" size={26} aria-hidden="true" />
            <h2 className="mt-4 text-lg font-bold">Explainable warnings</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Reports translate risky cues into plain language so users understand the tactic, not only the label.
            </p>
          </article>
          <article className="rounded-lg border border-slate-200 p-5">
            <ShieldCheck className="text-emerald-600" size={26} aria-hidden="true" />
            <h2 className="mt-4 text-lg font-bold">Local MVP analysis</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              A rule-based NLP engine detects urgency, authority pressure, suspicious links, and scam-specific cues.
            </p>
          </article>
          <article className="rounded-lg border border-slate-200 p-5">
            <BarChart3 className="text-orange-600" size={26} aria-hidden="true" />
            <h2 className="mt-4 text-lg font-bold">Study-ready metrics</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Built-in analytics and research mode frame trust, comprehension, click intention, and warning fatigue.
            </p>
          </article>
        </div>
      </section>

      <section className="bg-navy-950 py-14 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-200">Project Impact</p>
          <h2 className="mt-3 text-3xl font-bold tracking-normal">Protection that explains the human tactic</h2>
          <div className="mt-6 grid gap-5 md:grid-cols-3">
            {[
              "Protects users from phishing, fake jobs, immigration scams, financial scams, and social engineering.",
              "Explains manipulation tactics in human language so people can slow down and verify safely.",
              "Supports usable security research through warning-condition comparison and behavior metrics.",
            ].map((item) => (
              <article key={item} className="rounded-lg border border-white/10 bg-white/10 p-5 backdrop-blur">
                <p className="text-sm leading-6 text-slate-200">{item}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      </div>
      <Footer />
    </div>
  );
}
