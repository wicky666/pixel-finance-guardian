"use client";

export interface MiniScatterPoint {
  x: number;
  y: number;
  label?: string;
}

export function MiniScatterList({ data }: { data: MiniScatterPoint[] }) {
  if (data.length === 0) return <div className="text-xs text-pixel-text-muted">無數據</div>;
  const maxX = Math.max(...data.map((d) => d.x), 1);
  const maxY = Math.max(...data.map((d) => d.y), 1);
  return (
    <svg viewBox="0 0 100 100" className="h-40 w-full rounded-pixel border-2 border-pixel-border bg-pixel-page-bg">
      {data.map((d, i) => {
        const cx = (d.x / maxX) * 100;
        const cy = 100 - (d.y / maxY) * 100;
        return <circle key={d.label ?? i} cx={cx} cy={cy} r="2.2" fill="var(--color-danger)" />;
      })}
    </svg>
  );
}
