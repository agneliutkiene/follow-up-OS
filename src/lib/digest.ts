import "server-only";

import { isAfter, isBefore, parseISO, subMilliseconds } from "date-fns";
import { formatInTimeZone, fromZonedTime } from "date-fns-tz";
import { Resend } from "resend";

import { createAdminSupabaseClient } from "@/lib/supabase/admin";

type UserDigestSettings = {
  user_id: string;
  digest_enabled: boolean;
  digest_time_local: string;
  timezone: string;
};

type DigestThreadRow = {
  id: string;
  title: string;
  next_followup_at: string;
  next_message_draft: string | null;
  contact: { name: string }[] | { name: string } | null;
};

type DigestThread = {
  id: string;
  title: string;
  next_followup_at: string;
  next_message_draft: string | null;
  contact_name: string;
};

type DigestCounts = {
  overdue: number;
  due_today: number;
  upcoming: number;
};

type SendDigestOptions = {
  force?: boolean;
  now?: Date;
  settings?: UserDigestSettings;
};

export type SendDigestResult = {
  userId: string;
  email: string | null;
  status: "sent" | "skipped" | "error";
  reason?: string;
  errorMessage?: string;
  counts: DigestCounts;
};

const ZERO_COUNTS: DigestCounts = { overdue: 0, due_today: 0, upcoming: 0 };

function sanitizeBaseUrl(url: string | undefined) {
  return (url ?? "http://localhost:3000").replace(/\/$/, "");
}

function isValidTime(value: string) {
  return /^([01][0-9]|2[0-3]):[0-5][0-9]$/.test(value);
}

function addDaysToYmd(ymd: string, days: number) {
  const date = new Date(`${ymd}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function safeTimezone(timezone: string | null | undefined) {
  const candidate = timezone || "UTC";

  try {
    formatInTimeZone(new Date(), candidate, "yyyy-MM-dd");
    return candidate;
  } catch {
    return "UTC";
  }
}

function getContactName(
  contact: DigestThreadRow["contact"],
  fallback = "Unknown contact",
) {
  if (Array.isArray(contact)) {
    return contact[0]?.name ?? fallback;
  }

  return contact?.name ?? fallback;
}

function previewDraft(value: string | null) {
  if (!value) {
    return "No draft yet.";
  }

  return value.length > 120 ? `${value.slice(0, 120)}...` : value;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function buildTimezoneBoundaries(now: Date, timezone: string) {
  const localToday = formatInTimeZone(now, timezone, "yyyy-MM-dd");
  const localTomorrow = addDaysToYmd(localToday, 1);
  const localDayAfter7 = addDaysToYmd(localToday, 8);

  const startTodayUtc = fromZonedTime(`${localToday}T00:00:00`, timezone);
  const startTomorrowUtc = fromZonedTime(`${localTomorrow}T00:00:00`, timezone);
  const startDayAfter7Utc = fromZonedTime(`${localDayAfter7}T00:00:00`, timezone);
  const endTodayUtc = subMilliseconds(startTomorrowUtc, 1);
  const endUpcomingUtc = subMilliseconds(startDayAfter7Utc, 1);

  return {
    timezone,
    localToday,
    startTodayUtc,
    startTomorrowUtc,
    endTodayUtc,
    endUpcomingUtc,
  };
}

function shouldSendNow(
  now: Date,
  localToday: string,
  timezone: string,
  digestTimeLocal: string,
) {
  if (!isValidTime(digestTimeLocal)) {
    return false;
  }

  const scheduledUtc = fromZonedTime(
    `${localToday}T${digestTimeLocal}:00`,
    timezone,
  );

  return !isBefore(now, scheduledUtc);
}

async function getOrCreateUserSettings(userId: string) {
  const admin = createAdminSupabaseClient();
  const { data, error } = await admin
    .from("user_settings")
    .select("user_id,digest_enabled,digest_time_local,timezone")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (data) {
    return data as UserDigestSettings;
  }

  const { data: created, error: createError } = await admin
    .from("user_settings")
    .insert({ user_id: userId })
    .select("user_id,digest_enabled,digest_time_local,timezone")
    .single();

  if (createError || !created) {
    throw new Error(createError?.message ?? "Unable to initialize user settings.");
  }

  return created as UserDigestSettings;
}

async function hasSentDigestToday(
  userId: string,
  startTodayUtc: Date,
  startTomorrowUtc: Date,
) {
  const admin = createAdminSupabaseClient();
  const { count, error } = await admin
    .from("digest_logs")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("status", "sent")
    .gte("sent_at", startTodayUtc.toISOString())
    .lt("sent_at", startTomorrowUtc.toISOString());

  if (error) {
    throw new Error(error.message);
  }

  return (count ?? 0) > 0;
}

async function fetchDigestThreads(userId: string, endUpcomingUtc: Date) {
  const admin = createAdminSupabaseClient();
  const { data, error } = await admin
    .from("threads")
    .select("id,title,next_followup_at,next_message_draft,contact:contacts(name)")
    .eq("user_id", userId)
    .eq("status", "open")
    .not("next_followup_at", "is", null)
    .lte("next_followup_at", endUpcomingUtc.toISOString())
    .order("next_followup_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return ((data ?? []) as DigestThreadRow[]).map((row) => ({
    id: row.id,
    title: row.title,
    next_followup_at: row.next_followup_at,
    next_message_draft: row.next_message_draft,
    contact_name: getContactName(row.contact),
  }));
}

function splitThreadsByWindow(
  threads: DigestThread[],
  startTodayUtc: Date,
  endTodayUtc: Date,
  endUpcomingUtc: Date,
) {
  const overdue: DigestThread[] = [];
  const dueToday: DigestThread[] = [];
  const upcoming: DigestThread[] = [];

  threads.forEach((thread) => {
    const followupAt = parseISO(thread.next_followup_at);

    if (isBefore(followupAt, startTodayUtc)) {
      overdue.push(thread);
      return;
    }

    if (!isAfter(followupAt, endTodayUtc)) {
      dueToday.push(thread);
      return;
    }

    if (!isAfter(followupAt, endUpcomingUtc)) {
      upcoming.push(thread);
    }
  });

  return { overdue, dueToday, upcoming };
}

function renderThreadList(
  threads: DigestThread[],
  title: string,
  timezone: string,
  baseUrl: string,
  maxItems?: number,
) {
  const listed = typeof maxItems === "number" ? threads.slice(0, maxItems) : threads;
  const extraCount = threads.length - listed.length;

  if (listed.length === 0) {
    return `
      <section style="margin: 0 0 20px;">
        <h2 style="margin: 0 0 8px; font-size: 16px;">${escapeHtml(title)} (0)</h2>
        <p style="margin: 0; color: #64748b;">None</p>
      </section>
    `;
  }

  const items = listed
    .map((thread) => {
      const threadUrl = `${baseUrl}/threads/${thread.id}`;
      const followupLabel = formatInTimeZone(
        parseISO(thread.next_followup_at),
        timezone,
        "EEE, MMM d, HH:mm zzz",
      );

      return `
        <li style="margin: 0 0 12px; padding: 12px; border: 1px solid #E2E8F0; border-radius: 8px;">
          <div style="font-weight: 600; margin: 0 0 4px;">
            ${escapeHtml(thread.contact_name)} - ${escapeHtml(thread.title)}
          </div>
          <div style="color: #64748b; margin: 0 0 4px;">Next follow-up: ${escapeHtml(followupLabel)}</div>
          <div style="color: #64748b; margin: 0 0 6px;">
            Draft: ${escapeHtml(previewDraft(thread.next_message_draft))}
          </div>
          <a href="${escapeHtml(threadUrl)}" style="color: #2563EB; text-decoration: none;">Open thread</a>
        </li>
      `;
    })
    .join("");

  return `
    <section style="margin: 0 0 20px;">
      <h2 style="margin: 0 0 8px; font-size: 16px;">${escapeHtml(title)} (${threads.length})</h2>
      <ul style="margin: 0; padding: 0; list-style: none;">
        ${items}
      </ul>
      ${
        extraCount > 0
          ? `<p style="margin: 8px 0 0; color: #64748b;">+${extraCount} more not shown</p>`
          : ""
      }
    </section>
  `;
}

function buildDigestEmailHtml(params: {
  timezone: string;
  baseUrl: string;
  overdue: DigestThread[];
  dueToday: DigestThread[];
  upcoming: DigestThread[];
}) {
  const { timezone, baseUrl, overdue, dueToday, upcoming } = params;
  const inboxUrl = `${baseUrl}/inbox`;

  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; color: #0F172A; line-height: 1.45;">
      <h1 style="margin: 0 0 12px; font-size: 20px;">Follow-up OS Daily Digest</h1>
      <p style="margin: 0 0 16px; color: #64748b;">
        Here's your follow-up snapshot for today.
      </p>
      ${renderThreadList(overdue, "Overdue", timezone, baseUrl)}
      ${renderThreadList(dueToday, "Due Today", timezone, baseUrl)}
      ${renderThreadList(upcoming, "Upcoming 7 Days", timezone, baseUrl, 5)}
      <p style="margin: 16px 0 0;">
        <a href="${escapeHtml(inboxUrl)}" style="color: #2563EB; text-decoration: none;">Open inbox</a>
      </p>
    </div>
  `;
}

async function insertDigestLog(input: {
  userId: string;
  status: "sent" | "error";
  errorMessage?: string;
  counts: DigestCounts;
}) {
  const admin = createAdminSupabaseClient();
  const { error } = await admin.from("digest_logs").insert({
    user_id: input.userId,
    status: input.status,
    error_message: input.errorMessage ?? null,
    counts: input.counts,
  });

  if (error) {
    throw new Error(error.message);
  }
}

async function getUserEmail(userId: string) {
  const admin = createAdminSupabaseClient();
  const { data, error } = await admin.auth.admin.getUserById(userId);

  if (error) {
    throw new Error(error.message);
  }

  return data.user?.email ?? null;
}

export async function listEnabledDigestUsers() {
  const admin = createAdminSupabaseClient();
  const { data, error } = await admin
    .from("user_settings")
    .select("user_id,digest_enabled,digest_time_local,timezone")
    .eq("digest_enabled", true);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as UserDigestSettings[];
}

export async function sendDigestForUser(
  userId: string,
  options: SendDigestOptions = {},
): Promise<SendDigestResult> {
  let email: string | null = null;
  const now = options.now ?? new Date();
  const counts = { ...ZERO_COUNTS };
  try {
    const settings = options.settings ?? (await getOrCreateUserSettings(userId));
    const timezone = safeTimezone(settings.timezone);
    const boundaries = buildTimezoneBoundaries(now, timezone);

    email = await getUserEmail(userId);

    if (!email) {
      const result: SendDigestResult = {
        userId,
        email: null,
        status: "error",
        errorMessage: "User does not have an email address.",
        counts,
      };

      await insertDigestLog({
        userId,
        status: "error",
        errorMessage: result.errorMessage,
        counts,
      });

      return result;
    }

    if (!options.force && !settings.digest_enabled) {
      return {
        userId,
        email,
        status: "skipped",
        reason: "Digest disabled.",
        counts,
      };
    }

    if (
      !options.force &&
      !shouldSendNow(
        now,
        boundaries.localToday,
        boundaries.timezone,
        settings.digest_time_local,
      )
    ) {
      return {
        userId,
        email,
        status: "skipped",
        reason: "Not in delivery window yet.",
        counts,
      };
    }

    if (
      !options.force &&
      (await hasSentDigestToday(
        userId,
        boundaries.startTodayUtc,
        boundaries.startTomorrowUtc,
      ))
    ) {
      return {
        userId,
        email,
        status: "skipped",
        reason: "Digest already sent today.",
        counts,
      };
    }

    const threads = await fetchDigestThreads(userId, boundaries.endUpcomingUtc);
    const { overdue, dueToday, upcoming } = splitThreadsByWindow(
      threads,
      boundaries.startTodayUtc,
      boundaries.endTodayUtc,
      boundaries.endUpcomingUtc,
    );

    counts.overdue = overdue.length;
    counts.due_today = dueToday.length;
    counts.upcoming = upcoming.length;

    const resendApiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.DIGEST_FROM_EMAIL;

    if (!resendApiKey || !fromEmail) {
      const missingEnvMessage =
        "Missing RESEND_API_KEY or DIGEST_FROM_EMAIL environment variables.";

      await insertDigestLog({
        userId,
        status: "error",
        errorMessage: missingEnvMessage,
        counts,
      });

      return {
        userId,
        email,
        status: "error",
        errorMessage: missingEnvMessage,
        counts,
      };
    }

    const baseUrl = sanitizeBaseUrl(process.env.PUBLIC_BASE_URL);
    const subject = `Follow-up OS Digest: ${counts.overdue} overdue, ${counts.due_today} due today`;
    const html = buildDigestEmailHtml({
      timezone: boundaries.timezone,
      baseUrl,
      overdue,
      dueToday,
      upcoming,
    });

    const resend = new Resend(resendApiKey);
    const response = await resend.emails.send({
      from: fromEmail,
      to: [email],
      subject,
      html,
    });

    if (response.error) {
      await insertDigestLog({
        userId,
        status: "error",
        errorMessage: response.error.message,
        counts,
      });

      return {
        userId,
        email,
        status: "error",
        errorMessage: response.error.message,
        counts,
      };
    }

    await insertDigestLog({
      userId,
      status: "sent",
      counts,
    });

    return {
      userId,
      email,
      status: "sent",
      counts,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unexpected digest error.";

    try {
      await insertDigestLog({
        userId,
        status: "error",
        errorMessage: message,
        counts,
      });
    } catch {
      // Best-effort log write; keep returning error status.
    }

    return {
      userId,
      email,
      status: "error",
      errorMessage: message,
      counts,
    };
  }
}
