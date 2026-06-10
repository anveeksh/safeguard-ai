import { Camera, CheckCircle2, ClipboardPaste, FileText, Link2, MessageSquareText, Sparkles, UploadCloud } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { api } from "../api/client.js";

const warningModes = [
  { key: "traditional_warning", title: "Traditional", body: "Simple red danger alert." },
  { key: "explainable_ai_warning", title: "Explainable AI", body: "Reasons and safe action." },
  { key: "adaptive_human_centered_warning", title: "Adaptive", body: "Stronger interventions after risky behavior." },
];

const evidenceTypes = [
  { key: "sms_whatsapp", label: "SMS / WhatsApp", icon: MessageSquareText },
  { key: "email", label: "Email", icon: FileText },
  { key: "url", label: "URL", icon: Link2 },
  { key: "job_offer", label: "Job Offer", icon: ClipboardPaste },
  { key: "immigration", label: "Immigration / Visa", icon: FileText },
  { key: "social_media", label: "Social Media", icon: Camera },
];

const formConfigs = {
  sms_whatsapp: {
    helper: "Paste the message exactly as received. Screenshots help preserve visual context.",
    screenshot: true,
    fields: [
      { name: "sender", label: "Sender name or phone number", helper: "Use the visible caller ID, phone number, or account name.", required: true },
      { name: "message_content", label: "Message content", type: "textarea", helper: "Paste the full message without cleaning up spelling or formatting.", required: true },
      { name: "received_at", label: "Received date/time", type: "datetime-local", helper: "Optional timestamp for study timing context." },
      { name: "notes", label: "Notes", type: "textarea", helper: "Anything unusual about timing, tone, or prior contact." },
    ],
  },
  email: {
    helper: "Include sender details, subject, full body, and links. Headers can be added later via .eml support.",
    screenshot: true,
    fields: [
      { name: "sender_email", label: "Sender email", helper: "Copy the exact sender address.", required: true },
      { name: "sender_display_name", label: "Sender display name", helper: "Optional name shown by the email client." },
      { name: "subject", label: "Subject", helper: "Subject line exactly as received.", required: true },
      { name: "email_body", label: "Email body", type: "textarea", helper: "Paste the full body, including signatures and warnings.", required: true },
      { name: "links_found", label: "Links found", type: "textarea", helper: "Optional: paste one link per line." },
      { name: "eml_file", label: "Upload .eml file", type: "file", accept: ".eml", helper: "Placeholder metadata only; parsing can be added later." },
      { name: "notes", label: "Notes", type: "textarea", helper: "Optional context about the sender or thread." },
    ],
  },
  url: {
    helper: "SafeGuard checks suspicious link patterns and the message context around the URL.",
    screenshot: true,
    fields: [
      { name: "url", label: "URL", helper: "Paste the full URL, including http/https.", required: true },
      {
        name: "received_via",
        label: "Where did you receive it?",
        type: "select",
        options: ["email", "SMS", "WhatsApp", "social media", "website", "unknown"],
        helper: "Source helps interpret social pressure and context.",
      },
      { name: "message_context", label: "Message context", type: "textarea", helper: "Optional text around the link." },
    ],
  },
  job_offer: {
    helper: "Fake job scams often combine high rewards, identity requests, and fees.",
    screenshot: true,
    fields: [
      { name: "company_name", label: "Company name", required: true },
      { name: "recruiter_name", label: "Recruiter name" },
      { name: "recruiter_contact", label: "Recruiter email/phone", helper: "Email, phone, WhatsApp number, or social handle." },
      { name: "job_title", label: "Job title", required: true },
      { name: "offered_salary", label: "Offered salary/pay", helper: "Example: $95/hour, $6,000/month, commission only." },
      { name: "message_content", label: "Message content", type: "textarea", required: true },
      { name: "payment_requested", label: "Payment requested?", type: "yesno", helper: "Fees, deposits, equipment, checks, crypto, or gift cards." },
      { name: "document_file", label: "Upload document", type: "file", helper: "Placeholder metadata only for now." },
    ],
  },
  immigration: {
    helper: "Immigration scams often use fear, authority pressure, deadlines, and payment demands.",
    screenshot: true,
    fields: [
      { name: "sender", label: "Sender", required: true },
      { name: "claimed_organization", label: "Claimed organization", helper: "Example: USCIS, embassy, school office, visa agent." },
      { name: "message_content", label: "Message content", type: "textarea", required: true },
      { name: "payment_requested", label: "Payment requested?", type: "yesno" },
      { name: "deadline_mentioned", label: "Deadline mentioned?", type: "yesno" },
    ],
  },
  social_media: {
    helper: "Capture the platform, handle, caption, URL, and screenshot if possible.",
    screenshot: true,
    fields: [
      { name: "platform", label: "Platform", type: "select", options: ["TikTok", "Instagram", "YouTube", "X", "Facebook", "Other"], required: true },
      { name: "account_handle", label: "Account name/handle", required: true },
      { name: "caption_message", label: "Caption/message", type: "textarea", required: true },
      { name: "url", label: "URL", helper: "Optional post, profile, or shortened link." },
    ],
  },
};

const examples = {
  sms_whatsapp: [
    {
      label: "Bank SMS",
      values: {
        sender: "+1 888 555 0911",
        message_content: "URGENT: Your bank account will be suspended today. Verify your password at http://secure-bank-login.example.ru/account.",
        notes: "Unexpected message. I do not use this number for banking.",
      },
    },
    {
      label: "Visa pressure",
      values: {
        sender: "USCIS Notice",
        message_content: "Final USCIS notice: your visa record will be cancelled unless you pay the penalty in the next 2 hours. Contact this WhatsApp number now.",
      },
    },
  ],
  email: [
    {
      label: "Account phishing",
      values: {
        sender_email: "security-alert@secure-bank-login.example.ru",
        sender_display_name: "Bank Security Team",
        subject: "Final notice: account locked",
        email_body: "Your account is locked. Verify your password immediately using http://secure-bank-login.example.ru/account to avoid losing access.",
        links_found: "http://secure-bank-login.example.ru/account",
      },
    },
  ],
  url: [
    {
      label: "Shortened reward link",
      values: {
        url: "http://bit.ly/claim-prize-now",
        received_via: "social media",
        message_context: "Congratulations, you have won an exclusive reward. Act now before midnight.",
      },
    },
  ],
  job_offer: [
    {
      label: "Remote job fee",
      values: {
        company_name: "Northstar Remote Solutions",
        recruiter_name: "Maya Wilson",
        recruiter_contact: "maya.hr.jobs@gmail.com / WhatsApp",
        job_title: "Remote Data Entry Assistant",
        offered_salary: "$95/hour",
        message_content: "We reviewed your resume and selected you. Kindly send your passport photo and pay a refundable $150 equipment processing fee by Zelle.",
        payment_requested: "yes",
      },
    },
  ],
  immigration: [
    {
      label: "Visa penalty",
      values: {
        sender: "Case Officer",
        claimed_organization: "USCIS",
        message_content: "Your visa record will be cancelled unless you pay the immigration penalty today. Do not ignore this final notice.",
        payment_requested: "yes",
        deadline_mentioned: "yes",
      },
    },
  ],
  social_media: [
    {
      label: "Impersonation DM",
      values: {
        platform: "Instagram",
        account_handle: "@brand_support_helpdesk",
        caption_message: "Official support team here. Your account will be terminated unless you verify your login using this secure link.",
        url: "http://secure-account-verify.example.click",
      },
    },
  ],
};

function emptyValues(type) {
  return Object.fromEntries(
    formConfigs[type].fields.map((field) => {
      if (field.type === "yesno") return [field.name, "no"];
      if (field.type === "select") return [field.name, field.options?.[0] || ""];
      return [field.name, ""];
    })
  );
}

function composeAnalysisText(type, values) {
  const label = evidenceTypes.find((item) => item.key === type)?.label || type;
  const lines = [`Evidence type: ${label}`];
  for (const field of formConfigs[type].fields) {
    if (field.type === "file") continue;
    const value = values[field.name];
    if (value) lines.push(`${field.label}: ${value}`);
  }
  return lines.join("\n");
}

function signalPreview(text) {
  const checks = [
    { label: "Urgency language", found: /urgent|immediately|final notice|today|act now|deadline|next 2 hours/i.test(text) },
    { label: "Impersonation", found: /support team|security team|officer|agent|recruiter|official/i.test(text) },
    { label: "Suspicious links", found: /(http:\/\/|bit\.ly|\.click|\.ru|secure.*login|verify)/i.test(text) },
    { label: "Financial coercion", found: /zelle|fee|deposit|penalty|fine|gift card|crypto|payment/i.test(text) },
    { label: "Authority pressure", found: /uscis|irs|bank|government|payroll|compliance|visa/i.test(text) },
    { label: "Emotional manipulation", found: /locked|cancelled|terminated|frozen|arrested|lose access/i.test(text) },
  ];
  return checks;
}

function FileDropBox({ screenshot, onFile }) {
  function readFile(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      onFile({ name: file.name, type: file.type, size: file.size, dataUrl: reader.result });
    };
    reader.readAsDataURL(file);
  }

  return (
    <div
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        event.preventDefault();
        readFile(event.dataTransfer.files?.[0]);
      }}
      className="rounded-lg border border-dashed border-blue-300 bg-blue-500/10 p-4 text-sm text-blue-50 transition hover:bg-blue-500/15"
    >
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-white/10 p-2">
          <UploadCloud size={20} aria-hidden="true" />
        </div>
        <div>
          <p className="font-semibold">Upload screenshot</p>
          <p className="text-blue-100">Screenshots help preserve visual context. OCR is not enabled yet.</p>
        </div>
      </div>
      <input
        type="file"
        accept="image/*"
        onChange={(event) => readFile(event.target.files?.[0])}
        className="mt-4 block w-full text-xs text-blue-100 file:mr-3 file:rounded-md file:border-0 file:bg-blue-600 file:px-3 file:py-2 file:text-white"
      />
      {screenshot?.dataUrl && (
        <img src={screenshot.dataUrl} alt="Uploaded evidence preview" className="mt-4 max-h-52 w-full rounded-lg object-cover" />
      )}
    </div>
  );
}

export default function AnalyzePage() {
  const [inputType, setInputType] = useState("sms_whatsapp");
  const [formData, setFormData] = useState(() => emptyValues("sms_whatsapp"));
  const [warningMode, setWarningMode] = useState("explainable_ai_warning");
  const [screenshot, setScreenshot] = useState(null);
  const [attachments, setAttachments] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const intakeStartedAt = useRef(Date.now());
  const navigate = useNavigate();

  const analysisText = useMemo(() => composeAnalysisText(inputType, formData), [inputType, formData]);
  const preview = useMemo(() => signalPreview(analysisText), [analysisText]);
  const detectedCount = preview.filter((item) => item.found).length;

  function setType(nextType) {
    setInputType(nextType);
    setFormData(emptyValues(nextType));
    setScreenshot(null);
    setAttachments({});
    intakeStartedAt.current = Date.now();
  }

  function setField(name, value) {
    setFormData((current) => ({ ...current, [name]: value }));
  }

  function useExample(example) {
    setFormData({ ...emptyValues(inputType), ...example.values });
    intakeStartedAt.current = Date.now();
  }

  function handleAttachment(name, file) {
    if (!file) return;
    setAttachments((current) => ({ ...current, [name]: { name: file.name, type: file.type, size: file.size } }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const scan = await api.analyze({
        input_type: inputType,
        input_content: analysisText,
        warning_mode_used: warningMode,
        decision_time_seconds: Math.max(1, Math.round((Date.now() - intakeStartedAt.current) / 100) / 10),
        structured_metadata: {
          evidence_type: inputType,
          evidence_label: evidenceTypes.find((item) => item.key === inputType)?.label,
          fields: formData,
          screenshot,
          attachments,
          warning_mode_used: warningMode,
          preview_signals_detected: preview.filter((item) => item.found).map((item) => item.label),
        },
      });
      navigate(`/report/${scan.id}`, { state: { scan } });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const config = formConfigs[inputType];

  return (
    <div className="space-y-6 text-white">
      <div className="rounded-lg border border-white/10 bg-white/10 p-6 shadow-soft backdrop-blur">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-200">Evidence Intake</p>
        <h1 className="mt-2 text-3xl font-bold tracking-normal">Security intake console</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-200">
          SafeGuard explains manipulation tactics, not just technical risk. Add the evidence as received, preserve context,
          and generate a human-centered report.
        </p>
      </div>

      <div className="grid gap-3 lg:grid-cols-4">
        {["Select evidence type", "Add details", "Review risk signals", "Generate report"].map((step, index) => (
          <div key={step} className="rounded-lg border border-white/10 bg-white/10 p-3 backdrop-blur">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-xs font-bold">{index + 1}</span>
              <p className="text-sm font-semibold">{step}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <section className="rounded-lg border border-white/10 bg-white/10 p-5 shadow-soft backdrop-blur">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <h2 className="text-base font-semibold">1. Select evidence type</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {evidenceTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <button
                      key={type.key}
                      type="button"
                      onClick={() => setType(type.key)}
                      className={`rounded-lg border p-4 text-left transition duration-200 hover:-translate-y-0.5 ${
                        inputType === type.key ? "border-blue-300 bg-blue-500/25" : "border-white/10 bg-white/5 hover:bg-white/10"
                      }`}
                    >
                      <Icon size={20} className="text-blue-200" aria-hidden="true" />
                      <span className="mt-3 block text-sm font-bold">{type.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <h2 className="text-base font-semibold">2. Add details</h2>
              <p className="mt-1 text-sm text-slate-300">{config.helper}</p>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                {config.fields.map((field) => (
                  <label key={field.name} className={field.type === "textarea" ? "block md:col-span-2" : "block"}>
                    <span className="text-sm font-semibold text-blue-50">{field.label}</span>
                    {field.helper && <span className="mt-1 block text-xs leading-5 text-slate-300">{field.helper}</span>}
                    {field.type === "textarea" ? (
                      <textarea
                        value={formData[field.name] || ""}
                        onChange={(event) => setField(field.name, event.target.value)}
                        required={field.required}
                        rows={5}
                        placeholder="Paste the message exactly as received."
                        className="mt-2 w-full resize-y rounded-lg border border-white/10 bg-slate-950/60 px-3 py-3 leading-6 text-white placeholder:text-slate-500"
                      />
                    ) : field.type === "select" ? (
                      <select
                        value={formData[field.name] || field.options?.[0] || ""}
                        onChange={(event) => setField(field.name, event.target.value)}
                        required={field.required}
                        className="mt-2 w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 py-3 text-white"
                      >
                        {field.options.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    ) : field.type === "yesno" ? (
                      <div className="mt-2 grid grid-cols-2 gap-2">
                        {["yes", "no"].map((option) => (
                          <button
                            key={option}
                            type="button"
                            onClick={() => setField(field.name, option)}
                            className={`rounded-lg border px-3 py-3 text-sm font-semibold capitalize ${
                              formData[field.name] === option ? "border-blue-300 bg-blue-500/25" : "border-white/10 bg-slate-950/40"
                            }`}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    ) : field.type === "file" ? (
                      <input
                        type="file"
                        accept={field.accept}
                        onChange={(event) => handleAttachment(field.name, event.target.files?.[0])}
                        className="mt-2 block w-full text-xs text-blue-100 file:mr-3 file:rounded-md file:border-0 file:bg-slate-700 file:px-3 file:py-2 file:text-white"
                      />
                    ) : (
                      <input
                        type={field.type || "text"}
                        value={formData[field.name] || ""}
                        onChange={(event) => setField(field.name, event.target.value)}
                        required={field.required}
                        className="mt-2 w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 py-3 text-white placeholder:text-slate-500"
                      />
                    )}
                    {attachments[field.name] && <span className="mt-2 block text-xs text-blue-200">{attachments[field.name].name}</span>}
                  </label>
                ))}
              </div>
            </div>

            {config.screenshot && <FileDropBox screenshot={screenshot} onFile={setScreenshot} />}

            {error && <div className="rounded-lg border border-red-300/40 bg-red-500/15 px-4 py-3 text-sm text-red-100">{error}</div>}

            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white shadow-lg shadow-blue-950/40 transition hover:-translate-y-0.5 hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              <Sparkles size={18} aria-hidden="true" />
              {loading ? "Generating report..." : "Generate report"}
            </button>
          </form>
        </section>

        <aside className="space-y-5">
          <section className="rounded-lg border border-white/10 bg-white/10 p-5 shadow-soft backdrop-blur">
            <h2 className="text-base font-semibold">Live risk preview</h2>
            <p className="mt-2 text-sm text-slate-300">{detectedCount} signal group(s) detected from the intake fields.</p>
            <div className="mt-4 space-y-2">
              {preview.map((item) => (
                <div key={item.label} className="flex items-center justify-between rounded-lg bg-slate-950/40 px-3 py-2 text-sm">
                  <span>{item.label}</span>
                  {item.found ? <CheckCircle2 size={16} className="text-emerald-300" /> : <span className="text-slate-500">not yet</span>}
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-lg border border-white/10 bg-white/10 p-5 shadow-soft backdrop-blur">
            <h2 className="text-base font-semibold">Warning condition</h2>
            <div className="mt-4 space-y-2">
              {warningModes.map((mode) => (
                <button
                  key={mode.key}
                  type="button"
                  onClick={() => setWarningMode(mode.key)}
                  className={`w-full rounded-lg border p-3 text-left transition hover:bg-white/10 ${
                    warningMode === mode.key ? "border-blue-300 bg-blue-500/25" : "border-white/10 bg-slate-950/40"
                  }`}
                >
                  <span className="block text-sm font-bold">{mode.title}</span>
                  <span className="mt-1 block text-xs text-slate-300">{mode.body}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-lg border border-white/10 bg-white/10 p-5 shadow-soft backdrop-blur">
            <h2 className="text-base font-semibold">Demo examples</h2>
            <div className="mt-4 space-y-2">
              {(examples[inputType] || []).map((example) => (
                <button
                  key={example.label}
                  type="button"
                  onClick={() => useExample(example)}
                  className="w-full rounded-lg border border-white/10 bg-slate-950/40 px-4 py-3 text-left text-sm font-semibold text-blue-50 transition hover:-translate-y-0.5 hover:border-blue-300"
                >
                  {example.label}
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-lg border border-white/10 bg-white/10 p-5 shadow-soft backdrop-blur">
            <h2 className="text-base font-semibold">What SafeGuard checks</h2>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              SafeGuard explains manipulation tactics, not just technical risk: urgency, impersonation, suspicious links,
              financial coercion, authority pressure, and emotional manipulation.
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}
