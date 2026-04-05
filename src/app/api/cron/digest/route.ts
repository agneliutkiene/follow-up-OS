import { type NextRequest, NextResponse } from "next/server";

import { listEnabledDigestUsers, sendDigestForUser } from "@/lib/digest";

type DigestSummary = {
  force: boolean;
  totalEnabled: number;
  sent: number;
  skipped: number;
  errors: number;
  results: Array<{
    userId: string;
    email: string | null;
    status: "sent" | "skipped" | "error";
    reason?: string;
    errorMessage?: string;
    counts: {
      overdue: number;
      due_today: number;
      upcoming: number;
    };
  }>;
};

function parseForce(value: string | null) {
  return value === "1" || value === "true";
}

function hasValidSecret(request: NextRequest) {
  const expectedSecret = process.env.DIGEST_CRON_SECRET;

  if (!expectedSecret) {
    return { valid: false, reason: "DIGEST_CRON_SECRET is not configured." };
  }

  const providedSecret = request.headers.get("x-cron-secret");

  if (!providedSecret || providedSecret !== expectedSecret) {
    return { valid: false, reason: "Unauthorized." };
  }

  return { valid: true };
}

async function handleDigestCron(request: NextRequest) {
  const secretCheck = hasValidSecret(request);

  if (!secretCheck.valid) {
    const statusCode =
      secretCheck.reason === "DIGEST_CRON_SECRET is not configured." ? 500 : 401;

    return NextResponse.json({ error: secretCheck.reason }, { status: statusCode });
  }

  const force = parseForce(request.nextUrl.searchParams.get("force"));
  const summary: DigestSummary = {
    force,
    totalEnabled: 0,
    sent: 0,
    skipped: 0,
    errors: 0,
    results: [],
  };

  let users: Awaited<ReturnType<typeof listEnabledDigestUsers>>;

  try {
    users = await listEnabledDigestUsers();
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to read digest settings.",
      },
      { status: 500 },
    );
  }

  summary.totalEnabled = users.length;

  for (const userSettings of users) {
    try {
      const result = await sendDigestForUser(userSettings.user_id, {
        force,
        settings: userSettings,
      });

      if (result.status === "sent") {
        summary.sent += 1;
      } else if (result.status === "error") {
        summary.errors += 1;
      } else {
        summary.skipped += 1;
      }

      summary.results.push({
        userId: result.userId,
        email: result.email,
        status: result.status,
        reason: result.reason,
        errorMessage: result.errorMessage,
        counts: result.counts,
      });
    } catch (error) {
      summary.errors += 1;
      summary.results.push({
        userId: userSettings.user_id,
        email: null,
        status: "error",
        errorMessage:
          error instanceof Error ? error.message : "Unexpected digest error.",
        counts: { overdue: 0, due_today: 0, upcoming: 0 },
      });
    }
  }

  return NextResponse.json(summary, { status: 200 });
}

export async function GET(request: NextRequest) {
  return handleDigestCron(request);
}

export async function POST(request: NextRequest) {
  return handleDigestCron(request);
}
