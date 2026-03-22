"use client";

import { type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export interface PageLayoutProps {
  children: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
  className?: string;
}

/** Unified page wrapper: max-width container + optional title/description */
export function PageLayout({
  children,
  title,
  description,
  className,
}: PageLayoutProps) {
  return (
    <div className={cn("min-h-screen bg-[#090d14] text-slate-100", className)}>
      <div className="mx-auto max-w-6xl px-4 py-6">
        {title != null && (
          <header className="mb-6">
            <h1 className="text-2xl font-semibold text-white">{title}</h1>
            {description != null && (
              <p className="mt-1 text-sm text-slate-300">{description}</p>
            )}
          </header>
        )}
        {children}
      </div>
    </div>
  );
}
