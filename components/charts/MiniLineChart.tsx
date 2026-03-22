"use client";

export interface MiniLinePoint {
  label: string;
  value: number;
}

export function MiniLineChart({ data }: { data: MiniLinePoint[] }) {
  if (data.length === 0) return <div className="text-xs text-pixel-text-muted">無數據</div>;
  const values = data.map((d) => d.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const points = data
    .map((d, i) => {
      const x = (i / Math.max(1, data.length - 1)) * 100;
      const y = 100 - ((d.value - min) / range) * 100;
      return `${x},${y}`;
    })
    .join(" ");
  return (
    <svg viewBox="0 0 100 100" className="h-40 w-full rounded-pixel border-2 border-pixel-border bg-pixel-page-bg">
      <polyline fill="none" stroke="var(--color-accent)" strokeWidth="2" points={points} />
    </svg>
  );
}
