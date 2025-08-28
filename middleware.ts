import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 🚨 Skip Supabase middleware for ALL email-related API routes
  if (
    pathname.startsWith("/api/test-email") ||
    pathname.startsWith("/api/send-") // catch-all for send-welcome, send-reminder, etc.
  ) {
    return NextResponse.next();
  }

  const res = NextResponse.next();

  try {
    // ✅ Let Supabase Auth Helpers handle env vars internally
    const supabase = createMiddlewareClient({ req, res });

    // Touch the session to keep cookies in sync
    await supabase.auth.getSession();
  } catch (err) {
    console.error("Middleware error:", err);
  }

  return res;
}