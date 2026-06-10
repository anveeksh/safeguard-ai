from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(512), nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    scans = relationship("Scan", back_populates="user", cascade="all, delete-orphan")
    behavior_metrics = relationship("UserBehaviorMetrics", back_populates="user", cascade="all, delete-orphan")


class Scan(Base):
    __tablename__ = "scans"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    input_type = Column(String(50), nullable=False, default="text")
    input_content = Column(Text, nullable=False)
    risk_level = Column(String(20), nullable=False)
    risk_score = Column(Integer, nullable=False)
    category = Column(String(80), nullable=False)
    tactics = Column(Text, nullable=False, default="[]")
    structured_metadata = Column(Text, nullable=False, default="{}")
    explanation = Column(Text, nullable=False)
    recommended_action = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), index=True)

    user = relationship("User", back_populates="scans")


class UserBehaviorMetrics(Base):
    __tablename__ = "user_behavior_metrics"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    ignored_warnings = Column(Integer, nullable=False, default=0)
    risky_clicks = Column(Integer, nullable=False, default=0)
    average_decision_time = Column(Float, nullable=False, default=0.0)
    trust_score = Column(Float, nullable=False, default=0.0)
    comprehension_score = Column(Float, nullable=False, default=0.0)
    warning_mode_used = Column(String(80), nullable=False, default="explainable_ai_warning", index=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), index=True)

    user = relationship("User", back_populates="behavior_metrics")
