import { requireUser } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";

import { saveSettingsAction, sendTestDigestAction } from "./actions";
import { SettingsForm } from "./SettingsForm";

type SettingsPageProps = {
  searchParams: Promise<{ error?: string; message?: string }>;
};

type SettingsRow = {
  user_id: string;
  digest_enabled: boolean;
  digest_time_local: string;
  timezone: string;
  created_at: string;
  updated_at: string;
};

async function getOrCreateUserSettings(userId: string) {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("user_settings")
    .select(
      "user_id,digest_enabled,digest_time_local,timezone,created_at,updated_at",
    )
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (data) {
    return data as SettingsRow;
  }

  const { data: created, error: createError } = await supabase
    .from("user_settings")
    .insert({ user_id: userId })
    .select(
      "user_id,digest_enabled,digest_time_local,timezone,created_at,updated_at",
    )
    .single();

  if (createError || !created) {
    throw new Error(createError?.message ?? "Unable to create user settings.");
  }

  return created as SettingsRow;
}

export default async function SettingsPage({ searchParams }: SettingsPageProps) {
  const user = await requireUser();
  const settings = await getOrCreateUserSettings(user.id);
  const params = await searchParams;

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-[var(--line)] bg-[var(--surface)] p-5">
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--ink)]">
          Daily Digest Settings
        </h1>
        <p className="mt-1 text-sm text-[var(--ink-muted)]">
          Configure when your daily follow-up digest should arrive.
        </p>

        {params.error ? (
          <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {params.error}
          </p>
        ) : null}
        {params.message ? (
          <p className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            {params.message}
          </p>
        ) : null}
      </section>

      <SettingsForm
        settings={settings}
        saveSettingsAction={saveSettingsAction}
        sendTestDigestAction={sendTestDigestAction}
      />
    </div>
  );
}
