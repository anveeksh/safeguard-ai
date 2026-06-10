import csv
import io
import json
from collections import Counter

from fastapi import APIRouter, Depends
from fastapi.responses import PlainTextResponse
from sqlalchemy.orm import Session

from app import schemas
from app.auth import get_current_user
from app.database import get_db
from app.demo_examples import DEMO_EXAMPLES
from app.models import Scan, User, UserBehaviorMetrics
from app.routes.scan_utils import parse_tactics
from app.services.analyzer import analyze_content
from app.services.warnings import (
    WARNING_MODES,
    aggregate_behavior_summary,
    group_metrics_by_mode,
    simulate_behavior_metrics,
)


router = APIRouter(prefix="/research", tags=["research"])


def _get_user_metrics(db: Session, user_id: int):
    metrics = (
        db.query(UserBehaviorMetrics)
        .filter(UserBehaviorMetrics.user_id == user_id)
        .order_by(UserBehaviorMetrics.created_at.asc(), UserBehaviorMetrics.id.asc())
        .all()
    )
    return metrics


def _get_user_scans(db: Session, user_id: int):
    return (
        db.query(Scan)
        .filter(Scan.user_id == user_id)
        .order_by(Scan.created_at.asc(), Scan.id.asc())
        .all()
    )


def _build_research_metrics_response(metrics, scans):
    tactic_counter = Counter()
    for scan in scans:
        tactic_counter.update(parse_tactics(scan.tactics))

    comparison = group_metrics_by_mode(metrics)
    trend_rows = metrics[-12:]

    return schemas.ResearchMetricsResponse(
        behavior_summary=schemas.BehaviorSummary(**aggregate_behavior_summary(metrics)),
        condition_comparison=[schemas.WarningConditionComparison(**item) for item in comparison],
        user_behavior_trends=[
            schemas.BehaviorTrendPoint(
                label=f"{metric.created_at.strftime('%b %d')} #{metric.id}",
                ignored_warnings=metric.ignored_warnings,
                risky_clicks=metric.risky_clicks,
                trust_score=metric.trust_score,
                comprehension_score=metric.comprehension_score,
                average_decision_time=metric.average_decision_time,
            )
            for metric in trend_rows
        ],
        warning_effectiveness=[
            schemas.AnalyticsItem(name=item["label"], count=round(item["warning_effectiveness"]))
            for item in comparison
        ],
        phishing_susceptibility=[
            schemas.AnalyticsItem(name=item["label"], count=round(item["phishing_susceptibility"]))
            for item in comparison
        ],
        common_tactics=[
            schemas.AnalyticsItem(name=name, count=count) for name, count in tactic_counter.most_common(7)
        ],
        recent_metrics=[
            schemas.UserBehaviorMetricsResponse(
                id=metric.id,
                user_id=metric.user_id,
                scan_id=metric.scan_id,
                ignored_warnings=metric.ignored_warnings,
                risky_clicks=metric.risky_clicks,
                average_decision_time=metric.average_decision_time,
                trust_score=metric.trust_score,
                comprehension_score=metric.comprehension_score,
                warning_mode_used=metric.warning_mode_used,
                created_at=metric.created_at,
            )
            for metric in reversed(metrics[-20:])
        ],
        csv_export_ready=True,
    )


def _seed_demo_events_for_user(db: Session, user: User):
    db.query(UserBehaviorMetrics).filter(UserBehaviorMetrics.user_id == user.id).delete(synchronize_session=False)
    db.query(Scan).filter(Scan.user_id == user.id).delete(synchronize_session=False)
    db.flush()

    demo_metric_inputs = [
        ("traditional_warning", "clicked"),
        ("explainable_ai_warning", None),
        ("adaptive_human_centered_warning", None),
        ("explainable_ai_warning", None),
    ]
    prior_ignored = 0
    prior_risky_clicks = 0

    for index, example in enumerate(DEMO_EXAMPLES):
        warning_mode, decision = demo_metric_inputs[index % len(demo_metric_inputs)]
        result = analyze_content(example["content"], example["input_type"])
        scan = Scan(
            user_id=user.id,
            input_type=example["input_type"],
            input_content=example["content"],
            risk_level=result["risk_level"],
            risk_score=result["risk_score"],
            category=result["category"],
            tactics=json.dumps(result["tactics"]),
            structured_metadata=json.dumps(
                {
                    "evidence_type": example["input_type"],
                    "seeded_demo": True,
                    "warning_mode_used": warning_mode,
                    "evidence_label": example["title"],
                }
            ),
            explanation=result["explanation"],
            recommended_action=result["recommended_action"],
        )
        db.add(scan)
        db.flush()

        behavior = simulate_behavior_metrics(
            result=result,
            warning_mode=warning_mode,
            prior_ignored=prior_ignored,
            prior_risky_clicks=prior_risky_clicks,
            user_decision=decision,
        )
        db.add(UserBehaviorMetrics(user_id=user.id, scan_id=scan.id, **behavior))
        prior_ignored += behavior["ignored_warnings"]
        prior_risky_clicks += behavior["risky_clicks"]


@router.get("/metrics", response_model=schemas.ResearchMetricsResponse)
def research_metrics(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    metrics = _get_user_metrics(db, current_user.id)
    scans = _get_user_scans(db, current_user.id)
    return _build_research_metrics_response(metrics, scans)


@router.post("/reset-demo-data", response_model=schemas.ResearchMetricsResponse)
def reset_demo_data(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    _seed_demo_events_for_user(db, current_user)
    db.commit()
    metrics = _get_user_metrics(db, current_user.id)
    scans = _get_user_scans(db, current_user.id)
    return _build_research_metrics_response(metrics, scans)


@router.get("/export.csv")
def export_research_csv(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    metrics = _get_user_metrics(db, current_user.id)
    scans = _get_user_scans(db, current_user.id)
    dashboard_metrics = _build_research_metrics_response(metrics, scans)
    output = io.StringIO()
    writer = csv.writer(output)

    writer.writerow(["section", "field", "value"])
    summary = dashboard_metrics.behavior_summary
    for field, value in summary.model_dump().items():
        writer.writerow(["behavior_summary", field, value])
    writer.writerow([])

    writer.writerow(
        [
            "section",
            "warning_mode_used",
            "label",
            "total_sessions",
            "ignored_warnings",
            "risky_clicks",
            "average_decision_time",
            "average_trust_score",
            "average_comprehension_score",
            "warning_effectiveness",
            "click_through_rate",
            "phishing_susceptibility",
        ]
    )
    for row in dashboard_metrics.condition_comparison:
        writer.writerow(["condition_comparison", *row.model_dump().values()])
    writer.writerow([])

    writer.writerow(
        [
            "section",
            "label",
            "ignored_warnings",
            "risky_clicks",
            "trust_score",
            "comprehension_score",
            "average_decision_time",
        ]
    )
    for row in dashboard_metrics.user_behavior_trends:
        writer.writerow(["user_behavior_trends", *row.model_dump().values()])
    writer.writerow([])

    writer.writerow(["section", "name", "count"])
    for item in dashboard_metrics.common_tactics:
        writer.writerow(["common_tactics", item.name, item.count])
    writer.writerow([])

    writer.writerow(
        [
            "section",
            "id",
            "scan_id",
            "user_id",
            "ignored_warnings",
            "risky_clicks",
            "average_decision_time",
            "trust_score",
            "comprehension_score",
            "warning_mode_used",
            "warning_condition_label",
            "created_at",
        ]
    )
    for metric in metrics:
        writer.writerow(
            [
                "study_event",
                metric.id,
                metric.scan_id,
                metric.user_id,
                metric.ignored_warnings,
                metric.risky_clicks,
                metric.average_decision_time,
                metric.trust_score,
                metric.comprehension_score,
                metric.warning_mode_used,
                WARNING_MODES.get(metric.warning_mode_used, WARNING_MODES["explainable_ai_warning"])["label"],
                metric.created_at.isoformat(),
            ]
        )

    return PlainTextResponse(
        output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=safeguard-ai-study-metrics.csv"},
    )
