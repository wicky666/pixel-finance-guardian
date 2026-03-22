import { useEffect, useState } from "react";

const apiBase = () =>
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/+$/, "") ?? "";

async function fetchJson<T>(path: string): Promise<T> {
  const base = apiBase();
  const url = base ? `${base}/api${path}` : `/api${path}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return (await res.json()) as T;
}

export default function App() {
  const [health, setHealth] = useState<string>("加载中…");
  const [scenarios, setScenarios] = useState<unknown[]>([]);
  const [shadow, setShadow] = useState<unknown | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const h = await fetchJson<{ ok: boolean }>("/health");
        setHealth(h.ok ? "API 正常" : "API 异常");
        const s = await fetchJson<{ items: unknown[] }>("/scenarios?limit=10");
        setScenarios(s.items ?? []);
        const p = await fetchJson<{ item: unknown | null }>("/shadow/latest");
        setShadow(p.item ?? null);
        setErr(null);
      } catch (e) {
        setErr(e instanceof Error ? e.message : "请求失败");
        setHealth("—");
      }
    })();
  }, []);

  return (
    <div style={{ padding: 24, maxWidth: 960, margin: "0 auto" }}>
      <h1 style={{ fontSize: 22 }}>AI 成本模拟器 · 管理端（MVP）</h1>
      <p style={{ color: "#94a3b8", fontSize: 14 }}>
        对齐 aiforce 三端拆分：此为 <code>@pfg/admin</code>，只读查看后端内存数据。
        开发时可用 Vite 代理 <code>/api</code> → <code>:3100</code>，或设置{" "}
        <code>VITE_API_BASE_URL</code>。
      </p>
      <section style={{ marginTop: 20 }}>
        <h2 style={{ fontSize: 16 }}>健康检查</h2>
        <p>{health}</p>
        {err && <p style={{ color: "#f87171" }}>{err}</p>}
      </section>
      <section style={{ marginTop: 24 }}>
        <h2 style={{ fontSize: 16 }}>最近模拟（最多 3 条）</h2>
        <pre
          style={{
            background: "#111827",
            padding: 12,
            borderRadius: 8,
            overflow: "auto",
            fontSize: 12,
          }}
        >
          {JSON.stringify(scenarios, null, 2)}
        </pre>
      </section>
      <section style={{ marginTop: 24 }}>
        <h2 style={{ fontSize: 16 }}>最新影子对照</h2>
        <pre
          style={{
            background: "#111827",
            padding: 12,
            borderRadius: 8,
            overflow: "auto",
            fontSize: 12,
          }}
        >
          {JSON.stringify(shadow, null, 2)}
        </pre>
      </section>
    </div>
  );
}
