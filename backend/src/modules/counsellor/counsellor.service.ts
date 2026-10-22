import { prisma } from '../../shared/database/prisma.service';
import { hashPassword } from '../../shared/utils/password';
import { Role } from '../../config/roles';
import {
  CreateStudentByStaffDto,
  CreateActionPlanDto,
  UpdateActionPlanDto,
  CreateStudentNoteDto,
} from './counsellor.validation';

export class CounsellorService {
  /**
   * Helper to calculate student profile completion score
   */
  public static calculateCompletionScore(profile: any): number {
    let score = 20; // 20% for completing initial intake
    if (profile.preference) score += 20;
    if (profile.education) score += 20;
    if ((profile.examPlans && profile.examPlans.length > 0) || (profile.mockAttempts && profile.mockAttempts.length > 0)) {
      score += 20;
    }
    if (profile.personalInfo || (profile.activities && profile.activities.length > 0) || (profile.achievements && profile.achievements.length > 0)) {
      score += 20;
    }
    return Math.min(100, score);
  }

  /**
   * Get Counsellor Dashboard Metrics & Workload
   */
  public static async getCounsellorDashboard(counsellorId: string) {
    const [
      assignedCount,
      pendingVerificationCount,
      upcomingAppointments,
      pendingActionPlans,
      recentNotes,
      counsellorUser,
    ] = await Promise.all([
      prisma.studentProfile.count({
        where: { assignedCounsellorId: counsellorId },
      }),
      prisma.studentProfile.count({
        where: {
          assignedCounsellorId: counsellorId,
          verificationStatus: 'PENDING',
        },
      }),
      prisma.appointment.findMany({
        where: {
          counsellorId,
          scheduledAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        },
        include: {
          studentProfile: {
            select: { id: true, fullName: true, grade: true, contactEmail: true },
          },
        },
        orderBy: { scheduledAt: 'asc' },
        take: 5,
      }),
      prisma.actionPlanItem.count({
        where: {
          counsellorId,
          status: { in: ['PENDING', 'IN_PROGRESS'] },
        },
      }),
      prisma.studentCounsellorNote.findMany({
        where: { counsellorId },
        include: {
          studentProfile: {
            select: { id: true, fullName: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      prisma.user.findUnique({
        where: { id: counsellorId },
        select: { id: true, email: true, role: true },
      }),
    ]);

    // Unassigned students pool count (available for claiming)
    const unassignedCount = await prisma.studentProfile.count({
      where: { assignedCounsellorId: null },
    });

    return {
      counsellor: counsellorUser,
      metrics: {
        assignedStudents: assignedCount,
        pendingVerifications: pendingVerificationCount,
        upcomingAppointmentsCount: upcomingAppointments.length,
        activeActionPlans: pendingActionPlans,
        unassignedPoolCount: unassignedCount,
      },
      upcomingAppointments,
      recentNotes,
    };
  }

  /**
   * List Assigned Students with search, filtering and completion score
   */
  public static async listAssignedStudents(
    counsellorId: string,
    params: {
      search?: string;
      verificationStatus?: string;
      board?: string;
      passingOutYear?: string;
      grade?: string;
      page?: string | number;
      limit?: string | number;
    }
  ) {
    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(params.limit) || 20));
    const skip = (page - 1) * limit;

    const where: any = {
      assignedCounsellorId: counsellorId,
    };

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
          preference: true,
          education: true,
          examPlans: { select: { id: true } },
          mockAttempts: { select: { id: true } },
          personalInfo: { select: { id: true } },
          actionPlans: { select: { id: true, status: true } },
          appointments: {
            where: { counsellorId },
            orderBy: { scheduledAt: 'desc' },
            take: 1,
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const students = items.map((p) => {
      const completionScore = this.calculateCompletionScore(p);
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
   * Verify Counsellor Access to a Student Profile (IDOR Defense)
   */
  public static async verifyCounsellorAccess(
    profileId: string,
    requestingUser: { userId: string; role: string }
  ) {
    if (requestingUser.role === Role.ADMIN) {
      return true; // Admins have platform-wide access
    }

    const profile = await prisma.studentProfile.findUnique({
      where: { id: profileId },
      include: {
        appointments: { select: { counsellorId: true } },
      },
    });

    if (!profile) {
      throw new Error('Student profile not found');
    }

    if (requestingUser.role === Role.STUDENT) {
      if (profile.userId !== requestingUser.userId) {
        throw new Error('FORBIDDEN_IDOR');
      }
      return true;
    }

    if (requestingUser.role === Role.COUNSELLOR) {
      // Counsellor can access if:
      // 1. Assigned to student
      // 2. Verified the student
      // 3. Has an appointment with the student
      // 4. Student is currently unassigned (can inspect to claim)
      const isAssigned = profile.assignedCounsellorId === requestingUser.userId;
      const isVerifier = profile.verifiedBy === requestingUser.userId;
      const hasAppointment = profile.appointments.some((a) => a.counsellorId === requestingUser.userId);
      const isUnassigned = !profile.assignedCounsellorId;

      if (!isAssigned && !isVerifier && !hasAppointment && !isUnassigned) {
        throw new Error('FORBIDDEN_IDOR');
      }
    }

    return true;
  }

  /**
   * Get 360-degree Student Details across all integrated modules
   */
  public static async getStudent360(
    profileId: string,
    requestingUser: { userId: string; role: string }
  ) {
    await this.verifyCounsellorAccess(profileId, requestingUser);

    const profile = await prisma.studentProfile.findUnique({
      where: { id: profileId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            isActive: true,
            isEmailVerified: true,
            createdAt: true,
          },
        },
        assignedCounsellor: {
          select: { id: true, email: true },
        },
        preference: true,
        education: true,
        examPlans: {
          include: { exam: true },
          orderBy: { createdAt: 'desc' },
        },
        mockAttempts: {
          include: { mockTest: { select: { id: true, title: true, totalMarks: true } } },
          orderBy: { createdAt: 'desc' },
        },
        personalInfo: true,
        activities: { orderBy: { createdAt: 'desc' } },
        achievements: { orderBy: { createdAt: 'desc' } },
        savedInstitutions: {
          include: {
            institution: {
              select: { id: true, name: true, country: true, city: true, rankingInfo: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        savedCourses: {
          include: {
            course: {
              select: {
                id: true,
                name: true,
                department: true,
                level: true,
                institution: { select: { id: true, name: true, country: true } },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        savedScholarships: {
          include: {
            scholarship: {
              select: { id: true, name: true, provider: true, awardAmount: true, awardCurrency: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        shortlistItems: { orderBy: { priority: 'asc' } },
        recommendationBatches: {
          include: {
            items: {
              include: {
                institution: { select: { id: true, name: true, country: true, city: true } },
                course: { select: { id: true, name: true, department: true } },
              },
            },
          },
          orderBy: { generatedAt: 'desc' },
          take: 3,
        },
        appointments: {
          include: {
            counsellor: { select: { id: true, email: true } },
          },
          orderBy: { scheduledAt: 'desc' },
        },
        actionPlans: {
          include: {
            counsellor: { select: { id: true, email: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
        counsellorNotes: {
          include: {
            counsellor: { select: { id: true, email: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!profile) {
      throw new Error('Student profile not found');
    }

    const completionScore = this.calculateCompletionScore(profile);

    return {
      ...profile,
      completionScore,
    };
  }

  /**
   * Create Student Account by Staff (when direct registration is restricted)
   */
  public static async createStudentAccount(
    staffUserId: string,
    staffRole: string,
    dto: CreateStudentByStaffDto
  ) {
    const existing = await prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (existing) {
      throw new Error('A user with this email address already exists');
    }

    const passwordHash = await hashPassword(dto.password);
    const assignedCounsellorId =
      dto.counsellorId || (dto.assignToSelf && staffRole === Role.COUNSELLOR ? staffUserId : null);

    const user = await prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        passwordHash,
        role: Role.STUDENT,
        isActive: true,
        isEmailVerified: true,
      },
    });

    const profile = await prisma.studentProfile.create({
      data: {
        userId: user.id,
        fullName: dto.fullName,
        gender: dto.gender,
        grade: dto.grade,
        contactEmail: dto.contactEmail.toLowerCase(),
        phone: dto.phone,
        addressStreet: dto.address.street,
        addressCity: dto.address.city,
        addressState: dto.address.state,
        addressPostalCode: dto.address.postalCode,
        addressCountry: dto.address.country,
        board: dto.board,
        citizenship: dto.citizenship,
        passingOutYear: dto.passingOutYear,
        verificationStatus: 'VERIFIED',
        verifiedAt: new Date(),
        verifiedBy: staffUserId,
        verificationNotes: 'Account initialized and authenticated directly by staff member',
        assignedCounsellorId,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: staffUserId,
        action: 'STUDENT_ACCOUNT_CREATED_BY_STAFF',
        details: JSON.stringify({
          studentUserId: user.id,
          studentProfileId: profile.id,
          email: user.email,
          assignedCounsellorId,
          creatorRole: staffRole,
        }),
      },
    });

    return {
      user: { id: user.id, email: user.email, role: user.role },
      profile,
    };
  }

  /**
   * Claim an unassigned student
   */
  public static async claimStudent(profileId: string, counsellorId: string) {
    const profile = await prisma.studentProfile.findUnique({
      where: { id: profileId },
    });

    if (!profile) {
      throw new Error('Student profile not found');
    }

    if (profile.assignedCounsellorId && profile.assignedCounsellorId !== counsellorId) {
      throw new Error('This student is already assigned to another counsellor');
    }

    const updated = await prisma.studentProfile.update({
      where: { id: profileId },
      data: { assignedCounsellorId: counsellorId },
    });

    await prisma.auditLog.create({
      data: {
        userId: counsellorId,
        action: 'STUDENT_CLAIMED_BY_COUNSELLOR',
        details: JSON.stringify({ profileId, counsellorId }),
      },
    });

    return updated;
  }

  /**
   * Action Plans Management
   */
  public static async getActionPlans(
    profileId: string,
    requestingUser: { userId: string; role: string }
  ) {
    await this.verifyCounsellorAccess(profileId, requestingUser);

    return prisma.actionPlanItem.findMany({
      where: { studentProfileId: profileId },
      include: {
        counsellor: { select: { id: true, email: true } },
      },
      orderBy: [{ status: 'asc' }, { targetDate: 'asc' }, { createdAt: 'desc' }],
    });
  }

  public static async createActionPlan(
    profileId: string,
    counsellorId: string,
    dto: CreateActionPlanDto
  ) {
    const profile = await prisma.studentProfile.findUnique({
      where: { id: profileId },
    });

    if (!profile) {
      throw new Error('Student profile not found');
    }

    const item = await prisma.actionPlanItem.create({
      data: {
        studentProfileId: profileId,
        counsellorId,
        title: dto.title,
        description: dto.description || null,
        category: dto.category,
        targetDate: dto.targetDate || null,
        priority: dto.priority,
        status: 'PENDING',
      },
      include: {
        counsellor: { select: { id: true, email: true } },
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: counsellorId,
        action: 'ACTION_PLAN_CREATED',
        details: JSON.stringify({
          actionPlanId: item.id,
          profileId,
          title: item.title,
        }),
      },
    });

    return item;
  }

  public static async updateActionPlan(
    itemId: string,
    counsellorId: string,
    role: string,
    dto: UpdateActionPlanDto
  ) {
    const existing = await prisma.actionPlanItem.findUnique({
      where: { id: itemId },
    });

    if (!existing) {
      throw new Error('Action plan item not found');
    }

    if (role !== Role.ADMIN && existing.counsellorId !== counsellorId) {
      throw new Error('FORBIDDEN_IDOR');
    }

    const data: any = { ...dto };
    if (dto.status === 'COMPLETED' && existing.status !== 'COMPLETED') {
      data.completedAt = new Date();
    } else if (dto.status && dto.status !== 'COMPLETED') {
      data.completedAt = null;
    }

    return prisma.actionPlanItem.update({
      where: { id: itemId },
      data,
      include: {
        counsellor: { select: { id: true, email: true } },
      },
    });
  }

  public static async deleteActionPlan(itemId: string, counsellorId: string, role: string) {
    const existing = await prisma.actionPlanItem.findUnique({
      where: { id: itemId },
    });

    if (!existing) {
      throw new Error('Action plan item not found');
    }

    if (role !== Role.ADMIN && existing.counsellorId !== counsellorId) {
      throw new Error('FORBIDDEN_IDOR');
    }

    await prisma.actionPlanItem.delete({
      where: { id: itemId },
    });

    return { id: itemId, deleted: true };
  }

  /**
   * Counsellor Notes Management
   */
  public static async getNotes(
    profileId: string,
    requestingUser: { userId: string; role: string }
  ) {
    await this.verifyCounsellorAccess(profileId, requestingUser);

    return prisma.studentCounsellorNote.findMany({
      where: { studentProfileId: profileId },
      include: {
        counsellor: { select: { id: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  public static async createNote(
    profileId: string,
    counsellorId: string,
    dto: CreateStudentNoteDto
  ) {
    const profile = await prisma.studentProfile.findUnique({
      where: { id: profileId },
    });

    if (!profile) {
      throw new Error('Student profile not found');
    }

    return prisma.studentCounsellorNote.create({
      data: {
        studentProfileId: profileId,
        counsellorId,
        title: dto.title || null,
        content: dto.content,
        isPrivate: dto.isPrivate !== false,
      },
      include: {
        counsellor: { select: { id: true, email: true } },
      },
    });
  }

  /**
   * Secure Export of Assigned Student Roster (CSV)
   */
  public static async exportAssignedStudentsCsv(counsellorId: string): Promise<string> {
    const students = await prisma.studentProfile.findMany({
      where: { assignedCounsellorId: counsellorId },
      include: {
        user: { select: { email: true } },
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
      escapeCsv(s.preference?.primaryCountry || ''),
      escapeCsv(s.preference?.department || ''),
      escapeCsv(s.education?.schoolName || ''),
      escapeCsv(s.education?.percentage || ''),
    ]);

    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  }
}
