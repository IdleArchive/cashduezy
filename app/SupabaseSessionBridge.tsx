// /app/SupabaseSessionBridge.tsx
"use client";

import { useEffect, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { Session } from "@supabase/supabase-js";

async function send(event: string, session: Session | null) {
  try {
    await fetch("/api/auth/refresh", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event, session }),
    });
  } catch {
    // ignore network errors (offline, etc.)
  }
}

export default function SupabaseSessionBridge() {
  const postedOnce = useRef(false);

  useEffect(() => {
    let active = true;

    // 1) On mount, sync current session (handles page refresh / existing login)
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!active) return;
      if (!postedOnce.current) {
        postedOnce.current = true;
        await send("INITIAL", data.session ?? null);
      }
    })();

    // 2) On auth state changes, keep server cookies in sync
    const { data: sub } = supabase.auth.onAuthStateChange(async (event, session) => {
      await send(event, session ?? null);
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return null;
}
