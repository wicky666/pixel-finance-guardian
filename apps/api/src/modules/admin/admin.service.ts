import { Injectable } from "@nestjs/common";
import { ScenarioService } from "../scenario/scenario.service";
import { ShadowService } from "../shadow/shadow.service";
import { AuthService } from "../auth/auth.service";
import type { SafeUser, UserRole } from "../auth/auth.types";

export interface AdminFeatureFlags {
  scenarioWriteEnabled: boolean;
  reviewGenerationEnabled: boolean;
  shadowCompareEnabled: boolean;
  quoteSearchEnabled: boolean;
}

export interface AdminRiskRules {
  dailyScenarioLimit: number;
  rapidActionWindowMinutes: number;
  maxReviewSeed: number;
  abnormalImpactScore: number;
}

export interface AdminSettings {
  workspaceName: string;
  environment: "development" | "staging" | "production";
  timezone: string;
  apiBaseUrl: string;
  adminContact: string;
  defaultReviewStyle: "standard" | "share";
  defaultReviewTone: "calm" | "real" | "sharp";
  featureFlags: AdminFeatureFlags;
  riskRules: AdminRiskRules;
  updatedAt: string;
}

export interface AdminJob {
  id: string;
  name: string;
  description: string;
  cadence: string;
  status: "idle" | "running" | "healthy" | "warning";
  lastRunAt: string | null;
  lastDurationMs: number | null;
  lastMessage: string;
}

export interface AdminActivity {
  id: string;
  type: "config" | "ops" | "review" | "scenario";
  title: string;
  detail: string;
  createdAt: string;
}

export interface UpdateAdminSettingsInput
  extends Partial<
    Omit<AdminSettings, "featureFlags" | "riskRules" | "updatedAt">
  > {
  featureFlags?: Partial<AdminFeatureFlags>;
  riskRules?: Partial<AdminRiskRules>;
}

@Injectable()
export class AdminService {
  constructor(
    private readonly scenarios: ScenarioService,
    private readonly shadow: ShadowService,
    private readonly auth: AuthService
  ) {}

  private settings: AdminSettings = {
    workspaceName: "Pixel Finance Guardian",
    environment: "development",
    timezone: "Etc/UTC",
    apiBaseUrl: "/api",
    adminContact: "ops@pixel-finance-guardian.local",
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
    updatedAt: new Date().toISOString(),
  };

  private jobs: AdminJob[] = [
    {
      id: "scenario-audit",
      name: "场景审计",
      description: "汇总最近模拟次数、影响分与高频操作窗口。",
      cadence: "每 15 分钟",
      status: "healthy",
      lastRunAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
      lastDurationMs: 420,
      lastMessage: "最近 15 分钟内没有异常高频操作。",
    },
    {
      id: "shadow-sync",
      name: "影子对照同步",
      description: "同步最新真实/影子对照结果，供管理端巡检。",
      cadence: "每小时",
      status: "idle",
      lastRunAt: new Date(Date.now() - 48 * 60 * 1000).toISOString(),
      lastDurationMs: 680,
      lastMessage: "等待下一次巡检窗口。",
    },
    {
      id: "review-guard",
      name: "复盘文案守卫",
      description: "验证默认语气、seed 上限与功能开关是否可用。",
      cadence: "发布前 / 配置变更后",
      status: "warning",
      lastRunAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      lastDurationMs: 320,
      lastMessage: "建议在开启分享文案前再次确认默认语气。",
    },
  ];

  private activity: AdminActivity[] = [
    {
      id: "boot-1",
      type: "ops",
      title: "管理端控制台已初始化",
      detail: "已载入默认配置与运维任务模板。",
      createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    },
  ];

  getSettings(): AdminSettings {
    return this.settings;
  }

  updateSettings(partial: UpdateAdminSettingsInput): AdminSettings {
    this.settings = {
      ...this.settings,
      ...partial,
      featureFlags: {
        ...this.settings.featureFlags,
        ...(partial.featureFlags ?? {}),
      },
      riskRules: {
        ...this.settings.riskRules,
        ...(partial.riskRules ?? {}),
      },
      updatedAt: new Date().toISOString(),
    };
    this.pushActivity({
      type: "config",
      title: "管理员更新了系统配置",
      detail: `环境=${this.settings.environment}，默认复盘=${this.settings.defaultReviewStyle}/${this.settings.defaultReviewTone}`,
    });
    return this.settings;
  }

  getJobs(): AdminJob[] {
    return this.jobs;
  }

  runJob(id: string): AdminJob {
    const job = this.jobs.find((item) => item.id === id);
    if (!job) {
      throw new Error(`Unknown job: ${id}`);
    }
    const scenarioCount = this.scenarios.listAll(100).length;
    const latestShadow = this.shadow.latest();
    const now = new Date().toISOString();
    const messageMap: Record<string, string> = {
      "scenario-audit": `当前已记录 ${scenarioCount} 条模拟，单日阈值 ${this.settings.riskRules.dailyScenarioLimit}。`,
      "shadow-sync": latestShadow
        ? `最新对照 ${latestShadow.symbol}，impactScore=${latestShadow.impact.impactScore.toFixed(2)}。`
        : "暂无影子对照数据，建议先从 Web 端保存一次模拟。",
      "review-guard": `默认复盘风格 ${this.settings.defaultReviewStyle}，语气 ${this.settings.defaultReviewTone}。`,
    };
    const nextStatus =
      id === "review-guard" &&
      this.settings.defaultReviewStyle === "share" &&
      this.settings.defaultReviewTone === "sharp"
        ? "warning"
        : "healthy";
    const updated: AdminJob = {
      ...job,
      status: nextStatus,
      lastRunAt: now,
      lastDurationMs: 150 + Math.round(Math.random() * 500),
      lastMessage: messageMap[id] ?? "任务已执行。",
    };
    this.jobs = this.jobs.map((item) => (item.id === id ? updated : item));
    this.pushActivity({
      type: "ops",
      title: `执行任务：${updated.name}`,
      detail: updated.lastMessage,
    });
    return updated;
  }

  getActivity(limit = 20): AdminActivity[] {
    return this.activity.slice(0, limit);
  }



  listUsers() {
    return this.auth.listUsers();
  }

  updateUserRole(actor: SafeUser, userId: string, role: UserRole) {
    const next = this.auth.updateUserRole(actor, userId, role);
    this.pushActivity({
      type: "config",
      title: "管理员调整用户角色",
      detail: `${next.email} -> ${next.role}`,
    });
    return next;
  }

  updateUserStatus(actor: SafeUser, userId: string, status: "active" | "blocked") {
    const next = this.auth.updateUserStatus(actor, userId, status);
    this.pushActivity({
      type: "ops",
      title: "管理员更新用户状态",
      detail: `${next.email} -> ${next.status}`,
    });
    return next;
  }

  getOverview() {
    const scenarios = this.scenarios.listAll(100);
    const shadows = this.shadow.listAll(100);
    const latestShadow = shadows[0] ?? null;
    const today = new Date().toISOString().slice(0, 10);
    const todayScenarioCount = scenarios.filter((item) => item.createdAt.startsWith(today)).length;
    const warningJobs = this.jobs.filter((item) => item.status === "warning").length;
    const averageImpactScore =
      shadows.length > 0
        ? Number(
            (
              shadows.reduce((sum, item) => sum + item.impact.impactScore, 0) / shadows.length
            ).toFixed(2)
          )
        : 0;
    return {
      product: {
        name: this.settings.workspaceName,
        environment: this.settings.environment,
        timezone: this.settings.timezone,
        adminContact: this.settings.adminContact,
        apiBaseUrl: this.settings.apiBaseUrl,
        updatedAt: this.settings.updatedAt,
      },
      metrics: {
        totalScenarios: scenarios.length,
        totalShadowPairs: shadows.length,
        todayScenarioCount,
        warningJobs,
        averageImpactScore,
      },
      statuses: [
        {
          key: "api",
          label: "API 服务",
          level: "healthy",
          detail: "NestJS API 可用，管理端已连接。",
        },
        {
          key: "scenario-write",
          label: "模拟写入",
          level: this.settings.featureFlags.scenarioWriteEnabled ? "healthy" : "warning",
          detail: this.settings.featureFlags.scenarioWriteEnabled ? "允许 Web 端保存模拟。" : "已关闭写入，仅允许查看。",
        },
        {
          key: "shadow-compare",
          label: "影子对照",
          level: latestShadow ? "healthy" : "warning",
          detail: latestShadow
            ? `最新标的 ${latestShadow.symbol}，影响分 ${latestShadow.impact.impactScore.toFixed(2)}。`
            : "暂无影子对照，请先产生模拟数据。",
        },
      ],
      latestShadow,
      jobs: this.jobs,
      activity: this.getActivity(6),
    };
  }

  private pushActivity(entry: Omit<AdminActivity, "id" | "createdAt">) {
    this.activity = [
      {
        id: `act-${Date.now()}`,
        createdAt: new Date().toISOString(),
        ...entry,
      },
      ...this.activity,
    ].slice(0, 40);
  }
}
