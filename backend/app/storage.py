from __future__ import annotations

from dataclasses import dataclass
from typing import Protocol

import aiosqlite


@dataclass(frozen=True)
class Entry:
    id: int
    abbr: str
    value: str
    created_at: int
    updated_at: int


class EntryStore(Protocol):
    async def exists_abbr_value(self, abbr: str, value: str) -> bool: ...

    async def list_by_abbr(self, abbr: str, *, limit: int, offset: int) -> list[Entry]: ...

    async def create(self, abbr: str, value: str) -> Entry: ...

    async def update_by_abbr_value(
            self,
            abbr: str,
            value: str,
            *,
            new_abbr: str | None,
            new_value: str | None,
    ) -> int: ...

    async def delete_by_abbr_value(self, abbr: str, value: str) -> int: ...


def _row_to_entry(row: aiosqlite.Row) -> Entry:
    return Entry(
        id=int(row["id"]),
        abbr=str(row["abbr"]),
        value=str(row["value"]),
        created_at=int(row["created_at"]),
        updated_at=int(row["updated_at"]),
    )


class SQLiteEntryStore:
    def __init__(self, db: aiosqlite.Connection) -> None:
        self._db = db

    async def exists_abbr_value(self, abbr: str, value: str) -> bool:
        cur = await self._db.execute(
            "SELECT 1 FROM entries WHERE abbr = ? AND value = ? LIMIT 1;",
            (abbr, value),
        )
        row = await cur.fetchone()
        return row is not None

    async def list_by_abbr(self, abbr: str, *, limit: int, offset: int) -> list[Entry]:
        cur = await self._db.execute(
            """
            SELECT id, abbr, value, created_at, updated_at
            FROM entries
            WHERE abbr = ?
            ORDER BY updated_at DESC, id DESC LIMIT ?
            OFFSET ?;
            """,
            (abbr, int(limit), int(offset)),
        )
        rows = await cur.fetchall()
        return [_row_to_entry(r) for r in rows]

    async def create(self, abbr: str, value: str) -> Entry:
        cur = await self._db.execute(
            """
            INSERT INTO entries (abbr, value)
            VALUES (?, ?) RETURNING id, abbr, value, created_at, updated_at;
            """,
            (abbr, value),
        )
        row = await cur.fetchone()
        await self._db.commit()
        assert row is not None
        return _row_to_entry(row)

    async def update_by_abbr_value(
            self,
            abbr: str,
            value: str,
            *,
            new_abbr: str | None,
            new_value: str | None,
    ) -> int:
        sets: list[str] = []
        params: list[object] = []
        if new_abbr is not None:
            sets.append("abbr = ?")
            params.append(new_abbr)
        if new_value is not None:
            sets.append("value = ?")
            params.append(new_value)
        if not sets:
            return 0

        sets.append("updated_at = strftime('%s','now')")
        params.extend([abbr, value])

        cur = await self._db.execute(
            f"""
            UPDATE entries
            SET {", ".join(sets)}
            WHERE abbr = ? AND value = ?;
            """,
            tuple(params),
        )
        await self._db.commit()
        return int(cur.rowcount or 0)

    async def delete_by_abbr_value(self, abbr: str, value: str) -> int:
        cur = await self._db.execute(
            "DELETE FROM entries WHERE abbr = ? AND value = ?;",
            (abbr, value),
        )
        await self._db.commit()
        return int(cur.rowcount or 0)
