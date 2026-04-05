import type { InputHTMLAttributes } from "react";

import { cn } from "@/lib/cn";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-10 w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-2)] px-3 text-sm text-[var(--text)]",
        "placeholder:text-[var(--muted)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)]",
        className,
      )}
      {...props}
    />
  );
}
