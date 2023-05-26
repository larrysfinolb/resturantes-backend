import nodemailer from 'nodemailer';
import { config } from '../config/index.js';

export const sendMail = async (mail) => {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    secure: true,
    port: 465,
    auth: {
      user: config.smtpEmail,
      pass: config.smtpPassword,
    },
  });

  return await transporter.sendMail(mail);
};
