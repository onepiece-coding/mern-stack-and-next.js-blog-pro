import nodemailer, { Transporter, SendMailOptions, SentMessageInfo } from 'nodemailer';
import { env } from '../env.js';
import logger from './logger.js';

type EmailPayload = {
  to: string;
  subject: string;
  html: string;
  from?: string; // optional override
};

let transporterPromise: Promise<Transporter> | null = null;

async function getTransporter(): Promise<Transporter> {
  if (transporterPromise) return transporterPromise;

  transporterPromise = (async (): Promise<Transporter> => {
    if (env.NODE_ENV === 'test') {
      const testAccount = await nodemailer.createTestAccount();
      const tx = nodemailer.createTransport({
        host: testAccount.smtp.host,
        port: testAccount.smtp.port,
        secure: testAccount.smtp.secure,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      return tx;
    }

    if (!env.APP_EMAIL_ADDRESS || !process.env.APP_EMAIL_PASSWORD) {
      throw new Error(
        'Email is not configured: set APP_EMAIL_ADDRESS and APP_EMAIL_PASSWORD',
      );
    }

    const tx = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: env.APP_EMAIL_ADDRESS,
        pass: process.env.APP_EMAIL_PASSWORD,
      },
    });
    await tx.verify();
    return tx;
  })();

  return transporterPromise;
}

export async function sendEmail(
  { to, subject, html, from }: EmailPayload,
  transporterOverride?: Transporter,
): Promise<SentMessageInfo | string> {
  const transporter = transporterOverride ?? (await getTransporter());

  const mailOptions: SendMailOptions = {
    from: from ?? env.APP_EMAIL_ADDRESS,
    to,
    subject,
    html,
  };

  try {
    const info = (await transporter.sendMail(mailOptions)) as SentMessageInfo;

    if (env.NODE_ENV === 'test') {
      const preview = nodemailer.getTestMessageUrl(info);
      return preview ?? info;
    }

    logger.info('Email sent:', {
      messageId: info.messageId,
      accepted: info.accepted?.length ?? 0,
      rejected: info.rejected?.length ?? 0,
    });

    return info;
  } catch (err) {
    logger.error('Error sending email', err);
    throw new Error('Internal Server Error (email send)');
  }
}

export default sendEmail;