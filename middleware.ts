// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  try {
    // ✅ Explicitly set cookie path to root
    const supabase = createMiddlewareClient(
      { req, res },
      {
        cookieOptions: {
          path: "/", // important: avoid defaulting to /login
        },
      }
    );

    const {
      data: { session },
    } = await supabase.auth.getSession();

    const { pathname } = req.nextUrl;

    // If user is NOT logged in and tries to visit dashboard → redirect to homepage
    if (pathname.startsWith("/dashboard") && !session) {
      const homeUrl = req.nextUrl.clone();
      homeUrl.pathname = "/";
      return NextResponse.redirect(homeUrl);
    }

    // If user IS logged in and tries to visit homepage → send them to dashboard
    if (pathname === "/" && session) {
      const dashUrl = req.nextUrl.clone();
      dashUrl.pathname = "/dashboard";
      return NextResponse.redirect(dashUrl);
    }
  } catch (err) {
    console.error("Middleware error:", err);
  }

  return res;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};