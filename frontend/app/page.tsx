"use client";

import { useMemo, useState } from "react";

import { listEntries, type Entry } from "@/lib/api";

export default function HomePage() {
  const [abbr, setAbbr] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<Entry[]>([]);

  const canSearch = useMemo(() => abbr.trim().length > 0, [abbr]);

  async function onSearch() {
    if (!canSearch) return;
    setLoading(true);
    setError(null);
    try {
      const res = await listEntries(abbr.trim());
      setItems(res);
    } catch (e) {
      setItems([]);
      setError(e instanceof Error ? e.message : "请求失败");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div className="card">
        <h2 style={{ marginTop: 0, marginBottom: 10 }}>缩写查询</h2>
        <div className="row">
          <input
            value={abbr}
            onChange={(e) => setAbbr(e.target.value)}
            placeholder="输入缩写，例如 n / sbs / nlk"
            style={{ flex: "1 1 320px" }}
            onKeyDown={(e) => {
              if (e.key === "Enter") onSearch();
            }}
          />
          <button onClick={onSearch} disabled={!canSearch || loading}>
            {loading ? "查询中…" : "查询"}
          </button>
        </div>
        {error ? <div style={{ marginTop: 10, color: "var(--danger)" }}>{error}</div> : null}
        <div className="muted" style={{ marginTop: 10 }}>
          结果支持一条缩写对应多条释义。
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginTop: 0 }}>查询结果</h3>
        {items.length === 0 ? (
          <div className="muted">暂无结果</div>
        ) : (
          <ul className="list">
            {items.map((it) => (
              <li key={it.id} className="pill">
                <span style={{ color: "var(--muted)" }}>{it.abbr}</span>
                <span>{it.value}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

