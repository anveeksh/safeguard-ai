import os

from sqlalchemy import create_engine, text
from sqlalchemy.orm import declarative_base, sessionmaker


DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./safeguard_ai.db")

connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def init_db():
    from app import models  # noqa: F401

    Base.metadata.create_all(bind=engine)
    _run_sqlite_migrations()


def _run_sqlite_migrations():
    if not DATABASE_URL.startswith("sqlite"):
        return

    with engine.begin() as connection:
        scan_columns = [row[1] for row in connection.execute(text("PRAGMA table_info(scans)")).fetchall()]
        if "structured_metadata" not in scan_columns:
            connection.execute(text("ALTER TABLE scans ADD COLUMN structured_metadata TEXT DEFAULT '{}'"))

        metric_columns = [
            row[1] for row in connection.execute(text("PRAGMA table_info(user_behavior_metrics)")).fetchall()
        ]
        if metric_columns and "scan_id" not in metric_columns:
            connection.execute(text("ALTER TABLE user_behavior_metrics ADD COLUMN scan_id INTEGER"))
            connection.execute(
                text("CREATE INDEX IF NOT EXISTS ix_user_behavior_metrics_scan_id ON user_behavior_metrics (scan_id)")
            )


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
