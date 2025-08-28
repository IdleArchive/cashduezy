import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 🚨 Skip Supabase middleware for webhook/email routes
  if (
    pathname.startsWith("/api/test-email") ||
    pathname.startsWith("/api/send-welcome") ||
    pathname.startsWith("/api/send-reminder")
  ) {
    return NextResponse.next();
  }

  const res = NextResponse.next();

  try {
    const supabase = createMiddlewareClient(
      { req, res },
      {
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
        supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      }
    );

    await supabase.auth.getSession();
  } catch (err) {
    console.error("Middleware error:", err);
  }

  return res;
}