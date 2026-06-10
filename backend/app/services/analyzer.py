import re
from dataclasses import dataclass
from typing import Dict, List, Sequence
from urllib.parse import urlparse


@dataclass(frozen=True)
class RuleSignal:
    key: str
    label: str
    weight: int
    tactic: str | None
    category_hint: str
    evidence: List[str]
    human_reason: str


class RuleBasedAnalyzer:
    """Rule-based scam analyzer kept separate so an ML model can be added later."""

    URL_RE = re.compile(r"(?:(?:https?://|www\.)[^\s<>()]+)", re.IGNORECASE)

    URGENCY_TERMS = [
        "urgent",
        "immediately",
        "right now",
        "today only",
        "final notice",
        "last chance",
        "act now",
        "within 24 hours",
        "expires today",
        "do not ignore",
        "next 2 hours",
        "limited time",
        "before midnight",
    ]
    PAYMENT_TERMS = [
        "wire transfer",
        "zelle",
        "venmo",
        "cash app",
        "gift card",
        "bitcoin",
        "crypto",
        "processing fee",
        "refundable fee",
        "activation fee",
        "deposit",
        "penalty",
        "fine",
        "invoice attached",
        "bank transfer",
    ]
    CREDENTIAL_TERMS = [
        "verify your account",
        "confirm your password",
        "reset your password",
        "login to continue",
        "account suspended",
        "account locked",
        "security alert",
        "update your payment",
        "password",
        "ssn",
        "social security number",
        "one-time code",
        "otp",
    ]
    JOB_TERMS = [
        "remote data entry",
        "personal assistant",
        "mystery shopper",
        "selected you",
        "reviewed your resume",
        "interview on whatsapp",
        "equipment fee",
        "training check",
        "start immediately",
        "no interview",
        "kindly send your resume",
        "passport photo",
        "work from home",
    ]
    IMMIGRATION_TERMS = [
        "uscis",
        "visa",
        "immigration",
        "deportation",
        "work permit",
        "green card",
        "i-20",
        "sevis",
        "status cancelled",
        "record will be cancelled",
        "immigration penalty",
    ]
    AUTHORITY_TERMS = [
        "irs",
        "fbi",
        "police",
        "government",
        "customs",
        "hr department",
        "payroll",
        "administrator",
        "microsoft support",
        "apple support",
        "bank security team",
        "compliance office",
    ]
    EMOTIONAL_TERMS = [
        "you will be arrested",
        "legal action",
        "your family",
        "avoid consequences",
        "permanently lose",
        "frozen",
        "cancelled",
        "terminated",
        "blacklisted",
        "failure to respond",
    ]
    REWARD_TERMS = [
        "congratulations",
        "you have won",
        "guaranteed",
        "bonus",
        "prize",
        "reward",
        "$95/hour",
        "easy money",
        "high paying",
        "exclusive offer",
        "selected for",
    ]
    IMPERSONATION_TERMS = [
        "official notice",
        "support team",
        "security team",
        "payroll team",
        "hiring manager",
        "recruiter",
        "case officer",
        "agent",
        "representative",
    ]
    SUSPICIOUS_TLDS = {".zip", ".mov", ".top", ".xyz", ".click", ".country", ".ru", ".cn", ".tk", ".gq"}
    SHORTENERS = {
        "bit.ly",
        "tinyurl.com",
        "t.co",
        "goo.gl",
        "ow.ly",
        "is.gd",
        "buff.ly",
        "cutt.ly",
        "rebrand.ly",
        "lnkd.in",
    }

    def analyze(self, content: str, input_type: str = "text") -> Dict:
        normalized = self._normalize(content)
        signals: List[RuleSignal] = []

        signals.extend(self._keyword_signal(normalized, "urgency", self.URGENCY_TERMS, 14, "urgency", "social engineering"))
        signals.extend(
            self._keyword_signal(
                normalized, "payment_request", self.PAYMENT_TERMS, 18, "financial coercion", "financial scam"
            )
        )
        signals.extend(
            self._keyword_signal(normalized, "credential_request", self.CREDENTIAL_TERMS, 20, "fear", "phishing")
        )
        signals.extend(
            self._keyword_signal(normalized, "job_scam_language", self.JOB_TERMS, 18, "reward bait", "fake job scam")
        )
        signals.extend(
            self._keyword_signal(
                normalized, "immigration_pressure", self.IMMIGRATION_TERMS, 20, "fear", "immigration scam"
            )
        )
        signals.extend(
            self._keyword_signal(
                normalized, "authority_language", self.AUTHORITY_TERMS, 12, "authority pressure", "impersonation"
            )
        )
        signals.extend(
            self._keyword_signal(
                normalized, "emotional_manipulation", self.EMOTIONAL_TERMS, 14, "fear", "social engineering"
            )
        )
        signals.extend(
            self._keyword_signal(normalized, "reward_language", self.REWARD_TERMS, 12, "reward bait", "financial scam")
        )
        signals.extend(
            self._keyword_signal(
                normalized, "impersonation_language", self.IMPERSONATION_TERMS, 10, "impersonation", "impersonation"
            )
        )
        signals.extend(self._url_signals(content))
        signals.extend(self._context_signals(normalized))

        risk_score = self._score(signals)
        risk_level = self._risk_level(risk_score)
        tactics = self._tactics(signals)
        category = self._category(signals, risk_score)

        return {
            "risk_level": risk_level,
            "risk_score": risk_score,
            "category": category,
            "tactics": tactics,
            "threat_indicators": self._threat_indicators(signals),
            "explanation_breakdown": self._explanation_breakdown(signals),
            "explanation": self._explanation(signals, risk_level, category, input_type),
            "recommended_action": self._recommended_action(category, risk_level, tactics),
        }

    def _normalize(self, content: str) -> str:
        return re.sub(r"\s+", " ", content.lower()).strip()

    def _keyword_signal(
        self,
        normalized: str,
        key: str,
        terms: Sequence[str],
        weight: int,
        tactic: str,
        category_hint: str,
    ) -> List[RuleSignal]:
        matches = [term for term in terms if term in normalized]
        if not matches:
            return []

        reason_map = {
            "urgency": "It pushes for a fast decision, which can reduce the time someone takes to verify the request.",
            "payment_request": "It asks for money or a payment channel often used in scams because payments are hard to reverse.",
            "credential_request": "It asks for account, password, or identity information that could let someone take over an account.",
            "job_scam_language": "It uses hiring language that appears in fake job scams, especially when paired with fees or identity requests.",
            "immigration_pressure": "It invokes immigration or visa consequences, which can create fear and make the request feel official.",
            "authority_language": "It leans on an institution or authority figure to make the request feel harder to question.",
            "emotional_manipulation": "It uses fear, loss, or consequences to pressure the reader emotionally.",
            "reward_language": "It offers a prize, unusually high pay, or guaranteed benefit to make the request feel tempting.",
            "impersonation_language": "It presents the sender as a trusted role or organization without giving independent proof.",
        }
        return [
            RuleSignal(
                key=key,
                label=key.replace("_", " ").title(),
                weight=weight + min(8, (len(matches) - 1) * 3),
                tactic=tactic,
                category_hint=category_hint,
                evidence=matches[:5],
                human_reason=reason_map.get(key, "It matches a known risky message pattern."),
            )
        ]

    def _url_signals(self, content: str) -> List[RuleSignal]:
        signals: List[RuleSignal] = []
        urls = self.URL_RE.findall(content)
        if not urls:
            return signals

        suspicious_evidence: List[str] = []
        for raw_url in urls:
            parsed = urlparse(raw_url if raw_url.startswith(("http://", "https://")) else f"http://{raw_url}")
            host = (parsed.hostname or "").lower()
            path = parsed.path or ""
            if host in self.SHORTENERS:
                suspicious_evidence.append(f"shortened link: {host}")
            if re.fullmatch(r"\d{1,3}(?:\.\d{1,3}){3}", host):
                suspicious_evidence.append(f"IP address link: {host}")
            if "@" in raw_url:
                suspicious_evidence.append("link contains @ symbol")
            if parsed.scheme == "http":
                suspicious_evidence.append(f"non-HTTPS link: {host}")
            if any(host.endswith(tld) for tld in self.SUSPICIOUS_TLDS):
                suspicious_evidence.append(f"unusual domain ending: {host}")
            if len(host + path) > 90:
                suspicious_evidence.append("very long link")
            if re.search(r"(login|verify|account|secure|wallet|claim|bonus)", host + path, re.IGNORECASE):
                suspicious_evidence.append("link path uses account or verification language")
            if re.search(r"(rnicrosoft|paypa1|g00gle|app1e|secure-.*login|bank-.*verify)", host):
                suspicious_evidence.append(f"lookalike brand pattern: {host}")

        if suspicious_evidence:
            signals.append(
                RuleSignal(
                    key="suspicious_url",
                    label="Suspicious Link",
                    weight=22 + min(12, len(suspicious_evidence) * 3),
                    tactic="suspicious link",
                    category_hint="phishing",
                    evidence=suspicious_evidence[:6],
                    human_reason=(
                        "The link has properties commonly used to hide the real destination or imitate a trusted service."
                    ),
                )
            )
        else:
            signals.append(
                RuleSignal(
                    key="external_url",
                    label="External Link",
                    weight=6,
                    tactic="suspicious link",
                    category_hint="social engineering",
                    evidence=urls[:3],
                    human_reason="It includes an external link, so the destination should be checked before clicking.",
                )
            )
        return signals

    def _context_signals(self, normalized: str) -> List[RuleSignal]:
        signals: List[RuleSignal] = []
        if "whatsapp" in normalized and any(term in normalized for term in ["interview", "visa", "payment", "fee"]):
            signals.append(
                RuleSignal(
                    key="off_platform_pressure",
                    label="Off-Platform Pressure",
                    weight=10,
                    tactic="authority pressure",
                    category_hint="social engineering",
                    evidence=["WhatsApp plus sensitive request"],
                    human_reason="It moves the conversation to a channel where verification and accountability are weaker.",
                )
            )
        if re.search(r"\$\s?\d{2,}|\d{2,}\s?(usd|dollars)", normalized) and any(
            term in normalized for term in ["fee", "deposit", "penalty", "fine", "processing"]
        ):
            signals.append(
                RuleSignal(
                    key="specific_money_pressure",
                    label="Specific Money Pressure",
                    weight=12,
                    tactic="financial coercion",
                    category_hint="financial scam",
                    evidence=["specific amount plus fee/penalty language"],
                    human_reason="It combines a specific amount with a fee or penalty, a pattern that often pressures quick payment.",
                )
            )
        return signals

    def _score(self, signals: Sequence[RuleSignal]) -> int:
        if not signals:
            return 8
        base = sum(signal.weight for signal in signals)
        synergy = 0
        keys = {signal.key for signal in signals}
        if {"urgency", "suspicious_url"} <= keys:
            synergy += 8
        if {"credential_request", "suspicious_url"} <= keys:
            synergy += 10
        if {"payment_request", "authority_language"} <= keys:
            synergy += 8
        if {"job_scam_language", "payment_request"} <= keys:
            synergy += 12
        if {"immigration_pressure", "payment_request"} <= keys:
            synergy += 12
        return max(0, min(100, base + synergy))

    def _risk_level(self, score: int) -> str:
        if score >= 75:
            return "Critical"
        if score >= 50:
            return "High"
        if score >= 25:
            return "Medium"
        return "Low"

    def _tactics(self, signals: Sequence[RuleSignal]) -> List[str]:
        ordered = [
            "urgency",
            "fear",
            "authority pressure",
            "reward bait",
            "financial coercion",
            "impersonation",
            "suspicious link",
        ]
        present = {signal.tactic for signal in signals if signal.tactic}
        return [tactic for tactic in ordered if tactic in present]

    def _threat_indicators(self, signals: Sequence[RuleSignal]) -> List[Dict]:
        indicator_groups = [
            {
                "key": "urgency_language",
                "label": "Urgency language",
                "signal_keys": {"urgency"},
                "reason": "Time pressure can make people act before they verify.",
            },
            {
                "key": "impersonation",
                "label": "Impersonation",
                "signal_keys": {"impersonation_language"},
                "reason": "The sender presents themselves as a trusted person or team without proof.",
            },
            {
                "key": "suspicious_links",
                "label": "Suspicious links",
                "signal_keys": {"suspicious_url", "external_url"},
                "reason": "The message includes a link that should be verified before clicking.",
            },
            {
                "key": "financial_coercion",
                "label": "Financial coercion",
                "signal_keys": {"payment_request", "specific_money_pressure"},
                "reason": "Requests for payments, fees, penalties, or hard-to-reverse transfers increase risk.",
            },
            {
                "key": "authority_pressure",
                "label": "Authority pressure",
                "signal_keys": {"authority_language", "off_platform_pressure"},
                "reason": "Authority cues can make a request feel official even when it is unverified.",
            },
            {
                "key": "emotional_manipulation",
                "label": "Emotional manipulation",
                "signal_keys": {"emotional_manipulation", "immigration_pressure", "credential_request"},
                "reason": "Fear, loss, account access, or status threats can push unsafe decisions.",
            },
        ]
        indicators = []
        for group in indicator_groups:
            matched = [signal for signal in signals if signal.key in group["signal_keys"]]
            impact = sum(signal.weight for signal in matched)
            evidence = []
            for signal in matched:
                evidence.extend(signal.evidence)
            if impact >= 28:
                severity = "high"
            elif impact > 0:
                severity = "medium"
            else:
                severity = "low"
            indicators.append(
                {
                    "key": group["key"],
                    "label": group["label"],
                    "detected": bool(matched),
                    "evidence": evidence[:6],
                    "reason": group["reason"],
                    "severity": severity,
                }
            )
        return indicators

    def _explanation_breakdown(self, signals: Sequence[RuleSignal]) -> List[Dict]:
        return [
            {
                "label": signal.label,
                "tactic": signal.tactic,
                "evidence": signal.evidence[:5],
                "reason": signal.human_reason,
                "impact": signal.weight,
            }
            for signal in sorted(signals, key=lambda item: item.weight, reverse=True)
        ]

    def _category(self, signals: Sequence[RuleSignal], risk_score: int) -> str:
        if risk_score < 18:
            return "safe"

        keys = {signal.key for signal in signals}
        if "job_scam_language" in keys and risk_score >= 25:
            return "fake job scam"
        if "immigration_pressure" in keys and risk_score >= 25:
            return "immigration scam"

        weights: Dict[str, int] = {}
        for signal in signals:
            weights[signal.category_hint] = weights.get(signal.category_hint, 0) + signal.weight

        if weights.get("fake job scam", 0) and weights.get("financial scam", 0):
            weights["fake job scam"] += 15
        if weights.get("immigration scam", 0) and weights.get("financial scam", 0):
            weights["immigration scam"] += 15
        if weights.get("phishing", 0) and any(signal.key == "credential_request" for signal in signals):
            weights["phishing"] += 10

        return max(weights.items(), key=lambda item: item[1])[0] if weights else "social engineering"

    def _explanation(self, signals: Sequence[RuleSignal], risk_level: str, category: str, input_type: str) -> str:
        readable_input_type = (input_type or "message").replace("_", " ")
        if not signals:
            return (
                "This looks low risk based on the current rule set. I did not find strong pressure language, "
                "credential requests, payment demands, or suspicious link patterns. Still verify unexpected "
                "messages through a trusted channel before acting."
            )

        strongest = sorted(signals, key=lambda signal: signal.weight, reverse=True)[:4]
        reasons = []
        for signal in strongest:
            evidence = ", ".join(f"'{item}'" for item in signal.evidence[:3])
            reasons.append(f"{signal.human_reason} Detected cue(s): {evidence}.")

        opening = (
            f"This {readable_input_type} is classified as {risk_level.lower()} risk and most closely matches "
            f"{category}. The concern is not one single word; it is the combination of cues that tries to shape "
            "your decision under pressure."
        )
        closing = (
            "A safer response is to slow the interaction down, avoid using links or contact details inside the "
            "message, and verify the claim through an official website, known phone number, or trusted person."
        )
        return " ".join([opening, *reasons, closing])

    def _recommended_action(self, category: str, risk_level: str, tactics: Sequence[str]) -> str:
        if risk_level in {"High", "Critical"}:
            base = "Do not click links, reply, pay, or share personal information."
        elif risk_level == "Medium":
            base = "Pause before acting and verify the request outside this message."
        else:
            base = "No immediate danger is obvious, but keep using independent verification for unexpected requests."

        category_actions = {
            "phishing": "Go directly to the official website or app instead of using the provided link.",
            "fake job scam": "Contact the employer through a verified company domain and never pay fees to receive a job.",
            "immigration scam": "Check your case only through official immigration portals or a licensed professional.",
            "financial scam": "Call your bank or payment provider using the number on the official website.",
            "impersonation": "Confirm the sender through a separate trusted channel before responding.",
            "social engineering": "Ask a trusted person to review the message before taking action.",
            "safe": "Archive it normally if it matches an expected conversation.",
        }
        tactic_note = ""
        if "suspicious link" in tactics:
            tactic_note = " If you need to inspect the link, use a URL scanner or type the known domain manually."
        return f"{base} {category_actions.get(category, category_actions['social engineering'])}{tactic_note}"


analyzer = RuleBasedAnalyzer()


def analyze_content(content: str, input_type: str = "text") -> Dict:
    return analyzer.analyze(content=content, input_type=input_type)
