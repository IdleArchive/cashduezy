// app/api/send-welcome/route.ts
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const { to, name } = await req.json();

    if (!to) {
      return new Response(JSON.stringify({ success: false, error: "Missing recipient" }), { status: 400 });
    }

    const transporter = nodemailer.createTransport({
      host: process.env.MAILGUN_SMTP_HOST || "smtp.mailgun.org",
      port: Number(process.env.MAILGUN_SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.MAILGUN_SMTP_LOGIN,
        pass: process.env.MAILGUN_SMTP_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: "postmaster@in.cashduezy.com",
      to,
      subject: "🎉 Welcome to CashDuezy!",
      text: `Hi ${name || "there"},\n\nThanks for signing up for CashDuezy! 🚀\nWe'll help you stay on top of your bills and never miss a due date again.`,
    });

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err: any) {
    console.error("Welcome email error:", err);
    return new Response(JSON.stringify({ success: false, error: err.message }), { status: 500 });
  }
}