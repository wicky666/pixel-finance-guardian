"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils/cn";
import { PixelLabel } from "./PixelLabel";

export interface PixelInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  label?: string;
  error?: string;
  wrapperClassName?: string;
}

export const PixelInput = forwardRef<HTMLInputElement, PixelInputProps>(
  (
    {
      className,
      label,
      error,
      wrapperClassName,
      id: idProp,
      ...props
    },
    ref
  ) => {
    const id = idProp ?? `pixel-input-${Math.random().toString(36).slice(2, 9)}`;

    return (
      <div className={cn("space-y-1", wrapperClassName)}>
        {label != null && (
          <PixelLabel htmlFor={id}>{label}</PixelLabel>
        )}
        <input
          ref={ref}
          id={id}
          className={cn(
            "w-full rounded-pixel border-2 bg-pixel-panel-bg px-3 py-2 text-pixel-text placeholder:text-pixel-text-muted",
            "transition-colors focus:border-pixel-accent focus:outline-none focus:ring-1 focus:ring-pixel-accent",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error
              ? "border-pixel-danger focus:border-pixel-danger focus:ring-pixel-danger"
              : "border-pixel-border",
            className
          )}
          aria-invalid={error != null}
          aria-describedby={error ? `${id}-error` : undefined}
          {...props}
        />
        {error != null && (
          <p
            id={`${id}-error`}
            className="text-sm text-pixel-danger"
            role="alert"
          >
            {error}
          </p>
        )}
      </div>
    );
  }
);

PixelInput.displayName = "PixelInput";
