import { type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import { SHORT_DISCLAIMER } from "@/lib/compliance";

export interface ComplianceNoticeProps {
  /** Override default short disclaimer */
  text?: string;
  /** Inline (banner) vs block (footer) */
  variant?: "inline" | "block";
  className?: string;
  children?: ReactNode;
}

/**
 * Displays the standard short compliance disclaimer.
 * Use at top or bottom of simulation / report pages.
 */
export function ComplianceNotice({
  text = SHORT_DISCLAIMER,
  variant = "block",
  className,
  children,
}: ComplianceNoticeProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "text-sm text-pixel-text-muted",
        variant === "inline" && "inline",
        variant === "block" && "mt-4",
        className
      )}
    >
      {children ?? text}
    </div>
  );
}
