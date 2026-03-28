/**
 * 可选后端同步：设置 NEXT_PUBLIC_API_BASE_URL 后，部分操作会同步到 Nest API。
 * 未设置时全部走浏览器本地，行为与之前一致。
 */

function normalizeBase(raw: string | undefined): string {
  if (!raw?.trim()) return "";
  return raw.replace(/\/+$/, "");
}

export function getApiBaseUrl(): string {
  return normalizeBase(process.env.NEXT_PUBLIC_API_BASE_URL);
}

export function isApiSyncEnabled(): boolean {
  return Boolean(getApiBaseUrl());
}

export async function apiGetJson<T>(path: string): Promise<{ ok: true; data: T } | { ok: false; status: number; skipped?: boolean }> {
  const base = getApiBaseUrl();
  if (!base) return { ok: false, status: 0, skipped: true };
  const url = `${base}/api${path.startsWith("/") ? path : `/${path}`}`;
  const res = await fetch(url, { method: "GET", cache: "no-store", credentials: "include" });
  if (!res.ok) return { ok: false, status: res.status };
  return { ok: true, data: (await res.json()) as T };
}

export async function apiPostJson<TBody extends object, TRes>(
  path: string,
  body: TBody
): Promise<{ ok: true; data: TRes } | { ok: false; status: number; skipped?: boolean }> {
  const base = getApiBaseUrl();
  if (!base) return { ok: false, status: 0, skipped: true };
  const url = `${base}/api${path.startsWith("/") ? path : `/${path}`}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  });
  if (!res.ok) return { ok: false, status: res.status };
  return { ok: true, data: (await res.json()) as TRes };
}
