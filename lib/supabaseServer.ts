import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function getSupabaseServer() {
  const cookieStore = await cookies(); // 👈 await since it's a Promise in your setup

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options?: CookieOptions) {
          console.warn(`Tried to set cookie "${name}" server-side, ignored.`);
        },
        remove(name: string, options?: CookieOptions) {
          console.warn(`Tried to remove cookie "${name}" server-side, ignored.`);
        },
      },
    }
  );
}
