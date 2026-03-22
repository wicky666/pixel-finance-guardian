"use client";

import { PixelCard, PixelInput, PixelButton } from "@/components/ui";
import type { AddInputMode, SandboxFormState } from "./types";

export interface SandboxFormProps {
  state: SandboxFormState;
  onStateChange: (next: SandboxFormState) => void;
  /** Whether current inputs can produce valid results */
  canCompute: boolean;
}

export function SandboxForm({
  state,
  onStateChange,
  canCompute,
}: SandboxFormProps) {
  const update = (partial: Partial<SandboxFormState>) => {
    onStateChange({ ...state, ...partial });
  };

  return (
    <PixelCard title="持仓与模拟输入">
      <div className="space-y-4">
        <PixelInput
          label="标的代码（如 SIM）"
          type="text"
          placeholder="SIM"
          value={state.symbol}
          onChange={(e) => update({ symbol: e.target.value })}
        />
        <div className="grid gap-4 sm:grid-cols-3">
          <PixelInput
            label="当前持仓股数"
            type="text"
            inputMode="decimal"
            placeholder="0"
            value={state.currentQuantity}
            onChange={(e) => update({ currentQuantity: e.target.value })}
          />
          <PixelInput
            label="当前平均成本"
            type="text"
            inputMode="decimal"
            placeholder="0"
            value={state.currentAverageCost}
            onChange={(e) => update({ currentAverageCost: e.target.value })}
          />
          <PixelInput
            label="当前市价"
            type="text"
            inputMode="decimal"
            placeholder="0"
            value={state.currentPrice}
            onChange={(e) => update({ currentPrice: e.target.value })}
          />
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-pixel-text">
            加仓按
          </p>
          <div className="flex gap-2">
            <PixelButton
              variant={state.addInputMode === "amount" ? "primary" : "neutral"}
              size="sm"
              type="button"
              onClick={() => update({ addInputMode: "amount" as AddInputMode })}
            >
              金额
            </PixelButton>
            <PixelButton
              variant={state.addInputMode === "quantity" ? "primary" : "neutral"}
              size="sm"
              type="button"
              onClick={() => update({ addInputMode: "quantity" as AddInputMode })}
            >
              股数
            </PixelButton>
          </div>
        </div>

        {state.addInputMode === "amount" ? (
          <PixelInput
            label="加仓金额"
            type="text"
            inputMode="decimal"
            placeholder="0"
            value={state.addAmount}
            onChange={(e) => update({ addAmount: e.target.value })}
          />
        ) : (
          <PixelInput
            label="加仓股数"
            type="text"
            inputMode="decimal"
            placeholder="0"
            value={state.addQuantity}
            onChange={(e) => update({ addQuantity: e.target.value })}
          />
        )}
      </div>
    </PixelCard>
  );
}
