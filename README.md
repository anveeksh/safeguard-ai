# SafeGuard AI

![SafeGuard AI v1.0 Research MVP](https://img.shields.io/badge/SafeGuard%20AI-v1.0%20Research%20MVP-2563eb)

SafeGuard AI is a full-stack, human-centered cybersecurity research prototype for analyzing suspicious emails, SMS/WhatsApp messages, URLs, job offers, immigration/visa scams, and social engineering content.

It does more than classify risk. It explains why a message is risky in plain language, surfaces manipulation tactics, and supports usable security research through warning-condition comparison.

## Research Motivation

People often see phishing and scam warnings when they are already under pressure: a bank account may be "locked," a visa may be "cancelled," or a job offer may disappear unless they pay a fee. Traditional warnings often say "danger" without helping users understand the tactic.

SafeGuard AI explores whether human-centered explanations can improve comprehension, trust, and safer decision-making compared with basic warnings.

## System Architecture

```text
React + Vite + Tailwind frontend
  Evidence Intake
  Demo Mode
  Risk Reports
  Research Mode
  Researcher Dashboard

FastAPI backend
  Auth routes
  Analyze route
  Scan history
  Analytics
  Research metrics and CSV export

SQLite database
  User
  Scan
  UserBehaviorMetrics

Analyzer service
  Rule-based NLP signals
  Structured threat indicators
  Warning-condition framework
```

## Key Capabilities

- Structured evidence intake for SMS/WhatsApp, Email, URL, Job Offer, Immigration/Visa, and Social Media content
- Demo Mode with four preloaded scenarios:
  - bank phishing email
  - fake remote job offer
  - immigration/visa scam SMS
  - safe university reminder
- Risk reports with:
  - risk level and score
  - category
  - sender/source details
  - screenshot preview metadata
  - "Why This Was Flagged"
  - manipulation tactics
  - human-centered explanation
  - recommended safe action
  - warning condition used
  - research metrics
- Researcher Dashboard for comparing warning conditions, click-through behavior, trust/comprehension metrics, behavior trends, phishing susceptibility, and manipulation tactics
- CSV export for future study analysis

## Screenshots

Suggested captures for an application portfolio:

- `screenshots/landing.png`
- `screenshots/evidence-intake.png`
- `screenshots/demo-mode.png`
- `screenshots/risk-report.png`
- `screenshots/researcher-dashboard.png`
- `screenshots/professor-demo.png`

## How To Run Locally

Backend:

```bash
cd safeguard-ai/backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python -m app.seed
uvicorn app.main:app --reload
```

Frontend:

```bash
cd safeguard-ai/frontend
npm install
npm run dev
```

Open:

```text
Frontend: http://localhost:5173
Backend:  http://localhost:8000
```

## Running With Docker

Build and start the production-style local stack:

```bash
cd safeguard-ai
docker compose up --build
```

Open:

```text
Frontend: http://localhost
Backend:  http://localhost:8000
Health:   http://localhost:8000/health
```

Follow logs:

```bash
docker compose logs -f
```

Stop the stack:

```bash
docker compose down
```

The Docker backend stores SQLite data in the `safeguard-ai-data` volume. The frontend production build uses
`VITE_API_URL`, which defaults to `http://localhost:8000` for local Docker runs.

## Demo Login

After running the seed script:

```text
demo@safeguard.ai
demo1234
```

## Creator

Built by Anveeksh Mahesh Rao  
MS Cybersecurity, Northeastern University  
Portfolio: https://anveekshmrao.com  
LinkedIn: https://www.linkedin.com/in/anveekshmrao/  
GitHub: https://github.com/anveeksh

## Core API Routes

- `POST /auth/register`
- `POST /auth/login`
- `POST /analyze`
- `GET /scans`
- `GET /scans/{id}`
- `GET /analytics`
- `GET /research/metrics`
- `GET /research/export.csv`

## Study Design

SafeGuard AI supports three warning conditions:

- Traditional Warning: a simple red danger alert
- Explainable AI Warning: a plain-language explanation of suspicious cues
- Adaptive Human-Centered Warning: stronger interventions for repeated unsafe decisions

Study metrics include:

- click intention
- trust
- comprehension
- decision time
- warning fatigue
- ignored warnings
- risky clicks

Ethical note: this is a demo and research prototype. Do not run a real user study or collect participant data without appropriate IRB or institutional approval, consent, data handling, and debriefing procedures.

## Human-Centered Contribution

SafeGuard AI explains manipulation tactics in language people can use:

- urgency
- fear
- authority pressure
- reward bait
- financial coercion
- impersonation
- suspicious links

The research value is the explanation layer: users see how the message is trying to influence them, not only a technical risk label.

## Future Roadmap

- OCR for screenshots
- `.eml` parsing and email header analysis
- URL reputation enrichment
- model-assisted scoring while preserving explainability
- IRB-ready participant workflow
- longitudinal warning fatigue study
- exportable research packets for PhD application demos and pilot studies

## Notes

This is a local MVP for demonstration and research prototyping. For production use, replace the development token secret, enforce HTTPS, add rate limiting, harden auth/session management, and define a formal privacy/security model for stored evidence.
