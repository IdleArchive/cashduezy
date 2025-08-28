import nodemailer from "nodemailer";

export async function GET() {
  try {
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
      to: "b.sasuta@gmail.com",
      subject: "CashDuezy Test Email",
      text: "✅ If you see this, Mailgun SMTP is working!",
    });

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error("Email error:", err.message);
      return new Response(JSON.stringify({ success: false, error: err.message }), { status: 500 });
    }
    return new Response(JSON.stringify({ success: false, error: "Unknown error" }), { status: 500 });
  }
}