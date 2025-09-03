// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  try {
    // Attach Supabase client
    const supabase = createMiddlewareClient({ req, res });
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const { pathname } = req.nextUrl;

    // --- CASE 1: Logged-in users hitting homepage -> redirect to dashboard
    if (pathname === "/" && session) {
      const url = req.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }

    // --- CASE 2: Logged-in users hitting /login -> redirect to dashboard
    if (pathname === "/login" && session) {
      const url = req.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }

    // --- CASE 3: Guests at homepage -> stay on "/"
    if (pathname === "/" && !session) {
      return res;
    }

    // --- CASE 4: Guests at /login -> allow them to see login page
    if (pathname === "/login" && !session) {
      return res;
    }

    // --- CASE 5: Everything else -> pass through
    return res;
  } catch (err) {
    console.error("Middleware error:", err);
    return res;
  }
}

// ✅ Run middleware on everything EXCEPT api, static assets, AND sitemap/robots
export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:png|jpg|jpeg|gif|svg|webp)$).*)",
  ],
};
