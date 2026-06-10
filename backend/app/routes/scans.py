from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import schemas
from app.auth import get_current_user
from app.database import get_db
from app.models import Scan, User, UserBehaviorMetrics
from app.routes.scan_utils import scan_to_response


router = APIRouter(prefix="/scans", tags=["scans"])


@router.get("", response_model=list[schemas.ScanResponse])
def list_scans(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    scans = (
        db.query(Scan)
        .filter(Scan.user_id == current_user.id)
        .order_by(Scan.created_at.desc(), Scan.id.desc())
        .all()
    )
    return [scan_to_response(scan) for scan in scans]


@router.get("/{scan_id}", response_model=schemas.ScanResponse)
def get_scan(scan_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    scan = db.query(Scan).filter(Scan.id == scan_id, Scan.user_id == current_user.id).first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found.")
    metrics = db.query(UserBehaviorMetrics).filter(UserBehaviorMetrics.user_id == current_user.id).all()
    return scan_to_response(
        scan,
        ignored_warnings=sum(metric.ignored_warnings for metric in metrics),
        risky_clicks=sum(metric.risky_clicks for metric in metrics),
    )
