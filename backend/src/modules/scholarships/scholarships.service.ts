import { prisma } from '../../shared/database/prisma.service';
import {
  ScholarshipDto,
  ScholarshipListResponse,
  CreateScholarshipInput,
  UpdateScholarshipInput,
  EligibilityCriterionCheck,
  EligibilityStatus,
} from './scholarships.types';
import { badRequest, notFound, forbidden } from '../../shared/utils/error-handler';

export class ScholarshipsService {
  /**
   * Helper: Generate URL-safe unique slug
   */
  private static generateSlug(name: string): string {
    const baseSlug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    const randomSuffix = Math.random().toString(36).substring(2, 6);
    return `${baseSlug}-${randomSuffix}`;
  }

  /**
   * Evaluates a scholarship against a student's verified profile data
   */
  public static evaluateStudentEligibility(
    scholarship: any,
    studentProfile: any | null
  ): {
    status: EligibilityStatus;
    summary: string;
    checks: EligibilityCriterionCheck[];
  } {
    const checks: EligibilityCriterionCheck[] = [];

    if (!studentProfile) {
      return {
        status: 'POTENTIALLY_ELIGIBLE',
        summary:
          'Student profile is not completed or verified. Complete profile intake to verify personalized eligibility.',
        checks: [
          {
            criterion: 'academic',
            status: 'NEEDS_REVIEW',
            label: 'Academic Performance',
            detail: 'Complete and verify your student profile to evaluate academic requirements.',
          },
        ],
      };
    }

    // Extract student verified fields
    const studentPercentage: number | null = studentProfile.education?.percentage ?? null;
    const studentBoard: string | null = studentProfile.education?.board ?? studentProfile.board ?? null;
    const studentCitizenship: string | null = studentProfile.citizenship ?? null;
    const studentGender: string | null = studentProfile.gender ?? null;

    // Preferences: Countries
    let preferredCountries: string[] = [];
    let countriesNotFinalized = false;
    let primaryCountry: string | null = studentProfile.preference?.primaryCountry ?? null;

    if (studentProfile.preference?.countries) {
      try {
        const parsed = JSON.parse(studentProfile.preference.countries);
        if (Array.isArray(parsed)) {
          preferredCountries = parsed;
        } else if (parsed && typeof parsed === 'object') {
          if (parsed.notFinalized) countriesNotFinalized = true;
          if (Array.isArray(parsed.list)) preferredCountries = parsed.list;
        }
      } catch {
        preferredCountries = [studentProfile.preference.countries];
      }
    }

    // Preferences: Department
    const preferredDepartment: string | null = studentProfile.preference?.department ?? null;

    // Entrance Exams
    const studentExamCodes: string[] = (studentProfile.examPlans || [])
      .map((ep: any) => ep.exam?.code || '')
      .filter(Boolean);

    // 1. Academic Performance Check
    if (scholarship.minPercentageRequirement !== null && scholarship.minPercentageRequirement !== undefined) {
      if (studentPercentage !== null) {
        const margin = studentPercentage - scholarship.minPercentageRequirement;
        if (studentPercentage >= scholarship.minPercentageRequirement) {
          checks.push({
            criterion: 'academic',
            status: 'MET',
            label: 'Academic Aggregate Cutoff',
            detail: `Eligible: Your academic percentage (${studentPercentage}%) meets the required minimum (${scholarship.minPercentageRequirement}%). Margin: +${margin.toFixed(1)}%.`,
            requiredValue: `${scholarship.minPercentageRequirement}%`,
            studentValue: `${studentPercentage}%`,
          });
        } else {
          checks.push({
            criterion: 'academic',
            status: 'NOT_MET',
            label: 'Academic Aggregate Cutoff',
            detail: `Not eligible because the scholarship requires a minimum academic percentage of ${scholarship.minPercentageRequirement}%, higher than your verified aggregate (${studentPercentage}%).`,
            requiredValue: `${scholarship.minPercentageRequirement}%`,
            studentValue: `${studentPercentage}%`,
          });
        }
      } else {
        checks.push({
          criterion: 'academic',
          status: 'NEEDS_REVIEW',
          label: 'Academic Aggregate Cutoff',
          detail: 'Potentially eligible: Academic percentage information is missing from your profile.',
          requiredValue: `${scholarship.minPercentageRequirement}%`,
          studentValue: null,
        });
      }
    } else {
      checks.push({
        criterion: 'academic',
        status: 'MET',
        label: 'Academic Aggregate Cutoff',
        detail: 'Open to all academic aggregates. No minimum percentage requirement specified.',
        requiredValue: 'None',
        studentValue: studentPercentage ? `${studentPercentage}%` : null,
      });
    }

    // 2. Education Board Check
    let eligibleBoards: string[] = [];
    if (scholarship.eligibleBoards) {
      try {
        eligibleBoards = JSON.parse(scholarship.eligibleBoards);
      } catch {
        eligibleBoards = [];
      }
    }

    if (eligibleBoards.length > 0) {
      if (studentBoard) {
        const isMatch = eligibleBoards.some(
          (b) => b.trim().toLowerCase() === studentBoard.trim().toLowerCase()
        );
        if (isMatch) {
          checks.push({
            criterion: 'board',
            status: 'MET',
            label: 'Approved Education Board',
            detail: `Your education board (${studentBoard}) satisfies the approved eligibility criteria.`,
            requiredValue: eligibleBoards.join(', '),
            studentValue: studentBoard,
          });
        } else {
          checks.push({
            criterion: 'board',
            status: 'NOT_MET',
            label: 'Approved Education Board',
            detail: `Not eligible: Open only to candidates from approved boards (${eligibleBoards.join(', ')}). Your board is ${studentBoard}.`,
            requiredValue: eligibleBoards.join(', '),
            studentValue: studentBoard,
          });
        }
      } else {
        checks.push({
          criterion: 'board',
          status: 'NEEDS_REVIEW',
          label: 'Approved Education Board',
          detail: 'Potentially eligible: Secondary education board information is missing from your profile.',
          requiredValue: eligibleBoards.join(', '),
          studentValue: null,
        });
      }
    }

    // 3. Destination Country Check
    if (
      scholarship.destinationCountry &&
      scholarship.destinationCountry.trim().toLowerCase() !== 'global' &&
      scholarship.destinationCountry.trim().toLowerCase() !== 'global / any' &&
      scholarship.destinationCountry.trim().toLowerCase() !== 'all'
    ) {
      if (countriesNotFinalized) {
        checks.push({
          criterion: 'destination',
          status: 'NEEDS_REVIEW',
          label: 'Destination Country',
          detail: `Potentially eligible: Your destination preferences are currently unfinalized. Award applies to ${scholarship.destinationCountry}.`,
          requiredValue: scholarship.destinationCountry,
          studentValue: 'Unfinalized',
        });
      } else if (preferredCountries.length > 0 || primaryCountry) {
        const targetDest = scholarship.destinationCountry.trim().toLowerCase();
        const matchesPrimary = primaryCountry && primaryCountry.trim().toLowerCase() === targetDest;
        const matchesPreferred = preferredCountries.some(
          (c) => c.trim().toLowerCase() === targetDest
        );

        if (matchesPrimary || matchesPreferred) {
          checks.push({
            criterion: 'destination',
            status: 'MET',
            label: 'Destination Country',
            detail: `Study destination matches your preferences (${scholarship.destinationCountry}).`,
            requiredValue: scholarship.destinationCountry,
            studentValue: primaryCountry || preferredCountries[0],
          });
        } else {
          checks.push({
            criterion: 'destination',
            status: 'NOT_MET',
            label: 'Destination Country',
            detail: `Not eligible: Applicable for study programs in ${scholarship.destinationCountry}. Your preference list does not include this destination.`,
            requiredValue: scholarship.destinationCountry,
            studentValue: preferredCountries.join(', ') || primaryCountry,
          });
        }
      } else {
        checks.push({
          criterion: 'destination',
          status: 'NEEDS_REVIEW',
          label: 'Destination Country',
          detail: `Potentially eligible: Study destination preference is not yet specified in your preferences. Award applies to ${scholarship.destinationCountry}.`,
          requiredValue: scholarship.destinationCountry,
          studentValue: null,
        });
      }
    } else {
      checks.push({
        criterion: 'destination',
        status: 'MET',
        label: 'Destination Country',
        detail: 'Global / Multi-country applicability across recognized international institutions.',
        requiredValue: 'Global / Any',
        studentValue: primaryCountry || (preferredCountries.length ? preferredCountries[0] : 'Any'),
      });
    }

    // 4. Department / Field of Study Check
    if (
      scholarship.department &&
      scholarship.department.trim().toLowerCase() !== 'all disciplines' &&
      scholarship.department.trim().toLowerCase() !== 'general' &&
      scholarship.department.trim().toLowerCase() !== 'any'
    ) {
      if (preferredDepartment) {
        if (preferredDepartment.trim().toLowerCase() === scholarship.department.trim().toLowerCase()) {
          checks.push({
            criterion: 'department',
            status: 'MET',
            label: 'Academic Field / Department',
            detail: `Field of study matches your chosen department (${scholarship.department}).`,
            requiredValue: scholarship.department,
            studentValue: preferredDepartment,
          });
        } else {
          checks.push({
            criterion: 'department',
            status: 'NOT_MET',
            label: 'Academic Field / Department',
            detail: `Not eligible: Restricted to candidates pursuing ${scholarship.department}. Your preference is ${preferredDepartment}.`,
            requiredValue: scholarship.department,
            studentValue: preferredDepartment,
          });
        }
      } else {
        checks.push({
          criterion: 'department',
          status: 'NEEDS_REVIEW',
          label: 'Academic Field / Department',
          detail: `Potentially eligible: Preferred department is missing or unfinalized. Award applies to ${scholarship.department}.`,
          requiredValue: scholarship.department,
          studentValue: null,
        });
      }
    } else {
      checks.push({
        criterion: 'department',
        status: 'MET',
        label: 'Academic Field / Department',
        detail: 'Open across all academic departments, courses, and disciplines.',
        requiredValue: 'All Disciplines',
        studentValue: preferredDepartment || 'Any',
      });
    }

    // 5. Citizenship Check
    if (
      scholarship.requiredCitizenship &&
      scholarship.requiredCitizenship.trim().toLowerCase() !== 'all' &&
      scholarship.requiredCitizenship.trim().toLowerCase() !== 'international' &&
      scholarship.requiredCitizenship.trim().toLowerCase() !== 'any'
    ) {
      if (studentCitizenship) {
        if (
          studentCitizenship.trim().toLowerCase() ===
          scholarship.requiredCitizenship.trim().toLowerCase()
        ) {
          checks.push({
            criterion: 'citizenship',
            status: 'MET',
            label: 'Citizenship Requirement',
            detail: `Citizenship requirement met (${scholarship.requiredCitizenship}).`,
            requiredValue: scholarship.requiredCitizenship,
            studentValue: studentCitizenship,
          });
        } else {
          checks.push({
            criterion: 'citizenship',
            status: 'NOT_MET',
            label: 'Citizenship Requirement',
            detail: `Not eligible: Restricted to citizens of ${scholarship.requiredCitizenship}. Your recorded citizenship is ${studentCitizenship}.`,
            requiredValue: scholarship.requiredCitizenship,
            studentValue: studentCitizenship,
          });
        }
      } else {
        checks.push({
          criterion: 'citizenship',
          status: 'NEEDS_REVIEW',
          label: 'Citizenship Requirement',
          detail: 'Potentially eligible: Citizenship information is missing from your profile.',
          requiredValue: scholarship.requiredCitizenship,
          studentValue: null,
        });
      }
    }

    // 6. Gender Check
    if (
      scholarship.genderRequirement &&
      scholarship.genderRequirement.toUpperCase() !== 'ALL' &&
      scholarship.genderRequirement.toUpperCase() !== 'ANY'
    ) {
      if (studentGender) {
        if (studentGender.toUpperCase() === scholarship.genderRequirement.toUpperCase()) {
          checks.push({
            criterion: 'gender',
            status: 'MET',
            label: 'Demographic / Gender Criterion',
            detail: `Demographic criteria met (${scholarship.genderRequirement}).`,
            requiredValue: scholarship.genderRequirement,
            studentValue: studentGender,
          });
        } else {
          checks.push({
            criterion: 'gender',
            status: 'NOT_MET',
            label: 'Demographic / Gender Criterion',
            detail: `Not eligible: Restricted to ${scholarship.genderRequirement.toLowerCase()} applicants.`,
            requiredValue: scholarship.genderRequirement,
            studentValue: studentGender,
          });
        }
      } else {
        checks.push({
          criterion: 'gender',
          status: 'NEEDS_REVIEW',
          label: 'Demographic / Gender Criterion',
          detail: 'Potentially eligible: Gender information is not specified.',
          requiredValue: scholarship.genderRequirement,
          studentValue: null,
        });
      }
    }

    // 7. Entrance Exams Check
    let requiredExams: string[] = [];
    if (scholarship.requiredExams) {
      try {
        requiredExams = JSON.parse(scholarship.requiredExams);
      } catch {
        requiredExams = [];
      }
    }

    if (requiredExams.length > 0) {
      const matchedExams = requiredExams.filter((re) => studentExamCodes.includes(re));
      if (matchedExams.length > 0) {
        checks.push({
          criterion: 'entranceExam',
          status: 'MET',
          label: 'Entrance Exam Readiness',
          detail: `Entrance exam planned or cleared (${matchedExams.join(', ')}).`,
          requiredValue: requiredExams.join(', '),
          studentValue: matchedExams.join(', '),
        });
      } else {
        checks.push({
          criterion: 'entranceExam',
          status: 'NEEDS_REVIEW',
          label: 'Entrance Exam Readiness',
          detail: `Potentially eligible: Standardized exam requirement specified (${requiredExams.join(', ')}). Add exam to preparation plan.`,
          requiredValue: requiredExams.join(', '),
          studentValue: studentExamCodes.length ? studentExamCodes.join(', ') : 'None planned',
        });
      }
    }

    // 8. Financial / Need-Based Criteria Check
    if (scholarship.incomeCeiling !== null && scholarship.incomeCeiling !== undefined) {
      checks.push({
        criterion: 'financial',
        status: 'NEEDS_REVIEW',
        label: 'Financial Need Criteria',
        detail: `Potentially eligible: Need-based scholarship with income ceiling of ${scholarship.incomeCeiling.toLocaleString()} ${scholarship.incomeCurrency || 'USD'}. Financial eligibility documentation is missing and requires review.`,
        requiredValue: `<= ${scholarship.incomeCeiling.toLocaleString()} ${scholarship.incomeCurrency || ''}`,
        studentValue: 'Document verification required',
      });
    }

    // Determine aggregate eligibility status
    const hasFailed = checks.some((c) => c.status === 'NOT_MET');
    const hasReview = checks.some((c) => c.status === 'NEEDS_REVIEW');

    let overallStatus: EligibilityStatus;
    let summary: string;

    if (hasFailed) {
      overallStatus = 'NOT_ELIGIBLE';
      const failedLabels = checks
        .filter((c) => c.status === 'NOT_MET')
        .map((c) => c.label)
        .join(', ');
      summary = `Not eligible: Your profile does not currently satisfy requirements for: ${failedLabels}.`;
    } else if (hasReview) {
      overallStatus = 'POTENTIALLY_ELIGIBLE';
      const reviewLabels = checks
        .filter((c) => c.status === 'NEEDS_REVIEW')
        .map((c) => c.label)
        .join(', ');
      summary = `Potentially eligible: You qualify on verified academic criteria, but further information/review is needed for: ${reviewLabels}.`;
    } else {
      overallStatus = 'ELIGIBLE';
      summary =
        'Eligible because your academic percentage and background fully meet the published criteria for this scholarship.';
    }

    return {
      status: overallStatus,
      summary,
      checks,
    };
  }

  /**
   * Helper: Map Prisma Scholarship to ScholarshipDto
   */
  private static mapToDto(
    scholarship: any,
    studentProfile: any | null = null,
    isSaved: boolean = false
  ): ScholarshipDto {
    let eligibleBoards: string[] | null = null;
    if (scholarship.eligibleBoards) {
      try {
        eligibleBoards = JSON.parse(scholarship.eligibleBoards);
      } catch {
        eligibleBoards = null;
      }
    }

    let requiredExams: string[] | null = null;
    if (scholarship.requiredExams) {
      try {
        requiredExams = JSON.parse(scholarship.requiredExams);
      } catch {
        requiredExams = null;
      }
    }

    const evaluation = studentProfile
      ? this.evaluateStudentEligibility(scholarship, studentProfile)
      : undefined;

    return {
      id: scholarship.id,
      slug: scholarship.slug,
      name: scholarship.name,
      provider: scholarship.provider,
      country: scholarship.country,
      destinationCountry: scholarship.destinationCountry,
      institutionId: scholarship.institutionId,
      institutionName: scholarship.institution ? scholarship.institution.name : null,
      department: scholarship.department,
      specialization: scholarship.specialization,
      studyLevel: scholarship.studyLevel,
      awardAmount: scholarship.awardAmount,
      awardCurrency: scholarship.awardCurrency,
      awardType: scholarship.awardType,
      awardDetails: scholarship.awardDetails,
      eligibilityDescription: scholarship.eligibilityDescription,
      minPercentageRequirement: scholarship.minPercentageRequirement,
      eligibleBoards,
      requiredCitizenship: scholarship.requiredCitizenship,
      genderRequirement: scholarship.genderRequirement,
      incomeCeiling: scholarship.incomeCeiling,
      incomeCurrency: scholarship.incomeCurrency,
      requiredExams,
      applicationDeadline: scholarship.applicationDeadline,
      applicationUrl: scholarship.applicationUrl,
      sourceInfo: scholarship.sourceInfo,
      isActive: scholarship.isActive,
      isPublished: scholarship.isPublished,
      createdAt: scholarship.createdAt.toISOString(),
      updatedAt: scholarship.updatedAt.toISOString(),

      eligibilityStatus: evaluation?.status,
      eligibilitySummary: evaluation?.summary,
      criteriaChecks: evaluation?.checks,
      eligibility: evaluation
        ? {
            status: evaluation.status,
            summary: evaluation.summary,
            checks: evaluation.checks,
          }
        : undefined,
      isSaved,
    };
  }

  /**
   * Student: List active & published scholarships with personalized eligibility evaluations
   */
  public static async listScholarshipsForStudent(
    studentUserId: string,
    filters?: {
      search?: string;
      country?: string;
      eligibility?: string;
      department?: string;
      page?: number;
      limit?: number;
    }
  ): Promise<ScholarshipListResponse> {
    const page = Math.max(1, filters?.page || 1);
    const limit = Math.max(1, Math.min(50, filters?.limit || 12));

    // Retrieve authenticated student profile with full context
    const profile = await prisma.studentProfile.findUnique({
      where: { userId: studentUserId },
      include: {
        preference: true,
        education: true,
        examPlans: {
          include: { exam: true },
        },
        savedScholarships: true,
      },
    });

    if (!profile) {
      notFound('Student profile not found. Please complete profile intake first.');
    }

    const savedScholarshipIds = new Set(
      (profile.savedScholarships || []).map((s: any) => s.scholarshipId)
    );

    // Query active & published scholarships
    const where: any = {
      isActive: true,
      isPublished: true,
    };

    if (filters?.search && filters.search.trim()) {
      const term = filters.search.trim();
      where.OR = [
        { name: { contains: term } },
        { provider: { contains: term } },
        { awardDetails: { contains: term } },
        { eligibilityDescription: { contains: term } },
      ];
    }

    if (filters?.country && filters.country.trim() && filters.country !== 'ALL') {
      where.OR = [
        ...(where.OR || []),
        { country: { contains: filters.country.trim() } },
        { destinationCountry: { contains: filters.country.trim() } },
      ];
    }

    if (filters?.department && filters.department.trim() && filters.department !== 'ALL') {
      where.department = { contains: filters.department.trim() };
    }

    const allScholarships = await prisma.scholarship.findMany({
      where,
      include: {
        institution: {
          select: {
            id: true,
            name: true,
            country: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Evaluate eligibility for all matching items
    const evaluatedList = allScholarships.map((s) =>
      this.mapToDto(s, profile, savedScholarshipIds.has(s.id))
    );

    // Compute eligibility status counts
    const counts = {
      all: evaluatedList.length,
      eligible: evaluatedList.filter((s) => s.eligibilityStatus === 'ELIGIBLE').length,
      potentiallyEligible: evaluatedList.filter(
        (s) => s.eligibilityStatus === 'POTENTIALLY_ELIGIBLE'
      ).length,
      notEligible: evaluatedList.filter((s) => s.eligibilityStatus === 'NOT_ELIGIBLE').length,
      saved: evaluatedList.filter((s) => s.isSaved).length,
    };

    // Filter by eligibility status if requested
    let filteredList = evaluatedList;
    if (filters?.eligibility && filters.eligibility !== 'ALL') {
      if (filters.eligibility === 'SAVED') {
        filteredList = evaluatedList.filter((s) => s.isSaved);
      } else {
        filteredList = evaluatedList.filter(
          (s) => s.eligibilityStatus === filters.eligibility
        );
      }
    }

    const total = filteredList.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const paginated = filteredList.slice((page - 1) * limit, page * limit);

    return {
      scholarships: paginated,
      total,
      page,
      limit,
      totalPages,
      counts,
      studentProfileContext: {
        isVerified: profile.verificationStatus === 'VERIFIED',
        verificationStatus: profile.verificationStatus,
        studentName: profile.fullName,
        percentage: profile.education?.percentage ?? null,
        board: profile.education?.board ?? profile.board,
        primaryCountry: profile.preference?.primaryCountry ?? null,
        department: profile.preference?.department ?? null,
      },
    };
  }

  /**
   * Student & Staff: Get scholarship details with personalized eligibility breakdown
   */
  public static async getScholarshipDetail(
    scholarshipId: string,
    studentUserId?: string
  ): Promise<ScholarshipDto> {
    const scholarship = await prisma.scholarship.findUnique({
      where: { id: scholarshipId },
      include: {
        institution: {
          select: {
            id: true,
            name: true,
            country: true,
          },
        },
      },
    });

    if (!scholarship) {
      notFound('Scholarship record not found in catalogue.');
    }

    let profile: any = null;
    let isSaved = false;

    if (studentUserId) {
      profile = await prisma.studentProfile.findUnique({
        where: { userId: studentUserId },
        include: {
          preference: true,
          education: true,
          examPlans: {
            include: { exam: true },
          },
          savedScholarships: {
            where: { scholarshipId },
          },
        },
      });
      if (profile && profile.savedScholarships && profile.savedScholarships.length > 0) {
        isSaved = true;
      }
    }

    return this.mapToDto(scholarship, profile, isSaved);
  }

  /**
   * Student: Toggle save/shortlist scholarship
   */
  public static async toggleSaveScholarship(
    scholarshipId: string,
    studentUserId: string
  ): Promise<{ isSaved: boolean; message: string }> {
    const profile = await prisma.studentProfile.findUnique({
      where: { userId: studentUserId },
    });
    if (!profile) {
      notFound('Student profile not found.');
    }

    const scholarship = await prisma.scholarship.findUnique({
      where: { id: scholarshipId },
    });
    if (!scholarship) {
      notFound('Scholarship not found in catalogue.');
    }

    const existing = await prisma.studentSavedScholarship.findUnique({
      where: {
        studentProfileId_scholarshipId: {
          studentProfileId: profile.id,
          scholarshipId,
        },
      },
    });

    if (existing) {
      await prisma.studentSavedScholarship.delete({
        where: { id: existing.id },
      });
      return {
        isSaved: false,
        message: `Removed "${scholarship.name}" from your saved scholarships.`,
      };
    } else {
      await prisma.studentSavedScholarship.create({
        data: {
          studentProfileId: profile.id,
          scholarshipId,
        },
      });
      return {
        isSaved: true,
        message: `Saved "${scholarship.name}" to your scholarship shortlist.`,
      };
    }
  }

  /**
   * Student: List saved/shortlisted scholarships
   */
  public static async getSavedScholarships(studentUserId: string): Promise<ScholarshipDto[]> {
    const profile = await prisma.studentProfile.findUnique({
      where: { userId: studentUserId },
      include: {
        preference: true,
        education: true,
        examPlans: {
          include: { exam: true },
        },
        savedScholarships: {
          include: {
            scholarship: {
              include: {
                institution: {
                  select: { id: true, name: true, country: true },
                },
              },
            },
          },
        },
      },
    });

    if (!profile) {
      notFound('Student profile not found.');
    }

    return (profile.savedScholarships || []).map((saved: any) =>
      this.mapToDto(saved.scholarship, profile, true)
    );
  }

  /**
   * Admin: List all scholarships (including inactive & unverified)
   */
  public static async adminListScholarships(params?: {
    search?: string;
    country?: string;
    isActive?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    scholarships: ScholarshipDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    counts: {
      all: number;
      active: number;
      inactive: number;
    };
  }> {
    const page = Math.max(1, params?.page || 1);
    const limit = Math.max(1, Math.min(100, params?.limit || 15));

    const where: any = {};

    if (params?.search && params.search.trim()) {
      const term = params.search.trim();
      where.OR = [
        { name: { contains: term } },
        { provider: { contains: term } },
        { country: { contains: term } },
        { destinationCountry: { contains: term } },
      ];
    }

    if (params?.country && params.country !== 'ALL') {
      where.country = { contains: params.country };
    }

    if (params?.isActive && params.isActive !== 'ALL') {
      where.isActive = params.isActive === 'true';
    }

    const [allRecords, total] = await Promise.all([
      prisma.scholarship.findMany({
        where,
        include: {
          institution: {
            select: { id: true, name: true, country: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.scholarship.count({ where }),
    ]);

    const [activeCount, inactiveCount] = await Promise.all([
      prisma.scholarship.count({ where: { isActive: true } }),
      prisma.scholarship.count({ where: { isActive: false } }),
    ]);

    return {
      scholarships: allRecords.map((s) => this.mapToDto(s)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
      counts: {
        all: activeCount + inactiveCount,
        active: activeCount,
        inactive: inactiveCount,
      },
    };
  }

  /**
   * Admin: Add new scholarship to catalogue
   */
  public static async adminCreateScholarship(
    adminUserId: string,
    input: CreateScholarshipInput
  ): Promise<ScholarshipDto> {
    const slug = this.generateSlug(input.name);

    const created = await prisma.scholarship.create({
      data: {
        slug,
        name: input.name.trim(),
        provider: input.provider.trim(),
        country: input.country.trim(),
        destinationCountry: input.destinationCountry?.trim() || null,
        institutionId: input.institutionId || null,
        department: input.department?.trim() || null,
        specialization: input.specialization?.trim() || null,
        studyLevel: input.studyLevel?.trim() || 'ALL',
        awardAmount: input.awardAmount ?? null,
        awardCurrency: input.awardCurrency?.trim() || 'USD',
        awardType: input.awardType?.trim() || 'PARTIAL_TUITION',
        awardDetails: input.awardDetails.trim(),
        eligibilityDescription: input.eligibilityDescription.trim(),
        minPercentageRequirement: input.minPercentageRequirement ?? null,
        eligibleBoards: input.eligibleBoards ? JSON.stringify(input.eligibleBoards) : null,
        requiredCitizenship: input.requiredCitizenship?.trim() || null,
        genderRequirement: input.genderRequirement || 'ALL',
        incomeCeiling: input.incomeCeiling ?? null,
        incomeCurrency: input.incomeCurrency?.trim() || null,
        requiredExams: input.requiredExams ? JSON.stringify(input.requiredExams) : null,
        applicationDeadline: input.applicationDeadline?.trim() || null,
        applicationUrl: input.applicationUrl.trim(),
        sourceInfo: input.sourceInfo?.trim() || null,
        isActive: input.isActive !== undefined ? input.isActive : true,
        isPublished: input.isPublished !== undefined ? input.isPublished : true,
      },
      include: {
        institution: {
          select: { id: true, name: true, country: true },
        },
      },
    });

    // Record audit log
    await prisma.auditLog.create({
      data: {
        userId: adminUserId,
        action: 'SCHOLARSHIP_ADDED',
        details: JSON.stringify({
          scholarshipId: created.id,
          name: created.name,
          provider: created.provider,
          country: created.country,
          minPercentageRequirement: created.minPercentageRequirement,
          timestamp: new Date().toISOString(),
        }),
      },
    });

    return this.mapToDto(created);
  }

  /**
   * Admin: Update scholarship details and eligibility criteria
   */
  public static async adminUpdateScholarship(
    adminUserId: string,
    scholarshipId: string,
    input: UpdateScholarshipInput
  ): Promise<ScholarshipDto> {
    const existing = await prisma.scholarship.findUnique({
      where: { id: scholarshipId },
    });
    if (!existing) {
      notFound('Scholarship record not found in catalogue.');
    }

    const data: any = {};
    if (input.name !== undefined) data.name = input.name.trim();
    if (input.provider !== undefined) data.provider = input.provider.trim();
    if (input.country !== undefined) data.country = input.country.trim();
    if (input.destinationCountry !== undefined)
      data.destinationCountry = input.destinationCountry?.trim() || null;
    if (input.institutionId !== undefined) data.institutionId = input.institutionId;
    if (input.department !== undefined) data.department = input.department?.trim() || null;
    if (input.specialization !== undefined) data.specialization = input.specialization?.trim() || null;
    if (input.studyLevel !== undefined) data.studyLevel = input.studyLevel?.trim() || null;
    if (input.awardAmount !== undefined) data.awardAmount = input.awardAmount;
    if (input.awardCurrency !== undefined) data.awardCurrency = input.awardCurrency?.trim() || null;
    if (input.awardType !== undefined) data.awardType = input.awardType?.trim() || null;
    if (input.awardDetails !== undefined) data.awardDetails = input.awardDetails.trim();
    if (input.eligibilityDescription !== undefined)
      data.eligibilityDescription = input.eligibilityDescription.trim();
    if (input.minPercentageRequirement !== undefined)
      data.minPercentageRequirement = input.minPercentageRequirement;
    if (input.eligibleBoards !== undefined)
      data.eligibleBoards = input.eligibleBoards ? JSON.stringify(input.eligibleBoards) : null;
    if (input.requiredCitizenship !== undefined)
      data.requiredCitizenship = input.requiredCitizenship?.trim() || null;
    if (input.genderRequirement !== undefined) data.genderRequirement = input.genderRequirement;
    if (input.incomeCeiling !== undefined) data.incomeCeiling = input.incomeCeiling;
    if (input.incomeCurrency !== undefined)
      data.incomeCurrency = input.incomeCurrency?.trim() || null;
    if (input.requiredExams !== undefined)
      data.requiredExams = input.requiredExams ? JSON.stringify(input.requiredExams) : null;
    if (input.applicationDeadline !== undefined)
      data.applicationDeadline = input.applicationDeadline?.trim() || null;
    if (input.applicationUrl !== undefined) data.applicationUrl = input.applicationUrl.trim();
    if (input.sourceInfo !== undefined) data.sourceInfo = input.sourceInfo?.trim() || null;
    if (input.isActive !== undefined) data.isActive = input.isActive;
    if (input.isPublished !== undefined) data.isPublished = input.isPublished;

    const updated = await prisma.scholarship.update({
      where: { id: scholarshipId },
      data,
      include: {
        institution: {
          select: { id: true, name: true, country: true },
        },
      },
    });

    // Record audit log
    await prisma.auditLog.create({
      data: {
        userId: adminUserId,
        action: 'SCHOLARSHIP_UPDATED',
        details: JSON.stringify({
          scholarshipId: updated.id,
          name: updated.name,
          updatedFields: Object.keys(data),
          timestamp: new Date().toISOString(),
        }),
      },
    });

    return this.mapToDto(updated);
  }

  /**
   * Admin: Toggle scholarship active status
   */
  public static async adminToggleScholarshipStatus(
    adminUserId: string,
    scholarshipId: string,
    isActive: boolean
  ): Promise<ScholarshipDto> {
    const existing = await prisma.scholarship.findUnique({
      where: { id: scholarshipId },
    });
    if (!existing) {
      notFound('Scholarship record not found.');
    }

    const updated = await prisma.scholarship.update({
      where: { id: scholarshipId },
      data: { isActive },
      include: {
        institution: {
          select: { id: true, name: true, country: true },
        },
      },
    });

    // Record audit log
    await prisma.auditLog.create({
      data: {
        userId: adminUserId,
        action: 'SCHOLARSHIP_STATUS_CHANGED',
        details: JSON.stringify({
          scholarshipId: updated.id,
          name: updated.name,
          previousStatus: existing.isActive,
          newStatus: isActive,
          timestamp: new Date().toISOString(),
        }),
      },
    });

    return this.mapToDto(updated);
  }

  /**
   * Admin: Delete scholarship
   */
  public static async adminDeleteScholarship(
    adminUserId: string,
    scholarshipId: string
  ): Promise<{ message: string }> {
    const existing = await prisma.scholarship.findUnique({
      where: { id: scholarshipId },
    });
    if (!existing) {
      notFound('Scholarship record not found.');
    }

    await prisma.scholarship.delete({
      where: { id: scholarshipId },
    });

    // Record audit log
    await prisma.auditLog.create({
      data: {
        userId: adminUserId,
        action: 'SCHOLARSHIP_DELETED',
        details: JSON.stringify({
          scholarshipId,
          name: existing.name,
          timestamp: new Date().toISOString(),
        }),
      },
    });

    return {
      message: `Scholarship "${existing.name}" deleted successfully.`,
    };
  }
}
