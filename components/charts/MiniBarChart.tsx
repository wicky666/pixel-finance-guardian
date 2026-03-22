"use client";

export interface MiniBarItem {
  label: string;
  value: number;
}

export function MiniBarChart({ data, max = 100 }: { data: MiniBarItem[]; max?: number }) {
  return (
    <div className="space-y-2">
      {data.map((d) => (
        <div key={d.label} className="flex items-center gap-2 text-xs">
          <span className="w-12 text-pixel-text-muted">{d.label}</span>
          <div className="h-4 flex-1 rounded-pixel border border-pixel-border bg-pixel-page-bg">
            <div
              className="h-full rounded-[1px] bg-pixel-success"
              style={{ width: `${Math.max(0, Math.min(100, (d.value / max) * 100))}%` }}
            />
          </div>
          <span className="w-10 text-right text-pixel-text">{d.value.toFixed(0)}%</span>
        </div>
      ))}
    </div>
  );
}
