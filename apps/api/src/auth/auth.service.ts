import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto, LoginDto } from './dto';
import { MailService } from './mail.service';

@Injectable()
export class AuthService {
  private readonly accessSecret: string;
  private readonly refreshSecret: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly mail: MailService,
  ) {
    this.accessSecret = this.config.getOrThrow('JWT_ACCESS_SECRET');
    this.refreshSecret = this.config.getOrThrow('JWT_REFRESH_SECRET');
  }

  // ── Register ────────────────────────────────────────────────────────

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) {
      throw new ConflictException('Email already in use');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 12);
    const emailVerifyToken = uuidv4();
    const emailVerifyExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        firstName: dto.firstName,
        lastName: dto.lastName,
        country: dto.country,
        emailVerifyToken,
        emailVerifyExpires,
      },
    });

    await this.mail.sendVerificationEmail(user.email, emailVerifyToken);

    return {
      message: 'Account created. Please check your email for verification.',
      userId: user.id,
    };
  }

  // ── Verify Email ────────────────────────────────────────────────────

  async verifyEmail(token: string) {
    const user = await this.prisma.user.findUnique({
      where: { emailVerifyToken: token },
    });

    if (!user || !user.emailVerifyExpires || user.emailVerifyExpires < new Date()) {
      throw new BadRequestException('Invalid or expired verification token');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        isEmailVerified: true,
        emailVerifyToken: null,
        emailVerifyExpires: null,
      },
    });

    return { message: 'Email verified successfully' };
  }

  // ── Login ───────────────────────────────────────────────────────────

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordValid = await bcrypt.compare(dto.password, user.password);
    if (!passwordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isEmailVerified) {
      throw new UnauthorizedException('Please verify your email before logging in');
    }

    const { accessToken, refreshToken } = await this.generateTokens(user.id, user.email);

    return { accessToken, refreshToken };
  }

  // ── Refresh ─────────────────────────────────────────────────────────

  async refresh(userId: string, email: string, oldRefreshToken: string) {
    // Revoke the old token
    await this.prisma.refreshToken.update({
      where: { token: oldRefreshToken },
      data: { revokedAt: new Date() },
    });

    // Generate new pair (rotation)
    const { accessToken, refreshToken } = await this.generateTokens(userId, email);

    // Link old token to new one for audit trail
    await this.prisma.refreshToken.update({
      where: { token: oldRefreshToken },
      data: { replacedByToken: refreshToken },
    });

    return { accessToken, refreshToken };
  }

  // ── Logout ──────────────────────────────────────────────────────────

  async logout(refreshToken: string) {
    if (!refreshToken) return;

    await this.prisma.refreshToken.updateMany({
      where: { token: refreshToken, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  // ── Helpers ─────────────────────────────────────────────────────────

  private async generateTokens(userId: string, email: string) {
    const payload = { sub: userId, email };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync(payload, {
        secret: this.accessSecret,
        expiresIn: '15m',
      }),
      this.jwt.signAsync(payload, {
        secret: this.refreshSecret,
        expiresIn: '7d',
      }),
    ]);

    // Persist refresh token
    await this.prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return { accessToken, refreshToken };
  }
}
