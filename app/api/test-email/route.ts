import nodemailer from "nodemailer";

export async function GET() {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.MAILGUN_SMTP_HOST,
      port: Number(process.env.MAILGUN_SMTP_PORT) || 587,
      auth: {
        user: process.env.MAILGUN_SMTP_LOGIN,
        pass: process.env.MAILGUN_SMTP_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: "postmaster@in.cashduezy.com",
      to: "b.sasuta@gmail.com", // your test email
      subject: "CashDuezy Test Email",
      text: "If you're seeing this, your Mailgun SMTP is working ✅",
    });

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err: any) {
    console.error(err);
    return new Response(JSON.stringify({ success: false, error: err.message }), { status: 500 });
  }
}