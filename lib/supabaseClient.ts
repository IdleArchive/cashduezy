// /lib/supabaseClient.ts
"use client";

import { createBrowserClient } from "@supabase/ssr";

// Narrow, reliable type for the singleton
type Supa = ReturnType<typeof createBrowserClient<any>>;

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
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY"
    );
  }

  const client = createBrowserClient(url, key, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      // NOTE: no custom storageKey so DevTools/localStorage checks keep working
    },
  });

  // Expose in dev for quick console debugging
  if (process.env.NODE_ENV !== "production" && typeof window !== "undefined") {
    window.supabase = client;
    client.auth.getSession().then(({ data }) =>
      console.log("[supabase] session present:", !!data.session)
    );
  }

  return client;
}

/** Singleton instance (survives HMR) */
export function getSupabase(): Supa {
  if (_client) return _client;
  _client = initClient();
  return _client;
}

export const supabase = getSupabase();
