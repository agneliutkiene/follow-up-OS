import Link from "next/link";

import { requireUser } from "@/lib/auth";

import { signOutAction } from "./actions";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();

  return (
    <div className="mx-auto min-h-screen w-full max-w-6xl px-6 py-8">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[var(--line)] bg-[var(--surface)] px-5 py-4">
        <div className="space-y-1">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-[var(--ink-muted)]">
            Follow-up OS
          </p>
          <p className="text-sm text-[var(--ink-muted)]">{user.email}</p>
        </div>

        <nav className="flex items-center gap-2 text-sm">
          <Link
            href="/inbox"
            className="rounded-xl border border-[var(--line)] px-3 py-1.5 hover:bg-[var(--surface-muted)]"
          >
            Inbox
          </Link>
          <Link
            href="/contacts"
            className="rounded-xl border border-[var(--line)] px-3 py-1.5 hover:bg-[var(--surface-muted)]"
          >
            Contacts
          </Link>
          <form action={signOutAction}>
            <button
              type="submit"
              className="rounded-xl bg-[var(--accent)] px-3 py-1.5 text-white hover:opacity-95"
            >
              Sign out
            </button>
          </form>
        </nav>
      </header>

      <main>{children}</main>
    </div>
  );
}
