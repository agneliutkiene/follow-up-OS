import { redirect } from "next/navigation";

import { NoSlipLogo } from "@/components/brand/NoSlipLogo";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { getOptionalUser } from "@/lib/auth";

import { signInAction, signUpAction } from "./actions";

type LoginPageProps = {
  searchParams: Promise<{ error?: string; message?: string }>;
};

function Alert({
  tone,
  children,
}: {
  tone: "error" | "success";
  children: React.ReactNode;
}) {
  if (tone === "error") {
    return (
      <p className="rounded-[var(--radius-md)] border border-[rgba(239,68,68,0.35)] bg-[rgba(239,68,68,0.14)] px-3 py-2 text-sm text-[#fca5a5]">
        {children}
      </p>
    );
  }

  return (
    <p className="rounded-[var(--radius-md)] border border-[rgba(16,185,129,0.35)] bg-[rgba(16,185,129,0.12)] px-3 py-2 text-sm text-[#86efac]">
      {children}
    </p>
  );
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const user = await getOptionalUser();

  if (user) {
    redirect("/inbox");
  }

  const params = await searchParams;
  const error = params.error;
  const message = params.message;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl items-center px-6 py-12">
      <section className="grid w-full gap-8 lg:grid-cols-[1.1fr_1fr] lg:gap-12">
        <div className="space-y-7">
          <NoSlipLogo className="h-9" />
          <div className="max-w-xl space-y-4">
            <p className="font-mono text-xs uppercase tracking-[0.24em] text-[var(--muted)]">
              noslip.cloud
            </p>
            <h1 className="text-4xl font-semibold leading-tight tracking-tight text-[var(--text)] md:text-5xl">
              NoSlip keeps every follow-up moving.
            </h1>
            <p className="text-base text-[var(--muted)]">
              NoSlip — daily follow-up digest + drafts so nothing falls through.
            </p>
          </div>

          <ul className="space-y-3">
            <li className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--text)]">
              Daily digest: see overdue, due today, and upcoming in one glance.
            </li>
            <li className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--text)]">
              Drafts ready: keep your next message prepared for every open thread.
            </li>
            <li className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--text)]">
              One-click snooze: shift follow-ups by 2 or 7 days without losing context.
            </li>
          </ul>
        </div>

        <Card className="border-[var(--border)] bg-[rgba(17,26,45,0.9)] backdrop-blur">
          <CardHeader className="pb-4">
            <CardTitle>Welcome to NoSlip</CardTitle>
            <CardDescription>
              Sign in or create an account. If email confirmation is enabled in Supabase,
              confirm first, then sign in.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error ? <Alert tone="error">{error}</Alert> : null}
            {message ? <Alert tone="success">{message}</Alert> : null}

            <form action={signInAction} className="space-y-3">
              <h2 className="text-base font-semibold text-[var(--text)]">Sign in</h2>
              <label className="block space-y-1 text-sm">
                <span className="text-[var(--muted)]">Email</span>
                <Input required name="email" type="email" autoComplete="email" />
              </label>
              <label className="block space-y-1 text-sm">
                <span className="text-[var(--muted)]">Password</span>
                <Input
                  required
                  minLength={6}
                  name="password"
                  type="password"
                  autoComplete="current-password"
                />
              </label>
              <Button type="submit" variant="primary" className="w-full">
                Sign in
              </Button>
            </form>

            <form action={signUpAction} className="space-y-3 border-t border-[var(--border)] pt-4">
              <h2 className="text-base font-semibold text-[var(--text)]">Create account</h2>
              <label className="block space-y-1 text-sm">
                <span className="text-[var(--muted)]">Email</span>
                <Input required name="email" type="email" autoComplete="email" />
              </label>
              <label className="block space-y-1 text-sm">
                <span className="text-[var(--muted)]">Password</span>
                <Input
                  required
                  minLength={6}
                  name="password"
                  type="password"
                  autoComplete="new-password"
                />
              </label>
              <Button type="submit" variant="secondary" className="w-full">
                Create account
              </Button>
            </form>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
