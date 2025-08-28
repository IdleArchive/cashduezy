import { NextResponse } from "next/server";
import formData from "form-data";
import Mailgun from "mailgun.js";

export async function GET() {
  try {
    const mailgun = new Mailgun(formData);
    const mg = mailgun.client({
      username: "api",
      key: process.env.MAILGUN_API_KEY!,
    });

    await mg.messages.create(process.env.MAILGUN_DOMAIN!, {
      from: "CashDuezy <postmaster@in.cashduezy.com>",
      to: "b.sasuta@gmail.com", // test email
      subject: "CashDuezy Test",
      text: "This is a test email from your deployed app!",
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}