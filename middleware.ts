import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // 🚨 Skip Supabase middleware for test routes (like sending emails)
  if (req.nextUrl.pathname.startsWith("/api/test-email")) {
    return res;
  }

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