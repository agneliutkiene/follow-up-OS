"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { buildDraftTemplate } from "@/lib/thread-templates";
import type { ThreadStatus, ThreadType } from "@/lib/types";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const allowedTypes: ThreadType[] = ["lead", "invoice", "meeting", "other"];
const allowedStatuses: ThreadStatus[] = ["open", "closed"];

function toText(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

function toOptionalText(value: FormDataEntryValue | null) {
  const text = toText(value);
  return text.length > 0 ? text : null;
}

function toIsoDateTime(value: FormDataEntryValue | null) {
  const text = toText(value);

  if (!text) {
    return null;
  }

  const date = new Date(text);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString();
}

function threadRedirectWithError(threadId: string, message: string): never {
  redirect(`/threads/${threadId}?error=${encodeURIComponent(message)}`);
}

function threadRedirectWithMessage(threadId: string, message: string): never {
  redirect(`/threads/${threadId}?message=${encodeURIComponent(message)}`);
}

export async function updateThreadAction(formData: FormData) {
  const threadId = toText(formData.get("thread_id"));
  const title = toText(formData.get("title"));
  const type = toText(formData.get("type"));
  const status = toText(formData.get("status"));
  const nextFollowupAt = toIsoDateTime(formData.get("next_followup_at"));
  const nextMessageDraft = toOptionalText(formData.get("next_message_draft"));

  if (!threadId) {
    redirect("/inbox?error=Thread%20not%20found");
  }

  if (!title) {
    threadRedirectWithError(threadId, "Title is required.");
  }

  if (!allowedTypes.includes(type as ThreadType)) {
    threadRedirectWithError(threadId, "Invalid thread type.");
  }

  if (!allowedStatuses.includes(status as ThreadStatus)) {
    threadRedirectWithError(threadId, "Invalid thread status.");
  }

  if (status === "open" && !nextFollowupAt) {
    threadRedirectWithError(
      threadId,
      "Open threads must have a next follow-up date.",
    );
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase
    .from("threads")
    .update({
      title,
      type,
      status,
      next_followup_at: status === "closed" ? null : nextFollowupAt,
      next_message_draft: nextMessageDraft,
    })
    .eq("id", threadId);

  if (error) {
    threadRedirectWithError(threadId, error.message);
  }

  revalidatePath("/inbox");
  revalidatePath(`/threads/${threadId}`);
  threadRedirectWithMessage(threadId, "Thread updated.");
}

export async function addTouchAction(formData: FormData) {
  const threadId = toText(formData.get("thread_id"));
  const body = toText(formData.get("body"));
  const nextFollowupAt = toIsoDateTime(formData.get("next_followup_at"));
  const nextMessageDraft = toOptionalText(formData.get("next_message_draft"));

  if (!threadId) {
    redirect("/inbox?error=Thread%20not%20found");
  }

  if (!body) {
    threadRedirectWithError(threadId, "Touch note cannot be empty.");
  }

  const supabase = await createServerSupabaseClient();
  const { error: touchError } = await supabase
    .from("touches")
    .insert({ thread_id: threadId, body });

  if (touchError) {
    threadRedirectWithError(threadId, touchError.message);
  }

  const updates: {
    last_touched_at: string;
    next_followup_at?: string | null;
    next_message_draft?: string | null;
  } = {
    last_touched_at: new Date().toISOString(),
  };

  if (nextFollowupAt) {
    updates.next_followup_at = nextFollowupAt;
  }

  if (nextMessageDraft) {
    updates.next_message_draft = nextMessageDraft;
  }

  const { error: updateError } = await supabase
    .from("threads")
    .update(updates)
    .eq("id", threadId);

  if (updateError) {
    threadRedirectWithError(threadId, updateError.message);
  }

  revalidatePath("/inbox");
  revalidatePath(`/threads/${threadId}`);
  threadRedirectWithMessage(threadId, "Touch added.");
}

export async function generateDraftAction(formData: FormData) {
  const threadId = toText(formData.get("thread_id"));

  if (!threadId) {
    redirect("/inbox?error=Thread%20not%20found");
  }

  const supabase = await createServerSupabaseClient();
  const { data: thread, error } = await supabase
    .from("threads")
    .select("id, title, type, contact:contacts(name)")
    .eq("id", threadId)
    .single();

  if (error || !thread) {
    threadRedirectWithError(threadId, error?.message ?? "Thread not found.");
  }

  const contact = Array.isArray(thread.contact)
    ? (thread.contact[0] ?? null)
    : thread.contact;
  const contactName = contact?.name ?? "there";
  const draft = buildDraftTemplate(
    thread.type as ThreadType,
    thread.title,
    contactName,
  );

  const { error: updateError } = await supabase
    .from("threads")
    .update({ next_message_draft: draft })
    .eq("id", threadId);

  if (updateError) {
    threadRedirectWithError(threadId, updateError.message);
  }

  revalidatePath("/inbox");
  revalidatePath(`/threads/${threadId}`);
  threadRedirectWithMessage(threadId, "Draft template generated.");
}

export async function markFollowupDoneAction(formData: FormData) {
  const threadId = toText(formData.get("thread_id"));
  const mode = toText(formData.get("mode"));
  const nextFollowupAt = toIsoDateTime(formData.get("next_followup_at"));
  const nextMessageDraft = toOptionalText(formData.get("next_message_draft"));

  if (!threadId) {
    redirect("/inbox?error=Thread%20not%20found");
  }

  const supabase = await createServerSupabaseClient();

  if (mode === "close") {
    const updates: {
      status: "closed";
      next_followup_at: null;
      last_touched_at: string;
      next_message_draft?: string | null;
    } = {
      status: "closed",
      next_followup_at: null,
      last_touched_at: new Date().toISOString(),
    };

    if (nextMessageDraft) {
      updates.next_message_draft = nextMessageDraft;
    }

    const { error } = await supabase
      .from("threads")
      .update(updates)
      .eq("id", threadId);

    if (error) {
      threadRedirectWithError(threadId, error.message);
    }

    revalidatePath("/inbox");
    revalidatePath(`/threads/${threadId}`);
    threadRedirectWithMessage(threadId, "Follow-up marked done and thread closed.");
  }

  if (!nextFollowupAt) {
    threadRedirectWithError(
      threadId,
      "Set a next follow-up date or choose close.",
    );
  }

  const { error } = await supabase
    .from("threads")
    .update({
      status: "open",
      next_followup_at: nextFollowupAt,
      next_message_draft: nextMessageDraft,
      last_touched_at: new Date().toISOString(),
    })
    .eq("id", threadId);

  if (error) {
    threadRedirectWithError(threadId, error.message);
  }

  revalidatePath("/inbox");
  revalidatePath(`/threads/${threadId}`);
  threadRedirectWithMessage(threadId, "Follow-up marked done and rescheduled.");
}
