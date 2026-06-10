import json

from app.auth import hash_password
from app.database import SessionLocal, init_db
from app.demo_examples import DEMO_EXAMPLES
from app.models import Scan, User, UserBehaviorMetrics
from app.services.analyzer import analyze_content
from app.services.warnings import simulate_behavior_metrics


DEMO_EMAIL = "demo@safeguard.ai"
DEMO_PASSWORD = "demo1234"


def seed():
    init_db()
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == DEMO_EMAIL).first()
        if not user:
            user = User(email=DEMO_EMAIL, hashed_password=hash_password(DEMO_PASSWORD))
            db.add(user)
            db.commit()
            db.refresh(user)

        existing_count = db.query(Scan).filter(Scan.user_id == user.id).count()
        if existing_count == 0:
            for example in DEMO_EXAMPLES:
                result = analyze_content(example["content"], example["input_type"])
                db.add(
                    Scan(
                        user_id=user.id,
                        input_type=example["input_type"],
                        input_content=example["content"],
                        risk_level=result["risk_level"],
                        risk_score=result["risk_score"],
                        category=result["category"],
                        tactics=json.dumps(result["tactics"]),
                        structured_metadata=json.dumps({"evidence_type": example["input_type"], "seeded_demo": True}),
                        explanation=result["explanation"],
                        recommended_action=result["recommended_action"],
                    )
                )
            db.commit()

        metric_count = db.query(UserBehaviorMetrics).filter(UserBehaviorMetrics.user_id == user.id).count()
        if metric_count == 0:
            demo_metric_inputs = [
                ("traditional_warning", 0, 0, "clicked"),
                ("traditional_warning", 1, 1, "ignored"),
                ("explainable_ai_warning", 2, 1, None),
                ("explainable_ai_warning", 2, 1, None),
                ("adaptive_human_centered_warning", 2, 1, None),
                ("adaptive_human_centered_warning", 2, 1, None),
            ]
            examples = DEMO_EXAMPLES * 2
            for index, (mode, prior_ignored, prior_clicks, decision) in enumerate(demo_metric_inputs):
                example = examples[index]
                result = analyze_content(example["content"], example["input_type"])
                behavior = simulate_behavior_metrics(
                    result=result,
                    warning_mode=mode,
                    prior_ignored=prior_ignored,
                    prior_risky_clicks=prior_clicks,
                    user_decision=decision,
                )
                db.add(UserBehaviorMetrics(user_id=user.id, **behavior))
            db.commit()

        print(f"Seeded demo account: {DEMO_EMAIL} / {DEMO_PASSWORD}")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
