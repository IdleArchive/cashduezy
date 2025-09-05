"use client";

import { createBrowserClient } from "@supabase/ssr";

// --- optional, for better TS in dev console
type Supa = ReturnType<typeof createBrowserClient<any, any>>;

declare global {
  interface Window {
    supabase?: Supa;
  }
}

let _client: Supa | null = null;

function initClient(): Supa {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    // Helpful error if envs are missing on localhost
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY"
    );
  }

  const client = createBrowserClient(url, key, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: "supabase.auth",
    },
  });

  // Expose for debugging in DEVTOOLS (dev only)
  if (process.env.NODE_ENV !== "production" && typeof window !== "undefined") {
    window.supabase = client;
    // sanity log
    client.auth.getSession().then(({ data }) =>
      console.log("[supabase] session present:", !!data.session)
    );
  }

  return client;
}

// Singleton to survive HMR
export function getSupabase() {
  if (_client) return _client;
  _client = initClient();
  return _client;
}

export const supabase = getSupabase();
