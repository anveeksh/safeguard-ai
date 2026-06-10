import json

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app import schemas
from app.auth import get_current_user
from app.database import get_db
from app.models import Scan, User, UserBehaviorMetrics
from app.routes.scan_utils import scan_to_response
from app.services.analyzer import analyze_content
from app.services.warnings import normalize_warning_mode, simulate_behavior_metrics


router = APIRouter(tags=["analysis"])


@router.post("/analyze", response_model=schemas.ScanResponse, status_code=status.HTTP_201_CREATED)
def analyze(
    payload: schemas.AnalyzeRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    content = payload.input_content.strip()
    input_type = (payload.input_type or "text").strip().lower()

    if not content:
        raise HTTPException(status_code=400, detail="Input content cannot be empty.")
    if len(content) > 10_000:
        raise HTTPException(status_code=400, detail="Input content is too long for this MVP scan limit.")

    result = analyze_content(content=content, input_type=input_type)
    warning_mode = normalize_warning_mode(payload.warning_mode_used)
    previous_metrics = db.query(UserBehaviorMetrics).filter(UserBehaviorMetrics.user_id == current_user.id).all()
    prior_ignored = sum(metric.ignored_warnings for metric in previous_metrics)
    prior_risky_clicks = sum(metric.risky_clicks for metric in previous_metrics)

    scan = Scan(
        user_id=current_user.id,
        input_type=input_type,
        input_content=content,
        risk_level=result["risk_level"],
        risk_score=result["risk_score"],
        category=result["category"],
        tactics=json.dumps(result["tactics"]),
        structured_metadata=json.dumps(payload.structured_metadata or {}),
        explanation=result["explanation"],
        recommended_action=result["recommended_action"],
    )
    db.add(scan)
    behavior = simulate_behavior_metrics(
        result=result,
        warning_mode=warning_mode,
        prior_ignored=prior_ignored,
        prior_risky_clicks=prior_risky_clicks,
        decision_time_seconds=payload.decision_time_seconds,
        user_decision=payload.user_decision,
    )
    db.add(UserBehaviorMetrics(user_id=current_user.id, **behavior))
    db.commit()
    db.refresh(scan)

    return scan_to_response(
        scan,
        warning_mode=warning_mode,
        ignored_warnings=prior_ignored + behavior["ignored_warnings"],
        risky_clicks=prior_risky_clicks + behavior["risky_clicks"],
    )
