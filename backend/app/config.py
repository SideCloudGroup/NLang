from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path
from typing import Any

try:
    import tomllib  # py>=3.11
except ModuleNotFoundError:  # pragma: no cover
    import tomli as tomllib  # type: ignore[no-redef]


@dataclass(frozen=True)
class AppConfig:
    api_keys: tuple[str, ...]
    db_path: Path
    server_host: str
    server_port: int
    mcp_mount_path: str


def _repo_root() -> Path:
    return Path(__file__).resolve().parents[2]


def _load_toml(path: Path) -> dict[str, Any]:
    with path.open("rb") as f:
        return tomllib.load(f)


def load_config() -> AppConfig:
    config_path = Path(os.environ.get("NLANG_CONFIG", _repo_root() / "config.toml")).resolve()
    raw = _load_toml(config_path)

    api_keys = tuple(str(x) for x in raw.get("api_keys", []))

    db_raw = raw.get("db", {}) or {}
    db_path = Path(str(db_raw.get("path", "backend/data/nlang.db")))
    if not db_path.is_absolute():
        db_path = (_repo_root() / db_path).resolve()

    server_raw = raw.get("server", {}) or {}
    server_host = str(server_raw.get("host", "127.0.0.1"))
    server_port = int(server_raw.get("port", 8000))

    mcp_raw = raw.get("mcp", {}) or {}
    mcp_mount_path = str(mcp_raw.get("mount_path", "/mcp"))

    return AppConfig(
        api_keys=api_keys,
        db_path=db_path,
        server_host=server_host,
        server_port=server_port,
        mcp_mount_path=mcp_mount_path,
    )
