import type { ReactNode } from "react";

export function MarketingLayout({ children }: { children: ReactNode }) {
  return <div className="text-slate-100">{children}</div>;
}
