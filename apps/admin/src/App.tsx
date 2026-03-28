import { useEffect, useMemo, useState } from "react";

type HealthResponse = {
  ok: boolean;
  service: string;
  time: string;
};

type OverviewResponse = {
  product: {
    name: string;
    environment: string;
    timezone: string;
    adminContact: string;
    apiBaseUrl: string;
    updatedAt: string;
  };
  metrics: {
    totalScenarios: number;
    totalShadowPairs: number;
    todayScenarioCount: number;
    warningJobs: number;
    averageImpactScore: number;
  };
  statuses: Array<{
    key: string;
    label: string;
    level: "healthy" | "warning";
    detail: string;
  }>;
  latestShadow: null | {
    symbol: string;
    impact: { impactScore: number; avgCostDiff: string; quantityDiff: string };
    real: { avgCost: string; quantity: string };
    shadow: { avgCost: string; quantity: string };
    createdAt: string;
  };
  jobs: Job[];
  activity: Activity[];
};

type Job = {
  id: string;
  name: string;
  description: string;
  cadence: string;
  status: "idle" | "running" | "healthy" | "warning";
  lastRunAt: string | null;
  lastDurationMs: number | null;
  lastMessage: string;
};

type Activity = {
  id: string;
  type: "config" | "ops" | "review" | "scenario";
  title: string;
  detail: string;
  createdAt: string;
};

type Settings = {
  workspaceName: string;
  environment: "development" | "staging" | "production";
  timezone: string;
  apiBaseUrl: string;
  adminContact: string;
  defaultReviewStyle: "standard" | "share";
  defaultReviewTone: "calm" | "real" | "sharp";
  featureFlags: {
    scenarioWriteEnabled: boolean;
    reviewGenerationEnabled: boolean;
    shadowCompareEnabled: boolean;
    quoteSearchEnabled: boolean;
  };
  riskRules: {
    dailyScenarioLimit: number;
    rapidActionWindowMinutes: number;
    maxReviewSeed: number;
    abnormalImpactScore: number;
  };
  updatedAt: string;
};

type Scenario = {
  id: string;
  symbol: string;
  addAmount: string;
  addQuantity: string;
  currentAverageCost: string;
  newAverageCost: string;
  createdAt: string;
};

const apiBase = () =>
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/+$/, "") ?? "";

async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const base = apiBase();
  const url = base ? `${base}/api${path}` : `/api${path}`;
  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    ...init,
  });
  if (!res.ok) {
    throw new Error(`${res.status} ${res.statusText}`);
  }
  return (await res.json()) as T;
}

const emptySettings: Settings = {
  workspaceName: "",
  environment: "development",
  timezone: "Etc/UTC",
  apiBaseUrl: "/api",
  adminContact: "",
  defaultReviewStyle: "standard",
  defaultReviewTone: "calm",
  featureFlags: {
    scenarioWriteEnabled: true,
    reviewGenerationEnabled: true,
    shadowCompareEnabled: true,
    quoteSearchEnabled: true,
  },
  riskRules: {
    dailyScenarioLimit: 12,
    rapidActionWindowMinutes: 20,
    maxReviewSeed: 9999,
    abnormalImpactScore: 8,
  },
  updatedAt: "",
};

function formatTime(value?: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("zh-CN", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

function MetricCard(props: { label: string; value: string | number; hint: string }) {
  return (
    <article className="metric-card">
      <span className="metric-label">{props.label}</span>
      <strong className="metric-value">{props.value}</strong>
      <span className="metric-hint">{props.hint}</span>
    </article>
  );
}

export default function App() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [overview, setOverview] = useState<OverviewResponse | null>(null);
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [settings, setSettings] = useState<Settings>(emptySettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string>("正在载入管理台数据…");
  const [error, setError] = useState<string | null>(null);

  const recentScenarioRatio = useMemo(() => {
    if (!overview) return "—";
    const total = overview.metrics.totalScenarios || 1;
    return `${Math.round((overview.metrics.todayScenarioCount / total) * 100)}%`;
  }, [overview]);

  async function loadAll() {
    setLoading(true);
    try {
      const [healthRes, overviewRes, settingsRes, scenarioRes] = await Promise.all([
        fetchJson<HealthResponse>("/health"),
        fetchJson<OverviewResponse>("/admin/overview"),
        fetchJson<Settings>("/admin/settings"),
        fetchJson<{ items: Scenario[] }>("/scenarios?limit=10"),
      ]);
      setHealth(healthRes);
      setOverview(overviewRes);
      setSettings(settingsRes);
      setScenarios(scenarioRes.items ?? []);
      setError(null);
      setMessage("管理台已同步最新项目配置与运维状态。");
    } catch (err) {
      setError(err instanceof Error ? err.message : "加载失败");
      setMessage("管理台加载失败，请确认 API 已启动。");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadAll();
  }, []);

  async function saveSettings() {
    setSaving(true);
    try {
      const next = await fetchJson<Settings>("/admin/settings", {
        method: "PATCH",
        body: JSON.stringify({
          workspaceName: settings.workspaceName,
          environment: settings.environment,
          timezone: settings.timezone,
          apiBaseUrl: settings.apiBaseUrl,
          adminContact: settings.adminContact,
          defaultReviewStyle: settings.defaultReviewStyle,
          defaultReviewTone: settings.defaultReviewTone,
          featureFlags: settings.featureFlags,
          riskRules: {
            dailyScenarioLimit: Number(settings.riskRules.dailyScenarioLimit),
            rapidActionWindowMinutes: Number(settings.riskRules.rapidActionWindowMinutes),
            maxReviewSeed: Number(settings.riskRules.maxReviewSeed),
            abnormalImpactScore: Number(settings.riskRules.abnormalImpactScore),
          },
        }),
      });
      setSettings(next);
      setMessage("系统配置已保存。");
      setError(null);
      await loadAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存失败");
    } finally {
      setSaving(false);
    }
  }

  async function runJob(jobId: string) {
    try {
      const result = await fetchJson<{ item: Job }>(`/admin/jobs/${jobId}/run`, {
        method: "POST",
      });
      setMessage(`任务「${result.item.name}」执行完成：${result.item.lastMessage}`);
      setError(null);
      await loadAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : "执行任务失败");
    }
  }

  return (
    <div className="shell">
      <aside className="sidebar">
        <div>
          <p className="eyebrow">AIFORCE 风格 Admin</p>
          <h1>Pixel Finance Guardian</h1>
          <p className="sidebar-copy">
            管理员可在这里统一查看项目健康度、配置风控参数、执行运维巡检任务。
          </p>
        </div>
        <nav className="nav">
          <a href="#overview">总览驾驶舱</a>
          <a href="#settings">系统配置</a>
          <a href="#ops">运维作业</a>
          <a href="#data">业务数据</a>
        </nav>
        <div className="status-panel">
          <span className="status-dot" />
          <div>
            <strong>{health?.ok ? "API 在线" : loading ? "连接中" : "未连接"}</strong>
            <p>
              {health
                ? `${health.service} · ${formatTime(health.time)}`
                : "启动 API 后将自动刷新状态。"}
            </p>
          </div>
        </div>
      </aside>

      <main className="content">
        <header className="hero" id="overview">
          <div>
            <p className="eyebrow">Admin Console</p>
            <h2>把「只读 MVP」升级为可配置、可运维的后台工作台</h2>
            <p className="hero-copy">
              当前管理端已聚合系统总览、功能开关、风控规则、运维任务与最近业务数据，便于后续继续接数据库、鉴权与审计日志。
            </p>
          </div>
          <div className="hero-actions">
            <button className="button secondary" onClick={() => void loadAll()} disabled={loading}>
              {loading ? "刷新中…" : "刷新数据"}
            </button>
            <button className="button" onClick={() => void saveSettings()} disabled={saving}>
              {saving ? "保存中…" : "保存配置"}
            </button>
          </div>
        </header>

        <section className="banner">
          <span>{message}</span>
          {error && <strong>{error}</strong>}
        </section>

        <section className="metrics">
          <MetricCard
            label="总模拟数"
            value={overview?.metrics.totalScenarios ?? "—"}
            hint="来自 Web 端保存的最近模拟。"
          />
          <MetricCard
            label="今日模拟占比"
            value={recentScenarioRatio}
            hint="帮助识别当天是否出现集中操作。"
          />
          <MetricCard
            label="影子对照数"
            value={overview?.metrics.totalShadowPairs ?? "—"}
            hint="用于比对真实动作与不动作结果。"
          />
          <MetricCard
            label="平均影响分"
            value={overview?.metrics.averageImpactScore ?? "—"}
            hint="越高表示摊薄/动作影响越显著。"
          />
        </section>

        <section className="grid grid-2">
          <article className="panel">
            <div className="panel-header">
              <div>
                <p className="eyebrow">SYSTEM HEALTH</p>
                <h3>系统与数据源状态</h3>
              </div>
            </div>
            <div className="status-list">
              {overview?.statuses.map((item) => (
                <div className="status-item" key={item.key}>
                  <span className={`pill ${item.level}`}>{item.level}</span>
                  <div>
                    <strong>{item.label}</strong>
                    <p>{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="panel">
            <div className="panel-header">
              <div>
                <p className="eyebrow">LATEST SHADOW</p>
                <h3>最新真实 / 影子对照</h3>
              </div>
            </div>
            {overview?.latestShadow ? (
              <div className="shadow-card">
                <div>
                  <span>标的</span>
                  <strong>{overview.latestShadow.symbol}</strong>
                </div>
                <div>
                  <span>影响分</span>
                  <strong>{overview.latestShadow.impact.impactScore.toFixed(2)}</strong>
                </div>
                <div>
                  <span>真实均价</span>
                  <strong>{overview.latestShadow.real.avgCost}</strong>
                </div>
                <div>
                  <span>影子均价</span>
                  <strong>{overview.latestShadow.shadow.avgCost}</strong>
                </div>
                <p>
                  数量变化 {overview.latestShadow.impact.quantityDiff}，均价变化{" "}
                  {overview.latestShadow.impact.avgCostDiff}，记录时间{" "}
                  {formatTime(overview.latestShadow.createdAt)}。
                </p>
              </div>
            ) : (
              <p className="empty">暂无影子对照数据。</p>
            )}
          </article>
        </section>

        <section className="grid grid-2" id="settings">
          <article className="panel">
            <div className="panel-header">
              <div>
                <p className="eyebrow">SETTINGS</p>
                <h3>项目基础配置</h3>
              </div>
              <span className="updated-at">最近更新：{formatTime(settings.updatedAt)}</span>
            </div>
            <div className="form-grid">
              <label>
                <span>工作台名称</span>
                <input
                  value={settings.workspaceName}
                  onChange={(event) =>
                    setSettings((current) => ({ ...current, workspaceName: event.target.value }))
                  }
                />
              </label>
              <label>
                <span>运行环境</span>
                <select
                  value={settings.environment}
                  onChange={(event) =>
                    setSettings((current) => ({
                      ...current,
                      environment: event.target.value as Settings["environment"],
                    }))
                  }
                >
                  <option value="development">development</option>
                  <option value="staging">staging</option>
                  <option value="production">production</option>
                </select>
              </label>
              <label>
                <span>时区</span>
                <input
                  value={settings.timezone}
                  onChange={(event) =>
                    setSettings((current) => ({ ...current, timezone: event.target.value }))
                  }
                />
              </label>
              <label>
                <span>API Base URL</span>
                <input
                  value={settings.apiBaseUrl}
                  onChange={(event) =>
                    setSettings((current) => ({ ...current, apiBaseUrl: event.target.value }))
                  }
                />
              </label>
              <label className="full">
                <span>管理员联系邮箱</span>
                <input
                  value={settings.adminContact}
                  onChange={(event) =>
                    setSettings((current) => ({ ...current, adminContact: event.target.value }))
                  }
                />
              </label>
            </div>
          </article>

          <article className="panel">
            <div className="panel-header">
              <div>
                <p className="eyebrow">REVIEW & RISK</p>
                <h3>复盘默认值与风控阈值</h3>
              </div>
            </div>
            <div className="form-grid">
              <label>
                <span>默认复盘风格</span>
                <select
                  value={settings.defaultReviewStyle}
                  onChange={(event) =>
                    setSettings((current) => ({
                      ...current,
                      defaultReviewStyle: event.target.value as Settings["defaultReviewStyle"],
                    }))
                  }
                >
                  <option value="standard">standard</option>
                  <option value="share">share</option>
                </select>
              </label>
              <label>
                <span>默认复盘语气</span>
                <select
                  value={settings.defaultReviewTone}
                  onChange={(event) =>
                    setSettings((current) => ({
                      ...current,
                      defaultReviewTone: event.target.value as Settings["defaultReviewTone"],
                    }))
                  }
                >
                  <option value="calm">calm</option>
                  <option value="real">real</option>
                  <option value="sharp">sharp</option>
                </select>
              </label>
              <label>
                <span>单日模拟上限</span>
                <input
                  type="number"
                  value={settings.riskRules.dailyScenarioLimit}
                  onChange={(event) =>
                    setSettings((current) => ({
                      ...current,
                      riskRules: {
                        ...current.riskRules,
                        dailyScenarioLimit: Number(event.target.value),
                      },
                    }))
                  }
                />
              </label>
              <label>
                <span>高频窗口（分钟）</span>
                <input
                  type="number"
                  value={settings.riskRules.rapidActionWindowMinutes}
                  onChange={(event) =>
                    setSettings((current) => ({
                      ...current,
                      riskRules: {
                        ...current.riskRules,
                        rapidActionWindowMinutes: Number(event.target.value),
                      },
                    }))
                  }
                />
              </label>
              <label>
                <span>最大 review seed</span>
                <input
                  type="number"
                  value={settings.riskRules.maxReviewSeed}
                  onChange={(event) =>
                    setSettings((current) => ({
                      ...current,
                      riskRules: {
                        ...current.riskRules,
                        maxReviewSeed: Number(event.target.value),
                      },
                    }))
                  }
                />
              </label>
              <label>
                <span>异常影响分阈值</span>
                <input
                  type="number"
                  value={settings.riskRules.abnormalImpactScore}
                  onChange={(event) =>
                    setSettings((current) => ({
                      ...current,
                      riskRules: {
                        ...current.riskRules,
                        abnormalImpactScore: Number(event.target.value),
                      },
                    }))
                  }
                />
              </label>
            </div>
          </article>
        </section>

        <section className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">FEATURE FLAGS</p>
              <h3>功能开关</h3>
            </div>
          </div>
          <div className="toggle-grid">
            {(
              [
                ["scenarioWriteEnabled", "允许 Web 端写入模拟"],
                ["reviewGenerationEnabled", "允许生成复盘文案"],
                ["shadowCompareEnabled", "启用影子对照能力"],
                ["quoteSearchEnabled", "启用行情搜索"],
              ] as const
            ).map(([key, label]) => (
              <label className="toggle" key={key}>
                <input
                  type="checkbox"
                  checked={settings.featureFlags[key]}
                  onChange={(event) =>
                    setSettings((current) => ({
                      ...current,
                      featureFlags: {
                        ...current.featureFlags,
                        [key]: event.target.checked,
                      },
                    }))
                  }
                />
                <span>{label}</span>
              </label>
            ))}
          </div>
        </section>

        <section className="grid grid-2" id="ops">
          <article className="panel">
            <div className="panel-header">
              <div>
                <p className="eyebrow">OPS JOBS</p>
                <h3>运维任务中心</h3>
              </div>
            </div>
            <div className="job-list">
              {overview?.jobs.map((job) => (
                <div className="job-card" key={job.id}>
                  <div className="job-topline">
                    <div>
                      <strong>{job.name}</strong>
                      <p>{job.description}</p>
                    </div>
                    <span className={`pill ${job.status}`}>{job.status}</span>
                  </div>
                  <div className="job-meta">
                    <span>周期：{job.cadence}</span>
                    <span>上次执行：{formatTime(job.lastRunAt)}</span>
                    <span>耗时：{job.lastDurationMs ? `${job.lastDurationMs}ms` : "—"}</span>
                  </div>
                  <p className="job-message">{job.lastMessage}</p>
                  <button className="button secondary" onClick={() => void runJob(job.id)}>
                    立即执行
                  </button>
                </div>
              ))}
            </div>
          </article>

          <article className="panel">
            <div className="panel-header">
              <div>
                <p className="eyebrow">ACTIVITY</p>
                <h3>最近活动</h3>
              </div>
            </div>
            <div className="timeline">
              {overview?.activity.map((item) => (
                <div className="timeline-item" key={item.id}>
                  <span className={`timeline-dot ${item.type}`} />
                  <div>
                    <strong>{item.title}</strong>
                    <p>{item.detail}</p>
                    <small>{formatTime(item.createdAt)}</small>
                  </div>
                </div>
              ))}
            </div>
          </article>
        </section>

        <section className="panel" id="data">
          <div className="panel-header">
            <div>
              <p className="eyebrow">BUSINESS DATA</p>
              <h3>最近模拟记录</h3>
            </div>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>标的</th>
                  <th>补仓金额</th>
                  <th>补仓数量</th>
                  <th>当前均价</th>
                  <th>新均价</th>
                  <th>时间</th>
                </tr>
              </thead>
              <tbody>
                {scenarios.map((item) => (
                  <tr key={item.id}>
                    <td>{item.symbol}</td>
                    <td>{item.addAmount}</td>
                    <td>{item.addQuantity}</td>
                    <td>{item.currentAverageCost}</td>
                    <td>{item.newAverageCost}</td>
                    <td>{formatTime(item.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {scenarios.length === 0 && <p className="empty">暂时还没有模拟数据。</p>}
          </div>
        </section>
      </main>
    </div>
  );
}
