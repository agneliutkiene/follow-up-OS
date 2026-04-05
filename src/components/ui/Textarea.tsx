import type { TextareaHTMLAttributes } from "react";

import { cn } from "@/lib/cn";

export function Textarea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "w-full rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-sm text-[var(--text)]",
        "placeholder:text-[var(--muted)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)]",
        className,
      )}
      {...props}
    />
  );
}
