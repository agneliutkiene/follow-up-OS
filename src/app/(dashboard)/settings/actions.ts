"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireUser } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";

function toText(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

function settingsRedirectWithError(message: string): never {
  redirect(`/settings?error=${encodeURIComponent(message)}`);
}

function settingsRedirectWithMessage(message: string): never {
  redirect(`/settings?message=${encodeURIComponent(message)}`);
}

function isValidTime(value: string) {
  return /^([01][0-9]|2[0-3]):[0-5][0-9]$/.test(value);
}

export async function saveSettingsAction(formData: FormData) {
  const user = await requireUser();
  const digestEnabled = formData.get("digest_enabled") === "on";
  const digestTimeLocal = toText(formData.get("digest_time_local"));
  const timezone = toText(formData.get("timezone"));

  if (!isValidTime(digestTimeLocal)) {
    settingsRedirectWithError("Please provide a valid digest time.");
  }

  if (!timezone) {
    settingsRedirectWithError("Timezone is required.");
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from("user_settings").upsert(
    {
      user_id: user.id,
      digest_enabled: digestEnabled,
      digest_time_local: digestTimeLocal,
      timezone,
    },
    { onConflict: "user_id" },
  );

  if (error) {
    settingsRedirectWithError(error.message);
  }

  revalidatePath("/settings");
  settingsRedirectWithMessage("Daily digest settings saved.");
}

export async function sendTestDigestAction() {
  await requireUser();

  revalidatePath("/settings");
  settingsRedirectWithMessage("Test digest queued (stub). Prompt #2 will wire sending.");
}
