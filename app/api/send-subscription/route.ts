// app/api/send-subscription/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type UserPayload = { id: string; email: string };
type SubscriptionPayload = {
  id: string;
  name: string;
  amount: number;
  currency: string;
  next_charge_date?: string | null;
};

function required(name: string, value: string | undefined | null) {
  if (!value) throw new Error(`Missing env var: ${name}`);
  return value;
}

export async function POST(req: Request) {
  try {
    // Env validation (Supabase + Mailgun)
    const supabaseUrl = required(
      "NEXT_PUBLIC_SUPABASE_URL",
      process.env.NEXT_PUBLIC_SUPABASE_URL
    );
    const supabaseServiceRoleKey = required(
      "SUPABASE_SERVICE_ROLE_KEY",
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    const mgApiKey = required("MAILGUN_API_KEY", process.env.MAILGUN_API_KEY);
    const mgDomain = required("MAILGUN_DOMAIN", process.env.MAILGUN_DOMAIN);
    const from =
      process.env.MAIL_FROM || "CashDuezy <postmaster@in.cashduezy.com>";

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    const body = await req.json();
    const user: UserPayload | undefined = body?.user;
    const subscription: SubscriptionPayload | undefined = body?.subscription;

    if (!user?.id || !user?.email || !subscription?.id) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Missing required fields: user.id, user.email, subscription.id",
        },
        { status: 400 }
      );
    }

    // Minimal, defensive formatting for the email
    const subName = subscription.name ?? "your subscription";
    const amount =
      typeof subscription.amount === "number"
        ? subscription.amount.toFixed(2)
        : String(subscription.amount);
    const currency = subscription.currency ?? "USD";

    // Mailgun HTTP API (recommended for serverless)
    const mgResponse = await fetch(`https://api.mailgun.net/v3/${mgDomain}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`api:${mgApiKey}`).toString(
          "base64"
        )}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        from,
        to: user.email,
        subject: `Upcoming payment for ${subName}`,
        text: `Reminder: ${subName} payment of ${amount} ${currency} is due${
          subscription.next_charge_date ? ` on ${subscription.next_charge_date}` : ""
        }.`,
      }),
    });

    if (!mgResponse.ok) {
      const text = await mgResponse.text().catch(() => "(no body)");
      console.error("Mailgun error:", text);
      return NextResponse.json(
        { success: false, error: "Mailgun request failed" },
        { status: 502 }
      );
    }

    const mgResult = await mgResponse.json().catch(() => ({} as any));

    // Persist a notification record
    const { error } = await supabase.from("notifications").insert([
      {
        user_id: user.id,
        subscription_id: subscription.id,
        channel: "email",
        send_at: subscription.next_charge_date ?? null,
        status: "pending",
        mailgun_id: mgResult?.id ?? null,
      },
    ]);

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json(
        { success: false, error: "Failed to persist notification" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      mailgunId: mgResult?.id ?? null,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("send-subscription error:", msg);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
