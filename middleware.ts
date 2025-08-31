// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  try {
    // Initialize normally (no cookieOptions override needed)
    const supabase = createMiddlewareClient({ req, res });
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const { pathname } = req.nextUrl;

    // If a logged-in user hits the homepage, send them to the dashboard
    if (pathname === "/" && session) {
      const url = req.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }

    // NOTE: We intentionally do NOT block /dashboard here.
    // Let the page guard handle unauthenticated users to avoid
    // race conditions while Supabase is still writing cookies.
  } catch (err) {
    console.error("Middleware error:", err);
  }

  return res;
}

// Run on all routes except API/static assets
export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};