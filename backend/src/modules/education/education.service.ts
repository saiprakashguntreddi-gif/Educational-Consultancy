import { prisma } from '../../shared/database/prisma.service';
import {
  StudentEducationInput,
  StudentEducationRecord,
  SubjectDetail,
} from './education.types';

export class EducationService {
  /**
   * Transforms database StudentEducation model into client record.
   */
  private static mapToRecord(record: any): StudentEducationRecord {
    let parsedSubjects: SubjectDetail[] = [];
    try {
      parsedSubjects = record.subjectDetails ? JSON.parse(record.subjectDetails) : [];
    } catch {
      parsedSubjects = [];
    }

    return {
      id: record.id,
      studentProfileId: record.studentProfileId,
      schoolName: record.schoolName,
      board: record.board,
      completionYear: record.completionYear,
      percentage: record.percentage,
      subjectDetails: parsedSubjects,
      tenthSchoolName: record.tenthSchoolName || null,
      tenthBoard: record.tenthBoard || null,
      tenthPassingYear: record.tenthPassingYear || null,
      tenthPercentage: record.tenthPercentage || null,
      studyCategory: record.studyCategory || 'UNDERGRADUATE',
      targetStream: record.targetStream || null,
      twelfthDocumentUrl: record.twelfthDocumentUrl || null,
      tenthDocumentUrl: record.tenthDocumentUrl || null,
      undergradDegree: record.undergradDegree || null,
      undergradCollege: record.undergradCollege || null,
      undergradPassingYear: record.undergradPassingYear || null,
      undergradPercentage: record.undergradPercentage || null,
      undergradDocumentUrl: record.undergradDocumentUrl || null,
      createdAt: record.createdAt.toISOString(),
      updatedAt: record.updatedAt.toISOString(),
    };
  }

  /**
   * Save or update education details for the authenticated student.
   */
  static async saveOrUpdateEducation(
    userId: string,
    input: StudentEducationInput,
    ipAddress?: string
  ): Promise<StudentEducationRecord> {
    // 1. Locate student's Profile Intake
    const profile = await prisma.studentProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      const err: any = new Error(
        'Student profile not found. Please complete Module 1 profile intake before saving education details.'
      );
      err.statusCode = 404;
      throw err;
    }

    const serializedSubjects = JSON.stringify(input.subjectDetails || []);

    // 2. Upsert education details record
    const record = await (prisma.studentEducation as any).upsert({
      where: { studentProfileId: profile.id },
      create: {
        studentProfileId: profile.id,
        schoolName: input.schoolName,
        board: input.board,
        completionYear: input.completionYear,
        percentage: input.percentage,
        subjectDetails: serializedSubjects,
        tenthSchoolName: input.tenthSchoolName?.trim() || null,
        tenthBoard: input.tenthBoard?.trim() || null,
        tenthPassingYear: input.tenthPassingYear || null,
        tenthPercentage: input.tenthPercentage || null,
        studyCategory: input.studyCategory || 'UNDERGRADUATE',
        targetStream: input.targetStream?.trim() || null,
        twelfthDocumentUrl: input.twelfthDocumentUrl?.trim() || null,
        tenthDocumentUrl: input.tenthDocumentUrl?.trim() || null,
        undergradDegree: input.undergradDegree?.trim() || null,
        undergradCollege: input.undergradCollege?.trim() || null,
        undergradPassingYear: input.undergradPassingYear || null,
        undergradPercentage: input.undergradPercentage || null,
        undergradDocumentUrl: input.undergradDocumentUrl?.trim() || null,
      },
      update: {
        schoolName: input.schoolName,
        board: input.board,
        completionYear: input.completionYear,
        percentage: input.percentage,
        subjectDetails: serializedSubjects,
        tenthSchoolName: input.tenthSchoolName?.trim() || null,
        tenthBoard: input.tenthBoard?.trim() || null,
        tenthPassingYear: input.tenthPassingYear || null,
        tenthPercentage: input.tenthPercentage || null,
        studyCategory: input.studyCategory || 'UNDERGRADUATE',
        targetStream: input.targetStream?.trim() || null,
        twelfthDocumentUrl: input.twelfthDocumentUrl?.trim() || null,
        tenthDocumentUrl: input.tenthDocumentUrl?.trim() || null,
        undergradDegree: input.undergradDegree?.trim() || null,
        undergradCollege: input.undergradCollege?.trim() || null,
        undergradPassingYear: input.undergradPassingYear || null,
        undergradPercentage: input.undergradPercentage || null,
        undergradDocumentUrl: input.undergradDocumentUrl?.trim() || null,
      },
    });

    // 3. Record Audit Log for regulatory and compliance tracking
    await prisma.auditLog.create({
      data: {
        userId,
        action: 'EDUCATION_DETAILS_SAVED',
        details: JSON.stringify({
          educationId: record.id,
          studentProfileId: profile.id,
          schoolName: input.schoolName,
          board: input.board,
          completionYear: input.completionYear,
          percentage: input.percentage,
          subjectCount: input.subjectDetails.length,
        }),
        ipAddress: ipAddress || null,
      },
    });

    return this.mapToRecord(record);
  }

  /**
   * Retrieve education details for authenticated student.
   */
  static async getEducationByUserId(
    userId: string
  ): Promise<StudentEducationRecord | null> {
    const profile = await prisma.studentProfile.findUnique({
      where: { userId },
      include: { education: true },
    });

    if (!profile) {
      const err: any = new Error('Student profile not found for this user account.');
      err.statusCode = 404;
      throw err;
    }

    if (!profile.education) {
      return null;
    }

    return this.mapToRecord(profile.education);
  }

  /**
   * Retrieve education details by student profile ID for Counsellors / Admins.
   */
  static async getEducationByProfileId(
    studentProfileId: string
  ): Promise<StudentEducationRecord | null> {
    const record = await prisma.studentEducation.findUnique({
      where: { studentProfileId },
    });

    if (!record) {
      return null;
    }

    return this.mapToRecord(record);
  }
}
