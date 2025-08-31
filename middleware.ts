// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";

export async function middleware(req: NextRequest) {
  // Always create a response object
  const res = NextResponse.next();

  try {
    // ✅ Only pass { req, res } — do NOT pass URL/keys
    const supabase = createMiddlewareClient({ req, res });

    // Get current session (if any)
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const { pathname } = req.nextUrl;

    // ✅ If user is NOT logged in and tries to visit dashboard → redirect to login
    if (pathname.startsWith("/dashboard") && !session) {
      const loginUrl = req.nextUrl.clone();
      loginUrl.pathname = "/login";
      loginUrl.searchParams.set("redirect", pathname); // so we know where to go back after login
      return NextResponse.redirect(loginUrl);
    }

    // ✅ If user IS logged in and goes to /login → send them to dashboard instead
    if (pathname.startsWith("/login") && session) {
      const dashUrl = req.nextUrl.clone();
      dashUrl.pathname = "/dashboard";
      return NextResponse.redirect(dashUrl);
    }
  } catch (err) {
    console.error("Middleware error:", err);
    // Don’t block user completely if something goes wrong
  }

  return res;
}

// ✅ Middleware should run everywhere except API/static files
export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};