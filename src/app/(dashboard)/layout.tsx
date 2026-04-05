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
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-lg border border-[var(--line)] bg-[var(--surface)] px-5 py-4">
        <div className="space-y-1">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-[var(--ink-muted)]">
            Follow-up OS
          </p>
          <p className="text-xs text-[var(--ink-muted)]">Signed in as {user.email}</p>
        </div>

        <div className="flex items-center gap-3">
          <DashboardTabs />
          <form action={signOutAction}>
            <button
              type="submit"
              className="rounded-md border border-[var(--line)] bg-[var(--surface)] px-3 py-1.5 text-sm text-[var(--ink-muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--ink)]"
            >
              Sign out
            </button>
          </form>
        </div>
      </header>

      <main>{children}</main>
    </div>
  );
}
