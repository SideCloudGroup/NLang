"use client";

import { useMemo, useState } from "react";

import { createEntry, deleteEntry, listEntries, updateEntryByAbbrValue, type Entry } from "@/lib/api";
import { clearApiKey, getApiKey } from "@/lib/auth";

export default function AdminEntriesPage() {
  const apiKey = useMemo(() => getApiKey() ?? "", []);

  const [abbr, setAbbr] = useState("");
  const [items, setItems] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [newAbbr, setNewAbbr] = useState("");
  const [newValue, setNewValue] = useState("");

  async function refresh() {
    const q = abbr.trim();
    if (!q) return;
    setLoading(true);
    setError(null);
    try {
      const res = await listEntries(q);
      setItems(res);
    } catch (e) {
      setItems([]);
      setError(e instanceof Error ? e.message : "请求失败");
    } finally {
      setLoading(false);
    }
  }

  async function onCreate() {
    const a = newAbbr.trim();
    const v = newValue.trim();
    if (!a || !v) return;
    setLoading(true);
    setError(null);
    try {
      await createEntry(a, v, apiKey);
      setNewAbbr("");
      setNewValue("");
      setAbbr(a);
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "请求失败");
    } finally {
      setLoading(false);
    }
  }

  async function onUpdate(match: { abbr: string; value: string }, patch: { new_abbr?: string; new_value?: string }) {
    setLoading(true);
    setError(null);
    try {
      await updateEntryByAbbrValue(match.abbr, match.value, patch, apiKey);
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "请求失败");
    } finally {
      setLoading(false);
    }
  }

  async function onDelete(a: string, v: string) {
    setLoading(true);
    setError(null);
    try {
      await deleteEntry(a, v, apiKey);
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "请求失败");
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    clearApiKey();
    window.location.href = "/admin";
  }

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div className="card">
        <div className="row" style={{ justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h2 style={{ marginTop: 0, marginBottom: 6 }}>词条管理</h2>
            <div className="muted">写操作需要 Bearer API Key</div>
          </div>
          <button className="secondary" onClick={logout}>
            退出
          </button>
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginTop: 0 }}>新增</h3>
        <div className="row">
          <input
            value={newAbbr}
            onChange={(e) => setNewAbbr(e.target.value)}
            placeholder="abbr"
            style={{ flex: "1 1 160px" }}
          />
          <input
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            placeholder="value"
            style={{ flex: "2 1 320px" }}
          />
          <button onClick={onCreate} disabled={!apiKey || loading || !newAbbr.trim() || !newValue.trim()}>
            新增
          </button>
        </div>
        {!apiKey ? <div style={{ marginTop: 10, color: "var(--danger)" }}>未登录或 API Key 缺失</div> : null}
      </div>

      <div className="card">
        <h3 style={{ marginTop: 0 }}>按缩写查询并编辑</h3>
        <div className="row">
          <input
            value={abbr}
            onChange={(e) => setAbbr(e.target.value)}
            placeholder="输入 abbr 以加载列表"
            style={{ flex: "1 1 320px" }}
            onKeyDown={(e) => {
              if (e.key === "Enter") refresh();
            }}
          />
          <button onClick={refresh} disabled={loading || !abbr.trim()}>
            {loading ? "加载中…" : "加载"}
          </button>
        </div>
        {error ? <div style={{ marginTop: 10, color: "var(--danger)" }}>{error}</div> : null}
      </div>

      <div className="card">
        <h3 style={{ marginTop: 0 }}>列表</h3>
        {items.length === 0 ? (
          <div className="muted">暂无数据</div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: 80 }}>ID</th>
                <th style={{ width: 160 }}>abbr</th>
                <th>value</th>
                <th style={{ width: 220 }}>操作</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => (
                <Row key={it.id} item={it} onUpdate={onUpdate} onDelete={onDelete} busy={loading} />
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function Row(props: {
  item: Entry;
  busy: boolean;
  onUpdate: (
    match: { abbr: string; value: string },
    patch: { new_abbr?: string; new_value?: string }
  ) => Promise<void>;
  onDelete: (abbr: string, value: string) => Promise<void>;
}) {
  const { item, onUpdate, onDelete, busy } = props;
  const [abbr, setAbbr] = useState(item.abbr);
  const [value, setValue] = useState(item.value);

  const changed = abbr !== item.abbr || value !== item.value;

  return (
    <tr>
      <td className="muted">{item.id}</td>
      <td>
        <input value={abbr} onChange={(e) => setAbbr(e.target.value)} style={{ width: "100%" }} />
      </td>
      <td>
        <input value={value} onChange={(e) => setValue(e.target.value)} style={{ width: "100%" }} />
      </td>
      <td>
        <div className="row" style={{ flexWrap: "nowrap" }}>
          <button
            className="secondary"
            onClick={() =>
              onUpdate(
                { abbr: item.abbr, value: item.value },
                { new_abbr: abbr.trim(), new_value: value.trim() }
              )
            }
            disabled={busy || !changed || !abbr.trim() || !value.trim()}
          >
            保存
          </button>
          <button className="danger" onClick={() => onDelete(item.abbr, item.value)} disabled={busy}>
            删除
          </button>
        </div>
      </td>
    </tr>
  );
}

