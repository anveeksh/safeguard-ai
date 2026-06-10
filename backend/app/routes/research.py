import csv
import io
from collections import Counter

from fastapi import APIRouter, Depends
from fastapi.responses import PlainTextResponse
from sqlalchemy.orm import Session

from app import schemas
from app.auth import get_current_user
from app.database import get_db
from app.models import Scan, User, UserBehaviorMetrics
from app.routes.scan_utils import parse_tactics
from app.services.warnings import (
    WARNING_MODES,
    aggregate_behavior_summary,
    group_metrics_by_mode,
)


router = APIRouter(prefix="/research", tags=["research"])


@router.get("/metrics", response_model=schemas.ResearchMetricsResponse)
def research_metrics(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    metrics = (
        db.query(UserBehaviorMetrics)
        .filter(UserBehaviorMetrics.user_id == current_user.id)
        .order_by(UserBehaviorMetrics.created_at.asc(), UserBehaviorMetrics.id.asc())
        .all()
    )
    scans = db.query(Scan).filter(Scan.user_id == current_user.id).all()
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
                label=metric.created_at.strftime("%b %d"),
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
                user_id=metric.user_id,
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


@router.get("/export.csv")
def export_research_csv(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    metrics = (
        db.query(UserBehaviorMetrics)
        .filter(UserBehaviorMetrics.user_id == current_user.id)
        .order_by(UserBehaviorMetrics.created_at.asc(), UserBehaviorMetrics.id.asc())
        .all()
    )
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(
        [
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
