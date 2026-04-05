import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
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

function Notice({ tone, text }: { tone: "error" | "success"; text: string }) {
  if (tone === "error") {
    return (
      <p className="mt-3 rounded-[var(--radius-md)] border border-[rgba(239,68,68,0.35)] bg-[rgba(239,68,68,0.14)] px-3 py-2 text-sm text-[#fca5a5]">
        {text}
      </p>
    );
  }

  return (
    <p className="mt-3 rounded-[var(--radius-md)] border border-[rgba(16,185,129,0.35)] bg-[rgba(16,185,129,0.12)] px-3 py-2 text-sm text-[#86efac]">
      {text}
    </p>
  );
}

export default async function SettingsPage({ searchParams }: SettingsPageProps) {
  const user = await requireUser();
  const settings = await getOrCreateUserSettings(user.id);
  const params = await searchParams;

  return (
    <div className="space-y-6">
      <Card className="bg-[rgba(17,26,45,0.92)]">
        <CardHeader className="p-5">
          <CardTitle className="text-2xl">Daily digest settings</CardTitle>
          <CardDescription>
            Configure when NoSlip sends your summary and test delivery instantly.
          </CardDescription>
          {params.error ? <Notice tone="error" text={params.error} /> : null}
          {params.message ? <Notice tone="success" text={params.message} /> : null}
        </CardHeader>
      </Card>

      <SettingsForm
        settings={settings}
        saveSettingsAction={saveSettingsAction}
        sendTestDigestAction={sendTestDigestAction}
      />
    </div>
  );
}
