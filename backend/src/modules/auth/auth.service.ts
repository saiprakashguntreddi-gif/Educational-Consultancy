import jwt from 'jsonwebtoken';
import { prisma } from '../../shared/database/prisma.service';
import { hashPassword, comparePassword } from '../../shared/utils/password';
import { config } from '../../config/env';
import { Role } from '../../config/roles';
import { RegisterInput, LoginInput } from './auth.validation';

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
}
