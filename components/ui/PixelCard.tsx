import { type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export interface PixelCardProps {
  children: ReactNode;
  title?: ReactNode;
  className?: string;
  padding?: "none" | "sm" | "md";
}

const paddingStyles = {
  none: "",
  sm: "p-3",
  md: "p-4",
};

export function PixelCard({
  children,
  title,
  className,
  padding = "md",
}: PixelCardProps) {
  return (
    <div
      className={cn(
        "rounded-pixel border-2 border-pixel-border bg-pixel-panel-bg",
        className
      )}
    >
      {title != null && (
        <div className="border-b-2 border-pixel-border px-4 py-2">
          <span className="text-pixel-text font-medium">{title}</span>
        </div>
      )}
      <div className={cn(paddingStyles[padding])}>{children}</div>
    </div>
  );
}
