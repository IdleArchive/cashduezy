// /lib/supabaseServer.ts
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Server-side Supabase client for Next.js App Router (Next 14/15 compatible).
 * - Uses async cookies() API (Promise<ReadonlyRequestCookies>).
 * - Reads existing auth cookies for SSR.
 * - Attempts to WRITE cookies only when supported (Route Handlers / Server Actions).
 *   In read-only contexts (server components), write calls are safely ignored.
 */
export async function getSupabaseServer() {
  // In Next 15 (and some 14.x), cookies() is async and returns ReadonlyRequestCookies
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options?: CookieOptions) {
          // Guard: only works in Route Handlers / Server Actions.
          // In other contexts, cookies are read-only.
          try {
            const setter = (cookieStore as any)?.set;
            if (typeof setter === "function") {
              setter(name, value, options ?? {});
            } else {
              // Silently ignore when not writable
              // console.debug(`[SupabaseServer] Cookie set skipped for "${name}" (read-only context).`);
            }
          } catch {
            /* no-op in read-only contexts */
          }
        },
        remove(name: string, options?: CookieOptions) {
          try {
            const setter = (cookieStore as any)?.set;
            if (typeof setter === "function") {
              setter(name, "", { ...(options ?? {}), maxAge: 0 });
            } else {
              // console.debug(`[SupabaseServer] Cookie remove skipped for "${name}" (read-only context).`);
            }
          } catch {
            /* no-op */
          }
        },
      },
      // Ensure Next's fetch implementation is used (good for edge/runtime)
      global: { fetch },
      // SSR-safe: do not persist session or auto-refresh tokens on the server.
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );

  return supabase;
}
