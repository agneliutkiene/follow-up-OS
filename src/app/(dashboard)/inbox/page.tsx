import Link from "next/link";
import {
  addDays,
  endOfDay,
  format,
  isBefore,
  isWithinInterval,
  parseISO,
  startOfDay,
} from "date-fns";

import { requireUser } from "@/lib/auth";
import type { ThreadType } from "@/lib/types";
import { createServerSupabaseClient } from "@/lib/supabase/server";

import { createThreadAction, markDoneAction, snoozeAction } from "./actions";

type InboxTab = "due-today" | "overdue" | "upcoming" | "closed";

type ThreadRow = {
  id: string;
  title: string;
  type: ThreadType;
  status: "open" | "closed";
  next_followup_at: string | null;
  next_message_draft: string | null;
  last_touched_at: string;
  contact: { name: string } | null;
};

type ThreadQueryRow = Omit<ThreadRow, "contact"> & {
  contact: { name: string }[] | { name: string } | null;
};

type ContactOption = {
  id: string;
  name: string;
};

function asDate(value: string | null) {
  return value ? parseISO(value) : null;
}

function toDraftPreview(value: string | null) {
  if (!value) {
    return "No draft yet.";
  }

  return value.length > 84 ? `${value.slice(0, 84)}...` : value;
}

function localDateInputValue(date: Date) {
  const padded = (n: number) => n.toString().padStart(2, "0");
  const year = date.getFullYear();
  const month = padded(date.getMonth() + 1);
  const day = padded(date.getDate());
  const hours = padded(date.getHours());
  const minutes = padded(date.getMinutes());

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function getBuckets(rows: ThreadRow[]) {
  const now = new Date();
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);
  const upcomingEnd = endOfDay(addDays(now, 7));

  const buckets: Record<InboxTab, ThreadRow[]> = {
    "due-today": [],
    overdue: [],
    upcoming: [],
    closed: [],
  };

  rows.forEach((row) => {
    if (row.status === "closed") {
      buckets.closed.push(row);
      return;
    }

    const nextFollowupDate = asDate(row.next_followup_at);

    if (!nextFollowupDate) {
      buckets.overdue.push(row);
      return;
    }

    if (isBefore(nextFollowupDate, todayStart)) {
      buckets.overdue.push(row);
      return;
    }

    if (
      isWithinInterval(nextFollowupDate, {
        start: todayStart,
        end: todayEnd,
      })
    ) {
      buckets["due-today"].push(row);
      return;
    }

    if (
      isWithinInterval(nextFollowupDate, {
        start: todayEnd,
        end: upcomingEnd,
      })
    ) {
      buckets.upcoming.push(row);
    }
  });

  return buckets;
}

function parseTab(value: string | undefined): InboxTab {
  if (value === "overdue" || value === "upcoming" || value === "closed") {
    return value;
  }

  return "due-today";
}

const tabLabels: Record<InboxTab, string> = {
  "due-today": "Due Today",
  overdue: "Overdue",
  upcoming: "Upcoming 7d",
  closed: "Closed",
};

type InboxPageProps = {
  searchParams: Promise<{
    tab?: string;
    error?: string;
    message?: string;
    contact_id?: string;
  }>;
};

export default async function InboxPage({ searchParams }: InboxPageProps) {
  const user = await requireUser();
  const supabase = await createServerSupabaseClient();

  const [{ data: threadData, error: threadsError }, { data: contactData, error: contactsError }] =
    await Promise.all([
      supabase
        .from("threads")
        .select(
          "id,title,type,status,next_followup_at,next_message_draft,last_touched_at,contact:contacts(name)",
        )
        .order("status", { ascending: true })
        .order("next_followup_at", { ascending: true, nullsFirst: false }),
      supabase.from("contacts").select("id,name").order("name", { ascending: true }),
    ]);

  if (threadsError) {
    throw new Error(threadsError.message);
  }

  if (contactsError) {
    throw new Error(contactsError.message);
  }

  const params = await searchParams;
  const activeTab = parseTab(params.tab);
  const infoMessage = params.message;
  const errorMessage = params.error;
  const preselectedContactId = params.contact_id;

  const threads = ((threadData ?? []) as unknown as ThreadQueryRow[]).map((row) => ({
    ...row,
    contact: Array.isArray(row.contact) ? (row.contact[0] ?? null) : row.contact,
  }));
  const contacts = (contactData ?? []) as ContactOption[];
  const buckets = getBuckets(threads);
  const activeRows = buckets[activeTab];

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-[var(--ink)]">
              Inbox
            </h1>
            <p className="text-sm text-[var(--ink-muted)]">
              Signed in as {user.email}. Keep every open thread attached to a
              next follow-up.
            </p>
          </div>
        </div>

        {errorMessage ? (
          <p className="mb-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {errorMessage}
          </p>
        ) : null}
        {infoMessage ? (
          <p className="mb-3 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            {infoMessage}
          </p>
        ) : null}

        <form action={createThreadAction} className="grid gap-3 rounded-2xl border border-[var(--line)] bg-white p-4 md:grid-cols-2">
          <input type="hidden" name="status" value="open" />
          <label className="space-y-1 text-sm">
            <span className="text-[var(--ink-muted)]">Contact</span>
            <select
              name="contact_id"
              required
              defaultValue={preselectedContactId ?? ""}
              className="w-full rounded-xl border border-[var(--line)] px-3 py-2 outline-none ring-[var(--accent)] focus:ring"
            >
              <option value="" disabled>
                Select a contact
              </option>
              {contacts.map((contact) => (
                <option key={contact.id} value={contact.id}>
                  {contact.name}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1 text-sm">
            <span className="text-[var(--ink-muted)]">Thread title</span>
            <input
              required
              name="title"
              placeholder="Invoice #2045"
              className="w-full rounded-xl border border-[var(--line)] px-3 py-2 outline-none ring-[var(--accent)] focus:ring"
            />
          </label>

          <label className="space-y-1 text-sm">
            <span className="text-[var(--ink-muted)]">Type</span>
            <select
              name="type"
              defaultValue="lead"
              className="w-full rounded-xl border border-[var(--line)] px-3 py-2 outline-none ring-[var(--accent)] focus:ring"
            >
              <option value="lead">Lead</option>
              <option value="invoice">Invoice</option>
              <option value="meeting">Meeting</option>
              <option value="other">Other</option>
            </select>
          </label>

          <label className="space-y-1 text-sm">
            <span className="text-[var(--ink-muted)]">Next follow-up</span>
            <input
              required
              type="datetime-local"
              name="next_followup_at"
              defaultValue={localDateInputValue(addDays(new Date(), 1))}
              className="w-full rounded-xl border border-[var(--line)] px-3 py-2 outline-none ring-[var(--accent)] focus:ring"
            />
          </label>

          <label className="space-y-1 text-sm md:col-span-2">
            <span className="text-[var(--ink-muted)]">Next message draft</span>
            <textarea
              name="next_message_draft"
              rows={3}
              placeholder="Optional draft for your next follow-up"
              className="w-full rounded-xl border border-[var(--line)] px-3 py-2 outline-none ring-[var(--accent)] focus:ring"
            />
          </label>

          <button
            type="submit"
            className="w-fit rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white hover:opacity-95"
          >
            Create thread
          </button>
        </form>
      </section>

      <section className="space-y-3 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5">
        <div className="flex flex-wrap items-center gap-2">
          {(Object.keys(tabLabels) as InboxTab[]).map((tab) => (
            <Link
              key={tab}
              href={`/inbox?tab=${tab}`}
              className={`rounded-full border px-3 py-1.5 text-sm ${
                activeTab === tab
                  ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--ink)]"
                  : "border-[var(--line)] bg-white text-[var(--ink-muted)]"
              }`}
            >
              {tabLabels[tab]} ({buckets[tab].length})
            </Link>
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-y-2 text-sm">
            <thead>
              <tr className="text-left text-[var(--ink-muted)]">
                <th className="px-3">Contact</th>
                <th className="px-3">Thread</th>
                <th className="px-3">Next follow-up</th>
                <th className="px-3">Status</th>
                <th className="px-3">Draft preview</th>
                <th className="px-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {activeRows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="rounded-xl border border-dashed border-[var(--line)] bg-white px-3 py-6 text-center text-[var(--ink-muted)]">
                    No threads in this bucket.
                  </td>
                </tr>
              ) : (
                activeRows.map((thread) => (
                  <tr key={thread.id} className="rounded-xl border border-[var(--line)] bg-white align-top">
                    <td className="rounded-l-xl px-3 py-3 font-medium">
                      {thread.contact?.name ?? "Unknown"}
                    </td>
                    <td className="px-3 py-3">
                      <p className="font-medium text-[var(--ink)]">{thread.title}</p>
                      <p className="font-mono text-xs uppercase tracking-wide text-[var(--ink-muted)]">
                        {thread.type}
                      </p>
                      <p className="mt-1 text-xs text-[var(--ink-muted)]">
                        Last touched {format(parseISO(thread.last_touched_at), "PPp")}
                      </p>
                    </td>
                    <td className="px-3 py-3 text-[var(--ink-muted)]">
                      {thread.next_followup_at
                        ? format(parseISO(thread.next_followup_at), "PPp")
                        : "-"}
                    </td>
                    <td className="px-3 py-3">
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium ${
                          thread.status === "closed"
                            ? "bg-zinc-200 text-zinc-700"
                            : "bg-[var(--accent-soft)] text-[var(--ink)]"
                        }`}
                      >
                        {thread.status}
                      </span>
                    </td>
                    <td className="max-w-xs px-3 py-3 text-[var(--ink-muted)]">
                      {toDraftPreview(thread.next_message_draft)}
                    </td>
                    <td className="rounded-r-xl px-3 py-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          href={`/threads/${thread.id}`}
                          className="rounded-lg border border-[var(--line)] px-2.5 py-1.5 text-xs hover:bg-[var(--surface-muted)]"
                        >
                          Open
                        </Link>
                        {thread.status === "open" ? (
                          <>
                            <form action={markDoneAction}>
                              <input type="hidden" name="thread_id" value={thread.id} />
                              <button
                                type="submit"
                                className="rounded-lg border border-[var(--line)] px-2.5 py-1.5 text-xs hover:bg-[var(--surface-muted)]"
                              >
                                Mark done
                              </button>
                            </form>
                            <form action={snoozeAction}>
                              <input type="hidden" name="thread_id" value={thread.id} />
                              <input type="hidden" name="days" value="2" />
                              <button
                                type="submit"
                                className="rounded-lg border border-[var(--line)] px-2.5 py-1.5 text-xs hover:bg-[var(--surface-muted)]"
                              >
                                Snooze 2d
                              </button>
                            </form>
                            <form action={snoozeAction}>
                              <input type="hidden" name="thread_id" value={thread.id} />
                              <input type="hidden" name="days" value="7" />
                              <button
                                type="submit"
                                className="rounded-lg border border-[var(--line)] px-2.5 py-1.5 text-xs hover:bg-[var(--surface-muted)]"
                              >
                                Snooze 7d
                              </button>
                            </form>
                          </>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
