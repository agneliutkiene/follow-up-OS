import Link from "next/link";
import { format, parseISO } from "date-fns";

import { Button } from "@/components/ui/Button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { requireUser } from "@/lib/auth";
import type { Contact } from "@/lib/types";
import { createServerSupabaseClient } from "@/lib/supabase/server";

import { createContactAction, updateContactAction } from "./actions";

type ContactsPageProps = {
  searchParams: Promise<{ error?: string; message?: string }>;
};

function Notice({ tone, text }: { tone: "error" | "success"; text: string }) {
  if (tone === "error") {
    return (
      <p className="rounded-[var(--radius-md)] border border-[rgba(239,68,68,0.35)] bg-[rgba(239,68,68,0.14)] px-3 py-2 text-sm text-[#fca5a5]">
        {text}
      </p>
    );
  }

  return (
    <p className="rounded-[var(--radius-md)] border border-[rgba(16,185,129,0.35)] bg-[rgba(16,185,129,0.12)] px-3 py-2 text-sm text-[#86efac]">
      {text}
    </p>
  );
}

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
      <Card>
        <CardHeader className="space-y-4">
          <div>
            <CardTitle className="text-2xl">Contacts</CardTitle>
            <CardDescription className="mt-1">
              Add people once, then attach threads and keep every follow-up visible.
            </CardDescription>
          </div>

          {params.error ? <Notice tone="error" text={params.error} /> : null}
          {params.message ? <Notice tone="success" text={params.message} /> : null}
        </CardHeader>
      </Card>

      <Card>
        <CardHeader className="space-y-4">
          <div>
            <CardTitle className="text-base">New contact</CardTitle>
            <CardDescription className="mt-1">
              Name is required. Email, X handle, and notes are optional.
            </CardDescription>
          </div>

          <form action={createContactAction} className="grid gap-3 md:grid-cols-2">
            <label className="space-y-1.5 text-sm">
              <span className="text-[var(--muted)]">Name</span>
              <Input required name="name" placeholder="Jordan Lee" />
            </label>

            <label className="space-y-1.5 text-sm">
              <span className="text-[var(--muted)]">Email (optional)</span>
              <Input name="email" type="email" placeholder="jordan@example.com" />
            </label>

            <label className="space-y-1.5 text-sm">
              <span className="text-[var(--muted)]">X handle (optional)</span>
              <Input name="x_handle" placeholder="@jordan" />
            </label>

            <label className="space-y-1.5 text-sm">
              <span className="text-[var(--muted)]">Notes (optional)</span>
              <Textarea
                name="notes"
                rows={1}
                className="min-h-10 resize-none"
                placeholder="Prefers morning calls"
              />
            </label>

            <div className="md:col-span-2">
              <Button type="submit" variant="primary">
                Create contact
              </Button>
            </div>
          </form>
        </CardHeader>
      </Card>

      <section className="space-y-4">
        {contacts.length === 0 ? (
          <Card>
            <CardHeader className="py-10 text-center">
              <p className="text-sm text-[var(--muted)]">
                No contacts yet. Add your first contact above.
              </p>
            </CardHeader>
          </Card>
        ) : (
          contacts.map((contact) => (
            <Card key={contact.id}>
              <CardHeader className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <CardTitle className="text-base">{contact.name}</CardTitle>
                    <CardDescription className="mt-1 text-xs">
                      Added {format(parseISO(contact.created_at), "PP")}
                    </CardDescription>
                  </div>
                  <Link
                    href={`/inbox?contact_id=${contact.id}`}
                    className="inline-flex h-9 items-center justify-center rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-2)] px-3 text-xs font-medium text-[var(--text)] transition hover:bg-[var(--surface)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)]"
                  >
                    New thread
                  </Link>
                </div>

                <form action={updateContactAction} className="grid gap-3 md:grid-cols-2">
                  <input type="hidden" name="id" value={contact.id} />

                  <label className="space-y-1.5 text-sm">
                    <span className="text-[var(--muted)]">Name</span>
                    <Input required name="name" defaultValue={contact.name} />
                  </label>

                  <label className="space-y-1.5 text-sm">
                    <span className="text-[var(--muted)]">Email</span>
                    <Input
                      name="email"
                      type="email"
                      defaultValue={contact.email ?? ""}
                      placeholder="jordan@example.com"
                    />
                  </label>

                  <label className="space-y-1.5 text-sm">
                    <span className="text-[var(--muted)]">X handle</span>
                    <Input name="x_handle" defaultValue={contact.x_handle ?? ""} placeholder="@jordan" />
                  </label>

                  <label className="space-y-1.5 text-sm">
                    <span className="text-[var(--muted)]">Notes</span>
                    <Textarea
                      name="notes"
                      rows={1}
                      className="min-h-10 resize-none"
                      defaultValue={contact.notes ?? ""}
                    />
                  </label>

                  <div className="md:col-span-2">
                    <Button type="submit" variant="secondary">
                      Save changes
                    </Button>
                  </div>
                </form>
              </CardHeader>
            </Card>
          ))
        )}
      </section>
    </div>
  );
}
