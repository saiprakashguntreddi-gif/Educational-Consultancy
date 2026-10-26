import jwt from 'jsonwebtoken';
import { prisma } from '../../shared/database/prisma.service';
import { hashPassword, comparePassword } from '../../shared/utils/password';
import { config } from '../../config/env';
import { Role } from '../../config/roles';
import { RegisterInput, LoginInput, ForgotPasswordInput, ResetPasswordInput } from './auth.validation';
import { EmailService } from '../../shared/utils/email.service';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

export interface UserSummary {
  id: string;
  email: string;
  role: Role;
  isActive: boolean;
  isEmailVerified: boolean;
  hasProfile: boolean;
  createdAt: Date;
}

export class AuthService {
  /**
   * Register a new user account (Default role: STUDENT)
   */
  public static async register(input: RegisterInput): Promise<{ user: UserSummary; tokens: AuthTokens }> {
    const existing = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (existing) {
      throw new Error('An account with this email address already exists');
    }

    const hashedPassword = await hashPassword(input.password);

    // SECURITY ENFORCEMENT: Public registration strictly creates STUDENT accounts only.
    // Never trust client-supplied roles to prevent privilege escalation.
    const assignedRole = Role.STUDENT;

    const user = await prisma.user.create({
      data: {
        email: input.email,
        passwordHash: hashedPassword,
        role: assignedRole,
        studentProfile: {
          create: {
            fullName: input.fullName?.trim() || input.email.split('@')[0],
            contactEmail: input.email,
            phone: '',
            addressStreet: '',
            addressCity: '',
            addressState: '',
            addressPostalCode: '',
            addressCountry: '',
            gender: 'PREFER_NOT_TO_SAY',
            citizenship: 'Pending Intake',
            passingOutYear: new Date().getFullYear(),
            grade: 'Pending Intake',
            board: 'Pending Intake',
            verificationStatus: 'PENDING',
          },
        },
      },
      include: {
        studentProfile: { select: { id: true } },
      },
    });

    // Record audit log for account creation
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'USER_REGISTERED',
        details: JSON.stringify({ email: user.email, role: assignedRole }),
      },
    });

    const tokens = this.generateTokens(user.id, user.email, assignedRole);

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role as Role,
        isActive: user.isActive,
        isEmailVerified: user.isEmailVerified,
        hasProfile: !!user.studentProfile,
        createdAt: user.createdAt,
      },
      tokens,
    };
  }

  /**
   * Authenticate user credentials and return session tokens
   */
  public static async login(input: LoginInput): Promise<{ user: UserSummary; tokens: AuthTokens }> {
    const user = await prisma.user.findUnique({
      where: { email: input.email },
      include: {
        studentProfile: { select: { id: true } },
      },
    });

    if (!user) {
      throw new Error('Invalid email or password');
    }

    if (!user.isActive) {
      throw new Error('Account is deactivated. Please contact support.');
    }

    const isMatch = await comparePassword(input.password, user.passwordHash);
    if (!isMatch) {
      throw new Error('Invalid email or password');
    }

    // Record audit log for successful login
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'USER_LOGGED_IN',
        details: JSON.stringify({ email: user.email }),
      },
    });

    const tokens = this.generateTokens(user.id, user.email, user.role as Role);

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role as Role,
        isActive: user.isActive,
        isEmailVerified: user.isEmailVerified,
        hasProfile: !!user.studentProfile,
        createdAt: user.createdAt,
      },
      tokens,
    };
  }

  /**
   * Retrieve the current authenticated user's profile status
   */
  public static async getCurrentUser(userId: string): Promise<UserSummary> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        studentProfile: { select: { id: true, verificationStatus: true } },
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role as Role,
      isActive: user.isActive,
      isEmailVerified: user.isEmailVerified,
      hasProfile: !!user.studentProfile,
      createdAt: user.createdAt,
    };
  }

  /**
   * Generate access and refresh JWTs
   */
  private static generateTokens(userId: string, email: string, role: Role): AuthTokens {
    const accessToken = jwt.sign(
      { userId, email, role },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn as any }
    );

    const refreshToken = jwt.sign(
      { userId, email, role },
      config.jwt.refreshSecret,
      { expiresIn: config.jwt.refreshExpiresIn as any }
    );

    return {
      accessToken,
      refreshToken,
      expiresIn: config.jwt.expiresIn,
    };
  }

  /**
   * Initiate password reset by generating a secure token and sending email
   */
  public static async forgotPassword(input: ForgotPasswordInput): Promise<{ message: string; previewLink?: string }> {
    const user = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (!user) {
      return {
        message: 'If an account exists with that email address, a password reset link has been sent.',
      };
    }

    if (!user.isActive) {
      throw new Error('Account is deactivated. Please contact support.');
    }

    const resetToken = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        purpose: 'PASSWORD_RESET',
        passSig: user.passwordHash.slice(-10),
      },
      config.jwt.secret,
      { expiresIn: '1h' }
    );

    const clientOrigin = config.cors.origin || 'http://localhost:3000';
    const resetLink = `${clientOrigin}/?view=reset-password&token=${encodeURIComponent(resetToken)}`;

    const emailResult = await EmailService.sendPasswordResetEmail(user.email, resetLink);

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'PASSWORD_RESET_REQUESTED',
        details: JSON.stringify({ email: user.email }),
      },
    });

    return {
      message: 'A password reset link has been sent to your email address.',
      previewLink: emailResult.previewLink,
    };
  }

  /**
   * Reset user password using verified reset token
   */
  public static async resetPassword(input: ResetPasswordInput): Promise<{ message: string }> {
    let decoded: any;
    try {
      decoded = jwt.verify(input.token, config.jwt.secret);
    } catch (err: any) {
      throw new Error('Invalid or expired password reset link. Please request a new one.');
    }

    if (decoded.purpose !== 'PASSWORD_RESET' || !decoded.userId) {
      throw new Error('Invalid password reset token.');
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      throw new Error('User account not found.');
    }

    if (decoded.passSig && user.passwordHash.slice(-10) !== decoded.passSig) {
      throw new Error('This password reset link has already been used. Please request a new one.');
    }

    const newHashedPassword = await hashPassword(input.newPassword);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: newHashedPassword,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'PASSWORD_RESET_COMPLETED',
        details: JSON.stringify({ email: user.email }),
      },
    });

    return {
      message: 'Your password has been successfully reset. You may now log in.',
    };
  }
}
