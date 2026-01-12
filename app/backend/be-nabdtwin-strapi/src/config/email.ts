import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  from?: string;
  subject: string;
  text?: string;
  html?: string;
}

let transporter: any = null;
let isInitialized = false;

const initializeTransporter = async () => {
  if (isInitialized) {
    return transporter;
  }

  const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
  const smtpPort = parseInt(process.env.SMTP_PORT || '587', 10);
  const smtpUsername = process.env.SMTP_USERNAME;
  const smtpPassword = process.env.SMTP_PASSWORD;

  console.log('[EMAIL SERVICE] Initializing email transporter...');
  console.log('[EMAIL SERVICE] SMTP_HOST:', smtpHost);
  console.log('[EMAIL SERVICE] SMTP_PORT:', smtpPort);
  console.log('[EMAIL SERVICE] SMTP_USERNAME:', smtpUsername ? `${smtpUsername.substring(0, 5)}***` : 'NOT SET');
  console.log('[EMAIL SERVICE] SMTP_PASSWORD:', smtpPassword ? '***SET***' : 'NOT SET');

  if (!smtpUsername || !smtpPassword) {
    console.error('[EMAIL SERVICE] ❌ ERROR: Email credentials not configured!');
    console.error('[EMAIL SERVICE] Please set SMTP_USERNAME and SMTP_PASSWORD in .env file');
    isInitialized = true;
    return null;
  }

  try {
    transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUsername,
        pass: smtpPassword,
      },
      logger: true,
      debug: true,
    });

    // Verify connection
    await transporter.verify();
    console.log('[EMAIL SERVICE] ✅ Email transporter initialized and verified successfully!');
    console.log(`[EMAIL SERVICE] ✅ Connected to ${smtpHost}:${smtpPort}`);
    isInitialized = true;
    return transporter;
  } catch (error) {
    console.error('[EMAIL SERVICE] ❌ Failed to initialize transporter:', error.message);
    isInitialized = true;
    return null;
  }
};

export const sendEmail = async (options: EmailOptions): Promise<void> => {
  console.log(`[EMAIL SERVICE] 📧 Preparing to send email to: ${options.to}`);
  console.log(`[EMAIL SERVICE] 📧 Subject: ${options.subject}`);

  const emailTransporter = await initializeTransporter();

  if (!emailTransporter) {
    console.error('[EMAIL SERVICE] ❌ ERROR: Email transporter not available');
    console.error('[EMAIL SERVICE] Email will NOT be sent');
    return;
  }

  const defaultFrom =
    process.env.SMTP_DEFAULT_FROM || process.env.SMTP_USERNAME || 'noreply@nabdtwin.com';

  try {
    console.log('[EMAIL SERVICE] 📤 Sending email...');
    const info = await emailTransporter.sendMail({
      from: options.from || defaultFrom,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    });

    console.log('[EMAIL SERVICE] ✅ Email sent successfully!');
    console.log(`[EMAIL SERVICE] ✅ Message ID: ${info.messageId}`);
    console.log(`[EMAIL SERVICE] ✅ Recipient: ${options.to}`);
  } catch (error) {
    console.error('[EMAIL SERVICE] ❌ Failed to send email:');
    console.error('[EMAIL SERVICE] Error:', error.message);
    console.error('[EMAIL SERVICE] Full error:', error);
    throw error;
  }
};

export default {
  sendEmail,
  initializeTransporter,
};

