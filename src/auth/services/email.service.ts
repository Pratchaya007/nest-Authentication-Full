import { Injectable } from '@nestjs/common';
import { Resend } from 'resend';
import { TypedConfigService } from 'src/config/typed-config.service';

@Injectable()
export class EmailService {
  private resend: Resend;

  constructor(readonly typedConfigService: TypedConfigService) {
    this.resend = new Resend(typedConfigService.get('RESEND_API_KEY'));
  }
  // กด confirm email isVerity
  async sendVerificationEamil(email: string, token: string) {
    const appUrl = this.typedConfigService.get('APP_URL');
    const verificationUrl = `${appUrl}/api/auth/verify-email?token=${token}`;

    await this.resend.emails.send({
      from: 'onboarding@resend.dev',
      to: email,
      subject: 'Verify your eamil',
      html: `
        <h2>Welcome! Please verify your email</h2>
        <p>Click the link below to verify your email address. This link expires in 24 hours.</p>
        <a href="${verificationUrl}">Verify Email</a>
        <p>If you didn't create an account, you can safely ignore this email.</p>
      `,
    });
  }

  // SendResetPassword in Email
  async sendPasswordResetEmail(email: string, token: string) {
    const appUrl = this.typedConfigService.get('APP_URL');
    const resetUrl = `${appUrl}/api/auth/reset-password?token=${token}`;

    await this.resend.emails.send({
      from: 'onboarding@resend.dev',
      to: email,
      subject: 'Reset your password',
      html: `
        <h2>Password Reset Request</h2>
        <p>Click the link below to reset your password. This link expires in 1 hour.</p>
        <a href="${resetUrl}">Reset Password</a>
        <p>If you didn't request a password reset, you can safely ignore this email.</p> `,
    });
  }
}
