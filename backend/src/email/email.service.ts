import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as process from 'process';

@Injectable()
export class EmailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendConfirmationEmail(email: string, code: string, hash: string) {
    const verificationLink = `http://localhost/verify-email/${hash}`

    const mailOptions = {
      from: process.env.SMTP_USER,
      to: email,
      subject: 'Подтверждение вашей почты',
      text: `
      Чтобы подтвердить вашу почту, используйте код: ${code}
      Ссылка: ${verificationLink}
      `,
    };

    return this.transporter.sendMail(mailOptions);
  }

  async sendPasswordResetEmail(email: string, code: string, link: string) {
    await this.transporter.sendMail({
      from: process.env.SMTP_USER,
      to: email,
      subject: 'Сброс пароля',
      text: `Ваш код сброса пароля: ${code}. Введите его на странице или перейдите по ссылке: ${link}`,
    });
  }
}
