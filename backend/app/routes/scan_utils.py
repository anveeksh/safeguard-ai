import json
from typing import Any, Dict, List

from app import schemas
from app.models import Scan
from app.services.analyzer import analyze_content
from app.services.warnings import build_warning_condition


def parse_tactics(raw_tactics: str) -> List[str]:
    try:
        value = json.loads(raw_tactics or "[]")
        return value if isinstance(value, list) else []
    except json.JSONDecodeError:
        return []


def parse_structured_metadata(raw_metadata: str) -> Dict[str, Any]:
    try:
        value = json.loads(raw_metadata or "{}")
        return value if isinstance(value, dict) else {}
    except json.JSONDecodeError:
        return {}


def scan_to_response(
    scan: Scan,
    warning_mode: str | None = "explainable_ai_warning",
    ignored_warnings: int = 0,
    risky_clicks: int = 0,
) -> schemas.ScanResponse:
    derived = analyze_content(scan.input_content, scan.input_type)
    return schemas.ScanResponse(
        id=scan.id,
        user_id=scan.user_id,
        input_type=scan.input_type,
        input_content=scan.input_content,
        risk_level=scan.risk_level,
        risk_score=scan.risk_score,
        category=scan.category,
        tactics=parse_tactics(scan.tactics),
        structured_metadata=parse_structured_metadata(getattr(scan, "structured_metadata", "{}")),
        threat_indicators=derived["threat_indicators"],
        explanation_breakdown=derived["explanation_breakdown"],
        warning_condition=build_warning_condition(
            warning_mode=warning_mode,
            risk_level=scan.risk_level,
            category=scan.category,
            explanation=scan.explanation,
            ignored_warnings=ignored_warnings,
            risky_clicks=risky_clicks,
        ),
        explanation=scan.explanation,
        recommended_action=scan.recommended_action,
        created_at=scan.created_at,
    )
