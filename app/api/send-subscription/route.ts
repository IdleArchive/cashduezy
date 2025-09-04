import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    // ✅ Load Supabase env vars at runtime
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      console.error("❌ Missing Supabase env vars:", {
        supabaseUrl: !!supabaseUrl,
        supabaseServiceRoleKey: !!supabaseServiceRoleKey,
      });
      return NextResponse.json(
        { success: false, error: "Server misconfigured: missing Supabase env vars" },
        { status: 500 }
      );
    }

    // ✅ Create client only after confirming envs
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    const body = await req.json();
    const { user, subscription } = body;

    if (!user?.email || !user?.id || !subscription?.id) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: user.email, user.id, subscription.id" },
        { status: 400 }
      );
    }

    // === Call Mailgun API ===
    const mgResponse = await fetch(
      `https://api.mailgun.net/v3/${process.env.MAILGUN_DOMAIN}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${Buffer.from(
            `api:${process.env.MAILGUN_API_KEY}`
          ).toString("base64")}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          from: "CashDuezy <postmaster@in.cashduezy.com>",
          to: user.email,
          subject: `Upcoming payment for ${subscription.name}`,
          text: `Reminder: ${subscription.name} payment of ${subscription.amount} ${subscription.currency} is due.`,
        }),
      }
    );

    if (!mgResponse.ok) {
      const text = await mgResponse.text();
      console.error("Mailgun response error:", text);
      return NextResponse.json(
        { success: false, error: "Mailgun request failed" },
        { status: 500 }
      );
    }

    const mgResult = await mgResponse.json();

    // === Save notification to Supabase ===
    const { error } = await supabase.from("notifications").insert([
      {
        user_id: user.id,
        subscription_id: subscription.id,
        channel: "email",
        send_at: subscription.next_charge_date,
        status: "pending",
        mailgun_id: mgResult.id || null, // ✅ defensive
      },
    ]);

    if (error) {
      console.error("Supabase insert error:", error);
      throw error;
    }

    return NextResponse.json({ success: true, mailgunId: mgResult.id || null });
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error("send-subscription error:", err.message);
      return NextResponse.json(
        { success: false, error: err.message },
        { status: 500 }
      );
    }
    console.error("send-subscription unknown error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to send subscription reminder" },
      { status: 500 }
    );
  }
}
