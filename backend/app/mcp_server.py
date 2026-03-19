from __future__ import annotations

from fastmcp import FastMCP

from .config import load_config
from .db import connect_sqlite
from .storage import SQLiteEntryStore

mcp = FastMCP(name="NLang")


@mcp.tool(
    name="lookup",
    description="按缩写查询释义列表（免鉴权）。",
)
async def lookup(abbr: str, limit: int = 50, offset: int = 0) -> list[dict]:
    cfg = load_config()
    db = await connect_sqlite(cfg.db_path)
    try:
        store = SQLiteEntryStore(db)
        rows = await store.list_by_abbr(abbr, limit=limit, offset=offset)
        return [r.__dict__ for r in rows]
    finally:
        await db.close()


@mcp.tool(
    name="upsert",
    description="新增一条缩写-释义（需要 api_key）。注意：允许 abbr 重复，也允许 (abbr,value) 重复。",
)
async def upsert(abbr: str, value: str, api_key: str) -> dict:
    cfg = load_config()
    if api_key not in cfg.api_keys:
        raise ValueError("Invalid API key")

    db = await connect_sqlite(cfg.db_path)
    try:
        store = SQLiteEntryStore(db)
        entry = await store.create(abbr, value)
        return entry.__dict__
    finally:
        await db.close()


@mcp.tool(
    name="delete",
    description="按 abbr+value 精确删除词条（需要 api_key）。",
)
async def delete(abbr: str, value: str, api_key: str) -> dict:
    cfg = load_config()
    if api_key not in cfg.api_keys:
        raise ValueError("Invalid API key")

    db = await connect_sqlite(cfg.db_path)
    try:
        store = SQLiteEntryStore(db)
        deleted = await store.delete_by_abbr_value(abbr, value)
        return {"deleted": deleted}
    finally:
        await db.close()


def http_app(path: str = "/mcp"):
    return mcp.http_app(path=path)


async def run_http(host: str, port: int) -> None:
    await mcp.run_async(transport="http", host=host, port=port)


def run_stdio() -> None:
    mcp.run()
