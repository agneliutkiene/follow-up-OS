"use client";

import { useMemo } from "react";

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
      <form
        action={saveSettingsAction}
        className="space-y-5 rounded-lg border border-[var(--line)] bg-[var(--surface)] p-5"
      >
        <div className="flex items-start justify-between gap-4 rounded-lg border border-[var(--line)] bg-[var(--surface-muted)] p-4">
          <div>
            <h2 className="text-sm font-medium text-[var(--ink)]">Daily digest</h2>
            <p className="mt-1 text-sm text-[var(--ink-muted)]">
              Receive a once-daily summary with follow-ups that need attention.
            </p>
          </div>
          <label className="inline-flex items-center gap-2 text-sm text-[var(--ink)]">
            <input
              name="digest_enabled"
              type="checkbox"
              defaultChecked={settings.digest_enabled}
              className="h-4 w-4 rounded border-[var(--line)] text-[var(--accent)] focus:ring-[var(--accent)]"
            />
            Enabled
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-1 text-sm">
            <span className="text-[var(--ink-muted)]">Digest time (local)</span>
            <input
              required
              type="time"
              name="digest_time_local"
              defaultValue={settings.digest_time_local}
              className="w-full rounded-md border border-[var(--line)] bg-[var(--surface)] px-3 py-2 outline-none ring-[var(--accent)] focus:ring"
            />
          </label>

          <label className="space-y-1 text-sm">
            <span className="text-[var(--ink-muted)]">Timezone</span>
            <select
              required
              name="timezone"
              defaultValue={timezoneDefault}
              className="w-full rounded-md border border-[var(--line)] bg-[var(--surface)] px-3 py-2 outline-none ring-[var(--accent)] focus:ring"
            >
              {timezoneOptions.map((timezone) => (
                <option key={timezone} value={timezone}>
                  {timezone}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="submit"
            className="rounded-md bg-[var(--accent)] px-3 py-2 text-sm font-medium text-white hover:opacity-95"
          >
            Save settings
          </button>
          <p className="text-xs text-[var(--ink-muted)]">
            Browser timezone detected: {browserTimezone || "UTC"}
          </p>
        </div>
      </form>

      <form
        action={sendTestDigestAction}
        className="rounded-lg border border-[var(--line)] bg-[var(--surface)] p-5"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-medium text-[var(--ink)]">Test digest</h2>
            <p className="mt-1 text-sm text-[var(--ink-muted)]">
              Sends a one-off test digest using your current settings (stub for now).
            </p>
          </div>
          <button
            type="submit"
            className="rounded-md border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--ink-muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--ink)]"
          >
            Send test digest
          </button>
        </div>
      </form>
    </div>
  );
}
