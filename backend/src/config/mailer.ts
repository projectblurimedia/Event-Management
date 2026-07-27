import nodemailer from 'nodemailer';
import { env } from './env';

export const mailTransporter =
  env.SMTP_HOST && env.SMTP_USER
    ? nodemailer.createTransport({
        host: env.SMTP_HOST,
        port: env.SMTP_PORT,
        secure: env.SMTP_PORT === 465,
        auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
      })
    : null;

export const isMailerConfigured = Boolean(mailTransporter);

interface SendMailInput {
  to: string;
  subject: string;
  html: string;
}

export async function sendMail({ to, subject, html }: SendMailInput) {
  if (!mailTransporter) {
    console.info(`[mailer] SMTP not configured — skipping email to ${to} (${subject})`);
    return;
  }

  await mailTransporter.sendMail({
    from: `"${env.BUSINESS_NAME}" <${env.SMTP_USER}>`,
    to,
    subject,
    html,
  });
}
