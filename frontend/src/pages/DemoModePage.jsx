import { ArrowRight, BriefcaseBusiness, Building2, GraduationCap, Landmark, PlayCircle, ShieldCheck } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { api } from "../api/client.js";

const scenarios = [
  {
    id: "bank-phishing-email",
    title: "Bank phishing email",
    icon: Landmark,
    evidenceType: "email",
    riskFrame: "Credential theft and fake account verification",
    fields: {
      sender_email: "alerts@secure-bank-login.example.ru",
      sender_display_name: "Bank Security Team",
      subject: "URGENT: Account suspension notice",
      email_body:
        "URGENT: Your bank account will be suspended today. Verify your password immediately at http://secure-bank-login.example.ru/account or your funds may be frozen.",
      links_found: "http://secure-bank-login.example.ru/account",
      notes: "Unexpected email using fear and account lockout language.",
    },
  },
  {
    id: "fake-remote-job",
    title: "Fake remote job offer",
    icon: BriefcaseBusiness,
    evidenceType: "job_offer",
    riskFrame: "Reward bait, identity request, and processing fee",
    fields: {
      company_name: "Northstar Remote Solutions",
      recruiter_name: "Maya Wilson",
      recruiter_contact: "maya.hr.jobs@gmail.com / WhatsApp",
      job_title: "Remote Data Entry Assistant",
      offered_salary: "$95/hour",
      message_content:
        "We reviewed your resume and selected you for a remote data entry role paying $95/hour. Kindly send your passport photo and pay a refundable $150 equipment processing fee by Zelle.",
      payment_requested: "yes",
    },
  },
  {
    id: "visa-scam-sms",
    title: "Immigration/visa scam SMS",
    icon: Building2,
    evidenceType: "immigration",
    riskFrame: "Authority pressure and deadline-driven fear",
    fields: {
      sender: "USCIS Final Notice",
      claimed_organization: "USCIS",
      message_content:
        "Final USCIS notice: your visa record will be cancelled unless you pay the penalty in the next 2 hours. Do not ignore this message. Contact this WhatsApp number now.",
      payment_requested: "yes",
      deadline_mentioned: "yes",
    },
  },
  {
    id: "safe-university-reminder",
    title: "Safe university reminder",
    icon: GraduationCap,
    evidenceType: "email",
    riskFrame: "Expected institutional reminder with no coercive action",
    fields: {
      sender_email: "security-awareness@university.edu",
      sender_display_name: "University IT Security",
      subject: "Reminder: security awareness session tomorrow",
      email_body:
        "Reminder: our security awareness session is tomorrow at 2 PM. Please join from the calendar invite and bring any questions about suspicious messages.",
      links_found: "",
      notes: "Expected campus reminder with no payment, password, or urgent threat.",
    },
  },
];

function composeScenarioText(scenario) {
  return [`Demo scenario: ${scenario.title}`, ...Object.entries(scenario.fields).map(([key, value]) => `${key.replaceAll("_", " ")}: ${value}`)].join("\n");
}

export default function DemoModePage() {
  const [selectedId, setSelectedId] = useState(scenarios[0].id);
  const [guidedStarted, setGuidedStarted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const selected = useMemo(() => scenarios.find((scenario) => scenario.id === selectedId) || scenarios[0], [selectedId]);

  async function runScenario() {
    setError("");
    setLoading(true);
    try {
      const scan = await api.analyze({
        input_type: selected.evidenceType,
        input_content: composeScenarioText(selected),
        warning_mode_used: selected.id === "safe-university-reminder" ? "explainable_ai_warning" : "adaptive_human_centered_warning",
        structured_metadata: {
          demo_mode: true,
          scenario_id: selected.id,
          scenario_title: selected.title,
          evidence_type: selected.evidenceType,
          evidence_label: selected.title,
          fields: selected.fields,
          screenshot: null,
          preview_signals_detected: [],
        },
      });
      navigate(`/report/${scan.id}`, { state: { scan } });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 text-white">
      <section className="rounded-lg border border-white/10 bg-white/10 p-6 shadow-soft backdrop-blur">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-200">Demo Mode</p>
        <div className="mt-2 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <h1 className="text-3xl font-bold tracking-normal">One-click guided demo</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-200">
              Walk through four realistic scenarios with the evidence intake fields filled automatically, then generate a
              real SafeGuard report through the backend analyzer.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setGuidedStarted(true);
              setSelectedId(scenarios[0].id);
            }}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-blue-500"
          >
            <PlayCircle size={17} aria-hidden="true" />
            Start guided demo
          </button>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
        <section className="rounded-lg border border-white/10 bg-white/10 p-5 shadow-soft backdrop-blur">
          <h2 className="text-base font-semibold">Preloaded scenarios</h2>
          <div className="mt-4 space-y-3">
            {scenarios.map((scenario, index) => {
              const Icon = scenario.icon;
              const active = selected.id === scenario.id;
              return (
                <button
                  key={scenario.id}
                  type="button"
                  onClick={() => setSelectedId(scenario.id)}
                  className={`w-full rounded-lg border p-4 text-left transition duration-200 hover:-translate-y-0.5 ${
                    active ? "border-blue-300 bg-blue-500/25" : "border-white/10 bg-slate-950/40 hover:bg-white/10"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="rounded-lg bg-white/10 p-2 text-blue-100">
                      <Icon size={19} aria-hidden="true" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-blue-200">Scenario {index + 1}</p>
                      <p className="mt-1 font-bold">{scenario.title}</p>
                      <p className="mt-1 text-xs leading-5 text-slate-300">{scenario.riskFrame}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        <section className="rounded-lg border border-white/10 bg-white/10 p-5 shadow-soft backdrop-blur">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-blue-200">
                {guidedStarted ? "Guided demo active" : "Scenario preview"}
              </p>
              <h2 className="mt-2 text-2xl font-bold">{selected.title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-300">{selected.riskFrame}</p>
            </div>
            <div className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-100">
              Fields prefilled
            </div>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {Object.entries(selected.fields).map(([key, value]) => (
              <div key={key} className={String(value).length > 100 ? "rounded-lg border border-white/10 bg-slate-950/50 p-4 md:col-span-2" : "rounded-lg border border-white/10 bg-slate-950/50 p-4"}>
                <p className="text-xs font-semibold uppercase tracking-normal text-slate-400">{key.replaceAll("_", " ")}</p>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-white">{value || "None provided"}</p>
              </div>
            ))}
          </div>

          {error && <div className="mt-5 rounded-lg border border-red-300/40 bg-red-500/15 px-4 py-3 text-sm text-red-100">{error}</div>}

          <button
            type="button"
            onClick={runScenario}
            disabled={loading}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white shadow-lg shadow-blue-950/40 transition hover:-translate-y-0.5 hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            {loading ? "Generating report..." : "Analyze scenario"}
            <ArrowRight size={18} aria-hidden="true" />
          </button>

          <div className="mt-5 rounded-lg border border-emerald-300/20 bg-emerald-500/10 p-4 text-sm leading-6 text-emerald-50">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 shrink-0" size={18} aria-hidden="true" />
              <p>Every demo scenario uses the live `/analyze` endpoint and generates the same report format as a real intake.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
