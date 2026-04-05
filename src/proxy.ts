import { NextResponse, type NextRequest } from "next/server";

import { updateSession } from "@/lib/supabase/middleware";

const SESSION_PATH_PREFIXES = ["/login", "/inbox", "/contacts", "/settings", "/threads"];
const SESSION_TIMEOUT_MS = 2000;

function shouldRefreshSession(pathname: string) {
  return SESSION_PATH_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Session refresh timed out after ${ms}ms`));
    }, ms);

    promise
      .then((value) => {
        clearTimeout(timer);
        resolve(value);
      })
      .catch((error) => {
        clearTimeout(timer);
        reject(error);
      });
  });
}

export async function proxy(request: NextRequest) {
  if (!shouldRefreshSession(request.nextUrl.pathname)) {
    return NextResponse.next({ request });
  }

  try {
    return await withTimeout(updateSession(request), SESSION_TIMEOUT_MS);
  } catch (error) {
    console.error("Proxy session update failed; continuing without session refresh.", error);
    return NextResponse.next({ request });
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
