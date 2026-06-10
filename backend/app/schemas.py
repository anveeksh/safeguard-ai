from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel


class UserCreate(BaseModel):
    email: str
    password: str


class UserLogin(BaseModel):
    email: str
    password: str


class UserPublic(BaseModel):
    id: int
    email: str
    created_at: datetime

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserPublic


class AnalyzeRequest(BaseModel):
    input_type: Optional[str] = "text"
    input_content: str
    structured_metadata: Optional[Dict[str, Any]] = None
    warning_mode_used: Optional[str] = "explainable_ai_warning"
    decision_time_seconds: Optional[float] = None
    user_decision: Optional[str] = None


class ThreatIndicator(BaseModel):
    key: str
    label: str
    detected: bool
    evidence: List[str]
    reason: str
    severity: str


class ExplanationSignal(BaseModel):
    label: str
    tactic: Optional[str] = None
    evidence: List[str]
    reason: str
    impact: int


class WarningCondition(BaseModel):
    key: str
    title: str
    description: str
    intervention_level: str
    tone: str
    primary_message: str
    supporting_points: List[str]


class ScanResponse(BaseModel):
    id: int
    user_id: int
    input_type: str
    input_content: str
    risk_level: str
    risk_score: int
    category: str
    tactics: List[str]
    structured_metadata: Dict[str, Any]
    threat_indicators: List[ThreatIndicator]
    explanation_breakdown: List[ExplanationSignal]
    warning_condition: WarningCondition
    explanation: str
    recommended_action: str
    created_at: datetime


class AnalyticsItem(BaseModel):
    name: str
    count: int


class AnalyticsResponse(BaseModel):
    total_scans: int
    high_risk_scans: int
    critical_scans: int
    average_risk_score: float
    risk_distribution: Dict[str, int]
    common_categories: List[AnalyticsItem]
    common_tactics: List[AnalyticsItem]


class UserBehaviorMetricsResponse(BaseModel):
    user_id: int
    ignored_warnings: int
    risky_clicks: int
    average_decision_time: float
    trust_score: float
    comprehension_score: float
    warning_mode_used: str
    created_at: datetime


class BehaviorSummary(BaseModel):
    total_sessions: int
    ignored_warnings: int
    risky_clicks: int
    average_decision_time: float
    trust_score: float
    comprehension_score: float
    dominant_warning_mode: str


class WarningConditionComparison(BaseModel):
    warning_mode_used: str
    label: str
    total_sessions: int
    ignored_warnings: int
    risky_clicks: int
    average_decision_time: float
    average_trust_score: float
    average_comprehension_score: float
    warning_effectiveness: float
    click_through_rate: float
    phishing_susceptibility: float


class BehaviorTrendPoint(BaseModel):
    label: str
    ignored_warnings: int
    risky_clicks: int
    trust_score: float
    comprehension_score: float
    average_decision_time: float


class ResearchMetricsResponse(BaseModel):
    behavior_summary: BehaviorSummary
    condition_comparison: List[WarningConditionComparison]
    user_behavior_trends: List[BehaviorTrendPoint]
    warning_effectiveness: List[AnalyticsItem]
    phishing_susceptibility: List[AnalyticsItem]
    common_tactics: List[AnalyticsItem]
    recent_metrics: List[UserBehaviorMetricsResponse]
    csv_export_ready: bool
