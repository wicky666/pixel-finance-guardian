"use client";

import Link from "next/link";
import {
  PixelButton,
  PixelCard,
  PixelInput,
  PixelBadge,
  PixelProgressBar,
  PixelToast,
  PixelAchievementToast,
  PageSection,
} from "@/components/ui";

export default function UIDemoPage() {
  return (
    <main className="min-h-screen bg-pixel-page-bg p-6 text-pixel-text">
      <div className="mx-auto max-w-3xl space-y-10">
        <header className="flex items-center justify-between border-b-2 border-pixel-border pb-4">
          <h1 className="text-2xl font-bold">像素 UI 组件演示</h1>
          <Link href="/">
            <PixelButton variant="neutral" size="sm">
              返回
            </PixelButton>
          </Link>
        </header>

        <PageSection
          title="PixelButton（按钮）"
          description="变体与状态：默认、悬停、按下、禁用。"
        >
          <div className="flex flex-wrap gap-3">
            <PixelButton variant="primary">主要</PixelButton>
            <PixelButton variant="danger">危险</PixelButton>
            <PixelButton variant="neutral">中性</PixelButton>
            <PixelButton variant="ghost">幽灵</PixelButton>
            <PixelButton variant="primary" size="sm">
              小
            </PixelButton>
            <PixelButton variant="primary" size="lg">
              大
            </PixelButton>
            <PixelButton variant="primary" disabled>
              禁用
            </PixelButton>
          </div>
        </PageSection>

        <PageSection
          title="PixelCard（卡片）"
          description="面板样式，可选标题与内边距。"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <PixelCard title="带标题">卡片内容。</PixelCard>
            <PixelCard padding="sm">小内边距。</PixelCard>
            <PixelCard padding="none">
              <div className="p-2">无默认内边距（自定义）。</div>
            </PixelCard>
          </div>
        </PageSection>

        <PageSection
          title="PixelLabel & PixelInput（标签与输入框）"
          description="表单项，支持标签与错误状态。"
        >
          <div className="max-w-sm space-y-4">
            <PixelInput label="用户名" placeholder="请输入" />
            <PixelInput
              label="邮箱"
              type="email"
              placeholder="you@example.com"
              error="邮箱格式无效"
            />
            <PixelInput
              label="禁用"
              placeholder="禁用输入"
              disabled
            />
          </div>
        </PageSection>

        <PageSection
          title="PixelBadge（标签）"
          description="状态与分类标签。"
        >
          <div className="flex flex-wrap gap-2">
            <PixelBadge variant="success">成功</PixelBadge>
            <PixelBadge variant="danger">危险</PixelBadge>
            <PixelBadge variant="muted">中性</PixelBadge>
            <PixelBadge variant="accent">高亮</PixelBadge>
          </div>
        </PageSection>

        <PageSection
          title="PixelProgressBar（进度条）"
          description="XP 条风格，适用于理智值/进度。"
        >
          <div className="space-y-4 max-w-md">
            <PixelProgressBar value={75} showLabel variant="default" />
            <PixelProgressBar value={40} showLabel variant="success" />
            <PixelProgressBar value={15} showLabel variant="danger" />
            <PixelProgressBar value={0} showLabel />
            <PixelProgressBar value={100} showLabel variant="success" />
          </div>
        </PageSection>

        <PageSection
          title="PixelToast & PixelAchievementToast（通知与成就提示）"
          description="通知与成就风格消息。"
        >
          <div className="space-y-4 max-w-sm">
            <PixelToast message="这是一条信息提示。" variant="info" />
            <PixelToast
              title="成功"
              message="操作已完成。"
              variant="success"
            />
            <PixelToast
              message="出错了。"
              variant="danger"
            />
            <PixelAchievementToast
              title="第一步"
              message="你打开了组件演示页。"
            />
          </div>
        </PageSection>

        <PageSection
          title="PageSection（区块）"
          description="带标题与描述的区块容器（本块即使用该组件）。"
        >
          <PixelCard>
            所有基础组件位于 <code className="text-pixel-accent">@/components/ui</code>，可在应用中按需引用。
          </PixelCard>
        </PageSection>
      </div>
    </main>
  );
}
