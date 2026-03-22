import { type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";
import { FORMULA_EXPLANATION_COST_AVG } from "@/lib/compliance";

export interface FormulaExplanationNoticeProps {
  /** Override default formula explanation (e.g. cost avg) */
  text?: string;
  title?: ReactNode;
  className?: string;
  children?: ReactNode;
}

/**
 * Collapsible or static block explaining the math behind results.
 * Use near sandbox / shadow simulation outputs.
 */
export function FormulaExplanationNotice({
  text = FORMULA_EXPLANATION_COST_AVG,
  title = "计算说明",
  className,
  children,
}: FormulaExplanationNoticeProps) {
  return (
    <aside
      className={cn(
        "rounded-pixel border border-pixel-border bg-pixel-panel-bg/80 p-3 text-sm text-pixel-text-muted",
        className
      )}
    >
      {title && (
        <p className="mb-1 font-medium text-pixel-text">{title}</p>
      )}
      {children ?? <p>{text}</p>}
    </aside>
  );
}
