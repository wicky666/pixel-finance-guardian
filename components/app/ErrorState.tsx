"use client";

import { type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export interface ErrorStateProps {
  title?: string;
  message?: ReactNode;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = "出错了",
  message,
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 py-12 text-center",
        className
      )}
      role="alert"
    >
      <p className="font-medium text-pixel-danger">{title}</p>
      {message != null && (
        <p className="max-w-sm text-sm text-pixel-text-muted">{message}</p>
      )}
      {onRetry != null && (
        <button
          type="button"
          onClick={onRetry}
          className="rounded-pixel border-2 border-pixel-border bg-pixel-panel-bg px-4 py-2 text-sm text-pixel-text hover:bg-pixel-border"
        >
          重试
        </button>
      )}
    </div>
  );
}
