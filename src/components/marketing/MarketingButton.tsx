import { cn } from "@/lib/cn";

type MarketingButtonVariant = "primary" | "secondary";

export function marketingButtonClass(variant: MarketingButtonVariant = "primary") {
  return cn(
    "inline-flex h-11 items-center justify-center rounded-[var(--radius-md)] px-5 text-sm font-medium transition",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
    variant === "primary"
      ? "border border-[#1b2235] bg-[#0b0f1a] text-white shadow-[0_8px_20px_rgba(0,0,0,0.32)] hover:bg-[#101728]"
      : "border border-white/25 bg-white/[0.06] text-slate-100 shadow-[0_8px_18px_rgba(0,0,0,0.18)] hover:bg-white/10",
  );
}
