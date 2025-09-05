export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// /app/api/send-reminder/route.ts
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  // Hide this endpoint outside local dev
  if (process.env.NODE_ENV !== "development") {
    return new Response("Not Found", { status: 404 });
  }

  try {
    const { to, billName, dueDate, userId, subscriptionId } = await req.json();

    if (!to || !billName || !dueDate || !userId) {
      return NextResponse.json({ success:false, error:"Missing required fields", status:400 });
    }


    // --- Validate env vars ---
    if (
      !process.env.MAILGUN_SMTP_LOGIN ||
      !process.env.MAILGUN_SMTP_PASSWORD ||
      !process.env.MAILGUN_SMTP_HOST ||
      !process.env.MAILGUN_SMTP_PORT ||
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      !process.env.SUPABASE_SERVICE_ROLE_KEY
    ) {
      console.error("❌ Missing required environment variables");
      return NextResponse.json(
        { success: false, error: "Server misconfiguration: env vars missing" },
        { status: 500 }
      );
    }

    // --- Supabase admin client ---
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // --- Create transporter ---
    const transporter = nodemailer.createTransport({
      host: process.env.MAILGUN_SMTP_HOST,
      port: Number(process.env.MAILGUN_SMTP_PORT),
      secure: false,
      auth: {
        user: process.env.MAILGUN_SMTP_LOGIN,
        pass: process.env.MAILGUN_SMTP_PASSWORD,
      },
    });

    // --- Send email ---
    const info = await transporter.sendMail({
      from: "CashDuezy <postmaster@in.cashduezy.com>",
      to,
      subject: `⏰ Reminder: ${billName} is due soon`,
      text: `Heads up! Your bill "${billName}" is due on ${dueDate}. Don't forget to pay it.`,
    });

    console.log("✅ Reminder email sent:", info.messageId);

    // --- Save notification to Supabase ---
    const { error } = await supabase.from("notifications").insert([
      {
        user_id: userId,
        subscription_id: subscriptionId ?? null,
        channel: "email",
        send_at: new Date(dueDate).toISOString(),
        status: "pending",
        mailgun_id: info.messageId, // ✅ track Mailgun ID
      },
    ]);

    if (error) {
      console.error("❌ Supabase insert error:", error.message);
      return NextResponse.json(
        { success: false, error: "Email sent but failed to log notification" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, messageId: info.messageId });
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error("❌ Reminder error:", err.message);
      return NextResponse.json(
        { success: false, error: err.message },
        { status: 500 }
      );
    }

    console.error("❌ Reminder error (non-Error):", err);
    return NextResponse.json(
      { success: false, error: "Unexpected server error" },
      { status: 500 }
    );
  }
}
