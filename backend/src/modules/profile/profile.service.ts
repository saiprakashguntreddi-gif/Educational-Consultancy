import { prisma } from '../../shared/database/prisma.service';
import { VerificationStatus } from '../../config/constants';
import { ProfileIntakeDto, VerifyProfileDto } from './profile.validation';
import { StudentProfileRecord } from './profile.types';

export class ProfileService {
  /**
   * Save or update the intake record for a student
   * Module 1 creates or updates the profile with the 9 mandatory fields.
   */
  public static async saveIntake(
    userId: string,
    dto: ProfileIntakeDto
  ): Promise<StudentProfileRecord> {
    const profile = await prisma.studentProfile.upsert({
      where: { userId },
      create: {
        userId,
        fullName: dto.fullName,
        gender: dto.gender as any,
        grade: dto.grade,
        contactEmail: dto.contactEmail,
        phone: dto.phone,
        addressStreet: dto.address.street,
        addressCity: dto.address.city,
        addressState: dto.address.state,
        addressPostalCode: dto.address.postalCode,
        addressCountry: dto.address.country,
        board: dto.board,
        citizenship: dto.citizenship,
        passingOutYear: dto.passingOutYear,
        verificationStatus: VerificationStatus.PENDING as any,
      },
      update: {
        fullName: dto.fullName,
        gender: dto.gender as any,
        grade: dto.grade,
        contactEmail: dto.contactEmail,
        phone: dto.phone,
        addressStreet: dto.address.street,
        addressCity: dto.address.city,
        addressState: dto.address.state,
        addressPostalCode: dto.address.postalCode,
        addressCountry: dto.address.country,
        board: dto.board,
        citizenship: dto.citizenship,
        passingOutYear: dto.passingOutYear,
        // When updated by student, status resets to PENDING for re-verification
        verificationStatus: VerificationStatus.PENDING as any,
      },
    });

    // Record audit log for intake submission
    await prisma.auditLog.create({
      data: {
        userId,
        action: 'PROFILE_INTAKE_SUBMITTED',
        details: JSON.stringify({
          profileId: profile.id,
          fullName: profile.fullName,
          grade: profile.grade,
          board: profile.board,
        }),
      },
    });

    return this.mapToRecord(profile);
  }

  /**
   * Get student profile by associated User ID
   */
  public static async getProfileByUserId(userId: string): Promise<StudentProfileRecord | null> {
    const profile = await prisma.studentProfile.findUnique({
      where: { userId },
    });

    if (!profile) return null;
    return this.mapToRecord(profile);
  }

  /**
   * Get student profile by Profile ID (for Counsellor / Admin)
   */
  public static async getProfileById(profileId: string): Promise<StudentProfileRecord | null> {
    const profile = await prisma.studentProfile.findUnique({
      where: { id: profileId },
    });

    if (!profile) return null;
    return this.mapToRecord(profile);
  }

  /**
   * List profiles with pagination and optional status filter (for Counsellor / Admin)
   */
  public static async listProfiles(params: {
    page?: number;
    limit?: number;
    status?: VerificationStatus;
  }): Promise<{ profiles: StudentProfileRecord[]; total: number; page: number; totalPages: number }> {
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(100, Math.max(1, params.limit || 20));
    const skip = (page - 1) * limit;

    const where: any = {};
    if (params.status) {
      where.verificationStatus = params.status;
    }

    const [total, items] = await Promise.all([
      prisma.studentProfile.count({ where }),
      prisma.studentProfile.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      profiles: items.map(this.mapToRecord),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Update student verification status (Counsellor / Admin action)
   */
  public static async updateVerification(
    profileId: string,
    dto: VerifyProfileDto,
    verifiedByUserId: string
  ): Promise<StudentProfileRecord> {
    const existing = await prisma.studentProfile.findUnique({
      where: { id: profileId },
    });

    if (!existing) {
      throw new Error('Student profile not found');
    }

    const updated = await prisma.studentProfile.update({
      where: { id: profileId },
      data: {
        verificationStatus: dto.status as any,
        verificationNotes: dto.notes ?? null,
        verifiedAt: dto.status === VerificationStatus.VERIFIED ? new Date() : null,
        verifiedBy: verifiedByUserId,
      },
    });

    // Record audit log for verification action
    await prisma.auditLog.create({
      data: {
        userId: verifiedByUserId,
        action: `PROFILE_STATUS_${dto.status}`,
        details: JSON.stringify({
          profileId,
          newStatus: dto.status,
          notes: dto.notes,
        }),
      },
    });

    return this.mapToRecord(updated);
  }

  /**
   * Helper to format Prisma model into domain StudentProfileRecord
   */
  private static mapToRecord(raw: any): StudentProfileRecord {
    return {
      id: raw.id,
      userId: raw.userId,
      fullName: raw.fullName,
      gender: raw.gender as any,
      grade: raw.grade,
      contactEmail: raw.contactEmail,
      phone: raw.phone,
      address: {
        street: raw.addressStreet,
        city: raw.addressCity,
        state: raw.addressState,
        postalCode: raw.addressPostalCode,
        country: raw.addressCountry,
      },
      board: raw.board,
      citizenship: raw.citizenship,
      passingOutYear: raw.passingOutYear,
      verificationStatus: raw.verificationStatus as any,
      verifiedAt: raw.verifiedAt,
      verifiedBy: raw.verifiedBy,
      verificationNotes: raw.verificationNotes,
      isEnrolled: Boolean(raw.isEnrolled),
      enrolledAt: raw.enrolledAt ? new Date(raw.enrolledAt) : null,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    };
  }
}
