"use client";

import { useMemo } from "react";
import { getBehaviorAnalysis, getSanity } from "@/lib/services";
import { PageLayout, EmptyState } from "@/components/app";
import { MiniBarChart } from "@/components/charts";
import { ComplianceNotice } from "@/components/compliance";

export default function BehaviorPage() {
  const analysis = useMemo(() => getBehaviorAnalysis(), []);
  const sanity = useMemo(() => getSanity(), []);
  const styleLabel = sanity.score >= 80 ? "计划型" : sanity.score >= 60 ? "谨慎但会犹豫" : "下跌容易冲动型";
  const easyTrigger = analysis.intervalMinutes !== null && analysis.intervalMinutes < 20
    ? "你最容易在短时间连续操作的时候乱动。"
    : analysis.saveCount24h > 5
      ? "你最容易在连续波动时越看越急。"
      : "你最容易在亏损刚出现时急着证明自己。";
  const reflection = sanity.score < 60
    ? "你的问题不是看错，而是太急着把亏损拉回来。"
    : "你不是没想清楚，只是偶尔会在焦虑时动作偏快。";
  const bars = [
    { label: "冷静", value: sanity.score },
    { label: "冲动", value: 100 - sanity.score },
  ];

  return (
    <PageLayout
      title="你最近怎么动的"
      description="结论优先，帮你看清你最近到底是计划在动，还是情绪在动。"
    >
      <div className="mx-auto max-w-3xl space-y-4">
        {analysis.saveCount24h === 0 ? (
          <EmptyState
            title="你的记录还不够多，暂时还看不清你的习惯"
            description="先保留几次模拟，系统才知道你最容易在什么时候乱动。"
          />
        ) : (
          <>
            <section className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <h2 className="mb-2 text-base font-semibold">你的操作风格</h2>
              <p className="text-lg text-white">{styleLabel}</p>
              <p className="mt-2 text-sm text-slate-300">简化结论：你现在更像在 {sanity.score >= 60 ? "按计划推进" : "被情绪推着走"}。</p>
            </section>

            <section className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <h2 className="mb-2 text-base font-semibold">你最容易乱动的时候</h2>
              <p className="text-sm text-slate-200">{easyTrigger}</p>
              <div className="mt-3">
                <MiniBarChart data={bars} />
              </div>
              <p className="mt-2 text-xs text-slate-400">图里只看一个重点：冷静越低，冲动越高。</p>
            </section>

            <section className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <h2 className="mb-2 text-base font-semibold">最近最值得反思的一点</h2>
              <p className="text-base text-slate-100">{reflection}</p>
              <p className="mt-2 text-sm text-slate-300">{analysis.message}</p>
            </section>
          </>
        )}
        <ComplianceNotice variant="block" />
      </div>
    </PageLayout>
  );
}
