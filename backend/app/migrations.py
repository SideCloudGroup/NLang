from __future__ import annotations

from pathlib import Path

import aiosqlite


async def ensure_schema_migrations(db: aiosqlite.Connection) -> None:
    await db.execute(
        """
        CREATE TABLE IF NOT EXISTS schema_migrations
        (
            filename
            TEXT
            PRIMARY
            KEY,
            applied_at
            INTEGER
            NOT
            NULL
        );
        """
    )
    await db.commit()


async def _list_applied(db: aiosqlite.Connection) -> set[str]:
    await ensure_schema_migrations(db)
    cur = await db.execute("SELECT filename FROM schema_migrations;")
    rows = await cur.fetchall()
    return {str(r["filename"]) for r in rows}


async def apply_migrations(db: aiosqlite.Connection, migrations_dir: Path) -> None:
    migrations_dir = migrations_dir.resolve()
    migrations_dir.mkdir(parents=True, exist_ok=True)

    applied = await _list_applied(db)
    files = sorted(p for p in migrations_dir.glob("*.sql") if p.is_file())

    for path in files:
        if path.name in applied:
            continue
        sql = path.read_text(encoding="utf-8")
        await db.execute("BEGIN;")
        try:
            await db.executescript(sql)
            await db.execute(
                "INSERT INTO schema_migrations (filename, applied_at) VALUES (?, strftime('%s','now'));",
                (path.name,),
            )
            await db.commit()
        except Exception:
            await db.execute("ROLLBACK;")
            raise
