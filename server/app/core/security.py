import base64
import hashlib
import hmac
import json
import secrets
from datetime import datetime, timedelta, timezone

from app.core.config import settings


PBKDF2_ITERATIONS = 200_000


def _b64url_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode("ascii")


def _b64url_decode(value: str) -> bytes:
    padding = "=" * (-len(value) % 4)
    return base64.urlsafe_b64decode(f"{value}{padding}")


def hash_password(password: str) -> str:
    salt = secrets.token_bytes(16)
    derived_key = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt,
        PBKDF2_ITERATIONS,
    )
    return f"pbkdf2_sha256${PBKDF2_ITERATIONS}${_b64url_encode(salt)}${_b64url_encode(derived_key)}"


def verify_password(plain_password: str, password_hash: str) -> bool:
    try:
        scheme, iterations_raw, salt_raw, hash_raw = password_hash.split("$", 3)
        if scheme != "pbkdf2_sha256":
            return False

        iterations = int(iterations_raw)
        salt = _b64url_decode(salt_raw)
        expected_hash = _b64url_decode(hash_raw)
    except (ValueError, TypeError):
        return False

    candidate_hash = hashlib.pbkdf2_hmac(
        "sha256",
        plain_password.encode("utf-8"),
        salt,
        iterations,
    )
    return hmac.compare_digest(candidate_hash, expected_hash)


def create_access_token(subject: str) -> str:
    issued_at = datetime.now(timezone.utc)
    expires_at = issued_at + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)

    header = {"alg": settings.JWT_ALGORITHM, "typ": "JWT"}
    payload = {
        "sub": subject,
        "iat": int(issued_at.timestamp()),
        "exp": int(expires_at.timestamp()),
    }

    encoded_header = _b64url_encode(
        json.dumps(header, separators=(",", ":"), sort_keys=True).encode("utf-8"),
    )
    encoded_payload = _b64url_encode(
        json.dumps(payload, separators=(",", ":"), sort_keys=True).encode("utf-8"),
    )
    signing_input = f"{encoded_header}.{encoded_payload}".encode("ascii")
    signature = hmac.new(
        settings.secret_key_resolved.encode("utf-8"),
        signing_input,
        hashlib.sha256,
    ).digest()
    encoded_signature = _b64url_encode(signature)
    return f"{encoded_header}.{encoded_payload}.{encoded_signature}"


def decode_access_token(token: str) -> dict:
    try:
        encoded_header, encoded_payload, encoded_signature = token.split(".")
    except ValueError as error:
        raise ValueError("Invalid token.") from error

    signing_input = f"{encoded_header}.{encoded_payload}".encode("ascii")
    expected_signature = hmac.new(
        settings.secret_key_resolved.encode("utf-8"),
        signing_input,
        hashlib.sha256,
    ).digest()

    if not hmac.compare_digest(_b64url_encode(expected_signature), encoded_signature):
        raise ValueError("Invalid token signature.")

    try:
        header = json.loads(_b64url_decode(encoded_header))
        payload = json.loads(_b64url_decode(encoded_payload))
    except (json.JSONDecodeError, ValueError) as error:
        raise ValueError("Invalid token payload.") from error

    if header.get("alg") != settings.JWT_ALGORITHM:
        raise ValueError("Invalid token algorithm.")

    expires_at = payload.get("exp")
    if not isinstance(expires_at, int):
        raise ValueError("Invalid token expiration.")

    if expires_at < int(datetime.now(timezone.utc).timestamp()):
        raise ValueError("Token has expired.")

    return payload
