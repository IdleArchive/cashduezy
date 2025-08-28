// app/api/send-reminder/route.ts
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const { to, billName, dueDate } = await req.json();

    if (!to || !billName || !dueDate) {
      return new Response(JSON.stringify({ success: false, error: "Missing fields" }), { status: 400 });
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
      subject: `⏰ Reminder: ${billName} due on ${dueDate}`,
      text: `Hello!\n\nJust a friendly reminder that your bill "${billName}" is due on ${dueDate}. \n\nStay on top with CashDuezy ✅`,
    });

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err: any) {
    console.error("Reminder email error:", err);
    return new Response(JSON.stringify({ success: false, error: err.message }), { status: 500 });
  }
}