import Link from "next/link";
import { format, parseISO } from "date-fns";
import { notFound } from "next/navigation";

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

type ThreadPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; message?: string }>;
};

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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--ink-muted)]">
            Thread Detail
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">{thread.title}</h1>
        </div>

        <Link
          href="/inbox"
          className="rounded-xl border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-sm hover:bg-[var(--surface-muted)]"
        >
          Back to inbox
        </Link>
      </div>

      {query.error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {query.error}
        </p>
      ) : null}
      {query.message ? (
        <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {query.message}
        </p>
      ) : null}

      <section className="grid gap-4 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 md:grid-cols-2">
        <div>
          <p className="text-sm text-[var(--ink-muted)]">Contact</p>
          <p className="text-lg font-semibold">{thread.contact?.name ?? "Unknown"}</p>
          <p className="mt-1 text-sm text-[var(--ink-muted)]">
            {thread.contact?.email ?? "No email"}
            {thread.contact?.x_handle ? ` · ${thread.contact.x_handle}` : ""}
          </p>
          {thread.contact?.notes ? (
            <p className="mt-2 text-sm text-[var(--ink-muted)]">{thread.contact.notes}</p>
          ) : null}
        </div>
        <div className="space-y-1 text-sm text-[var(--ink-muted)]">
          <p>
            Status: <span className="font-medium text-[var(--ink)]">{thread.status}</span>
          </p>
          <p>
            Type: <span className="font-medium text-[var(--ink)]">{thread.type}</span>
          </p>
          <p>
            Last touched: {format(parseISO(thread.last_touched_at), "PPp")}
          </p>
          <p>Created: {format(parseISO(thread.created_at), "PPp")}</p>
        </div>
      </section>

      <section className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Edit thread</h2>
          <form action={generateDraftAction}>
            <input type="hidden" name="thread_id" value={thread.id} />
            <button
              type="submit"
              className="rounded-xl border border-[var(--line)] bg-white px-3 py-2 text-sm hover:bg-[var(--surface-muted)]"
            >
              Generate draft
            </button>
          </form>
        </div>

        <form action={updateThreadAction} className="grid gap-3 md:grid-cols-2">
          <input type="hidden" name="thread_id" value={thread.id} />

          <label className="space-y-1 text-sm">
            <span className="text-[var(--ink-muted)]">Title</span>
            <input
              required
              name="title"
              defaultValue={thread.title}
              className="w-full rounded-xl border border-[var(--line)] bg-white px-3 py-2 outline-none ring-[var(--accent)] focus:ring"
            />
          </label>

          <label className="space-y-1 text-sm">
            <span className="text-[var(--ink-muted)]">Type</span>
            <select
              name="type"
              defaultValue={thread.type}
              className="w-full rounded-xl border border-[var(--line)] bg-white px-3 py-2 outline-none ring-[var(--accent)] focus:ring"
            >
              <option value="lead">Lead</option>
              <option value="invoice">Invoice</option>
              <option value="meeting">Meeting</option>
              <option value="other">Other</option>
            </select>
          </label>

          <label className="space-y-1 text-sm">
            <span className="text-[var(--ink-muted)]">Status</span>
            <select
              name="status"
              defaultValue={thread.status}
              className="w-full rounded-xl border border-[var(--line)] bg-white px-3 py-2 outline-none ring-[var(--accent)] focus:ring"
            >
              <option value="open">Open</option>
              <option value="closed">Closed</option>
            </select>
          </label>

          <label className="space-y-1 text-sm">
            <span className="text-[var(--ink-muted)]">Next follow-up</span>
            <input
              name="next_followup_at"
              type="datetime-local"
              defaultValue={localDateInputValue(thread.next_followup_at)}
              className="w-full rounded-xl border border-[var(--line)] bg-white px-3 py-2 outline-none ring-[var(--accent)] focus:ring"
            />
          </label>

          <label className="space-y-1 text-sm md:col-span-2">
            <span className="text-[var(--ink-muted)]">Next message draft</span>
            <textarea
              name="next_message_draft"
              defaultValue={thread.next_message_draft ?? ""}
              rows={4}
              className="w-full rounded-xl border border-[var(--line)] bg-white px-3 py-2 outline-none ring-[var(--accent)] focus:ring"
            />
          </label>

          <button
            type="submit"
            className="w-fit rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white hover:opacity-95"
          >
            Save changes
          </button>
        </form>
      </section>

      <section className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5">
        <h2 className="mb-3 text-lg font-semibold">Mark follow-up done</h2>
        <p className="mb-3 text-sm text-[var(--ink-muted)]">
          Rule enforced: either set next follow-up date or close the thread.
        </p>

        <form action={markFollowupDoneAction} className="grid gap-3 md:grid-cols-2">
          <input type="hidden" name="thread_id" value={thread.id} />

          <label className="space-y-1 text-sm">
            <span className="text-[var(--ink-muted)]">Next follow-up date</span>
            <input
              type="datetime-local"
              name="next_followup_at"
              defaultValue={localDateInputValue(thread.next_followup_at)}
              className="w-full rounded-xl border border-[var(--line)] bg-white px-3 py-2 outline-none ring-[var(--accent)] focus:ring"
            />
          </label>

          <label className="space-y-1 text-sm">
            <span className="text-[var(--ink-muted)]">Next message draft (optional)</span>
            <input
              name="next_message_draft"
              defaultValue={thread.next_message_draft ?? ""}
              className="w-full rounded-xl border border-[var(--line)] bg-white px-3 py-2 outline-none ring-[var(--accent)] focus:ring"
            />
          </label>

          <div className="flex flex-wrap items-center gap-2 md:col-span-2">
            <button
              type="submit"
              name="mode"
              value="reschedule"
              className="rounded-xl border border-[var(--line)] bg-white px-3 py-2 text-sm hover:bg-[var(--surface-muted)]"
            >
              Mark done + set next follow-up
            </button>
            <button
              type="submit"
              name="mode"
              value="close"
              className="rounded-xl bg-[var(--accent)] px-3 py-2 text-sm font-medium text-white hover:opacity-95"
            >
              Mark done + close thread
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5">
        <h2 className="mb-3 text-lg font-semibold">Add touch</h2>

        <form action={addTouchAction} className="grid gap-3 md:grid-cols-2">
          <input type="hidden" name="thread_id" value={thread.id} />

          <label className="space-y-1 text-sm md:col-span-2">
            <span className="text-[var(--ink-muted)]">Note</span>
            <textarea
              required
              name="body"
              rows={3}
              placeholder="Called and confirmed they will reply tomorrow."
              className="w-full rounded-xl border border-[var(--line)] bg-white px-3 py-2 outline-none ring-[var(--accent)] focus:ring"
            />
          </label>

          <label className="space-y-1 text-sm">
            <span className="text-[var(--ink-muted)]">Update next follow-up (optional)</span>
            <input
              type="datetime-local"
              name="next_followup_at"
              className="w-full rounded-xl border border-[var(--line)] bg-white px-3 py-2 outline-none ring-[var(--accent)] focus:ring"
            />
          </label>

          <label className="space-y-1 text-sm">
            <span className="text-[var(--ink-muted)]">Update draft (optional)</span>
            <input
              name="next_message_draft"
              className="w-full rounded-xl border border-[var(--line)] bg-white px-3 py-2 outline-none ring-[var(--accent)] focus:ring"
            />
          </label>

          <button
            type="submit"
            className="w-fit rounded-xl border border-[var(--line)] bg-white px-3 py-2 text-sm hover:bg-[var(--surface-muted)]"
          >
            Add touch
          </button>
        </form>
      </section>

      <section className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5">
        <h2 className="mb-3 text-lg font-semibold">Activity log</h2>

        {touches.length === 0 ? (
          <p className="rounded-xl border border-dashed border-[var(--line)] bg-white px-3 py-6 text-sm text-[var(--ink-muted)]">
            No touches yet.
          </p>
        ) : (
          <ul className="space-y-2">
            {touches.map((touch) => (
              <li
                key={touch.id}
                className="rounded-xl border border-[var(--line)] bg-white px-3 py-3"
              >
                <p className="text-sm">{touch.body}</p>
                <p className="mt-1 font-mono text-xs uppercase tracking-[0.15em] text-[var(--ink-muted)]">
                  {format(parseISO(touch.created_at), "PPp")}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
