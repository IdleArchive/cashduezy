// /app/api/auth/refresh/route.ts
import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabaseServer";
import type { Session } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

type Payload = {
  event?: string;                 // "INITIAL" | "SIGNED_IN" | "SIGNED_OUT" | "TOKEN_REFRESHED" | etc.
  session?: Session | null;       // current session (or null)
};

export async function POST(req: Request) {
  try {
    const supabase = await getSupabaseServer();
    const { event, session } = (await req.json()) as Payload;

    // If we have a session, set/refresh it on the server. Otherwise clear.
    if (session) {
      await supabase.auth.setSession(session);
    } else {
      await supabase.auth.signOut();
    }

    return NextResponse.json({ ok: true, event });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}
