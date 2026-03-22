"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils/cn";

export type PixelButtonVariant = "primary" | "danger" | "neutral" | "ghost";
export type PixelButtonSize = "sm" | "md" | "lg";

export interface PixelButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: PixelButtonVariant;
  size?: PixelButtonSize;
}

const variantStyles: Record<PixelButtonVariant, string> = {
  primary:
    "bg-pixel-success border-pixel border-pixel-border text-[#1a1a1a] hover:brightness-110 active:translate-y-[2px] active:shadow-[inset_0_2px_0_rgba(0,0,0,0.2)] disabled:opacity-50 disabled:pointer-events-none disabled:active:translate-y-0",
  danger:
    "bg-pixel-danger border-pixel border-pixel-border text-white hover:brightness-110 active:translate-y-[2px] active:shadow-[inset_0_2px_0_rgba(0,0,0,0.2)] disabled:opacity-50 disabled:pointer-events-none disabled:active:translate-y-0",
  neutral:
    "bg-pixel-panel-bg border-pixel border-pixel-border text-pixel-text hover:bg-[#4d4d4d] active:translate-y-[2px] active:shadow-[inset_0_2px_0_rgba(0,0,0,0.2)] disabled:opacity-50 disabled:pointer-events-none disabled:active:translate-y-0",
  ghost:
    "bg-transparent border-pixel border-pixel-border text-pixel-text hover:bg-pixel-panel-bg active:translate-y-[2px] disabled:opacity-50 disabled:pointer-events-none disabled:active:translate-y-0",
};

const sizeStyles: Record<PixelButtonSize, string> = {
  sm: "px-2 py-1 text-sm",
  md: "px-4 py-2 text-base",
  lg: "px-6 py-3 text-lg",
};

export const PixelButton = forwardRef<HTMLButtonElement, PixelButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      disabled,
      type = "button",
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled}
        className={cn(
          "inline-flex items-center justify-center rounded-pixel font-medium transition-all focus-visible:outline focus-visible:ring-2 focus-visible:ring-pixel-accent focus-visible:ring-offset-2 focus-visible:ring-offset-pixel-page-bg",
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      />
    );
  }
);

PixelButton.displayName = "PixelButton";
