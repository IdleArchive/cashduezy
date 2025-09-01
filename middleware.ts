// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  try {
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
    // Let the page guard handle unauthenticated users to avoid race conditions.
  } catch (err) {
    console.error("Middleware error:", err);
  }

  return res;
}

// ✅ Run middleware on everything EXCEPT api, static assets, AND sitemap/robots
export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:png|jpg|jpeg|gif|svg|webp)$).*)",
  ],
};