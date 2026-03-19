from __future__ import annotations

from contextlib import asynccontextmanager
from pathlib import Path

import httpx
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastmcp import FastMCP
from fastmcp.server.dependencies import get_http_request
from fastmcp.utilities.lifespan import combine_lifespans

from .config import load_config
from .db import connect_sqlite
from .migrations import apply_migrations
from .routes.entries import router as entries_router


@asynccontextmanager
async def app_lifespan(app: FastAPI):
    cfg = load_config()
    db = await connect_sqlite(cfg.db_path)
    try:
        migrations_dir = Path(__file__).resolve().parents[1] / "migrations"
        await apply_migrations(db, migrations_dir)
    finally:
        await db.close()
    yield

class ForwardMCPAuth(httpx.Auth):
    """将 MCP 客户端请求中的 Authorization header 转发给内部 FastAPI 调用。"""

    def auth_flow(self, request: httpx.Request):
        try:
            mcp_request = get_http_request()
            auth = mcp_request.headers.get("authorization")
            if auth:
                request.headers["Authorization"] = auth
        except Exception:
            pass
        yield request

def create_app() -> FastAPI:
    cfg = load_config()

    api_app = FastAPI(
        title="NLang API",
        version="1.0.0",
        description="NLang 缩写查询与管理接口",
        lifespan=app_lifespan,
    )

    api_app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_methods=["*"],
        allow_headers=["*"],
    )

    api_app.include_router(entries_router)

    # 从现有 FastAPI 自动生成 MCP（OpenAPI -> Tools），并转发 Authorization 以复用 Bearer 鉴权
    mcp = FastMCP.from_fastapi(app=api_app, httpx_client_kwargs={"auth": ForwardMCPAuth()})
    mcp_app = mcp.http_app(path="/")

    combined = FastAPI(
        title="NLang API",
        version="1.0.0",
        description="NLang 缩写查询与管理接口（REST + MCP）",
        routes=[*mcp_app.routes, *api_app.routes],
        lifespan=combine_lifespans(app_lifespan, mcp_app.lifespan),
    )
    combined.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_methods=["*"],
        allow_headers=["*"],
    )
    combined.mount(cfg.mcp_mount_path, mcp_app)
    return combined


app = create_app()
