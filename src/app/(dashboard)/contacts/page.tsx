import Link from "next/link";

import { requireUser } from "@/lib/auth";
import type { Contact } from "@/lib/types";
import { createServerSupabaseClient } from "@/lib/supabase/server";

import { createContactAction, updateContactAction } from "./actions";

type ContactsPageProps = {
  searchParams: Promise<{ error?: string; message?: string }>;
};

export default async function ContactsPage({ searchParams }: ContactsPageProps) {
  await requireUser();
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("contacts")
    .select("id,name,email,x_handle,notes,created_at")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const params = await searchParams;
  const contacts = (data ?? []) as Contact[];

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5">
        <h1 className="text-2xl font-semibold tracking-tight">Contacts</h1>
        <p className="mt-1 text-sm text-[var(--ink-muted)]">
          Add people once, then attach follow-up threads from inbox or thread
          detail.
        </p>

        {params.error ? (
          <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {params.error}
          </p>
        ) : null}
        {params.message ? (
          <p className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            {params.message}
          </p>
        ) : null}

        <form action={createContactAction} className="mt-4 grid gap-3 rounded-2xl border border-[var(--line)] bg-white p-4 md:grid-cols-2">
          <label className="space-y-1 text-sm">
            <span className="text-[var(--ink-muted)]">Name</span>
            <input
              required
              name="name"
              className="w-full rounded-xl border border-[var(--line)] px-3 py-2 outline-none ring-[var(--accent)] focus:ring"
              placeholder="Jordan Lee"
            />
          </label>
          <label className="space-y-1 text-sm">
            <span className="text-[var(--ink-muted)]">Email (optional)</span>
            <input
              name="email"
              type="email"
              className="w-full rounded-xl border border-[var(--line)] px-3 py-2 outline-none ring-[var(--accent)] focus:ring"
              placeholder="jordan@example.com"
            />
          </label>
          <label className="space-y-1 text-sm">
            <span className="text-[var(--ink-muted)]">X handle (optional)</span>
            <input
              name="x_handle"
              className="w-full rounded-xl border border-[var(--line)] px-3 py-2 outline-none ring-[var(--accent)] focus:ring"
              placeholder="@jordan"
            />
          </label>
          <label className="space-y-1 text-sm">
            <span className="text-[var(--ink-muted)]">Notes (optional)</span>
            <input
              name="notes"
              className="w-full rounded-xl border border-[var(--line)] px-3 py-2 outline-none ring-[var(--accent)] focus:ring"
              placeholder="Prefers morning calls"
            />
          </label>

          <button
            type="submit"
            className="w-fit rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white hover:opacity-95"
          >
            Create contact
          </button>
        </form>
      </section>

      <section className="space-y-3">
        {contacts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[var(--line)] bg-[var(--surface)] px-4 py-10 text-center text-sm text-[var(--ink-muted)]">
            No contacts yet. Create your first one above.
          </div>
        ) : (
          contacts.map((contact) => (
            <form
              key={contact.id}
              action={updateContactAction}
              className="grid gap-3 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4 md:grid-cols-2"
            >
              <input type="hidden" name="id" value={contact.id} />

              <label className="space-y-1 text-sm">
                <span className="text-[var(--ink-muted)]">Name</span>
                <input
                  required
                  name="name"
                  defaultValue={contact.name}
                  className="w-full rounded-xl border border-[var(--line)] bg-white px-3 py-2 outline-none ring-[var(--accent)] focus:ring"
                />
              </label>
              <label className="space-y-1 text-sm">
                <span className="text-[var(--ink-muted)]">Email</span>
                <input
                  name="email"
                  type="email"
                  defaultValue={contact.email ?? ""}
                  className="w-full rounded-xl border border-[var(--line)] bg-white px-3 py-2 outline-none ring-[var(--accent)] focus:ring"
                />
              </label>
              <label className="space-y-1 text-sm">
                <span className="text-[var(--ink-muted)]">X handle</span>
                <input
                  name="x_handle"
                  defaultValue={contact.x_handle ?? ""}
                  className="w-full rounded-xl border border-[var(--line)] bg-white px-3 py-2 outline-none ring-[var(--accent)] focus:ring"
                />
              </label>
              <label className="space-y-1 text-sm">
                <span className="text-[var(--ink-muted)]">Notes</span>
                <input
                  name="notes"
                  defaultValue={contact.notes ?? ""}
                  className="w-full rounded-xl border border-[var(--line)] bg-white px-3 py-2 outline-none ring-[var(--accent)] focus:ring"
                />
              </label>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="submit"
                  className="rounded-xl border border-[var(--line)] bg-white px-3 py-2 text-sm hover:bg-[var(--surface-muted)]"
                >
                  Save
                </button>
                <Link
                  href={`/inbox?contact_id=${contact.id}`}
                  className="rounded-xl border border-[var(--line)] bg-white px-3 py-2 text-sm hover:bg-[var(--surface-muted)]"
                >
                  New thread
                </Link>
              </div>
            </form>
          ))
        )}
      </section>
    </div>
  );
}
