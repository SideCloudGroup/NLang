"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { getApiKey, setApiKey } from "@/lib/auth";

export default function AdminLoginPage() {
  const router = useRouter();
  const [apiKey, setApiKeyState] = useState("");

  useEffect(() => {
    const existing = getApiKey();
    if (existing) router.replace("/admin/entries");
  }, [router]);

  function onSubmit() {
    const v = apiKey.trim();
    if (!v) return;
    setApiKey(v);
    router.push("/admin/entries");
  }

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div className="card">
        <h2 style={{ marginTop: 0, marginBottom: 10 }}>后台登录</h2>
        <div className="row">
          <input
            value={apiKey}
            onChange={(e) => setApiKeyState(e.target.value)}
            placeholder="输入 API Key"
            style={{ flex: "1 1 320px" }}
            onKeyDown={(e) => {
              if (e.key === "Enter") onSubmit();
            }}
          />
          <button onClick={onSubmit} disabled={!apiKey.trim()}>
            进入后台
          </button>
        </div>
        <div className="muted" style={{ marginTop: 10 }}>
          API Key 仅保存在当前会话中（关闭标签页后失效）。
        </div>
      </div>

      <div className="card">
        <div className="row" style={{ justifyContent: "space-between" }}>
          <span className="muted">管理功能：增 / 改 / 删</span>
          <Link className="muted" href="/">
            返回查询页
          </Link>
        </div>
      </div>
    </div>
  );
}

