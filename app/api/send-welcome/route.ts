// app/api/send-welcome/route.ts
import nodemailer from "nodemailer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Payload = {
  to: string;
  name?: string;
};

function required(name: string, value: string | undefined | null) {
  if (!value) throw new Error(`Missing env var: ${name}`);
  return value;
}

export async function POST(req: Request) {
  try {
    const {
      MAILGUN_SMTP_HOST,
      MAILGUN_SMTP_PORT,
      MAILGUN_SMTP_LOGIN,
      MAILGUN_SMTP_PASSWORD,
      MAIL_FROM,
    } = process.env;

    // Validate required env vars
    required("MAILGUN_SMTP_HOST", MAILGUN_SMTP_HOST);
    required("MAILGUN_SMTP_PORT", MAILGUN_SMTP_PORT);
    required("MAILGUN_SMTP_LOGIN", MAILGUN_SMTP_LOGIN);
    required("MAILGUN_SMTP_PASSWORD", MAILGUN_SMTP_PASSWORD);

    // Prefer MAIL_FROM; fall back to your known domain
    const from = MAIL_FROM || "CashDuezy <postmaster@in.cashduezy.com>";

    const { to, name }: Payload = await req.json();

    if (!to || typeof to !== "string") {
      return new Response(
        JSON.stringify({ success: false, error: "Field 'to' is required" }),
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

    await transporter.sendMail({
      from,
      to,
      subject: "👋 Welcome to CashDuezy",
      text: `Welcome${name ? ` ${name}` : ""}! Thanks for signing up with CashDuezy.`,
    });

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("send-welcome error:", msg);
    return new Response(JSON.stringify({ success: false, error: msg }), {
      status: 500,
    });
  }
}
