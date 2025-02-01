import nodemailer from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';

const transporter = nodemailer.createTransport({
  service: process.env.MAIL_SERVICE,
  host: process.env.MAIL_HOST,
  port: Number(process.env.MAIL_PORT),
  secure: false,
  auth: {
    user: process.env.MAIL_USER, // Sender gmail address
    pass: process.env.MAIL_PASSWORD, // App password from gmail account
  },
});

const sendEmail = (mailOptions: Mail.Options) => {
  transporter.sendMail(mailOptions);
};

export const mailOptionsTemplate = {
  from: {
    name: 'Han Nom Recognition - Sino Nom',
    address: process.env.MAIL_USER!,
  }, // sender address
  to: [''], // list of receivers
  subject: 'Email from Han Nom Recognition', // Subject line
  html: '', // html body
  attachments: [], // files attachments
};

export default sendEmail;
