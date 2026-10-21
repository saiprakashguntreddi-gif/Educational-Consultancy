import { prisma } from '../../shared/database/prisma.service';
import {
  PersonalModulePayload,
  UpdateContactGuardianInput,
  ActivityInput,
  AchievementInput,
  StudentActivityRecord,
  StudentAchievementRecord,
} from './personal.types';

export class PersonalService {
  /**
   * Helper to format Activity record
   */
  private static mapActivity(record: any): StudentActivityRecord {
    return {
      id: record.id,
      studentProfileId: record.studentProfileId,
      activityName: record.activityName,
      category: record.category,
      organization: record.organization || null,
      period: record.period || null,
      description: record.description,
      recognition: record.recognition || null,
      createdAt: record.createdAt.toISOString(),
      updatedAt: record.updatedAt.toISOString(),
    };
  }

  /**
   * Helper to format Achievement record
   */
  private static mapAchievement(record: any): StudentAchievementRecord {
    return {
      id: record.id,
      studentProfileId: record.studentProfileId,
      title: record.title,
      category: record.category,
      issuer: record.issuer || null,
      dateYear: record.dateYear || null,
      description: record.description || null,
      certificateUrl: record.certificateUrl || null,
      createdAt: record.createdAt.toISOString(),
      updatedAt: record.updatedAt.toISOString(),
    };
  }

  /**
   * Helper to get or create student profile verification
   */
  private static async getStudentProfileByUserId(userId: string) {
    const profile = await prisma.studentProfile.findUnique({
      where: { userId },
      include: { user: true },
    });

    if (!profile) {
      const err: any = new Error(
        'Student profile record not found. Please complete Module 1 profile intake first.'
      );
      err.statusCode = 404;
      throw err;
    }

    return profile;
  }

  /**
   * Get authenticated student's complete Personal Information module data
   */
  static async getPersonalData(userId: string): Promise<PersonalModulePayload> {
    const profile = await this.getStudentProfileByUserId(userId);

    const [personalInfo, activities, achievements] = await Promise.all([
      prisma.studentPersonalInfo.findUnique({
        where: { studentProfileId: profile.id },
      }),
      prisma.studentActivity.findMany({
        where: { studentProfileId: profile.id },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.studentAchievement.findMany({
        where: { studentProfileId: profile.id },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      primaryEmail: profile.user?.email || profile.contactEmail,
      primaryPhone: personalInfo?.primaryPhone || profile.phone,
      alternateEmail: personalInfo?.alternateEmail || null,
      guardian: {
        name: personalInfo?.guardianName || null,
        relationship: personalInfo?.guardianRelationship || null,
        phone: personalInfo?.guardianPhone || null,
        email: personalInfo?.guardianEmail || null,
      },
      activities: activities.map(this.mapActivity),
      achievements: achievements.map(this.mapAchievement),
    };
  }

  /**
   * Update student's contact information and parent / guardian details
   */
  static async updateContactAndGuardian(
    userId: string,
    input: UpdateContactGuardianInput,
    ipAddress?: string
  ): Promise<PersonalModulePayload> {
    const profile = await this.getStudentProfileByUserId(userId);

    // Synchronize primary phone to StudentProfile if provided
    if (input.primaryPhone && input.primaryPhone !== profile.phone) {
      await prisma.studentProfile.update({
        where: { id: profile.id },
        data: { phone: input.primaryPhone },
      });
    }

    // Upsert StudentPersonalInfo
    await prisma.studentPersonalInfo.upsert({
      where: { studentProfileId: profile.id },
      create: {
        studentProfileId: profile.id,
        primaryPhone: input.primaryPhone || profile.phone,
        alternateEmail: input.alternateEmail?.trim() || null,
        guardianName: input.guardianName?.trim() || null,
        guardianRelationship: input.guardianRelationship?.trim() || null,
        guardianPhone: input.guardianPhone?.trim() || null,
        guardianEmail: input.guardianEmail?.trim() || null,
      },
      update: {
        primaryPhone: input.primaryPhone || undefined,
        alternateEmail:
          input.alternateEmail !== undefined ? input.alternateEmail?.trim() || null : undefined,
        guardianName:
          input.guardianName !== undefined ? input.guardianName?.trim() || null : undefined,
        guardianRelationship:
          input.guardianRelationship !== undefined
            ? input.guardianRelationship?.trim() || null
            : undefined,
        guardianPhone:
          input.guardianPhone !== undefined ? input.guardianPhone?.trim() || null : undefined,
        guardianEmail:
          input.guardianEmail !== undefined ? input.guardianEmail?.trim() || null : undefined,
      },
    });

    // Audit log (sanitized, avoiding full PII in clear text logs)
    await prisma.auditLog.create({
      data: {
        userId,
        action: 'PERSONAL_CONTACT_GUARDIAN_UPDATED',
        details: JSON.stringify({
          studentProfileId: profile.id,
          hasAlternateEmail: Boolean(input.alternateEmail),
          hasGuardian: Boolean(input.guardianName),
          guardianRelationship: input.guardianRelationship || null,
        }),
        ipAddress: ipAddress || null,
      },
    });

    return this.getPersonalData(userId);
  }

  /**
   * Add an extracurricular activity
   */
  static async addActivity(
    userId: string,
    input: ActivityInput,
    ipAddress?: string
  ): Promise<StudentActivityRecord> {
    const profile = await this.getStudentProfileByUserId(userId);

    const activity = await prisma.studentActivity.create({
      data: {
        studentProfileId: profile.id,
        activityName: input.activityName.trim(),
        category: input.category.trim(),
        organization: input.organization?.trim() || null,
        period: input.period?.trim() || null,
        description: input.description.trim(),
        recognition: input.recognition?.trim() || null,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'STUDENT_ACTIVITY_ADDED',
        details: JSON.stringify({
          activityId: activity.id,
          category: activity.category,
        }),
        ipAddress: ipAddress || null,
      },
    });

    return this.mapActivity(activity);
  }

  /**
   * Update an existing extracurricular activity (with strict student ownership barrier)
   */
  static async updateActivity(
    userId: string,
    activityId: string,
    input: Partial<ActivityInput>,
    ipAddress?: string
  ): Promise<StudentActivityRecord> {
    const profile = await this.getStudentProfileByUserId(userId);

    const existing = await prisma.studentActivity.findUnique({
      where: { id: activityId },
    });

    if (!existing || existing.studentProfileId !== profile.id) {
      const err: any = new Error('Extracurricular activity not found or access denied.');
      err.statusCode = 404;
      throw err;
    }

    const updated = await prisma.studentActivity.update({
      where: { id: activityId },
      data: {
        activityName: input.activityName !== undefined ? input.activityName.trim() : undefined,
        category: input.category !== undefined ? input.category.trim() : undefined,
        organization:
          input.organization !== undefined ? input.organization?.trim() || null : undefined,
        period: input.period !== undefined ? input.period?.trim() || null : undefined,
        description: input.description !== undefined ? input.description.trim() : undefined,
        recognition:
          input.recognition !== undefined ? input.recognition?.trim() || null : undefined,
      },
    });

    return this.mapActivity(updated);
  }

  /**
   * Delete an extracurricular activity (with strict student ownership barrier)
   */
  static async deleteActivity(userId: string, activityId: string, ipAddress?: string) {
    const profile = await this.getStudentProfileByUserId(userId);

    const existing = await prisma.studentActivity.findUnique({
      where: { id: activityId },
    });

    if (!existing || existing.studentProfileId !== profile.id) {
      const err: any = new Error('Extracurricular activity not found or access denied.');
      err.statusCode = 404;
      throw err;
    }

    await prisma.studentActivity.delete({
      where: { id: activityId },
    });

    return { deleted: true };
  }

  /**
   * Add an achievement
   */
  static async addAchievement(
    userId: string,
    input: AchievementInput,
    ipAddress?: string
  ): Promise<StudentAchievementRecord> {
    const profile = await this.getStudentProfileByUserId(userId);

    const achievement = await prisma.studentAchievement.create({
      data: {
        studentProfileId: profile.id,
        title: input.title.trim(),
        category: input.category.trim(),
        issuer: input.issuer?.trim() || null,
        dateYear: input.dateYear?.trim() || null,
        description: input.description?.trim() || null,
        certificateUrl: input.certificateUrl?.trim() || null,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'STUDENT_ACHIEVEMENT_ADDED',
        details: JSON.stringify({
          achievementId: achievement.id,
          category: achievement.category,
        }),
        ipAddress: ipAddress || null,
      },
    });

    return this.mapAchievement(achievement);
  }

  /**
   * Update an achievement (with strict student ownership barrier)
   */
  static async updateAchievement(
    userId: string,
    achievementId: string,
    input: Partial<AchievementInput>,
    ipAddress?: string
  ): Promise<StudentAchievementRecord> {
    const profile = await this.getStudentProfileByUserId(userId);

    const existing = await prisma.studentAchievement.findUnique({
      where: { id: achievementId },
    });

    if (!existing || existing.studentProfileId !== profile.id) {
      const err: any = new Error('Achievement record not found or access denied.');
      err.statusCode = 404;
      throw err;
    }

    const updated = await prisma.studentAchievement.update({
      where: { id: achievementId },
      data: {
        title: input.title !== undefined ? input.title.trim() : undefined,
        category: input.category !== undefined ? input.category.trim() : undefined,
        issuer: input.issuer !== undefined ? input.issuer?.trim() || null : undefined,
        dateYear: input.dateYear !== undefined ? input.dateYear?.trim() || null : undefined,
        description: input.description !== undefined ? input.description?.trim() || null : undefined,
        certificateUrl:
          input.certificateUrl !== undefined ? input.certificateUrl?.trim() || null : undefined,
      },
    });

    return this.mapAchievement(updated);
  }

  /**
   * Delete an achievement (with strict student ownership barrier)
   */
  static async deleteAchievement(userId: string, achievementId: string, ipAddress?: string) {
    const profile = await this.getStudentProfileByUserId(userId);

    const existing = await prisma.studentAchievement.findUnique({
      where: { id: achievementId },
    });

    if (!existing || existing.studentProfileId !== profile.id) {
      const err: any = new Error('Achievement record not found or access denied.');
      err.statusCode = 404;
      throw err;
    }

    await prisma.studentAchievement.delete({
      where: { id: achievementId },
    });

    return { deleted: true };
  }

  /**
   * Staff Review (Counsellor / Admin) by Student Profile ID
   */
  static async getPersonalDataByProfileId(studentProfileId: string): Promise<PersonalModulePayload> {
    const profile = await prisma.studentProfile.findUnique({
      where: { id: studentProfileId },
      include: { user: true },
    });

    if (!profile) {
      const err: any = new Error('Student profile not found.');
      err.statusCode = 404;
      throw err;
    }

    const [personalInfo, activities, achievements] = await Promise.all([
      prisma.studentPersonalInfo.findUnique({
        where: { studentProfileId: profile.id },
      }),
      prisma.studentActivity.findMany({
        where: { studentProfileId: profile.id },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.studentAchievement.findMany({
        where: { studentProfileId: profile.id },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      primaryEmail: profile.user?.email || profile.contactEmail,
      primaryPhone: personalInfo?.primaryPhone || profile.phone,
      alternateEmail: personalInfo?.alternateEmail || null,
      guardian: {
        name: personalInfo?.guardianName || null,
        relationship: personalInfo?.guardianRelationship || null,
        phone: personalInfo?.guardianPhone || null,
        email: personalInfo?.guardianEmail || null,
      },
      activities: activities.map(this.mapActivity),
      achievements: achievements.map(this.mapAchievement),
    };
  }
}
