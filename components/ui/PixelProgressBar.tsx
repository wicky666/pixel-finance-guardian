import { cn } from "@/lib/utils/cn";

export type PixelProgressBarVariant = "default" | "success" | "danger";

export interface PixelProgressBarProps {
  value: number;
  max?: number;
  variant?: PixelProgressBarVariant;
  showLabel?: boolean;
  className?: string;
}

const variantStyles: Record<PixelProgressBarVariant, string> = {
  default: "bg-pixel-muted",
  success: "bg-pixel-success",
  danger: "bg-pixel-danger",
};

export function PixelProgressBar({
  value,
  max = 100,
  variant = "default",
  showLabel = false,
  className,
}: PixelProgressBarProps) {
  const percent = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;

  return (
    <div className={cn("space-y-1", className)}>
      <div
        className="h-4 w-full overflow-hidden rounded-pixel border-2 border-pixel-border bg-pixel-panel-bg"
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
      >
        <div
          className={cn(
            "h-full rounded-[1px] transition-[width] duration-200",
            variantStyles[variant]
          )}
          style={{ width: `${percent}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-xs text-pixel-text-muted">
          {Math.round(percent)}%
        </span>
      )}
    </div>
  );
}
