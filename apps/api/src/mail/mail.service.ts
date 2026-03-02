import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as sgMail from "@sendgrid/mail";

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly fromEmail: string;

  constructor(private readonly config: ConfigService) {
    sgMail.setApiKey(this.config.getOrThrow<string>("SENDGRID_API_KEY"));
    this.fromEmail = this.config.getOrThrow<string>("SENDGRID_FROM_EMAIL");
  }

  async sendVerificationEmail(email: string, token: string): Promise<void> {
    const appUrl = this.config.getOrThrow<string>("APP_URL");
    const verifyUrl = `${appUrl}/auth/verify-email?token=${token}`;

    try {
      await sgMail.send({
        to: email,
        from: this.fromEmail,
        subject: "COWRI – Vérifiez votre adresse e-mail",
        html: `
          <h2>Bienvenue sur COWRI !</h2>
          <p>Cliquez sur le lien ci-dessous pour vérifier votre adresse e-mail :</p>
          <a href="${verifyUrl}">${verifyUrl}</a>
          <p>Ce lien expire dans 24 heures.</p>
        `,
      });
    } catch (error) {
      this.logger.error(`Failed to send verification email to ${email}`, error);
      throw error;
    }
  }
}
