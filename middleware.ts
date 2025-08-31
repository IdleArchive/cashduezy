// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";

export async function middleware(req: NextRequest) {
  // Start with a mutable response (cookies set on this are allowed)
  const res = NextResponse.next();

  try {
    // Use the middleware client; it handles cookies on `res` for you.
    const supabase = createMiddlewareClient({ req, res });

    // Touch the session so auth cookies are kept fresh (no-op if none)
    const {
      data: { session },
    } = await supabase.auth.getSession();

    // Optional: protect authenticated routes
    const path = req.nextUrl.pathname;
    if (path.startsWith("/dashboard") && !session) {
      const url = req.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("redirect", path);
      return NextResponse.redirect(url);
    }
  } catch (err) {
    // Never throw from middleware; log and allow request to continue
    console.error("Middleware error:", err);
    return res;
  }

  return res;
}

// Only run on non-API/non-static paths to avoid unnecessary work
export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};