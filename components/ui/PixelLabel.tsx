import { type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export interface PixelLabelProps {
  children: ReactNode;
  htmlFor?: string;
  required?: boolean;
  className?: string;
}

export function PixelLabel({
  children,
  htmlFor,
  required,
  className,
}: PixelLabelProps) {
  return (
    <label
      htmlFor={htmlFor}
      className={cn(
        "block text-pixel-text text-sm font-medium",
        required && "after:ml-0.5 after:text-pixel-danger after:content-['*']",
        className
      )}
    >
      {children}
    </label>
  );
}
