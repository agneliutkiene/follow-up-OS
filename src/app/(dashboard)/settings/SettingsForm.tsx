"use client";

import { useMemo } from "react";

import { Button } from "@/components/ui/Button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

type SettingsRow = {
  digest_enabled: boolean;
  digest_time_local: string;
  timezone: string;
};

type SettingsFormProps = {
  settings: SettingsRow;
  saveSettingsAction: (formData: FormData) => void | Promise<void>;
  sendTestDigestAction:
    | (() => void | Promise<void>)
    | ((formData: FormData) => void | Promise<void>);
};

const fallbackTimezones = [
  "UTC",
  "Europe/Vilnius",
  "Europe/London",
  "Europe/Berlin",
  "America/New_York",
  "America/Chicago",
  "America/Los_Angeles",
  "Asia/Dubai",
  "Asia/Singapore",
  "Asia/Tokyo",
  "Australia/Sydney",
];

function getBrowserTimezone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

function getTimezoneOptions(settingsTimezone: string) {
  const browserTimezone = getBrowserTimezone();
  const intlWithSupported = Intl as typeof Intl & {
    supportedValuesOf?: (type: string) => string[];
  };
  const supportedValuesOf = intlWithSupported.supportedValuesOf;

  const fromIntl =
    typeof supportedValuesOf === "function"
      ? supportedValuesOf("timeZone")
      : fallbackTimezones;

  const set = new Set<string>(["UTC", ...fromIntl]);

  if (browserTimezone) {
    set.add(browserTimezone);
  }

  if (settingsTimezone) {
    set.add(settingsTimezone);
  }

  return Array.from(set).sort((a, b) => a.localeCompare(b));
}

export function SettingsForm({
  settings,
  saveSettingsAction,
  sendTestDigestAction,
}: SettingsFormProps) {
  const browserTimezone = useMemo(() => getBrowserTimezone(), []);
  const timezoneOptions = useMemo(
    () => getTimezoneOptions(settings.timezone),
    [settings.timezone],
  );

  const timezoneDefault =
    settings.timezone === "UTC" && browserTimezone
      ? browserTimezone
      : settings.timezone;

  return (
    <div className="space-y-6">
      <form action={saveSettingsAction}>
        <Card>
          <CardHeader className="space-y-5 p-5">
            <div className="flex items-start justify-between gap-4 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-4">
              <div>
                <CardTitle className="text-base">Daily digest</CardTitle>
                <CardDescription className="mt-1">
                  Receive one concise summary with follow-ups that need attention.
                </CardDescription>
              </div>
              <label className="inline-flex items-center gap-2 text-sm text-[var(--text)]">
                <input
                  name="digest_enabled"
                  type="checkbox"
                  defaultChecked={settings.digest_enabled}
                  className="h-4 w-4 rounded border-[var(--border)] bg-[var(--surface-2)] text-[var(--primary)] focus:ring-2 focus:ring-[var(--ring)]"
                />
                Enabled
              </label>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-1 text-sm">
                <span className="text-[var(--muted)]">Digest time (local)</span>
                <Input
                  required
                  type="time"
                  name="digest_time_local"
                  defaultValue={settings.digest_time_local}
                />
              </label>

              <label className="space-y-1 text-sm">
                <span className="text-[var(--muted)]">Timezone</span>
                <Select required name="timezone" defaultValue={timezoneDefault}>
                  {timezoneOptions.map((timezone) => (
                    <option key={timezone} value={timezone}>
                      {timezone}
                    </option>
                  ))}
                </Select>
              </label>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button type="submit" variant="primary">
                Save settings
              </Button>
              <p className="text-xs text-[var(--muted)]">
                Browser timezone detected: {browserTimezone || "UTC"}
              </p>
            </div>
          </CardHeader>
        </Card>
      </form>

      <form action={sendTestDigestAction}>
        <Card>
          <CardHeader className="flex flex-wrap items-center justify-between gap-3 p-5">
            <div>
              <CardTitle className="text-base">Send test digest</CardTitle>
              <CardDescription className="mt-1">
                Send a one-off digest email immediately using your current settings.
              </CardDescription>
            </div>
            <Button type="submit" variant="secondary">
              Send test digest
            </Button>
          </CardHeader>
        </Card>
      </form>
    </div>
  );
}
