import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Skip auth for API routes
  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // Start a response we can mutate (cookies, headers)
  let res = NextResponse.next({
    request: { headers: req.headers },
  });

  try {
    // Build a Supabase server client for middleware
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return req.cookies.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            // Reflect cookie changes in both request + response
            req.cookies.set({ name, value, ...options });
            res = NextResponse.next({ request: { headers: req.headers } });
            res.cookies.set({ name, value, ...options });
          },
          remove(name: string, options: CookieOptions) {
            req.cookies.set({ name, value: "", ...options });
            res = NextResponse.next({ request: { headers: req.headers } });
            res.cookies.set({ name, value: "", ...options });
          },
        },
      }
    );

    // Try to read the session; don't block routing if it fails
    await supabase.auth.getSession().catch(() => {});
  } catch (err) {
    console.error("Middleware execution error:", err);
    // Fall back to continuing the request
    return res;
  }

  return res;
}