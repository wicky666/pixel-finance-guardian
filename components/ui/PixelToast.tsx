"use client";

import { type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export type PixelToastVariant = "info" | "success" | "danger";

export interface PixelToastProps {
  message: ReactNode;
  title?: string;
  variant?: PixelToastVariant;
  onClose?: () => void;
  className?: string;
}

const variantStyles: Record<PixelToastVariant, string> = {
  info: "border-pixel-border bg-pixel-panel-bg",
  success: "border-pixel-success/60 bg-pixel-success/10",
  danger: "border-pixel-danger/60 bg-pixel-danger/10",
};

export function PixelToast({
  message,
  title,
  variant = "info",
  onClose,
  className,
}: PixelToastProps) {
  return (
    <div
      role="status"
      className={cn(
        "relative rounded-pixel border-2 px-4 py-3 shadow-lg",
        variantStyles[variant],
        className
      )}
    >
      {title != null && (
        <p className="mb-1 font-medium text-pixel-text">{title}</p>
      )}
      <p className="text-sm text-pixel-text">{message}</p>
      {onClose != null && (
        <button
          type="button"
          onClick={onClose}
          className="absolute right-2 top-2 text-pixel-text-muted hover:text-pixel-text focus-visible:outline focus-visible:ring-2 focus-visible:ring-pixel-accent"
          aria-label="Close"
        >
          ×
        </button>
      )}
    </div>
  );
}

export interface PixelAchievementToastProps extends PixelToastProps {
  title: string;
}

export function PixelAchievementToast({
  message,
  title,
  onClose,
  className,
}: PixelAchievementToastProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "relative rounded-pixel border-2 border-pixel-success/60 bg-pixel-success/10 px-4 py-3 shadow-lg",
        className
      )}
    >
      <p className="mb-0.5 text-xs font-medium uppercase tracking-wide text-pixel-success">
        Advancement Made
      </p>
      <p className="font-medium text-pixel-text">{title}</p>
      <p className="text-sm text-pixel-text-muted">{message}</p>
      {onClose != null && (
        <button
          type="button"
          onClick={onClose}
          className="absolute right-2 top-2 text-pixel-text-muted hover:text-pixel-text focus-visible:outline focus-visible:ring-2 focus-visible:ring-pixel-accent"
          aria-label="Close"
        >
          ×
        </button>
      )}
    </div>
  );
}
