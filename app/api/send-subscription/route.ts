import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // needs service role for insert
);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { user, subscription } = body;

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

    const mgResult = await mgResponse.json();

    // === Save notification to Supabase ===
    const { error } = await supabase.from("notifications").insert([
      {
        user_id: user.id,
        subscription_id: subscription.id,
        channel: "email",
        send_at: subscription.next_charge_date,
        status: "pending",
        mailgun_id: mgResult.id, // ✅ store Mailgun job ID
      },
    ]);

    if (error) throw error;

    return NextResponse.json({ success: true, mailgunId: mgResult.id });
  } catch (err: any) {
    console.error("Mailgun error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}