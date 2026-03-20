import nodemailer from 'nodemailer';

export interface SendEmailOptions {
  gmailUser: string;
  gmailAppPassword: string;
  to: string;
  subject: string;
  body: string;
  resumeBase64?: string;
  resumeFileName?: string;
}

export async function sendEmail(opts: SendEmailOptions) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: opts.gmailUser,
      pass: opts.gmailAppPassword,
    },
  });

  const mailOptions: nodemailer.SendMailOptions = {
    from: opts.gmailUser,
    to: opts.to,
    subject: opts.subject,
    text: opts.body,
  };

  if (opts.resumeBase64 && opts.resumeFileName) {
    mailOptions.attachments = [
      {
        filename: opts.resumeFileName,
        content: opts.resumeBase64,
        encoding: 'base64',
        contentType: 'application/pdf',
      },
    ];
  }

  const info = await transporter.sendMail(mailOptions);
  return { messageId: info.messageId };
}
