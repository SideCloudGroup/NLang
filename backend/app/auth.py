from __future__ import annotations

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from .config import AppConfig, load_config

_security = HTTPBearer(auto_error=False)


def get_config() -> AppConfig:
    return load_config()


def validate_api_key(token: str, cfg: AppConfig) -> None:
    if token not in cfg.api_keys:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid API key",
        )


def require_api_key(
        credentials: HTTPAuthorizationCredentials | None = Depends(_security),
        cfg: AppConfig = Depends(get_config),
) -> str:
    if credentials is None or credentials.scheme.lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing bearer token",
        )
    token = credentials.credentials
    validate_api_key(token, cfg)
    return token
