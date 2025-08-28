// app/api/test-email/route.ts
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { to, subject, text } = body;

    // ✅ Create transporter with Mailgun SMTP
    const transporter = nodemailer.createTransport({
      host: process.env.MAILGUN_SMTP_HOST || "smtp.mailgun.org",
      port: Number(process.env.MAILGUN_SMTP_PORT) || 587,
      secure: false, // STARTTLS (port 587)
      auth: {
        user: process.env.MAILGUN_SMTP_LOGIN,
        pass: process.env.MAILGUN_SMTP_PASSWORD,
      },
    });

    // ✅ Send email
    await transporter.sendMail({
      from: "postmaster@in.cashduezy.com",
      to: to || "b.sasuta@gmail.com", // fallback if not provided
      subject: subject || "CashDuezy Test Email",
      text: text || "✅ If you see this, Mailgun SMTP is working in production!",
    });

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err: any) {
    console.error("Email error:", err);
    return new Response(
      JSON.stringify({ success: false, error: err.message }),
      { status: 500 }
    );
  }
}

// Optional: allow GET for quick tests
export async function GET() {
  return POST(new Request("", { method: "POST", body: "{}" }));
}