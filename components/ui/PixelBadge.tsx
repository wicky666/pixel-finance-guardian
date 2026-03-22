import { type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export type PixelBadgeVariant = "success" | "danger" | "muted" | "accent";

export interface PixelBadgeProps {
  children: ReactNode;
  variant?: PixelBadgeVariant;
  className?: string;
}

const variantStyles: Record<PixelBadgeVariant, string> = {
  success:
    "bg-pixel-success/20 border-pixel-success text-pixel-success",
  danger:
    "bg-pixel-danger/20 border-pixel-danger text-pixel-danger",
  muted:
    "bg-pixel-muted/20 border-pixel-muted text-pixel-text-muted",
  accent:
    "bg-pixel-accent/20 border-pixel-accent text-pixel-accent",
};

export function PixelBadge({
  children,
  variant = "muted",
  className,
}: PixelBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-pixel border-2 px-2 py-0.5 text-xs font-medium",
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
