import Link from "next/link";
import { format, parseISO } from "date-fns";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { requireUser } from "@/lib/auth";
import type { ThreadType, Touch } from "@/lib/types";
import { createServerSupabaseClient } from "@/lib/supabase/server";

import {
  addTouchAction,
  generateDraftAction,
  markFollowupDoneAction,
  updateThreadAction,
} from "./actions";

type ThreadDetails = {
  id: string;
  title: string;
  type: ThreadType;
  status: "open" | "closed";
  next_followup_at: string | null;
  next_message_draft: string | null;
  last_touched_at: string;
  created_at: string;
  contact: {
    id: string;
    name: string;
    email: string | null;
    x_handle: string | null;
    notes: string | null;
  } | null;
};

type ThreadQueryDetails = Omit<ThreadDetails, "contact"> & {
  contact:
    | {
        id: string;
        name: string;
        email: string | null;
        x_handle: string | null;
        notes: string | null;
      }[]
    | {
        id: string;
        name: string;
        email: string | null;
        x_handle: string | null;
        notes: string | null;
      }
    | null;
};

type ThreadPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; message?: string }>;
};

function localDateInputValue(iso: string | null) {
  if (!iso) {
    return "";
  }

  const date = new Date(iso);
  const padded = (n: number) => n.toString().padStart(2, "0");

  const year = date.getFullYear();
  const month = padded(date.getMonth() + 1);
  const day = padded(date.getDate());
  const hour = padded(date.getHours());
  const minute = padded(date.getMinutes());

  return `${year}-${month}-${day}T${hour}:${minute}`;
}

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

function FieldLabel({ children }: { children: ReactNode }) {
  return <span className="text-sm text-[var(--muted)]">{children}</span>;
}

export default async function ThreadPage({ params, searchParams }: ThreadPageProps) {
  await requireUser();
  const supabase = await createServerSupabaseClient();
  const { id } = await params;

  const [{ data: threadData, error: threadError }, { data: touchesData, error: touchesError }] =
    await Promise.all([
      supabase
        .from("threads")
        .select(
          "id,title,type,status,next_followup_at,next_message_draft,last_touched_at,created_at,contact:contacts(id,name,email,x_handle,notes)",
        )
        .eq("id", id)
        .single(),
      supabase
        .from("touches")
        .select("id,thread_id,user_id,body,created_at")
        .eq("thread_id", id)
        .order("created_at", { ascending: false }),
    ]);

  if (threadError || !threadData) {
    notFound();
  }

  if (touchesError) {
    throw new Error(touchesError.message);
  }

  const threadRaw = threadData as unknown as ThreadQueryDetails;
  const thread: ThreadDetails = {
    ...threadRaw,
    contact: Array.isArray(threadRaw.contact)
      ? (threadRaw.contact[0] ?? null)
      : threadRaw.contact,
  };
  const touches = (touchesData ?? []) as Touch[];
  const query = await searchParams;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
            Thread detail
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[var(--text)]">
            {thread.title}
          </h1>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Keep this thread aligned to the next concrete action.
          </p>
        </div>

        <Link
          href="/inbox"
          className="inline-flex h-10 items-center justify-center rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-2)] px-4 text-sm font-medium text-[var(--text)] transition hover:bg-[var(--surface)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)]"
        >
          Back to inbox
        </Link>
      </div>

      {query.error ? <Notice tone="error" text={query.error} /> : null}
      {query.message ? <Notice tone="success" text={query.message} /> : null}

      <Card>
        <CardHeader className="grid gap-4 md:grid-cols-2">
          <div>
            <CardTitle className="text-base">{thread.contact?.name ?? "Unknown contact"}</CardTitle>
            <CardDescription className="mt-1">
              {thread.contact?.email ?? "No email"}
              {thread.contact?.x_handle ? ` · ${thread.contact.x_handle}` : ""}
            </CardDescription>
            {thread.contact?.notes ? (
              <p className="mt-3 text-sm text-[var(--muted)]">{thread.contact.notes}</p>
            ) : null}
          </div>

          <div className="space-y-2 text-sm text-[var(--muted)]">
            <p className="flex items-center gap-2">
              <span>Status</span>
              <Badge variant={thread.status === "closed" ? "muted" : "default"}>{thread.status}</Badge>
            </p>
            <p className="flex items-center gap-2">
              <span>Type</span>
              <Badge variant="muted">{thread.type}</Badge>
            </p>
            <p>Last touched: {format(parseISO(thread.last_touched_at), "PPp")}</p>
            <p>Created: {format(parseISO(thread.created_at), "PPp")}</p>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base">Edit thread</CardTitle>
              <CardDescription className="mt-1">
                Open threads must keep a next follow-up date.
              </CardDescription>
            </div>
            <form action={generateDraftAction}>
              <input type="hidden" name="thread_id" value={thread.id} />
              <Button type="submit" variant="secondary" size="sm">
                Generate draft
              </Button>
            </form>
          </div>

          <form action={updateThreadAction} className="grid gap-3 md:grid-cols-2">
            <input type="hidden" name="thread_id" value={thread.id} />

            <label className="space-y-1.5">
              <FieldLabel>Title</FieldLabel>
              <Input required name="title" defaultValue={thread.title} />
            </label>

            <label className="space-y-1.5">
              <FieldLabel>Type</FieldLabel>
              <Select name="type" defaultValue={thread.type}>
                <option value="lead">Lead</option>
                <option value="invoice">Invoice</option>
                <option value="meeting">Meeting</option>
                <option value="other">Other</option>
              </Select>
            </label>

            <label className="space-y-1.5">
              <FieldLabel>Status</FieldLabel>
              <Select name="status" defaultValue={thread.status}>
                <option value="open">Open</option>
                <option value="closed">Closed</option>
              </Select>
            </label>

            <label className="space-y-1.5">
              <FieldLabel>Next follow-up</FieldLabel>
              <Input
                name="next_followup_at"
                type="datetime-local"
                defaultValue={localDateInputValue(thread.next_followup_at)}
              />
            </label>

            <label className="space-y-1.5 md:col-span-2">
              <FieldLabel>Next message draft</FieldLabel>
              <Textarea
                name="next_message_draft"
                defaultValue={thread.next_message_draft ?? ""}
                rows={4}
              />
            </label>

            <div className="md:col-span-2">
              <Button type="submit" variant="primary">
                Save changes
              </Button>
            </div>
          </form>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader className="space-y-4">
          <div>
            <CardTitle className="text-base">Mark follow-up done</CardTitle>
            <CardDescription className="mt-1">
              Either reschedule the next follow-up or close the thread.
            </CardDescription>
          </div>

          <form action={markFollowupDoneAction} className="grid gap-3 md:grid-cols-2">
            <input type="hidden" name="thread_id" value={thread.id} />

            <label className="space-y-1.5">
              <FieldLabel>Next follow-up date</FieldLabel>
              <Input
                type="datetime-local"
                name="next_followup_at"
                defaultValue={localDateInputValue(thread.next_followup_at)}
              />
            </label>

            <label className="space-y-1.5">
              <FieldLabel>Next message draft (optional)</FieldLabel>
              <Input name="next_message_draft" defaultValue={thread.next_message_draft ?? ""} />
            </label>

            <div className="flex flex-wrap items-center gap-2 md:col-span-2">
              <Button type="submit" name="mode" value="reschedule" variant="secondary">
                Mark done + set next follow-up
              </Button>
              <Button type="submit" name="mode" value="close" variant="primary">
                Mark done + close thread
              </Button>
            </div>
          </form>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader className="space-y-4">
          <div>
            <CardTitle className="text-base">Add touch</CardTitle>
            <CardDescription className="mt-1">
              Log an update, then optionally refresh the next follow-up and draft.
            </CardDescription>
          </div>

          <form action={addTouchAction} className="grid gap-3 md:grid-cols-2">
            <input type="hidden" name="thread_id" value={thread.id} />

            <label className="space-y-1.5 md:col-span-2">
              <FieldLabel>Note</FieldLabel>
              <Textarea
                required
                name="body"
                rows={3}
                placeholder="Called and confirmed they will reply tomorrow."
              />
            </label>

            <label className="space-y-1.5">
              <FieldLabel>Update next follow-up (optional)</FieldLabel>
              <Input type="datetime-local" name="next_followup_at" />
            </label>

            <label className="space-y-1.5">
              <FieldLabel>Update draft (optional)</FieldLabel>
              <Input name="next_message_draft" />
            </label>

            <div className="md:col-span-2">
              <Button type="submit" variant="secondary">
                Add touch
              </Button>
            </div>
          </form>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader className="space-y-4">
          <div>
            <CardTitle className="text-base">Activity log</CardTitle>
            <CardDescription className="mt-1">
              Timeline of touches recorded for this thread.
            </CardDescription>
          </div>

          {touches.length === 0 ? (
            <div className="rounded-[var(--radius-md)] border border-dashed border-[var(--border)] bg-[rgba(148,163,184,0.06)] px-4 py-8 text-center text-sm text-[var(--muted)]">
              No touches yet.
            </div>
          ) : (
            <ul className="space-y-2">
              {touches.map((touch) => (
                <li
                  key={touch.id}
                  className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[rgba(148,163,184,0.07)] px-3 py-3"
                >
                  <p className="text-sm text-[var(--text)]">{touch.body}</p>
                  <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--muted)]">
                    {format(parseISO(touch.created_at), "PPp")}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </CardHeader>
      </Card>
    </div>
  );
}
