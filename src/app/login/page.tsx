import { redirect } from "next/navigation";

import { getOptionalUser } from "@/lib/auth";

import { signInAction, signUpAction } from "./actions";

type LoginPageProps = {
  searchParams: Promise<{ error?: string; message?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const user = await getOptionalUser();

  if (user) {
    redirect("/inbox");
  }

  const params = await searchParams;
  const error = params.error;
  const message = params.message;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl items-center px-6 py-16">
      <section className="grid w-full gap-8 rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-8 shadow-sm lg:grid-cols-[1.1fr_1fr] lg:p-10">
        <div className="space-y-4">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-[var(--ink-muted)]">
            Follow-up OS
          </p>
          <h1 className="text-4xl font-semibold tracking-tight text-[var(--ink)]">
            Keep every client and lead moving.
          </h1>
          <p className="max-w-md text-base text-[var(--ink-muted)]">
            A lightweight follow-up tracker so no lead, invoice, or meeting ever
            loses its next action.
          </p>
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface-muted)] p-4 text-sm text-[var(--ink-muted)]">
            Use email + password. If your Supabase project has email
            confirmation enabled, confirm first and then sign in.
          </div>
        </div>

        <div className="space-y-4 rounded-2xl border border-[var(--line)] bg-white p-6">
          {error ? (
            <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          ) : null}
          {message ? (
            <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              {message}
            </p>
          ) : null}

          <form action={signInAction} className="space-y-3">
            <h2 className="text-lg font-semibold">Sign in</h2>
            <label className="block space-y-1 text-sm">
              <span className="text-[var(--ink-muted)]">Email</span>
              <input
                required
                name="email"
                type="email"
                className="w-full rounded-xl border border-[var(--line)] px-3 py-2 outline-none ring-[var(--accent)] focus:ring"
              />
            </label>
            <label className="block space-y-1 text-sm">
              <span className="text-[var(--ink-muted)]">Password</span>
              <input
                required
                minLength={6}
                name="password"
                type="password"
                className="w-full rounded-xl border border-[var(--line)] px-3 py-2 outline-none ring-[var(--accent)] focus:ring"
              />
            </label>
            <button
              type="submit"
              className="w-full rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-medium text-white hover:opacity-95"
            >
              Sign in
            </button>
          </form>

          <form action={signUpAction} className="space-y-3 border-t border-[var(--line)] pt-4">
            <h2 className="text-lg font-semibold">Create account</h2>
            <label className="block space-y-1 text-sm">
              <span className="text-[var(--ink-muted)]">Email</span>
              <input
                required
                name="email"
                type="email"
                className="w-full rounded-xl border border-[var(--line)] px-3 py-2 outline-none ring-[var(--accent)] focus:ring"
              />
            </label>
            <label className="block space-y-1 text-sm">
              <span className="text-[var(--ink-muted)]">Password</span>
              <input
                required
                minLength={6}
                name="password"
                type="password"
                className="w-full rounded-xl border border-[var(--line)] px-3 py-2 outline-none ring-[var(--accent)] focus:ring"
              />
            </label>
            <button
              type="submit"
              className="w-full rounded-xl border border-[var(--line)] bg-[var(--surface-muted)] px-4 py-2.5 text-sm font-medium text-[var(--ink)] hover:bg-[var(--accent-soft)]"
            >
              Create account
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
