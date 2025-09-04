import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    // ✅ Load env vars at runtime
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      console.error("❌ Missing Supabase env vars:", {
        supabaseUrl: !!supabaseUrl,
        supabaseServiceRoleKey: !!supabaseServiceRoleKey,
      });
      return NextResponse.json(
        { error: "Server misconfigured: missing Supabase environment variables" },
        { status: 500 }
      );
    }

    // ✅ Create client only after confirming env vars
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    // ✅ Use Supabase Admin API to delete the user
    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (error) {
      console.error("Supabase deleteUser error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Unexpected error deleting account:", err);
    return NextResponse.json(
      { error: "Unexpected error deleting account" },
      { status: 500 }
    );
  }
}
