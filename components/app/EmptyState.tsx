"use client";

import { type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export interface EmptyStateProps {
  title?: string;
  description?: ReactNode;
  className?: string;
}

export function EmptyState({
  title = "暂无数据",
  description,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2 py-12 text-center text-pixel-text-muted",
        className
      )}
    >
      <p className="font-medium text-pixel-text">{title}</p>
      {description != null && (
        <p className="max-w-sm text-sm">{description}</p>
      )}
    </div>
  );
}
