from __future__ import annotations

import uvicorn

from app.config import load_config


def main() -> None:
    cfg = load_config()
    uvicorn.run(
        "app.main:app",
        host=cfg.server_host,
        port=cfg.server_port,
        reload=False,
        log_level="info",
    )


if __name__ == "__main__":
    main()

