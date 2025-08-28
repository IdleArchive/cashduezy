import nodemailer from "nodemailer";

export async function GET() {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.MAILGUN_SMTP_HOST,
      port: Number(process.env.MAILGUN_SMTP_PORT) || 587,
      secure: false, // use true for port 465, false for 587
      auth: {
        user: process.env.MAILGUN_SMTP_LOGIN,
        pass: process.env.MAILGUN_SMTP_PASSWORD,
      },
    });

    const info = await transporter.sendMail({
      from: "postmaster@in.cashduezy.com",
      to: "b.sasuta@gmail.com", // test email
      subject: "CashDuezy Test Email",
      text: "If you're seeing this, your Mailgun SMTP is working ✅",
    });

    console.log("Message sent: %s", info.messageId);

    return new Response(
      JSON.stringify({ success: true, messageId: info.messageId }),
      { status: 200 }
    );
  } catch (err: any) {
    console.error("Email error:", err);
    return new Response(
      JSON.stringify({ success: false, error: err.message }),
      { status: 500 }
    );
  }
}