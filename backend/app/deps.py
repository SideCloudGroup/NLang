from __future__ import annotations

import aiosqlite
from fastapi import Depends

from .db import get_db
from .storage import EntryStore, SQLiteEntryStore


async def get_entry_store(db: aiosqlite.Connection = Depends(get_db)) -> EntryStore:
    return SQLiteEntryStore(db)
