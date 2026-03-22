import { type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export interface PageSectionProps {
  children: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
  className?: string;
}

export function PageSection({
  children,
  title,
  description,
  className,
}: PageSectionProps) {
  return (
    <section className={cn("space-y-4", className)}>
      {(title != null || description != null) && (
        <header className="space-y-1">
          {title != null && (
            <h2 className="text-xl font-semibold text-pixel-text">{title}</h2>
          )}
          {description != null && (
            <p className="text-sm text-pixel-text-muted">{description}</p>
          )}
        </header>
      )}
      {children}
    </section>
  );
}
