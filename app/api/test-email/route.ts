// app/api/test-email/route.ts
import nodemailer from "nodemailer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function required(name: string, value: string | undefined | null) {
  if (!value) throw new Error(`Missing env var: ${name}`);
  return value;
}

export async function GET(req: Request) {
  try {
    // Hard gate: only in development or with INTERNAL_API_KEY
    const internalKey = process.env.INTERNAL_API_KEY;
    const authKey = new URL(req.url).searchParams.get("key");

    const isDev = process.env.NODE_ENV !== "production";
    const isAuthorized = isDev || (internalKey && authKey === internalKey);

    if (!isAuthorized) {
      return new Response("Not Found", { status: 404 });
    }

    const {
      MAILGUN_SMTP_HOST,
      MAILGUN_SMTP_PORT,
      MAILGUN_SMTP_LOGIN,
      MAILGUN_SMTP_PASSWORD,
      MAIL_FROM,
      DEV_EMAIL,
      TEST_EMAIL,
    } = process.env;

    // Validate mail transport envs
    required("MAILGUN_SMTP_HOST", MAILGUN_SMTP_HOST);
    required("MAILGUN_SMTP_PORT", MAILGUN_SMTP_PORT);
    required("MAILGUN_SMTP_LOGIN", MAILGUN_SMTP_LOGIN);
    required("MAILGUN_SMTP_PASSWORD", MAILGUN_SMTP_PASSWORD);

    const from = MAIL_FROM || "CashDuezy <postmaster@in.cashduezy.com>";

    // Choose recipient: query param ?to=..., or TEST_EMAIL/DEV_EMAIL
    const url = new URL(req.url);
    const toParam = url.searchParams.get("to");
    const to = toParam || TEST_EMAIL || DEV_EMAIL;

    if (!to) {
      return new Response(
        JSON.stringify({
          success: false,
          error:
            "No recipient provided. Use ?to=email or set TEST_EMAIL/DEV_EMAIL env var.",
        }),
        { status: 400 }
      );
    }

    const transporter = nodemailer.createTransport({
      host: MAILGUN_SMTP_HOST!,
      port: Number(MAILGUN_SMTP_PORT!) || 587,
      secure: false,
      auth: {
        user: MAILGUN_SMTP_LOGIN!,
        pass: MAILGUN_SMTP_PASSWORD!,
      },
    });

    const info = await transporter.sendMail({
      from,
      to,
      subject: "CashDuezy Test Email",
      text: "✅ If you see this, your SMTP settings are working.",
    });

    return new Response(
      JSON.stringify({ success: true, messageId: info.messageId }),
      { status: 200 }
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("test-email error:", msg);
    return new Response(JSON.stringify({ success: false, error: msg }), {
      status: 500,
    });
  }
}
