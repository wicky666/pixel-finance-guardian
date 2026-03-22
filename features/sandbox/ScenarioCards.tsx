"use client";

import { PixelCard, PixelButton } from "@/components/ui";
import type { ScenarioRecord } from "@/lib/services/types";

function formatPct(value: string): string {
  const n = parseFloat(value);
  if (Number.isNaN(n)) return value;
  return `${(n * 100).toFixed(2)}%`;
}

export interface ScenarioCardsProps {
  scenarios: ScenarioRecord[];
  onRemove: (id: string) => void;
  maxCount?: number;
}

export function ScenarioCards({
  scenarios,
  onRemove,
  maxCount = 3,
}: ScenarioCardsProps) {
  if (scenarios.length === 0) {
    return (
      <PixelCard title="方案对比">
        <p className="text-sm text-pixel-text-muted">
          从上方模拟结果点击「保存方案」，最多保存 {maxCount} 个方案用于横向对比。
        </p>
      </PixelCard>
    );
  }

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-pixel-text">
        方案对比（{scenarios.length}/{maxCount}）
      </h2>
      <div className="grid gap-4 sm:grid-cols-3">
        {scenarios.map((s) => (
          <PixelCard key={s.id} padding="sm" className="relative">
            <div className="absolute right-2 top-2">
              <PixelButton
                variant="ghost"
                size="sm"
                type="button"
                aria-label="删除方案"
                onClick={() => onRemove(s.id)}
                className="!p-1 !min-w-0 text-pixel-text-muted hover:text-pixel-danger"
              >
                ×
              </PixelButton>
            </div>
            <dl className="space-y-1 pr-6 text-sm">
              {s.symbol && (
                <div>
                  <dt className="text-pixel-text-muted">标的</dt>
                  <dd className="font-medium text-pixel-text">{s.symbol}</dd>
                </div>
              )}
              <div>
                <dt className="text-pixel-text-muted">加仓金额</dt>
                <dd className="font-medium text-pixel-text">{s.addAmount}</dd>
              </div>
              <div>
                <dt className="text-pixel-text-muted">加仓股数</dt>
                <dd className="font-medium text-pixel-text">{s.addQuantity}</dd>
              </div>
              <div>
                <dt className="text-pixel-text-muted">新平均成本</dt>
                <dd className="font-medium text-pixel-text">{s.newAverageCost}</dd>
              </div>
              <div>
                <dt className="text-pixel-text-muted">效率/万元</dt>
                <dd className="font-medium text-pixel-text">
                  {s.costImprovementEfficiency}
                </dd>
              </div>
              <div>
                <dt className="text-pixel-text-muted">回本反弹</dt>
                <dd className="font-medium text-pixel-text">
                  {formatPct(s.breakevenReboundPct)}
                </dd>
              </div>
            </dl>
          </PixelCard>
        ))}
      </div>
    </div>
  );
}
