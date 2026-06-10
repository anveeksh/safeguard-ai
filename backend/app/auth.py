import base64
import hashlib
import hmac
import json
import os
import secrets
from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User


SECRET_KEY = os.getenv("SECRET_KEY", "dev-change-me-safe-guard-ai")
TOKEN_EXPIRE_HOURS = int(os.getenv("TOKEN_EXPIRE_HOURS", "24"))
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def _b64encode(raw: bytes) -> str:
    return base64.urlsafe_b64encode(raw).rstrip(b"=").decode("utf-8")


def _b64decode(value: str) -> bytes:
    padding = "=" * (-len(value) % 4)
    return base64.urlsafe_b64decode(value + padding)


def hash_password(password: str) -> str:
    salt = secrets.token_hex(16)
    iterations = 120_000
    digest = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt.encode("utf-8"), iterations)
    return f"pbkdf2_sha256${iterations}${salt}${_b64encode(digest)}"


def verify_password(password: str, stored_hash: str) -> bool:
    try:
        algorithm, iterations_raw, salt, expected = stored_hash.split("$", 3)
        if algorithm != "pbkdf2_sha256":
            return False
        iterations = int(iterations_raw)
        digest = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt.encode("utf-8"), iterations)
        return hmac.compare_digest(_b64encode(digest), expected)
    except (ValueError, TypeError):
        return False


def create_access_token(user_id: int) -> str:
    expires_at = datetime.now(timezone.utc) + timedelta(hours=TOKEN_EXPIRE_HOURS)
    payload = {"sub": str(user_id), "exp": int(expires_at.timestamp())}
    encoded_payload = _b64encode(json.dumps(payload, separators=(",", ":")).encode("utf-8"))
    signature = hmac.new(SECRET_KEY.encode("utf-8"), encoded_payload.encode("utf-8"), hashlib.sha256).digest()
    return f"{encoded_payload}.{_b64encode(signature)}"


def decode_access_token(token: str) -> Optional[dict]:
    try:
        encoded_payload, encoded_signature = token.split(".", 1)
        expected_signature = hmac.new(
            SECRET_KEY.encode("utf-8"), encoded_payload.encode("utf-8"), hashlib.sha256
        ).digest()
        if not hmac.compare_digest(_b64encode(expected_signature), encoded_signature):
            return None
        payload = json.loads(_b64decode(encoded_payload))
        if int(payload.get("exp", 0)) < int(datetime.now(timezone.utc).timestamp()):
            return None
        return payload
    except (ValueError, TypeError, json.JSONDecodeError):
        return None


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    credentials_error = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials.",
        headers={"WWW-Authenticate": "Bearer"},
    )
    payload = decode_access_token(token)
    if not payload or not payload.get("sub"):
        raise credentials_error

    user = db.query(User).filter(User.id == int(payload["sub"])).first()
    if not user:
        raise credentials_error
    return user
