import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as sgMail from '@sendgrid/mail';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly fromEmail: string;
  private readonly appUrl: string;

  constructor(private readonly config: ConfigService) {
    sgMail.setApiKey(this.config.getOrThrow('SENDGRID_API_KEY'));
    this.fromEmail = this.config.getOrThrow('SENDGRID_FROM_EMAIL');
    this.appUrl = this.config.getOrThrow('APP_URL');
  }

  async sendVerificationEmail(to: string, token: string): Promise<void> {
    const verifyUrl = `${this.appUrl}/verify-email?token=${token}`;

    const msg = {
      to,
      from: this.fromEmail,
      subject: 'Vérifiez votre adresse email — Cowri',
      html: `
        <h2>Bienvenue sur Cowri !</h2>
        <p>Cliquez sur le lien ci-dessous pour vérifier votre adresse email :</p>
        <a href="${verifyUrl}" style="display:inline-block;padding:12px 24px;background:#2563eb;color:#fff;text-decoration:none;border-radius:6px;">
          Vérifier mon email
        </a>
        <p>Ce lien expire dans 24 heures.</p>
        <p>Si vous n'avez pas créé de compte, ignorez cet email.</p>
      `,
    };

    try {
      await sgMail.send(msg);
    } catch (error) {
      this.logger.error(`Failed to send verification email to ${to}`, error);
      throw error;
    }
  }
}
