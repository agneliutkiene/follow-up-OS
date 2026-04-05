import Link from "next/link";

import { NoSlipLogo } from "@/components/brand/NoSlipLogo";
import { Button } from "@/components/ui/Button";
import { requireUser } from "@/lib/auth";

import { DashboardTabs } from "./DashboardTabs";
import { signOutAction } from "./actions";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();

  return (
    <div className="mx-auto min-h-screen w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      <header className="mb-6 rounded-[var(--radius-xl)] border border-[var(--border)] bg-[rgba(9,14,27,0.88)] px-4 py-4 shadow-[var(--shadow-sm)] backdrop-blur-sm sm:px-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link href="/inbox" className="flex items-center gap-3 rounded-[var(--radius-md)] px-1 py-1.5">
            <NoSlipLogo className="h-8 w-auto" />
            <div className="space-y-0.5">
              <p className="text-sm font-semibold tracking-tight text-[var(--text)]">NoSlip</p>
              <p className="text-xs text-[var(--muted)]">Follow-up workspace</p>
            </div>
          </Link>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <DashboardTabs />
            <p className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[rgba(148,163,184,0.08)] px-2.5 py-1 text-xs text-[var(--muted)]">
              {user.email}
            </p>
            <form action={signOutAction}>
              <Button type="submit" variant="ghost" size="sm" className="text-xs">
                Sign out
              </Button>
            </form>
          </div>
        </div>
      </header>

      <main>{children}</main>
    </div>
  );
}
