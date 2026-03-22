"use client";

import { PixelCard } from "@/components/ui";

export interface SandboxResultsProps {
  /** When null, show "fill valid inputs" message */
  newAverageCost: string | null;
  costImprovementEfficiency: string | null;
  breakevenReboundPct: string | null;
  /** True when inputs are invalid or cannot compute */
  isEmpty: boolean;
}

function formatPct(value: string): string {
  const n = parseFloat(value);
  if (Number.isNaN(n)) return value;
  return `${(n * 100).toFixed(2)}%`;
}

export function SandboxResults({
  newAverageCost,
  costImprovementEfficiency,
  breakevenReboundPct,
  isEmpty,
}: SandboxResultsProps) {
  if (isEmpty) {
    return (
      <PixelCard title="模拟结果">
        <p className="text-sm text-pixel-text-muted">
          请填写当前持仓与加仓金额或股数后查看结果。
        </p>
      </PixelCard>
    );
  }

  return (
    <PixelCard title="模拟结果">
      <dl className="grid gap-3 sm:grid-cols-3">
        <div>
          <dt className="text-xs text-pixel-text-muted">新平均成本</dt>
          <dd className="text-lg font-medium text-pixel-text">
            {newAverageCost ?? "—"}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-pixel-text-muted">每万元成本改善</dt>
          <dd className="text-lg font-medium text-pixel-text">
            {costImprovementEfficiency ?? "—"}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-pixel-text-muted">回本需反弹</dt>
          <dd className="text-lg font-medium text-pixel-text">
            {breakevenReboundPct != null ? formatPct(breakevenReboundPct) : "—"}
          </dd>
        </div>
      </dl>
    </PixelCard>
  );
}
