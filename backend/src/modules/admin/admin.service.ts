import { prisma } from '../../shared/database/prisma.service';
import { Role } from '../../config/roles';
import { CounsellorService } from '../counsellor/counsellor.service';

export class AdminService {
  /**
   * Get Admin Platform Overview Dashboard
   */
  public static async getAdminDashboard() {
    const [
      totalStudents,
      totalCounsellors,
      verifiedProfiles,
      pendingProfiles,
      rejectedProfiles,
      unassignedStudents,
      totalAppointments,
      totalWebinars,
      recentAuditLogs,
    ] = await Promise.all([
      prisma.user.count({ where: { role: Role.STUDENT } }),
      prisma.user.count({ where: { role: Role.COUNSELLOR } }),
      prisma.studentProfile.count({ where: { verificationStatus: 'VERIFIED' } }),
      prisma.studentProfile.count({ where: { verificationStatus: 'PENDING' } }),
      prisma.studentProfile.count({ where: { verificationStatus: 'REJECTED' } }),
      prisma.studentProfile.count({ where: { assignedCounsellorId: null } }),
      prisma.appointment.count(),
      prisma.webinar.count(),
      prisma.auditLog.findMany({
        include: {
          user: { select: { id: true, email: true, role: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
    ]);

    return {
      kpis: {
        totalStudents,
        totalCounsellors,
        verifiedProfiles,
        pendingProfiles,
        rejectedProfiles,
        unassignedStudents,
        totalAppointments,
        totalWebinars,
      },
      recentAuditLogs,
    };
  }

  /**
   * Global Student Management: List All Students across the platform
   */
  public static async listAllStudents(params: {
    search?: string;
    verificationStatus?: string;
    board?: string;
    passingOutYear?: string;
    grade?: string;
    counsellorId?: string;
    assignmentStatus?: 'ALL' | 'ASSIGNED' | 'UNASSIGNED';
    page?: string | number;
    limit?: string | number;
  }) {
    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(params.limit) || 20));
    const skip = (page - 1) * limit;

    const where: any = {};

    if (params.verificationStatus) {
      where.verificationStatus = params.verificationStatus;
    }

    if (params.board) {
      where.board = { contains: params.board };
    }

    if (params.passingOutYear) {
      where.passingOutYear = parseInt(params.passingOutYear, 10);
    }

    if (params.grade) {
      where.grade = { contains: params.grade };
    }

    if (params.counsellorId) {
      where.assignedCounsellorId = params.counsellorId;
    }

    if (params.assignmentStatus === 'ASSIGNED') {
      where.assignedCounsellorId = { not: null };
    } else if (params.assignmentStatus === 'UNASSIGNED') {
      where.assignedCounsellorId = null;
    }

    if (params.search && params.search.trim().length > 0) {
      const q = params.search.trim();
      where.OR = [
        { fullName: { contains: q } },
        { contactEmail: { contains: q } },
        { user: { email: { contains: q } } },
      ];
    }

    const [total, items] = await Promise.all([
      prisma.studentProfile.count({ where }),
      prisma.studentProfile.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: { select: { id: true, email: true, isActive: true, isEmailVerified: true } },
          assignedCounsellor: { select: { id: true, email: true } },
          preference: true,
          education: true,
          examPlans: { select: { id: true } },
          mockAttempts: { select: { id: true } },
          personalInfo: { select: { id: true } },
          actionPlans: { select: { id: true, status: true } },
          appointments: {
            orderBy: { scheduledAt: 'desc' },
            take: 1,
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const students = items.map((p) => {
      const completionScore = CounsellorService.calculateCompletionScore(p);
      const pendingActions = p.actionPlans.filter(
        (a) => a.status === 'PENDING' || a.status === 'IN_PROGRESS'
      ).length;

      return {
        id: p.id,
        userId: p.userId,
        fullName: p.fullName,
        gender: p.gender,
        grade: p.grade,
        contactEmail: p.contactEmail,
        phone: p.phone,
        board: p.board,
        citizenship: p.citizenship,
        passingOutYear: p.passingOutYear,
        verificationStatus: p.verificationStatus,
        verifiedAt: p.verifiedAt,
        verifiedBy: p.verifiedBy,
        verificationNotes: p.verificationNotes,
        assignedCounsellor: p.assignedCounsellor,
        completionScore,
        pendingActionsCount: pendingActions,
        lastAppointment: p.appointments[0] || null,
        preferenceSummary: p.preference
          ? {
              primaryCountry: p.preference.primaryCountry,
              department: p.preference.department,
              subDepartment: p.preference.subDepartment,
            }
          : null,
        user: p.user,
        createdAt: p.createdAt,
      };
    });

    return {
      students,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Assign or Reassign Counsellor to Student
   */
  public static async assignCounsellor(
    profileId: string,
    counsellorId: string | null,
    adminUserId: string
  ) {
    const profile = await prisma.studentProfile.findUnique({
      where: { id: profileId },
    });

    if (!profile) {
      throw new Error('Student profile not found');
    }

    if (counsellorId) {
      const counsellor = await prisma.user.findFirst({
        where: { id: counsellorId, role: Role.COUNSELLOR },
      });
      if (!counsellor) {
        throw new Error('Selected user is not a valid counsellor');
      }
    }

    const updated = await prisma.studentProfile.update({
      where: { id: profileId },
      data: { assignedCounsellorId: counsellorId },
      include: {
        assignedCounsellor: { select: { id: true, email: true } },
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: adminUserId,
        action: counsellorId ? 'COUNSELLOR_ASSIGNED_TO_STUDENT' : 'COUNSELLOR_UNASSIGNED_FROM_STUDENT',
        details: JSON.stringify({
          studentProfileId: profileId,
          counsellorId,
          assignedBy: adminUserId,
        }),
      },
    });

    return updated;
  }

  /**
   * List all Counsellors with active caseload count
   */
  public static async listCounsellors() {
    const counsellors = await prisma.user.findMany({
      where: { role: Role.COUNSELLOR },
      select: {
        id: true,
        email: true,
        isActive: true,
        createdAt: true,
        _count: {
          select: {
            assignedStudents: true,
            counsellorAppointments: true,
          },
        },
      },
      orderBy: { email: 'asc' },
    });

    return counsellors.map((c) => ({
      id: c.id,
      email: c.email,
      isActive: c.isActive,
      assignedStudentsCount: c._count.assignedStudents,
      appointmentsCount: c._count.counsellorAppointments,
      createdAt: c.createdAt,
    }));
  }

  /**
   * Get Platform Audit Logs
   */
  public static async getAuditLogs(params: {
    action?: string;
    userId?: string;
    page?: string | number;
    limit?: string | number;
  }) {
    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(params.limit) || 30));
    const skip = (page - 1) * limit;

    const where: any = {};
    if (params.action) {
      where.action = { contains: params.action };
    }
    if (params.userId) {
      where.userId = params.userId;
    }

    const [total, logs] = await Promise.all([
      prisma.auditLog.count({ where }),
      prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: { select: { id: true, email: true, role: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      logs,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Export All Platform Students (CSV)
   */
  public static async exportAllStudentsCsv(): Promise<string> {
    const students = await prisma.studentProfile.findMany({
      include: {
        user: { select: { email: true } },
        assignedCounsellor: { select: { email: true } },
        preference: true,
        education: true,
      },
      orderBy: { fullName: 'asc' },
    });

    const headers = [
      'ID',
      'Full Name',
      'Account Email',
      'Contact Email',
      'Phone',
      'Grade',
      'Board',
      'Passing Out Year',
      'Citizenship',
      'Verification Status',
      'Assigned Counsellor',
      'Primary Country',
      'Department',
      '12th School',
      '12th Percentage',
    ];

    const escapeCsv = (str: any) => {
      if (str === null || str === undefined) return '""';
      const s = String(str).replace(/"/g, '""');
      return `"${s}"`;
    };

    const rows = students.map((s) => [
      escapeCsv(s.id),
      escapeCsv(s.fullName),
      escapeCsv(s.user.email),
      escapeCsv(s.contactEmail),
      escapeCsv(s.phone),
      escapeCsv(s.grade),
      escapeCsv(s.board),
      escapeCsv(s.passingOutYear),
      escapeCsv(s.citizenship),
      escapeCsv(s.verificationStatus),
      escapeCsv(s.assignedCounsellor?.email || 'Unassigned'),
      escapeCsv(s.preference?.primaryCountry || ''),
      escapeCsv(s.preference?.department || ''),
      escapeCsv(s.education?.schoolName || ''),
      escapeCsv(s.education?.percentage || ''),
    ]);

    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  }
}
