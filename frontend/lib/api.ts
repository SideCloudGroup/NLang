export type Entry = {
  id: number;
  abbr: string;
  value: string;
  created_at: number;
  updated_at: number;
};

function apiBase(): string {
  return process.env.NEXT_PUBLIC_API_BASE ?? "";
}

function authHeader(apiKey?: string): HeadersInit {
  if (!apiKey) return {};
  return { Authorization: `Bearer ${apiKey}` };
}

async function request<T>(
  path: string,
  init?: RequestInit,
  opts?: { apiKey?: string }
): Promise<T> {
  const res = await fetch(`${apiBase()}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
      ...authHeader(opts?.apiKey)
    },
    cache: "no-store"
  });
  if (!res.ok) {
    let detail = `HTTP ${res.status}`;
    try {
      const body = (await res.json()) as { detail?: string };
      if (body?.detail) detail = body.detail;
    } catch {
      // ignore
    }
    throw new Error(detail);
  }
  return (await res.json()) as T;
}

export async function listEntries(abbr: string, limit = 50, offset = 0): Promise<Entry[]> {
  const q = new URLSearchParams({ abbr, limit: String(limit), offset: String(offset) });
  return request<Entry[]>(`/api/entries?${q.toString()}`);
}

export async function createEntry(abbr: string, value: string, apiKey: string): Promise<Entry> {
  return request<Entry>(
    "/api/entries",
    { method: "POST", body: JSON.stringify({ abbr, value }) },
    { apiKey }
  );
}

export async function updateEntryByAbbrValue(
  abbr: string,
  value: string,
  patch: { new_abbr?: string; new_value?: string },
  apiKey: string
): Promise<number> {
  const res = await request<{ updated: number }>(
    "/api/entries",
    { method: "PATCH", body: JSON.stringify({ abbr, value, ...patch }) },
    { apiKey }
  );
  return res.updated;
}

export async function deleteEntry(abbr: string, value: string, apiKey: string): Promise<number> {
  const res = await request<{ deleted: number }>(
    "/api/entries",
    { method: "DELETE", body: JSON.stringify({ abbr, value }) },
    { apiKey }
  );
  return res.deleted;
}

