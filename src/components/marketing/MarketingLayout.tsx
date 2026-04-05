import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

type MarketingLayoutProps = {
  children: ReactNode;
  className?: string;
};

export function MarketingLayout({ children, className }: MarketingLayoutProps) {
  return (
    <div className={cn("relative isolate overflow-hidden bg-[#070a12]", className)}>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_8%,rgba(124,58,237,0.32),transparent_36%),radial-gradient(circle_at_88%_14%,rgba(37,99,235,0.26),transparent_32%),radial-gradient(circle_at_55%_82%,rgba(236,72,153,0.16),transparent_38%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.08)_1px,transparent_1px)] [background-size:44px_44px]" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
