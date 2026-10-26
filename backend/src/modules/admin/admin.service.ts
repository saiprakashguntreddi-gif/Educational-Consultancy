import { prisma } from '../../shared/database/prisma.service';
import { Role } from '../../config/roles';
import { CounsellorService } from '../counsellor/counsellor.service';
import { hashPassword } from '../../shared/utils/password';

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
      activeCounsellorsCount,
      pendingCounsellorsCount,
      verifiedProfiles,
      pendingProfiles,
      rejectedProfiles,
      unassignedStudents,
      totalAppointments,
      upcomingAppointmentsCount,
      pendingAppointmentsCount,
      completedSessionsCount,
      sessionsRequiringFollowUp,
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
      unassignedStudentsList,
      pendingVerificationCounsellors,
      pendingAppointmentsList,
      sessionsNeedingFollowUpList,
    ] = await Promise.all([
      prisma.studentProfile.count(),
      prisma.studentProfile.count({ where: { user: { isActive: true } } }),
      prisma.user.count({ where: { role: Role.ADMIN } }),
      prisma.counsellorProfile.count({ where: { verificationStatus: 'ACTIVE' } }),
      prisma.counsellorProfile.count({ where: { verificationStatus: 'PENDING' } }),
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
      prisma.appointment.count({ where: { status: 'SCHEDULED' } }),
      prisma.appointment.count({ where: { status: 'COMPLETED' } }),
      prisma.appointment.count({ where: { status: 'COMPLETED', followUpRequired: true } }),
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
          assignedCounsellor: {
            select: {
              id: true,
              email: true,
              counsellorProfile: { select: { fullName: true, specialization: true } },
            },
          },
          preference: true,
        },
      }),
      prisma.appointment.findMany({
        where: { scheduledAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
        take: 6,
        orderBy: { scheduledAt: 'asc' },
        include: {
          studentProfile: { select: { id: true, fullName: true, contactEmail: true } },
          counsellor: {
            select: {
              id: true,
              email: true,
              counsellorProfile: { select: { fullName: true } },
            },
          },
        },
      }),
      prisma.scholarship.findMany({
        where: { isActive: true },
        take: 6,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.findMany({
        where: { role: Role.ADMIN },
        select: {
          id: true,
          email: true,
          isActive: true,
          counsellorProfile: true,
          _count: {
            select: {
              assignedStudents: true,
              counsellorAppointments: true,
            },
          },
        },
        take: 12,
        orderBy: { email: 'asc' },
      }),
      prisma.studentProfile.findMany({
        where: { assignedCounsellorId: null },
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          fullName: true,
          contactEmail: true,
          grade: true,
          board: true,
          createdAt: true,
        },
      }),
      prisma.counsellorProfile.findMany({
        where: { verificationStatus: 'PENDING' },
        take: 5,
        include: { user: { select: { email: true } } },
      }),
      prisma.appointment.findMany({
        where: { status: 'SCHEDULED' },
        take: 5,
        orderBy: { scheduledAt: 'asc' },
        include: {
          studentProfile: { select: { fullName: true, contactEmail: true } },
          counsellor: { select: { email: true } },
        },
      }),
      prisma.appointment.findMany({
        where: { status: 'COMPLETED', followUpRequired: true },
        take: 5,
        orderBy: { completedAt: 'desc' },
        include: {
          studentProfile: { select: { fullName: true, contactEmail: true } },
          counsellor: { select: { email: true } },
        },
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

    // Calculate capacity warnings
    const counsellorsReachingCapacity = counsellorsList.filter((c) => {
      const cap = c.counsellorProfile?.capacity || 30;
      return c._count.assignedStudents >= cap * 0.8;
    });

    return {
      kpis: {
        totalStudents,
        activeStudents,
        unassignedStudents,
        totalCounsellors,
        activeCounsellors: activeCounsellorsCount || totalCounsellors,
        pendingCounsellorVerification: pendingCounsellorsCount,
        upcomingAppointmentsCount,
        pendingAppointmentsCount,
        completedSessionsCount,
        sessionsRequiringFollowUp,
        verifiedProfiles,
        pendingProfiles,
        rejectedProfiles,
        totalAppointments,
        totalWebinars: 0,
        activeApplications,
        pendingRequests,
        upcomingDeadlines,
        totalScholarships,
      },
      attentionRequired: {
        unassignedStudents: unassignedStudentsList.length,
        unassignedStudentsCount: unassignedStudentsList.length,
        pendingVerifications: pendingVerificationCounsellors.length,
        pendingVerificationCount: pendingVerificationCounsellors.length,
        pendingAppointments: pendingAppointmentsList.length,
        pendingAppointmentRequestsCount: pendingAppointmentsList.length,
        followUpsRequired: sessionsNeedingFollowUpList.length,
        followUpNeededCount: sessionsNeedingFollowUpList.length,
        unassignedStudentsList,
        pendingVerificationCounsellors: pendingVerificationCounsellors.map((p) => ({
          id: p.id,
          userId: p.userId,
          fullName: p.fullName,
          email: p.user.email,
          specialization: p.specialization,
          status: p.verificationStatus,
        })),
        counsellorsReachingCapacity: counsellorsReachingCapacity.map((c) => ({
          id: c.id,
          email: c.email,
          name: c.counsellorProfile?.fullName || c.email.split('@')[0],
          assignedStudents: c._count.assignedStudents,
          capacity: c.counsellorProfile?.capacity || 30,
        })),
        pendingAppointmentItems: pendingAppointmentsList.map((a) => ({
          id: a.id,
          title: a.title,
          studentName: a.studentProfile.fullName,
          counsellorEmail: a.counsellor.email,
          scheduledAt: a.scheduledAt,
        })),
        sessionsRequiringFollowUpItems: sessionsNeedingFollowUpList.map((s) => ({
          id: s.id,
          title: s.title,
          studentName: s.studentProfile.fullName,
          counsellorEmail: s.counsellor.email,
          completedAt: s.completedAt,
          nextAction: s.nextAction || 'Follow-up pending',
        })),
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
        counsellorName: a.counsellor.counsellorProfile?.fullName || a.counsellor.email.split('@')[0],
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
        name: c.counsellorProfile?.fullName || c.email.split('@')[0],
        specialization: c.counsellorProfile?.specialization || 'Admissions & Career Guidance',
        skills: c.counsellorProfile?.skills ? JSON.parse(c.counsellorProfile.skills) : [],
        capacity: c.counsellorProfile?.capacity || 30,
        status: c.counsellorProfile?.verificationStatus || (c.isActive ? 'ACTIVE' : 'INACTIVE'),
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
  /**
   * Assign or Reassign Counsellor to Student with Verification Check & History Tracking
   */
  public static async assignCounsellor(
    profileId: string,
    counsellorId: string | null,
    adminUserId: string,
    reason?: string
  ) {
    const profile = await prisma.studentProfile.findUnique({
      where: { id: profileId },
      include: { assignedCounsellor: true },
    });

    if (!profile) {
      throw new Error('Student profile not found');
    }

    if (counsellorId) {
      const counsellor = await prisma.user.findFirst({
        where: { id: counsellorId, role: Role.ADMIN },
        include: { counsellorProfile: true },
      });

      if (!counsellor) {
        throw new Error('Selected user is not a valid administrator or advisor');
      }

      // Ensure Counsellor is Verified and Active
      const status = counsellor.counsellorProfile?.verificationStatus || (counsellor.isActive ? 'ACTIVE' : 'PENDING');
      if (status !== 'ACTIVE' && status !== 'VERIFIED') {
        throw new Error(
          `Cannot assign student: Counsellor "${counsellor.email}" has status "${status}". Only verified and active counsellors are eligible for student assignment.`
        );
      }

      // If already assigned to this exact counsellor, no-op
      if (profile.assignedCounsellorId === counsellorId) {
        return profile;
      }

      // Mark previous assignment record as REASSIGNED
      await prisma.counsellorAssignmentHistory.updateMany({
        where: { studentProfileId: profileId, status: 'ACTIVE' },
        data: {
          status: 'REASSIGNED',
          unassignedAt: new Date(),
        },
      });

      // Create new assignment history entry
      await prisma.counsellorAssignmentHistory.create({
        data: {
          studentProfileId: profileId,
          counsellorId,
          assignedById: adminUserId,
          status: 'ACTIVE',
          reason: reason || 'Assigned by Administrator',
        },
      });
    } else {
      // Unassigning counsellor
      await prisma.counsellorAssignmentHistory.updateMany({
        where: { studentProfileId: profileId, status: 'ACTIVE' },
        data: {
          status: 'UNASSIGNED',
          unassignedAt: new Date(),
          reason: reason || 'Unassigned by Administrator',
        },
      });
    }

    const updated = await prisma.studentProfile.update({
      where: { id: profileId },
      data: { assignedCounsellorId: counsellorId },
      include: {
        assignedCounsellor: {
          select: {
            id: true,
            email: true,
            counsellorProfile: true,
          },
        },
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
          reason: reason || null,
        }),
      },
    });

    return updated;
  }

  /**
   * Get Student Counsellor Assignment History
   */
  public static async getStudentAssignmentHistory(profileId: string) {
    const history = await prisma.counsellorAssignmentHistory.findMany({
      where: { studentProfileId: profileId },
      include: {
        counsellor: {
          select: {
            id: true,
            email: true,
            counsellorProfile: { select: { fullName: true, specialization: true } },
          },
        },
        assignedBy: {
          select: { id: true, email: true },
        },
      },
      orderBy: { assignedAt: 'desc' },
    });

    return history.map((h) => ({
      id: h.id,
      studentProfileId: h.studentProfileId,
      counsellorId: h.counsellorId,
      counsellorEmail: h.counsellor.email,
      counsellorName: h.counsellor.counsellorProfile?.fullName || h.counsellor.email.split('@')[0],
      specialization: h.counsellor.counsellorProfile?.specialization || 'General',
      assignedById: h.assignedById,
      assignedByEmail: h.assignedBy?.email || 'System Admin',
      assignedAt: h.assignedAt,
      unassignedAt: h.unassignedAt,
      status: h.status,
      reason: h.reason,
    }));
  }

  /**
   * Admin Creates a new Counsellor Account with Profile & Skills
   */
  public static async createCounsellor(
    data: {
      email: string;
      password: string;
      fullName: string;
      phone?: string;
      qualification?: string;
      experienceYears?: number;
      specialization?: string;
      skills?: string[];
      languages?: string[];
      countriesOfExpertise?: string[];
      courseExpertise?: string[];
      bio?: string;
      availability?: string;
      capacity?: number;
      verificationStatus?: 'PENDING' | 'VERIFIED' | 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
    },
    adminUserId: string
  ) {
    const existing = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase().trim() },
    });

    if (existing) {
      const err: any = new Error('A user with this email address already exists.');
      err.statusCode = 409;
      throw err;
    }

    const passwordHash = await hashPassword(data.password);
    const verificationStatus = data.verificationStatus || 'ACTIVE';
    const isUserActive = verificationStatus === 'ACTIVE' || verificationStatus === 'VERIFIED';

    const newUser = await prisma.user.create({
      data: {
        email: data.email.toLowerCase().trim(),
        passwordHash,
        role: Role.ADMIN,
        isActive: isUserActive,
        isEmailVerified: true,
        counsellorProfile: {
          create: {
            fullName: data.fullName.trim(),
            phone: data.phone || null,
            qualification: data.qualification || 'Certified College Admissions Advisor',
            experienceYears: data.experienceYears ?? 3,
            specialization: data.specialization || 'Higher Education & STEM Pathways',
            skills: JSON.stringify(
              data.skills && data.skills.length > 0
                ? data.skills
                : ['Career Guidance', 'University Selection', 'Study Abroad', 'Scholarship Guidance']
            ),
            languages: JSON.stringify(data.languages && data.languages.length > 0 ? data.languages : ['English']),
            countriesOfExpertise: JSON.stringify(
              data.countriesOfExpertise && data.countriesOfExpertise.length > 0
                ? data.countriesOfExpertise
                : ['United States', 'United Kingdom', 'Canada']
            ),
            courseExpertise: JSON.stringify(
              data.courseExpertise && data.courseExpertise.length > 0
                ? data.courseExpertise
                : ['Computer Science', 'Engineering', 'Business & Management']
            ),
            bio: data.bio || `Senior educational advisor dedicated to student success and university admissions.`,
            availability: data.availability || 'Mon-Fri, 9:00 AM - 5:00 PM',
            capacity: data.capacity || 30,
            verificationStatus,
            verifiedAt: isUserActive ? new Date() : null,
            verifiedBy: isUserActive ? adminUserId : null,
          },
        },
      },
      include: {
        counsellorProfile: true,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: adminUserId,
        action: 'COUNSELLOR_CREATED_BY_ADMIN',
        details: JSON.stringify({
          counsellorId: newUser.id,
          email: newUser.email,
          fullName: data.fullName,
          status: verificationStatus,
        }),
      },
    });

    return {
      id: newUser.id,
      email: newUser.email,
      isActive: newUser.isActive,
      profile: newUser.counsellorProfile,
      counsellorProfile: newUser.counsellorProfile,
      createdAt: newUser.createdAt,
    };
  }

  /**
   * Admin Updates Counsellor Profile Details
   */
  public static async updateCounsellor(
    counsellorId: string,
    data: {
      fullName?: string;
      phone?: string;
      qualification?: string;
      experienceYears?: number;
      specialization?: string;
      skills?: string[];
      languages?: string[];
      countriesOfExpertise?: string[];
      courseExpertise?: string[];
      bio?: string;
      availability?: string;
      capacity?: number;
    },
    adminUserId: string
  ) {
    const counsellor = await prisma.user.findFirst({
      where: { id: counsellorId, role: Role.ADMIN },
      include: { counsellorProfile: true },
    });

    if (!counsellor) {
      throw new Error('Counsellor not found');
    }

    const updateData: any = {};
    if (data.fullName !== undefined) updateData.fullName = data.fullName;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.qualification !== undefined) updateData.qualification = data.qualification;
    if (data.experienceYears !== undefined) updateData.experienceYears = data.experienceYears;
    if (data.specialization !== undefined) updateData.specialization = data.specialization;
    if (data.skills !== undefined) updateData.skills = JSON.stringify(data.skills);
    if (data.languages !== undefined) updateData.languages = JSON.stringify(data.languages);
    if (data.countriesOfExpertise !== undefined) updateData.countriesOfExpertise = JSON.stringify(data.countriesOfExpertise);
    if (data.courseExpertise !== undefined) updateData.courseExpertise = JSON.stringify(data.courseExpertise);
    if (data.bio !== undefined) updateData.bio = data.bio;
    if (data.availability !== undefined) updateData.availability = data.availability;
    if (data.capacity !== undefined) updateData.capacity = data.capacity;

    const profile = await prisma.counsellorProfile.upsert({
      where: { userId: counsellorId },
      update: updateData,
      create: {
        userId: counsellorId,
        fullName: data.fullName || counsellor.email.split('@')[0],
        qualification: data.qualification || 'Certified Educational Counsellor',
        specialization: data.specialization || 'Undergraduate Admissions',
        skills: JSON.stringify(data.skills || ['Career Guidance', 'University Selection']),
        capacity: data.capacity || 30,
        verificationStatus: 'ACTIVE',
        verifiedAt: new Date(),
        verifiedBy: adminUserId,
        ...updateData,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: adminUserId,
        action: 'COUNSELLOR_PROFILE_UPDATED',
        details: JSON.stringify({ counsellorId, updatedFields: Object.keys(updateData) }),
      },
    });

    return profile;
  }

  /**
   * Admin Verifies, Activates, Deactivates, or Suspends Counsellor
   */
  public static async updateCounsellorStatus(
    counsellorId: string,
    status: 'PENDING' | 'VERIFIED' | 'ACTIVE' | 'INACTIVE' | 'SUSPENDED',
    adminUserId: string,
    notes?: string
  ) {
    const counsellor = await prisma.user.findFirst({
      where: { id: counsellorId, role: Role.ADMIN },
      include: { counsellorProfile: true },
    });

    if (!counsellor) {
      throw new Error('Counsellor not found');
    }

    const isUserActive = status === 'ACTIVE' || status === 'VERIFIED';
    const isNowVerified = status === 'VERIFIED' || status === 'ACTIVE';

    await prisma.$transaction([
      prisma.user.update({
        where: { id: counsellorId },
        data: { isActive: isUserActive },
      }),
      prisma.counsellorProfile.upsert({
        where: { userId: counsellorId },
        update: {
          verificationStatus: status,
          verifiedAt: isNowVerified ? new Date() : undefined,
          verifiedBy: isNowVerified ? adminUserId : undefined,
        },
        create: {
          userId: counsellorId,
          fullName: counsellor.email.split('@')[0],
          verificationStatus: status,
          verifiedAt: isNowVerified ? new Date() : null,
          verifiedBy: isNowVerified ? adminUserId : null,
          skills: JSON.stringify(['Career Guidance', 'University Selection']),
        },
      }),
      prisma.auditLog.create({
        data: {
          userId: adminUserId,
          action: 'COUNSELLOR_STATUS_CHANGED',
          details: JSON.stringify({ counsellorId, newStatus: status, notes: notes || null }),
        },
      }),
    ]);

    return {
      counsellorId,
      status,
      isActive: isUserActive,
    };
  }

  /**
   * Admin Manages Counsellor Skills
   */
  public static async updateCounsellorSkills(
    counsellorId: string,
    data: {
      skills: string[];
      specialization?: string;
      countriesOfExpertise?: string[];
      courseExpertise?: string[];
    },
    adminUserId: string
  ) {
    const updateData: any = {
      skills: JSON.stringify(data.skills),
    };
    if (data.specialization) updateData.specialization = data.specialization;
    if (data.countriesOfExpertise) updateData.countriesOfExpertise = JSON.stringify(data.countriesOfExpertise);
    if (data.courseExpertise) updateData.courseExpertise = JSON.stringify(data.courseExpertise);

    const updated = await prisma.counsellorProfile.upsert({
      where: { userId: counsellorId },
      update: updateData,
      create: {
        userId: counsellorId,
        fullName: 'Academic Counsellor',
        verificationStatus: 'ACTIVE',
        ...updateData,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: adminUserId,
        action: 'COUNSELLOR_SKILLS_UPDATED',
        details: JSON.stringify({ counsellorId, skills: data.skills, specialization: data.specialization }),
      },
    });

    return updated;
  }

  /**
   * List all Counsellors with active caseload count, capacity, and profile data
   */
  public static async listCounsellors() {
    const counsellors = await prisma.user.findMany({
      where: { role: Role.ADMIN },
      include: {
        counsellorProfile: true,
        _count: {
          select: {
            assignedStudents: true,
            counsellorAppointments: true,
          },
        },
      },
      orderBy: { email: 'asc' },
    });

    // Auto-initialize profile for any legacy counsellor missing one
    const result = [];
    for (const c of counsellors) {
      let prof = c.counsellorProfile;
      if (!prof) {
        prof = await prisma.counsellorProfile.create({
          data: {
            userId: c.id,
            fullName: c.email.split('@')[0].replace(/[\._]/g, ' '),
            qualification: 'Certified Admissions Counsellor',
            specialization: 'University Guidance & Admissions',
            skills: JSON.stringify(['Career Guidance', 'University Selection', 'Study Abroad', 'Scholarship Guidance']),
            languages: JSON.stringify(['English']),
            countriesOfExpertise: JSON.stringify(['United States', 'United Kingdom', 'Canada', 'Australia']),
            courseExpertise: JSON.stringify(['Engineering', 'Business', 'Computer Science']),
            bio: 'Experienced university admissions counsellor guiding students to global institutions.',
            availability: 'Mon-Fri, 9:00 AM - 5:00 PM',
            capacity: 30,
            verificationStatus: c.isActive ? 'ACTIVE' : 'PENDING',
          },
        });
      }

      let parsedSkills: string[] = [];
      try {
        parsedSkills = prof.skills ? JSON.parse(prof.skills) : [];
      } catch {
        parsedSkills = [];
      }

      let parsedCountries: string[] = [];
      try {
        parsedCountries = prof.countriesOfExpertise ? JSON.parse(prof.countriesOfExpertise) : [];
      } catch {
        parsedCountries = [];
      }

      let parsedCourses: string[] = [];
      try {
        parsedCourses = prof.courseExpertise ? JSON.parse(prof.courseExpertise) : [];
      } catch {
        parsedCourses = [];
      }

      result.push({
        id: c.id,
        email: c.email,
        isActive: c.isActive,
        fullName: prof.fullName,
        phone: prof.phone,
        qualification: prof.qualification,
        experienceYears: prof.experienceYears,
        specialization: prof.specialization,
        skills: parsedSkills,
        countriesOfExpertise: parsedCountries,
        courseExpertise: parsedCourses,
        bio: prof.bio,
        availability: prof.availability,
        capacity: prof.capacity,
        verificationStatus: prof.verificationStatus,
        verifiedAt: prof.verifiedAt,
        assignedStudentsCount: c._count.assignedStudents,
        appointmentsCount: c._count.counsellorAppointments,
        createdAt: c.createdAt,
      });
    }

    return result;
  }

  /**
   * Session Audit: Comprehensive log of all counselling sessions and outcomes
   */
  public static async listSessionAudits(params: {
    counsellorId?: string;
    studentProfileId?: string;
    status?: string;
    followUpRequired?: string;
    startDate?: string;
    endDate?: string;
    page?: string | number;
    limit?: string | number;
  }) {
    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(params.limit) || 20));
    const skip = (page - 1) * limit;

    const where: any = {};

    if (params.counsellorId) {
      where.counsellorId = params.counsellorId;
    }

    if (params.studentProfileId) {
      where.studentProfileId = params.studentProfileId;
    }

    if (params.status && params.status !== 'ALL') {
      where.status = params.status;
    }

    if (params.followUpRequired === 'TRUE') {
      where.followUpRequired = true;
    } else if (params.followUpRequired === 'FALSE') {
      where.followUpRequired = false;
    }

    if (params.startDate || params.endDate) {
      where.scheduledAt = {};
      if (params.startDate) where.scheduledAt.gte = new Date(params.startDate);
      if (params.endDate) where.scheduledAt.lte = new Date(params.endDate);
    }

    const [total, items] = await Promise.all([
      prisma.appointment.count({ where }),
      prisma.appointment.findMany({
        where,
        skip,
        take: limit,
        include: {
          studentProfile: {
            select: {
              id: true,
              fullName: true,
              contactEmail: true,
              phone: true,
              grade: true,
            },
          },
          counsellor: {
            select: {
              id: true,
              email: true,
              counsellorProfile: { select: { fullName: true, specialization: true } },
            },
          },
        },
        orderBy: { scheduledAt: 'desc' },
      }),
    ]);

    const sessions = items.map((a) => ({
      id: a.id,
      title: a.title,
      description: a.description,
      appointmentType: a.appointmentType,
      scheduledAt: a.scheduledAt,
      durationMinutes: a.durationMinutes,
      status: a.status,
      meetingType: a.meetingType,
      meetingLocation: a.meetingLocation,
      actualStartTime: a.actualStartTime,
      actualEndTime: a.actualEndTime,
      sessionOutcome: a.sessionOutcome,
      recommendations: a.recommendations,
      followUpRequired: a.followUpRequired,
      nextAction: a.nextAction,
      followUpActions: a.followUpActions,
      privateCounsellorNotes: a.privateCounsellorNotes,
      completedAt: a.completedAt,
      cancelledAt: a.cancelledAt,
      cancellationReason: a.cancellationReason,
      studentInterest: (a as any).studentInterest || null,
      targetStream: (a as any).targetStream || null,
      targetDepartments: (a as any).targetDepartments || null,
      targetColleges: (a as any).targetColleges || null,
      targetCity: (a as any).targetCity || null,
      studyScope: (a as any).studyScope || null,
      detailedInterestReport: (a as any).detailedInterestReport || null,
      reminderSentAt: (a as any).reminderSentAt || null,
      reminderSentVia: (a as any).reminderSentVia || null,
      isRecorded: Boolean((a as any).isRecorded !== false),
      recordingUrl:
        (a as any).recordingUrl &&
        !(a as any).recordingUrl.includes('.internal') &&
        !(a as any).recordingUrl.includes('storage.superconsciousness.com') &&
        !(a as any).recordingUrl.includes('commondatastorage.googleapis.com')
          ? (a as any).recordingUrl
          : '/assets/sample-consultation.mp4',
      audioUrl: '/assets/sample-consultation-audio.wav',
      student: {
        id: a.studentProfile.id,
        name: a.studentProfile.fullName,
        email: a.studentProfile.contactEmail,
        phone: a.studentProfile.phone,
        grade: a.studentProfile.grade,
      },
      counsellor: {
        id: a.counsellor.id,
        email: a.counsellor.email,
        name: a.counsellor.counsellorProfile?.fullName || a.counsellor.email.split('@')[0],
        specialization: a.counsellor.counsellorProfile?.specialization || 'Admissions',
      },
      createdAt: a.createdAt,
    }));

    return {
      sessions,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * PDF Requirement: Counsellor Performance & Descending Enrollment Leaderboard Module
   * Measures performance, awards points, and ranks all counsellors descending by confirmed enrollments.
   */
  public static async getCounsellorPerformance() {
    const counsellors = await prisma.user.findMany({
      where: { role: Role.ADMIN },
      include: {
        counsellorProfile: true,
        counsellorEnrollments: {
          include: {
            studentProfile: {
              select: {
                id: true,
                fullName: true,
                contactEmail: true,
                phone: true,
                grade: true,
              },
            },
          },
        },
        counsellorAppointments: {
          select: {
            id: true,
            status: true,
            studentInterest: true,
            scheduledAt: true,
          },
        },
        assignedStudents: {
          select: { id: true },
        },
      },
    });

    const performanceList = counsellors.map((c: any) => {
      const totalAppointments = (c.counsellorAppointments || []).length;
      const completedSessions = (c.counsellorAppointments || []).filter((a: any) => a.status === 'COMPLETED').length;
      const interestedCount = (c.counsellorAppointments || []).filter((a: any) => a.studentInterest === 'INTERESTED').length;
      const confirmedEnrollmentsCount = (c.counsellorEnrollments || []).length;
      const points = Math.max(c.counsellorProfile?.enrollmentPoints || 0, confirmedEnrollmentsCount);
      const conversionRate =
        completedSessions > 0 ? Math.round((confirmedEnrollmentsCount / completedSessions) * 100) : 0;

      let performanceTier = 'Active Advisor';
      if (confirmedEnrollmentsCount >= 3 || points >= 3) {
        performanceTier = 'Top Performer (Promoted)';
      } else if (confirmedEnrollmentsCount >= 2 || points >= 2) {
        performanceTier = 'Senior Consultant (High Conversion)';
      } else if (confirmedEnrollmentsCount >= 1 || points >= 1) {
        performanceTier = 'Qualified Consultant';
      }

      return {
        counsellorId: c.id,
        email: c.email,
        fullName: c.counsellorProfile?.fullName || c.email.split('@')[0],
        specialization: c.counsellorProfile?.specialization || 'Educational Consulting & Admissions',
        experienceYears: c.counsellorProfile?.experienceYears || 3,
        verificationStatus: c.counsellorProfile?.verificationStatus || 'ACTIVE',
        enrollmentPoints: points,
        confirmedEnrollmentsCount,
        completedSessions,
        interestedStudentsCount: interestedCount,
        totalAssignedStudents: c.assignedStudents.length,
        conversionRate,
        performanceTier,
        enrollments: (c.counsellorEnrollments || []).map((e: any) => ({
          id: e.id,
          studentName: e.studentProfile?.fullName || 'Student',
          studentEmail: e.studentProfile?.contactEmail || '',
          studentPhone: e.studentProfile?.phone || null,
          targetCollege: e.targetCollege,
          targetStream: e.targetStream,
          enrolledAt: e.enrolledAt.toISOString(),
          pointsAwarded: e.pointsAwarded,
        })),
      };
    });

    // Sort strictly in descending order of confirmed enrollments / points (per PDF specification)
    performanceList.sort((a, b) => {
      if (b.confirmedEnrollmentsCount !== a.confirmedEnrollmentsCount) {
        return b.confirmedEnrollmentsCount - a.confirmedEnrollmentsCount;
      }
      if (b.enrollmentPoints !== a.enrollmentPoints) {
        return b.enrollmentPoints - a.enrollmentPoints;
      }
      return b.completedSessions - a.completedSessions;
    });

    // Assign descending rankings (Rank 1, Rank 2, ...)
    const ranked = performanceList.map((item, index) => ({
      rank: index + 1,
      ...item,
    }));

    return {
      counsellors: ranked,
      totalCounsellors: ranked.length,
      totalEnrollments: ranked.reduce((acc, curr) => acc + curr.confirmedEnrollmentsCount, 0),
      topPerformer: ranked[0] || null,
    };
  }

  /**
   * Admin: Award performance point / promotion point to a counsellor
   */
  public static async awardCounsellorPoints(
    counsellorId: string,
    points: number,
    reason: string,
    adminUserId: string
  ) {
    const updated = await prisma.counsellorProfile.upsert({
      where: { userId: counsellorId },
      update: {
        enrollmentPoints: { increment: points },
      },
      create: {
        userId: counsellorId,
        fullName: 'Counsellor Advisor',
        enrollmentPoints: points,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: adminUserId,
        action: 'ADMIN_AWARDED_COUNSELLOR_POINTS',
        details: JSON.stringify({
          counsellorId,
          points,
          reason,
          newTotalPoints: updated.enrollmentPoints,
        }),
      },
    }).catch(() => {});

    return {
      success: true,
      message: `Successfully awarded ${points} performance point(s) to counsellor.`,
      enrollmentPoints: updated.enrollmentPoints,
    };
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

