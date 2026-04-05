import type { HTMLAttributes } from "react";

import { cn } from "@/lib/cn";

type BadgeVariant = "default" | "muted" | "success" | "danger";

const variantClasses: Record<BadgeVariant, string> = {
  default: "bg-[rgba(37,99,235,0.15)] text-[#93c5fd] border border-[rgba(37,99,235,0.35)]",
  muted: "bg-[var(--surface-2)] text-[var(--muted)] border border-[var(--border)]",
  success: "bg-[rgba(16,185,129,0.14)] text-[#86efac] border border-[rgba(16,185,129,0.35)]",
  danger: "bg-[rgba(239,68,68,0.14)] text-[#fca5a5] border border-[rgba(239,68,68,0.35)]",
};

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
};

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
        variantClasses[variant],
        className,
      )}
      {...props}
    />
  );
}
