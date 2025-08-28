import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  host: process.env.MAILGUN_SMTP_HOST,
  port: Number(process.env.MAILGUN_SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.MAILGUN_SMTP_LOGIN,
    pass: process.env.MAILGUN_SMTP_PASSWORD,
  },
});