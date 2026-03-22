"use client";

import { cn } from "@/lib/utils/cn";

export interface LoadingStateProps {
  message?: string;
  className?: string;
}

export function LoadingState({ message = "加载中…", className }: LoadingStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 py-12 text-pixel-text-muted",
        className
      )}
      role="status"
      aria-live="polite"
    >
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-pixel-border border-t-pixel-accent" />
      <p className="text-sm">{message}</p>
    </div>
  );
}
