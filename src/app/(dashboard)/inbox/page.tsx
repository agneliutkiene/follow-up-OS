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

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import {
  Table,
  TableBody,
  TableHeader,
  TableWrapper,
  Td,
  Th,
} from "@/components/ui/Table";
import { requireUser } from "@/lib/auth";
import { cn } from "@/lib/cn";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { ThreadType } from "@/lib/types";

import { createThreadAction, markDoneAction, snoozeAction } from "./actions";
import { NewThreadDialog } from "./NewThreadDialog";

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
  "due-today": "Due today",
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

export default async function InboxPage({ searchParams }: InboxPageProps) {
  await requireUser();
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

  const threads = ((threadData ?? []) as ThreadQueryRow[]).map((row) => ({
    ...row,
    contact: Array.isArray(row.contact) ? (row.contact[0] ?? null) : row.contact,
  }));
  const contacts = (contactData ?? []) as ContactOption[];
  const buckets = getBuckets(threads);
  const activeRows = buckets[activeTab];

  return (
    <div className="space-y-6">
      <Card className="bg-[rgba(17,26,45,0.92)]">
        <CardHeader className="p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-1.5">
              <CardTitle className="text-2xl">Inbox</CardTitle>
              <CardDescription>
                Keep every thread pointed at a clear next action.
              </CardDescription>
            </div>
            <NewThreadDialog
              contacts={contacts}
              preselectedContactId={preselectedContactId}
              createThreadAction={createThreadAction}
            />
          </div>
          <div className="space-y-2 pt-1">
            {errorMessage ? <Notice tone="error" text={errorMessage} /> : null}
            {infoMessage ? <Notice tone="success" text={infoMessage} /> : null}
          </div>
        </CardHeader>
      </Card>

      <Card className="bg-[rgba(17,26,45,0.92)]">
        <CardHeader className="space-y-4 p-5">
          <div className="inline-flex w-full flex-wrap items-center gap-2 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-1">
            {(Object.keys(tabLabels) as InboxTab[]).map((tab) => (
              <Link
                key={tab}
                href={`/inbox?tab=${tab}`}
                className={cn(
                  "inline-flex h-9 items-center justify-center rounded-[var(--radius-md)] px-3 text-sm font-medium transition",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)]",
                  activeTab === tab
                    ? "bg-[var(--surface-2)] text-[var(--text)]"
                    : "text-[var(--muted)] hover:text-[var(--text)]",
                )}
              >
                {tabLabels[tab]} ({buckets[tab].length})
              </Link>
            ))}
          </div>

          <TableWrapper>
            <Table>
              <TableHeader>
                <tr>
                  <Th>Contact</Th>
                  <Th>Thread</Th>
                  <Th>Next follow-up</Th>
                  <Th>Status</Th>
                  <Th>Draft preview</Th>
                  <Th>Actions</Th>
                </tr>
              </TableHeader>
              <TableBody>
                {activeRows.length === 0 ? (
                  <tr>
                    <Td
                      colSpan={6}
                      className="px-4 py-12 text-center text-sm text-[var(--muted)]"
                    >
                      No threads here yet. Add one with <span className="text-[var(--text)]">New thread</span>.
                    </Td>
                  </tr>
                ) : (
                  activeRows.map((thread) => (
                    <tr
                      key={thread.id}
                      className="align-top transition-colors hover:bg-[rgba(148,163,184,0.06)]"
                    >
                      <Td className="font-medium">{thread.contact?.name ?? "Unknown"}</Td>
                      <Td>
                        <p className="font-medium text-[var(--text)]">{thread.title}</p>
                        <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--muted)]">
                          {thread.type}
                        </p>
                        <p className="mt-1 text-xs text-[var(--muted)]">
                          Last touched {format(parseISO(thread.last_touched_at), "PPp")}
                        </p>
                      </Td>
                      <Td className="text-[var(--muted)]">
                        {thread.next_followup_at
                          ? format(parseISO(thread.next_followup_at), "PPp")
                          : "-"}
                      </Td>
                      <Td>
                        <Badge variant={thread.status === "closed" ? "muted" : "default"}>
                          {thread.status}
                        </Badge>
                      </Td>
                      <Td className="max-w-xs text-[var(--muted)]">
                        {toDraftPreview(thread.next_message_draft)}
                      </Td>
                      <Td>
                        <div className="flex flex-wrap items-center gap-2">
                          <Link
                            href={`/threads/${thread.id}`}
                            className="inline-flex h-8 items-center justify-center rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-2)] px-3 text-xs font-medium text-[var(--text)] transition hover:bg-[var(--surface)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)]"
                          >
                            Open
                          </Link>
                          {thread.status === "open" ? (
                            <>
                              <form action={markDoneAction}>
                                <input type="hidden" name="thread_id" value={thread.id} />
                                <Button type="submit" size="sm" variant="ghost">
                                  Mark done
                                </Button>
                              </form>
                              <form action={snoozeAction}>
                                <input type="hidden" name="thread_id" value={thread.id} />
                                <input type="hidden" name="days" value="2" />
                                <Button type="submit" size="sm" variant="ghost">
                                  +2d
                                </Button>
                              </form>
                              <form action={snoozeAction}>
                                <input type="hidden" name="thread_id" value={thread.id} />
                                <input type="hidden" name="days" value="7" />
                                <Button type="submit" size="sm" variant="ghost">
                                  +7d
                                </Button>
                              </form>
                            </>
                          ) : null}
                        </div>
                      </Td>
                    </tr>
                  ))
                )}
              </TableBody>
            </Table>
          </TableWrapper>
        </CardHeader>
      </Card>
    </div>
  );
}
