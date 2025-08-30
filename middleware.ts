import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ✅ Skip Supabase middleware for ALL email routes
  if (
    pathname.includes("/api/test-email") ||
    pathname.includes("/api/send-welcome") ||
    pathname.includes("/api/send-reminder")
  ) {
    return NextResponse.next();
  }

  const res = NextResponse.next();

  try {
    // ✅ No config object needed, picks up env vars automatically
    const supabase = createMiddlewareClient({ req, res });

    await supabase.auth.getSession();
  } catch (err) {
    console.error("Middleware error:", err);
    return NextResponse.next(); // ✅ Always return a valid response
  }

  return res;
}