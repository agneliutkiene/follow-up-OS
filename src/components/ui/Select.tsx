import type { SelectHTMLAttributes } from "react";

import { cn } from "@/lib/cn";

export function Select({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "h-10 w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-2)] px-3 text-sm text-[var(--text)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)]",
        className,
      )}
      {...props}
    />
  );
}
