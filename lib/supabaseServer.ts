// /lib/supabaseServer.ts
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Creates a Supabase server client for Next.js App Router.
 * - Safe for SSR (no localStorage).
 * - Reads cookies for session if user is authenticated.
 * - Falls back gracefully for anon public reads (e.g., blog SEO pages).
 */
export async function getSupabaseServer() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options?: CookieOptions) {
          // Avoid trying to set cookies during SSR
          console.warn(
            `[SupabaseServer] Tried to set cookie "${name}" server-side, ignored.`
          );
        },
        remove(name: string, options?: CookieOptions) {
          // Avoid trying to remove cookies during SSR
          console.warn(
            `[SupabaseServer] Tried to remove cookie "${name}" server-side, ignored.`
          );
        },
      },
      global: {
        fetch, // ensure Next.js fetch is used
      },
      auth: {
        persistSession: false, // SSR-safe
        autoRefreshToken: false,
      },
    }
  );
}