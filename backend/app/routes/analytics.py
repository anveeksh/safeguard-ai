from collections import Counter

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app import schemas
from app.auth import get_current_user
from app.database import get_db
from app.models import Scan, User
from app.routes.scan_utils import parse_tactics


router = APIRouter(tags=["analytics"])


@router.get("/analytics", response_model=schemas.AnalyticsResponse)
def analytics(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    scans = db.query(Scan).filter(Scan.user_id == current_user.id).all()
    total = len(scans)
    risk_distribution = {"Low": 0, "Medium": 0, "High": 0, "Critical": 0}
    categories = Counter()
    tactics = Counter()

    for scan in scans:
        risk_distribution[scan.risk_level] = risk_distribution.get(scan.risk_level, 0) + 1
        categories[scan.category] += 1
        tactics.update(parse_tactics(scan.tactics))

    high_risk = risk_distribution.get("High", 0) + risk_distribution.get("Critical", 0)
    average_score = round(sum(scan.risk_score for scan in scans) / total, 1) if total else 0.0

    return schemas.AnalyticsResponse(
        total_scans=total,
        high_risk_scans=high_risk,
        critical_scans=risk_distribution.get("Critical", 0),
        average_risk_score=average_score,
        risk_distribution=risk_distribution,
        common_categories=[schemas.AnalyticsItem(name=name, count=count) for name, count in categories.most_common(5)],
        common_tactics=[schemas.AnalyticsItem(name=name, count=count) for name, count in tactics.most_common(7)],
    )
