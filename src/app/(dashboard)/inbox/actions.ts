"use server";

import { addDays } from "date-fns";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import type { ThreadType } from "@/lib/types";
import { createServerSupabaseClient } from "@/lib/supabase/server";

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

function inboxRedirectWithError(message: string): never {
  redirect(`/inbox?error=${encodeURIComponent(message)}`);
}

const allowedThreadTypes: ThreadType[] = ["lead", "invoice", "meeting", "other"];

export async function createThreadAction(formData: FormData) {
  const contactId = toText(formData.get("contact_id"));
  const title = toText(formData.get("title"));
  const type = toText(formData.get("type"));
  const nextFollowupAt = toIsoDateTime(formData.get("next_followup_at"));
  const nextMessageDraft = toOptionalText(formData.get("next_message_draft"));

  if (!contactId || !title || !nextFollowupAt) {
    inboxRedirectWithError("Contact, title, and next follow-up date are required.");
  }

  if (!allowedThreadTypes.includes(type as ThreadType)) {
    inboxRedirectWithError("Invalid thread type.");
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("threads")
    .insert({
      contact_id: contactId,
      title,
      type,
      status: "open",
      next_followup_at: nextFollowupAt,
      next_message_draft: nextMessageDraft,
    })
    .select("id")
    .single();

  if (error || !data?.id) {
    inboxRedirectWithError(error?.message ?? "Could not create thread.");
  }

  revalidatePath("/inbox");
  redirect(`/threads/${data.id}`);
}

export async function markDoneAction(formData: FormData) {
  const threadId = toText(formData.get("thread_id"));

  if (!threadId) {
    inboxRedirectWithError("Thread ID is required.");
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase
    .from("threads")
    .update({
      status: "closed",
      next_followup_at: null,
      last_touched_at: new Date().toISOString(),
    })
    .eq("id", threadId)
    .eq("status", "open");

  if (error) {
    inboxRedirectWithError(error.message);
  }

  revalidatePath("/inbox");
  revalidatePath(`/threads/${threadId}`);
  redirect("/inbox?message=Thread%20marked%20done%20and%20closed.");
}

export async function snoozeAction(formData: FormData) {
  const threadId = toText(formData.get("thread_id"));
  const daysValue = toText(formData.get("days"));
  const days = Number.parseInt(daysValue, 10);

  if (!threadId || ![2, 7].includes(days)) {
    inboxRedirectWithError("Invalid snooze request.");
  }

  const supabase = await createServerSupabaseClient();
  const { data: thread, error: findError } = await supabase
    .from("threads")
    .select("id, status, next_followup_at")
    .eq("id", threadId)
    .single();

  if (findError || !thread) {
    inboxRedirectWithError("Thread not found.");
  }

  if (thread.status !== "open" || !thread.next_followup_at) {
    inboxRedirectWithError("Only open threads with a follow-up date can be snoozed.");
  }

  const nextDate = addDays(new Date(thread.next_followup_at), days).toISOString();

  const { error: updateError } = await supabase
    .from("threads")
    .update({ next_followup_at: nextDate })
    .eq("id", threadId);

  if (updateError) {
    inboxRedirectWithError(updateError.message);
  }

  revalidatePath("/inbox");
  revalidatePath(`/threads/${threadId}`);
  redirect(`/inbox?message=${encodeURIComponent(`Snoozed by ${days} days.`)}`);
}
