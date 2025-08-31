import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createMiddlewareClient } from "@supabase/ssr"; // ✅ NEW import

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Skip auth for API routes
  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  const res = NextResponse.next();

  try {
    // ✅ Use @supabase/ssr version
    const supabase = createMiddlewareClient({ req, res });

    // Just attempt to fetch session; don’t block or throw
    await supabase.auth.getSession().catch((e) => {
      console.warn("Supabase session fetch failed:", e.message);
    });
  } catch (err) {
    console.error("Middleware execution error:", err);
    // Always fall back to next()
    return res;
  }

  return res;
}