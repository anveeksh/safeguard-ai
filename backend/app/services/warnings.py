from collections import Counter
from statistics import mean
from typing import Dict, Iterable, List, Sequence


WARNING_MODES = {
    "traditional_warning": {
        "label": "Traditional Warning",
        "description": "Simple red danger alert with minimal explanation.",
    },
    "explainable_ai_warning": {
        "label": "Explainable AI Warning",
        "description": "Plain-language explanation of why the content is suspicious.",
    },
    "adaptive_human_centered_warning": {
        "label": "Adaptive Human-Centered Warning",
        "description": "Warning strength adapts to prior unsafe decisions and comprehension needs.",
    },
}


def normalize_warning_mode(mode: str | None) -> str:
    if mode in WARNING_MODES:
        return mode
    return "explainable_ai_warning"


def warning_mode_label(mode: str | None) -> str:
    return WARNING_MODES[normalize_warning_mode(mode)]["label"]


def build_warning_condition(
    warning_mode: str | None,
    risk_level: str,
    category: str,
    explanation: str,
    ignored_warnings: int = 0,
    risky_clicks: int = 0,
) -> Dict:
    mode = normalize_warning_mode(warning_mode)
    high_risk = risk_level in {"High", "Critical"}
    repeated_risk = ignored_warnings + risky_clicks >= 3

    if mode == "traditional_warning":
        return {
            "key": mode,
            "title": "Traditional Warning",
            "description": WARNING_MODES[mode]["description"],
            "intervention_level": "Basic alert",
            "tone": "danger",
            "primary_message": "Danger: this content may be unsafe.",
            "supporting_points": [
                "Do not click suspicious links.",
                "Do not share passwords, money, documents, or one-time codes.",
                "Verify the request through an official channel.",
            ],
        }

    if mode == "adaptive_human_centered_warning":
        intervention = "High-friction pause" if high_risk or repeated_risk else "Guided caution"
        behavior_note = (
            f"Prior study behavior shows {ignored_warnings} ignored warning(s) and {risky_clicks} risky click(s)."
            if ignored_warnings or risky_clicks
            else "No prior unsafe decisions are recorded for this user."
        )
        return {
            "key": mode,
            "title": "Adaptive Human-Centered Warning",
            "description": WARNING_MODES[mode]["description"],
            "intervention_level": intervention,
            "tone": "adaptive",
            "primary_message": (
                f"Pause before acting: this {category} warning is being strengthened because the risk is "
                f"{risk_level.lower()}."
            ),
            "supporting_points": [
                behavior_note,
                "This warning emphasizes the safest next action before the user continues.",
                "Repeated unsafe behavior increases friction and asks for independent verification.",
            ],
        }

    return {
        "key": mode,
        "title": "Explainable AI Warning",
        "description": WARNING_MODES[mode]["description"],
        "intervention_level": "Explain and redirect",
        "tone": "explanatory",
        "primary_message": f"This was flagged as {risk_level.lower()} risk because it matches {category} patterns.",
        "supporting_points": [
            explanation[:220] + ("..." if len(explanation) > 220 else ""),
            "The warning focuses on the manipulation tactic, not only the content label.",
            "The safest path is to verify outside the message before acting.",
        ],
    }


def simulate_behavior_metrics(
    result: Dict,
    warning_mode: str | None,
    prior_ignored: int = 0,
    prior_risky_clicks: int = 0,
    decision_time_seconds: float | None = None,
    user_decision: str | None = None,
) -> Dict:
    mode = normalize_warning_mode(warning_mode)
    risk_score = int(result.get("risk_score", 0))
    risk_level = result.get("risk_level", "Low")
    high_risk = risk_level in {"High", "Critical"}
    clicked = (user_decision or "").strip().lower() in {"clicked", "proceeded", "unsafe", "continue"}
    dismissed = (user_decision or "").strip().lower() in {"ignored", "dismissed"}

    if user_decision:
        ignored = 1 if dismissed and high_risk else 0
        risky_clicks = 1 if clicked and high_risk else 0
    elif mode == "traditional_warning":
        ignored = 1 if high_risk else 0
        risky_clicks = 1 if risk_score >= 75 else 0
    elif mode == "explainable_ai_warning":
        ignored = 1 if risk_score >= 90 else 0
        risky_clicks = 1 if risk_score >= 95 else 0
    else:
        ignored = 1 if risk_score >= 98 and prior_risky_clicks > 4 else 0
        risky_clicks = 0

    mode_time = {
        "traditional_warning": 5.8,
        "explainable_ai_warning": 9.6,
        "adaptive_human_centered_warning": 12.4,
    }[mode]
    decision_time = decision_time_seconds or mode_time + (risk_score * 0.04) + min(3.5, (prior_ignored + prior_risky_clicks) * 0.2)

    mode_scores = {
        "traditional_warning": (62, 58),
        "explainable_ai_warning": (79, 84),
        "adaptive_human_centered_warning": (85, 89),
    }
    trust_base, comprehension_base = mode_scores[mode]
    risk_adjustment = min(8, risk_score / 18)

    return {
        "ignored_warnings": ignored,
        "risky_clicks": risky_clicks,
        "average_decision_time": round(decision_time, 1),
        "trust_score": round(max(0, min(100, trust_base - risk_adjustment + (2 if not ignored else -4))), 1),
        "comprehension_score": round(max(0, min(100, comprehension_base - risk_adjustment + (3 if mode != "traditional_warning" else 0))), 1),
        "warning_mode_used": mode,
    }


def aggregate_behavior_summary(metrics: Sequence) -> Dict:
    if not metrics:
        return {
            "total_sessions": 0,
            "ignored_warnings": 0,
            "risky_clicks": 0,
            "average_decision_time": 0.0,
            "trust_score": 0.0,
            "comprehension_score": 0.0,
            "dominant_warning_mode": "explainable_ai_warning",
        }

    modes = Counter(metric.warning_mode_used for metric in metrics)
    return {
        "total_sessions": len(metrics),
        "ignored_warnings": sum(metric.ignored_warnings for metric in metrics),
        "risky_clicks": sum(metric.risky_clicks for metric in metrics),
        "average_decision_time": round(mean(metric.average_decision_time for metric in metrics), 1),
        "trust_score": round(mean(metric.trust_score for metric in metrics), 1),
        "comprehension_score": round(mean(metric.comprehension_score for metric in metrics), 1),
        "dominant_warning_mode": modes.most_common(1)[0][0],
    }


def comparison_for_mode(mode: str, metrics: Sequence) -> Dict:
    sessions = len(metrics)
    ignored = sum(metric.ignored_warnings for metric in metrics)
    risky_clicks = sum(metric.risky_clicks for metric in metrics)
    avg_time = round(mean(metric.average_decision_time for metric in metrics), 1) if metrics else 0.0
    avg_trust = round(mean(metric.trust_score for metric in metrics), 1) if metrics else 0.0
    avg_comp = round(mean(metric.comprehension_score for metric in metrics), 1) if metrics else 0.0
    unsafe_rate = ((ignored + risky_clicks) / max(1, sessions * 2)) * 100
    click_rate = (risky_clicks / max(1, sessions)) * 100
    susceptibility = min(100, (click_rate * 0.7) + ((ignored / max(1, sessions)) * 100 * 0.3))

    return {
        "warning_mode_used": mode,
        "label": warning_mode_label(mode),
        "total_sessions": sessions,
        "ignored_warnings": ignored,
        "risky_clicks": risky_clicks,
        "average_decision_time": avg_time,
        "average_trust_score": avg_trust,
        "average_comprehension_score": avg_comp,
        "warning_effectiveness": round(max(0, 100 - unsafe_rate), 1),
        "click_through_rate": round(click_rate, 1),
        "phishing_susceptibility": round(susceptibility, 1),
    }


def group_metrics_by_mode(metrics: Iterable) -> List[Dict]:
    metric_list = list(metrics)
    return [
        comparison_for_mode(mode, [metric for metric in metric_list if metric.warning_mode_used == mode])
        for mode in WARNING_MODES
    ]
