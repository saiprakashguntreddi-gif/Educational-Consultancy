import { prisma } from '../../shared/database/prisma.service';
import { Role } from '../../config/roles';
import { CounsellorService } from '../counsellor/counsellor.service';

export class AdminService {
  /**
   * Get Admin Platform Overview Dashboard with Real PostgreSQL Aggregations
   */
  public static async getAdminDashboard() {
    const now = new Date();
    const nextMonth = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const [
      totalStudents,
      activeStudents,
      totalCounsellors,
      verifiedProfiles,
      pendingProfiles,
      rejectedProfiles,
      unassignedStudents,
      totalAppointments,
      upcomingAppointmentsCount,
      totalScholarships,
      totalShortlists,
      totalActionPlans,
      recentAuditLogs,
      countryDistributionRaw,
      departmentDistributionRaw,
      recentStudentsRaw,
      upcomingAppointments,
      recentScholarships,
      counsellorsList,
    ] = await Promise.all([
      prisma.studentProfile.count(),
      prisma.studentProfile.count({ where: { user: { isActive: true } } }),
      prisma.user.count({ where: { role: Role.COUNSELLOR } }),
      prisma.studentProfile.count({ where: { verificationStatus: 'VERIFIED' } }),
      prisma.studentProfile.count({ where: { verificationStatus: 'PENDING' } }),
      prisma.studentProfile.count({ where: { verificationStatus: 'REJECTED' } }),
      prisma.studentProfile.count({ where: { assignedCounsellorId: null } }),
      prisma.appointment.count(),
      prisma.appointment.count({
        where: {
          scheduledAt: { gte: now, lte: nextMonth },
          status: { in: ['SCHEDULED', 'CONFIRMED'] },
        },
      }),
      prisma.scholarship.count({ where: { isActive: true } }),
      prisma.shortlistItem.count(),
      prisma.actionPlanItem.count({ where: { category: 'APPLICATION' } }),
      prisma.auditLog.findMany({
        include: {
          user: { select: { id: true, email: true, role: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
      prisma.studentPreference.groupBy({
        by: ['primaryCountry'],
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 6,
      }),
      prisma.studentPreference.groupBy({
        by: ['department'],
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 6,
      }),
      prisma.studentProfile.findMany({
        take: 6,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, email: true, isActive: true } },
          assignedCounsellor: { select: { id: true, email: true } },
          preference: true,
        },
      }),
      prisma.appointment.findMany({
        where: { scheduledAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
        take: 6,
        orderBy: { scheduledAt: 'asc' },
        include: {
          studentProfile: { select: { id: true, fullName: true, contactEmail: true } },
          counsellor: { select: { id: true, email: true } },
        },
      }),
      prisma.scholarship.findMany({
        where: { isActive: true },
        take: 6,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.findMany({
        where: { role: Role.COUNSELLOR },
        select: {
          id: true,
          email: true,
          isActive: true,
          _count: { select: { assignedStudents: true, counsellorAppointments: true } },
        },
        take: 6,
      }),
    ]);

    const activeApplications = totalShortlists + totalActionPlans;
    const pendingRequests = pendingProfiles + unassignedStudents;
    const upcomingDeadlines = upcomingAppointmentsCount + (totalScholarships > 0 ? totalScholarships : 0);

    const countryDistribution = countryDistributionRaw
      .filter((c) => c.primaryCountry)
      .map((c) => ({
        country: c.primaryCountry as string,
        count: c._count.id,
      }));

    const departmentDistribution = departmentDistributionRaw
      .filter((d) => d.department)
      .map((d) => ({
        department: d.department,
        count: d._count.id,
      }));

    return {
      kpis: {
        totalStudents,
        activeStudents,
        totalCounsellors,
        verifiedProfiles,
        pendingProfiles,
        rejectedProfiles,
        unassignedStudents,
        totalAppointments,
        totalWebinars: 0,
        activeApplications,
        pendingRequests,
        upcomingDeadlines,
        totalScholarships,
      },
      analytics: {
        countryDistribution,
        departmentDistribution,
        applicationStatus: {
          pending: pendingProfiles,
          approved: verifiedProfiles,
          rejected: rejectedProfiles,
          inReview: unassignedStudents,
          total: totalStudents,
        },
      },
      recentStudents: recentStudentsRaw.map((s) => ({
        id: s.id,
        fullName: s.fullName,
        email: s.contactEmail || s.user.email,
        phone: s.phone,
        grade: s.grade,
        verificationStatus: s.verificationStatus,
        assignedCounsellor: s.assignedCounsellor,
        countryPreference: s.preference?.primaryCountry || 'Global',
        department: s.preference?.department || 'General',
        createdAt: s.createdAt,
      })),
      upcomingAppointments: upcomingAppointments.map((a) => ({
        id: a.id,
        title: a.title,
        scheduledAt: a.scheduledAt,
        status: a.status,
        appointmentType: a.appointmentType,
        studentName: a.studentProfile.fullName,
        studentEmail: a.studentProfile.contactEmail,
        counsellorEmail: a.counsellor.email,
      })),
      recentScholarships: recentScholarships.map((sch) => ({
        id: sch.id,
        name: sch.name,
        provider: sch.provider,
        country: sch.country,
        awardType: sch.awardType,
        applicationDeadline: sch.applicationDeadline,
        isActive: sch.isActive,
      })),
      counsellorWorkloads: counsellorsList.map((c) => ({
        id: c.id,
        email: c.email,
        isActive: c.isActive,
        studentCount: c._count.assignedStudents,
        appointmentsCount: c._count.counsellorAppointments,
      })),
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

  /**
   * List all student applications (shortlisted colleges & formal submissions)
   */
  public static async listAllApplications(params: { status?: string; search?: string } = {}) {
    const shortlists = await prisma.shortlistItem.findMany({
      where: { itemType: 'INSTITUTION' },
      include: {
        studentProfile: {
          select: {
            id: true,
            fullName: true,
            contactEmail: true,
            assignedCounsellor: { select: { email: true } },
            preference: { select: { primaryCountry: true, department: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const institutionIds = shortlists.map((s) => s.itemId);
    const institutions = await prisma.institution.findMany({
      where: { id: { in: institutionIds } },
      select: { id: true, name: true, country: true, city: true },
    });
    const instMap = new Map(institutions.map((i) => [i.id, i]));

    let applications = shortlists.map((s) => {
      const inst = instMap.get(s.itemId);
      const calculatedStatus =
        s.fitCategory === 'SAFE'
          ? 'Approved'
          : s.priority === 'HIGH'
          ? 'In Review'
          : 'Pending';

      return {
        id: s.id,
        studentId: s.studentProfile.id,
        studentName: s.studentProfile.fullName,
        studentEmail: s.studentProfile.contactEmail,
        institutionName: inst?.name || 'Partner University',
        country: inst?.country || s.studentProfile.preference?.primaryCountry || 'Global',
        program: s.studentProfile.preference?.department || 'Undergraduate Degree',
        status: calculatedStatus,
        appliedOn: s.createdAt.toISOString().slice(0, 10),
        counsellorEmail: s.studentProfile.assignedCounsellor?.email || 'Unassigned',
      };
    });

    if (params.status && params.status !== 'ALL') {
      applications = applications.filter(
        (a) => a.status.toLowerCase() === params.status?.toLowerCase()
      );
    }

    if (params.search && params.search.trim()) {
      const q = params.search.toLowerCase();
      applications = applications.filter(
        (a) =>
          a.studentName.toLowerCase().includes(q) ||
          a.institutionName.toLowerCase().includes(q) ||
          a.program.toLowerCase().includes(q)
      );
    }

    return applications;
  }
}

