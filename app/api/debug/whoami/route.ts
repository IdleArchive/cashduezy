import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabaseServer";
import { isAdmin } from "@/lib/isAdmin";

export async function GET() {
  const supabase = await getSupabaseServer();
  const { data: { user }, error } = await supabase.auth.getUser();
  const admin = user ? await isAdmin() : false;

  return NextResponse.json(
    { user, admin, error: error?.message ?? null },
    { status: user ? 200 : 401 }
  );
}
