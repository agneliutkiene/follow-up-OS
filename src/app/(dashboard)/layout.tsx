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
    <div className="mx-auto min-h-screen w-full max-w-6xl px-6 py-8">
      <header className="mb-6 rounded-[var(--radius-xl)] border border-[var(--border)] bg-[rgba(17,26,45,0.9)] px-5 py-4 shadow-[var(--shadow-sm)] backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <NoSlipLogo className="h-8" />
            <div className="space-y-0.5">
              <p className="text-sm font-semibold text-[var(--text)]">NoSlip</p>
              <p className="text-xs text-[var(--muted)]">
                NoSlip — daily follow-up digest + drafts so nothing falls through.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <DashboardTabs />
            <p className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-2.5 py-1 text-xs text-[var(--muted)]">
              {user.email}
            </p>
            <form action={signOutAction}>
              <Button type="submit" variant="ghost" size="sm">
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
