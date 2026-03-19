from __future__ import annotations

from collections.abc import AsyncIterator
from pathlib import Path

import aiosqlite
from fastapi import Depends

from .config import AppConfig, load_config


async def connect_sqlite(db_path: Path) -> aiosqlite.Connection:
    db_path.parent.mkdir(parents=True, exist_ok=True)
    db = await aiosqlite.connect(db_path.as_posix())
    db.row_factory = aiosqlite.Row
    await db.execute("PRAGMA foreign_keys = ON;")
    await db.execute("PRAGMA journal_mode = WAL;")
    return db


async def get_db(cfg: AppConfig = Depends(load_config)) -> AsyncIterator[aiosqlite.Connection]:
    db = await connect_sqlite(cfg.db_path)
    try:
        yield db
    finally:
        await db.close()
