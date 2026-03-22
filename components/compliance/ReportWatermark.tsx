import { cn } from "@/lib/utils/cn";
import { REPORT_WATERMARK_TEXT } from "@/lib/compliance";

export interface ReportWatermarkProps {
  /** Override watermark text */
  text?: string;
  /** Optional extra class for layout (e.g. pointer-events-none) */
  className?: string;
}

/**
 * Mandatory watermark for report / share views.
 * Place over report content so it appears on screenshots and prints.
 */
export function ReportWatermark({
  text = REPORT_WATERMARK_TEXT,
  className,
}: ReportWatermarkProps) {
  return (
    <div
      role="img"
      aria-label={text}
      className={cn(
        "absolute inset-0 flex items-center justify-center pointer-events-none select-none",
        className
      )}
    >
      <span
        className="text-pixel-text-muted/30 text-lg font-medium whitespace-nowrap rotate-[-12deg]"
        style={{ textShadow: "0 0 20px rgba(0,0,0,0.3)" }}
      >
        {text}
      </span>
    </div>
  );
}
