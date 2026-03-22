"use client";

import { useMemo } from "react";
import { getShadowHistory } from "@/lib/services";
import type { RealShadowPair } from "@/lib/services/types";
import { PageLayout, EmptyState } from "@/components/app";
import { ComplianceNotice } from "@/components/compliance";

export default function ShadowPage() {
  const pairs = useMemo<RealShadowPair[]>(() => getShadowHistory(20), []);
  const latest = pairs[0];
  const diffMoney = useMemo(() => {
    if (!latest) return 0;
    const qty = Number(latest.real.quantity || "0");
    const diff = Number(latest.impact.avgCostDiff || "0");
    if (!Number.isFinite(qty) || !Number.isFinite(diff)) return 0;
    return Math.abs(qty * diff);
  }, [latest]);
  const sentence = useMemo(() => {
    if (!latest) return "留下一次操作后，系统才能帮你保留另一个“没动的结果”。";
    return latest.impact.impactScore < 0
      ? `如果你当时没动，按当前估算会少亏约 ${diffMoney.toFixed(2)}。`
      : `如果你当时没动，按当前估算可能少赚约 ${diffMoney.toFixed(2)}。`;
  }, [latest, diffMoney]);

  return (
    <PageLayout
      title="如果你当时没动"
      description="这里只回答一个问题：那次动作，和不动相比，到底差了多少。"
    >
      <div className="mx-auto max-w-3xl space-y-4">
        {latest == null ? (
          <EmptyState
            title="留下一次操作后，系统才能帮你保留另一个“没动的结果”"
            description="先在首页保留一次模拟，再回来对照。"
          />
        ) : (
          <>
            <section className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <h2 className="mb-2 text-base font-semibold">这次对照结果</h2>
              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <p className="text-xs text-slate-400">实际结果</p>
                  <p className="text-sm">成本 {latest.real.avgCost}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">如果没动</p>
                  <p className="text-sm">成本 {latest.shadow.avgCost}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">差值估算</p>
                  <p className="text-sm">{diffMoney.toFixed(2)}</p>
                </div>
              </div>
            </section>

            <section className="rounded-xl border border-amber-400/30 bg-amber-400/10 p-4">
              <h2 className="mb-2 text-base font-semibold text-amber-200">一句提醒</h2>
              <p className="text-sm text-amber-100">{sentence}</p>
            </section>
          </>
        )}
        <ComplianceNotice variant="block" />
      </div>
    </PageLayout>
  );
}
