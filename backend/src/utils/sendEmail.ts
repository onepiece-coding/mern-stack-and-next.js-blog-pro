import nodemailer, { Transporter, SendMailOptions, SentMessageInfo } from 'nodemailer';
import { env } from '../env.js';

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
    // Test environment: use ethereal (no real email sent)
    if (env.NODE_ENV === 'test') {
      const testAccount = await nodemailer.createTestAccount();
      const tx = nodemailer.createTransport({
        host: testAccount.smtp.host,
        port: testAccount.smtp.port,
        secure: testAccount.smtp.secure,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });
      return tx;
    }

    // Fallback: username/password (APP_EMAIL_PASSWORD must be an app password for Gmail)
    if (!env.APP_EMAIL_ADDRESS || !process.env.APP_EMAIL_PASSWORD) {
      throw new Error(
        'Email is not configured: set APP_EMAIL_ADDRESS and APP_EMAIL_PASSWORD'
      );
    }

    const tx = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: env.APP_EMAIL_ADDRESS,
        pass: process.env.APP_EMAIL_PASSWORD
      }
    });
    await tx.verify();
    return tx;
  })();

  return transporterPromise;
}

/**
 * Send an email. Returns SentMessageInfo for real transports,
 * and (in test mode) returns the preview URL string so tests can assert on it.
 */
export async function sendEmail({ to, subject, html, from }: EmailPayload): Promise<SentMessageInfo | string> {
  const transporter = await getTransporter();

  const mailOptions: SendMailOptions = {
    from: from ?? env.APP_EMAIL_ADDRESS,
    to,
    subject,
    html
  };

  try {
    const info = (await transporter.sendMail(mailOptions)) as SentMessageInfo;

    // Return preview URL for assertions
    if (env.NODE_ENV === 'test') {
      // For test assertions.
      const preview = nodemailer.getTestMessageUrl(info);
      return preview ?? info;
    }

    console.info('Email sent:', {
      messageId: info.messageId,
      accepted: info.accepted?.length ?? 0,
      rejected: info.rejected?.length ?? 0
    });

    return info;
  } catch (err) {
    console.error('Error sending email', err);
    throw new Error('Internal Server Error (email send)');
  }
}

export default sendEmail;