import { prisma } from '../../shared/database/prisma.service';
import {
  InstitutionSummary,
  InstitutionDetail,
  CourseSummary,
  InstitutionListResponse,
  AdminInstitutionListResponse,
  SavedInstitutionsAndCoursesResponse,
  ComparisonResponse,
  CollegeSearchParams,
  AdminCollegeSearchParams,
  AdminCreateInstitutionInput,
  AdminUpdateInstitutionInput,
  AdminCreateCourseInput,
  AdminUpdateCourseInput,
  CatalogueStatus,
} from './colleges.types';
import { seedCollegesCatalog } from './colleges.seed';

export class CollegesService {
  /**
   * Seed the catalog with verified real institutions if the database is currently empty
   */
  private static async ensureCatalogSeeded(): Promise<void> {
    const count = await prisma.institution.count();
    if (count > 0) return;

    console.log('[COLLEGES] Initializing verified educational catalogue seeds...');
    await seedCollegesCatalog();
  }

  /**
   * Helper to map a course database record to CourseSummary
   */
  private static mapCourse(
    record: any,
    savedCourseIds?: Set<string>,
    institutionData?: { name?: string; country?: string; city?: string }
  ): CourseSummary {
    let exams: string[] = [];
    try {
      if (record.entranceExamsRequired) {
        exams = JSON.parse(record.entranceExamsRequired);
      }
    } catch {
      exams = [];
    }

    return {
      id: record.id,
      institutionId: record.institutionId,
      institutionName: record.institution?.name || institutionData?.name,
      institutionCountry: record.institution?.country || institutionData?.country,
      institutionCity: record.institution?.city || institutionData?.city,
      name: record.name,
      department: record.department,
      specialization: record.specialization || null,
      level: record.level,
      durationYears: record.durationYears || null,
      durationText: record.durationText || null,
      description: record.description || null,
      eligibilityCriteria: record.eligibilityCriteria || null,
      annualTuitionFee: record.annualTuitionFee || null,
      feeCurrency: record.feeCurrency || null,
      feeRange: record.feeRange || null,
      entranceExamsRequired: exams,
      scholarshipAvailable: Boolean(record.scholarshipAvailable),
      scholarshipDetails: record.scholarshipDetails || null,
      applicationDeadline: record.applicationDeadline || null,
      isPopular: Boolean(record.isPopular),
      status: (record.status as CatalogueStatus) || 'PUBLISHED',
      isPublished: Boolean(record.isPublished ?? true),
      isSaved: savedCourseIds ? savedCourseIds.has(record.id) : false,
    };
  }

  /**
   * Helper to map an institution database record to InstitutionSummary
   */
  private static mapInstitutionSummary(
    record: any,
    savedInstitutionIds?: Set<string>,
    comparedInstitutionIds?: Set<string>
  ): InstitutionSummary {
    const courses = record.courses || [];
    const popularPrograms = courses
      .filter((c: any) => c.isPopular)
      .map((c: any) => c.name);

    const examSet = new Set<string>();
    courses.forEach((c: any) => {
      try {
        if (c.entranceExamsRequired) {
          const list = JSON.parse(c.entranceExamsRequired);
          if (Array.isArray(list)) list.forEach((e: string) => examSet.add(e));
        }
      } catch {
        // ignore JSON parse
      }
    });

    return {
      id: record.id,
      slug: record.slug,
      name: record.name,
      country: record.country,
      city: record.city,
      state: record.state || null,
      institutionType: record.institutionType || null,
      establishedYear: record.establishedYear || null,
      overview: record.overview,
      rankingInfo: record.rankingInfo || null,
      hasScholarships: Boolean(record.hasScholarships),
      minAnnualFee: record.minAnnualFee || null,
      maxAnnualFee: record.maxAnnualFee || null,
      feeCurrency: record.feeCurrency || null,
      officialWebsiteUrl: record.officialWebsiteUrl,
      bannerImageUrl: record.bannerImageUrl || null,
      logoUrl: record.logoUrl || null,
      status: (record.status as CatalogueStatus) || 'PUBLISHED',
      isPublished: Boolean(record.isPublished ?? true),
      isVerified: Boolean(record.isVerified ?? true),
      publishedAt: record.publishedAt ? record.publishedAt.toISOString() : null,
      archivedAt: record.archivedAt ? record.archivedAt.toISOString() : null,
      coursesCount: courses.length,
      popularPrograms: popularPrograms.slice(0, 3),
      entranceExams: Array.from(examSet),
      isSaved: savedInstitutionIds ? savedInstitutionIds.has(record.id) : false,
      isCompared: comparedInstitutionIds ? comparedInstitutionIds.has(record.id) : false,
    };
  }

  /**
   * Helper to fetch student profile by userId
   */
  private static async getStudentProfile(userId: string) {
    const profile = await prisma.studentProfile.findUnique({
      where: { userId },
    });
    if (!profile) {
      const err: any = new Error(
        'Student profile intake must be completed before accessing shortlists.'
      );
      err.statusCode = 404;
      throw err;
    }
    return profile;
  }

  // =========================================================================
  // PUBLIC / STUDENT / COUNSELLOR DISCOVERY CATALOGUE APIS
  // =========================================================================

  /**
   * List and filter institutions catalog with server-side pagination & search
   * STRICT VISIBILITY: Students and public see ONLY PUBLISHED records
   */
  static async listColleges(
    query: CollegeSearchParams,
    userId?: string
  ): Promise<InstitutionListResponse> {
    await this.ensureCatalogSeeded();

    const page = Math.max(1, parseInt(String(query.page || '1'), 10));
    const limit = Math.max(1, Math.min(50, parseInt(String(query.limit || '9'), 10)));
    const skip = (page - 1) * limit;

    // Filter sets for student personalization
    let savedInstitutionIds: Set<string> | undefined;
    let comparedInstitutionIds: Set<string> | undefined;

    if (userId) {
      const studentProfile = await prisma.studentProfile.findUnique({
        where: { userId },
        include: {
          savedInstitutions: { select: { institutionId: true } },
          comparisonItems: { select: { institutionId: true } },
        },
      });

      if (studentProfile) {
        savedInstitutionIds = new Set(
          studentProfile.savedInstitutions.map((s) => s.institutionId)
        );
        comparedInstitutionIds = new Set(
          studentProfile.comparisonItems.map((c) => c.institutionId)
        );
      }
    }

    // Build Prisma query condition: STRICTLY PUBLISHED ONLY
    const andConditions: any[] = [
      { status: 'PUBLISHED' },
      { isPublished: true },
      { isActive: true },
    ];

    // Search query: matches name, city, country, or course details
    if (query.search && query.search.trim()) {
      const term = query.search.trim();
      andConditions.push({
        OR: [
          { name: { contains: term } },
          { city: { contains: term } },
          { country: { contains: term } },
          { overview: { contains: term } },
          {
            courses: {
              some: {
                status: 'PUBLISHED',
                isPublished: true,
                isActive: true,
                OR: [
                  { name: { contains: term } },
                  { department: { contains: term } },
                  { specialization: { contains: term } },
                ],
              },
            },
          },
        ],
      });
    }

    // Country filter
    if (query.country && query.country.trim() && query.country !== 'ALL') {
      andConditions.push({ country: { contains: query.country.trim() } });
    }

    // City filter
    if (query.city && query.city.trim() && query.city !== 'ALL') {
      andConditions.push({ city: { contains: query.city.trim() } });
    }

    // Department filter
    if (query.department && query.department.trim() && query.department !== 'ALL') {
      andConditions.push({
        courses: {
          some: {
            status: 'PUBLISHED',
            isPublished: true,
            isActive: true,
            department: { contains: query.department.trim() },
          },
        },
      });
    }

    // Specialization filter
    if (query.specialization && query.specialization.trim() && query.specialization !== 'ALL') {
      andConditions.push({
        courses: {
          some: {
            status: 'PUBLISHED',
            isPublished: true,
            isActive: true,
            specialization: { contains: query.specialization.trim() },
          },
        },
      });
    }

    // Course level filter (Undergraduate, Postgraduate)
    if (query.level && query.level.trim() && query.level !== 'ALL') {
      andConditions.push({
        courses: {
          some: {
            status: 'PUBLISHED',
            isPublished: true,
            isActive: true,
            level: { contains: query.level.trim() },
          },
        },
      });
    }

    // Scholarship filter
    if (query.hasScholarship === 'true' || query.hasScholarship === true || query.hasScholarship === '1') {
      andConditions.push({
        OR: [
          { hasScholarships: true },
          {
            courses: {
              some: {
                status: 'PUBLISHED',
                isPublished: true,
                isActive: true,
                scholarshipAvailable: true,
              },
            },
          },
        ],
      });
    }

    // Fee range filter
    if (query.minFee && !isNaN(Number(query.minFee))) {
      andConditions.push({
        maxAnnualFee: { gte: Number(query.minFee) },
      });
    }
    if (query.maxFee && !isNaN(Number(query.maxFee))) {
      andConditions.push({
        minAnnualFee: { lte: Number(query.maxFee) },
      });
    }

    // Entrance Exam Requirement filter
    if (query.entranceExam && query.entranceExam.trim() && query.entranceExam !== 'ALL') {
      andConditions.push({
        courses: {
          some: {
            status: 'PUBLISHED',
            isPublished: true,
            isActive: true,
            entranceExamsRequired: { contains: query.entranceExam.trim() },
          },
        },
      });
    }

    const where = andConditions.length > 0 ? { AND: andConditions } : {};

    // Sort order
    let orderBy: any = { name: 'asc' };
    if (query.sortBy === 'name_desc') {
      orderBy = { name: 'desc' };
    } else if (query.sortBy === 'fee_asc') {
      orderBy = { minAnnualFee: 'asc' };
    } else if (query.sortBy === 'fee_desc') {
      orderBy = { maxAnnualFee: 'desc' };
    }

    // Execute query with count
    const [total, records, allAvailableInstitutions] = await Promise.all([
      prisma.institution.count({ where }),
      prisma.institution.findMany({
        where,
        include: {
          courses: {
            where: {
              status: 'PUBLISHED',
              isPublished: true,
              isActive: true,
            },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      // Fetch distinct metadata from published catalog
      prisma.institution.findMany({
        where: {
          status: 'PUBLISHED',
          isPublished: true,
          isActive: true,
        },
        select: {
          country: true,
          city: true,
          courses: {
            where: {
              status: 'PUBLISHED',
              isPublished: true,
              isActive: true,
            },
            select: {
              department: true,
              specialization: true,
              level: true,
              entranceExamsRequired: true,
            },
          },
        },
      }),
    ]);

    // Extract dynamic filter values from active published catalog
    const countrySet = new Set<string>();
    const citySet = new Set<string>();
    const departmentSet = new Set<string>();
    const specializationSet = new Set<string>();
    const levelSet = new Set<string>();
    const examSet = new Set<string>();

    allAvailableInstitutions.forEach((inst) => {
      if (inst.country) countrySet.add(inst.country);
      if (inst.city) citySet.add(inst.city);
      inst.courses.forEach((c) => {
        if (c.department) departmentSet.add(c.department);
        if (c.specialization) specializationSet.add(c.specialization);
        if (c.level) levelSet.add(c.level);
        try {
          if (c.entranceExamsRequired) {
            const list = JSON.parse(c.entranceExamsRequired);
            if (Array.isArray(list)) list.forEach((e: string) => examSet.add(e));
          }
        } catch {
          // ignore
        }
      });
    });

    const data: InstitutionSummary[] = records.map((rec) =>
      this.mapInstitutionSummary(rec, savedInstitutionIds, comparedInstitutionIds)
    );

    return {
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
      filters: {
        countries: Array.from(countrySet).sort(),
        cities: Array.from(citySet).sort(),
        departments: Array.from(departmentSet).sort(),
        specializations: Array.from(specializationSet).sort(),
        levels: Array.from(levelSet).sort(),
        entranceExams: Array.from(examSet).sort(),
        feeRange: {
          min: 0,
          max: 100000,
          currency: 'USD',
        },
      },
    };
  }

  /**
   * Get single institution profile by ID or slug
   * STRICT VISIBILITY: Must be PUBLISHED for students / public
   */
  static async getCollegeById(
    idOrSlug: string,
    userId?: string
  ): Promise<InstitutionDetail> {
    await this.ensureCatalogSeeded();

    const record = await prisma.institution.findFirst({
      where: {
        OR: [{ id: idOrSlug }, { slug: idOrSlug }],
        status: 'PUBLISHED',
        isPublished: true,
        isActive: true,
      },
      include: {
        courses: {
          where: {
            status: 'PUBLISHED',
            isPublished: true,
            isActive: true,
          },
          orderBy: { name: 'asc' },
        },
      },
    });

    if (!record) {
      const err: any = new Error(
        `Institution with identifier '${idOrSlug}' not found or is not published.`
      );
      err.statusCode = 404;
      throw err;
    }

    let savedCourseIds: Set<string> | undefined;
    let savedInstitutionIds: Set<string> | undefined;
    let comparedInstitutionIds: Set<string> | undefined;

    if (userId) {
      const studentProfile = await prisma.studentProfile.findUnique({
        where: { userId },
        include: {
          savedInstitutions: { select: { institutionId: true } },
          savedCourses: { select: { courseId: true } },
          comparisonItems: { select: { institutionId: true } },
        },
      });

      if (studentProfile) {
        savedInstitutionIds = new Set(
          studentProfile.savedInstitutions.map((s) => s.institutionId)
        );
        savedCourseIds = new Set(studentProfile.savedCourses.map((c) => c.courseId));
        comparedInstitutionIds = new Set(
          studentProfile.comparisonItems.map((c) => c.institutionId)
        );
      }
    }

    const summary = this.mapInstitutionSummary(
      record,
      savedInstitutionIds,
      comparedInstitutionIds
    );

    let facilities: string[] = [];
    try {
      if (record.campusFacilities) {
        facilities = JSON.parse(record.campusFacilities);
      }
    } catch {
      facilities = [];
    }

    const mappedCourses = (record.courses || []).map((c: any) =>
      this.mapCourse(c, savedCourseIds, {
        name: record.name,
        country: record.country,
        city: record.city,
      })
    );

    return {
      ...summary,
      campusFacilities: facilities,
      placementInfo: record.placementInfo || null,
      admissionDeadlines: record.admissionDeadlines || null,
      contactEmail: record.contactEmail || null,
      contactPhone: record.contactPhone || null,
      address: record.address || null,
      scholarshipDetails: record.scholarshipDetails || null,
      courses: mappedCourses,
    };
  }

  /**
   * Get single course details by ID
   * STRICT VISIBILITY: Must be PUBLISHED under a PUBLISHED institution
   */
  static async getCourseById(courseId: string, userId?: string): Promise<CourseSummary> {
    await this.ensureCatalogSeeded();

    const course = await prisma.course.findFirst({
      where: {
        id: courseId,
        status: 'PUBLISHED',
        isPublished: true,
        isActive: true,
        institution: {
          status: 'PUBLISHED',
          isPublished: true,
          isActive: true,
        },
      },
      include: {
        institution: true,
      },
    });

    if (!course) {
      const err: any = new Error(`Course with ID '${courseId}' not found or is not published.`);
      err.statusCode = 404;
      throw err;
    }

    let isSaved = false;
    if (userId) {
      const studentProfile = await prisma.studentProfile.findUnique({
        where: { userId },
        include: { savedCourses: { where: { courseId } } },
      });
      isSaved = (studentProfile?.savedCourses.length || 0) > 0;
    }

    const savedSet = new Set<string>();
    if (isSaved) savedSet.add(courseId);

    return this.mapCourse(course, savedSet);
  }

  /**
   * Save an institution to student shortlist
   */
  static async saveInstitution(
    userId: string,
    institutionId: string,
    notes?: string | null,
    ipAddress?: string
  ): Promise<{ saved: boolean }> {
    const studentProfile = await this.getStudentProfile(userId);

    const institution = await prisma.institution.findFirst({
      where: {
        id: institutionId,
        status: 'PUBLISHED',
        isPublished: true,
        isActive: true,
      },
    });
    if (!institution) {
      const err: any = new Error('Cannot save unpublished or non-existent institution.');
      err.statusCode = 404;
      throw err;
    }

    await prisma.studentSavedInstitution.upsert({
      where: {
        studentProfileId_institutionId: {
          studentProfileId: studentProfile.id,
          institutionId,
        },
      },
      update: { notes: notes || null },
      create: {
        studentProfileId: studentProfile.id,
        institutionId,
        notes: notes || null,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'COLLEGE_SAVED',
        details: JSON.stringify({
          institutionId,
          name: institution.name,
          studentProfileId: studentProfile.id,
        }),
        ipAddress,
      },
    });

    return { saved: true };
  }

  /**
   * Remove institution from student shortlist
   */
  static async unsaveInstitution(
    userId: string,
    institutionId: string,
    ipAddress?: string
  ): Promise<{ unsaved: boolean }> {
    const studentProfile = await this.getStudentProfile(userId);

    await prisma.studentSavedInstitution.deleteMany({
      where: {
        studentProfileId: studentProfile.id,
        institutionId,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'COLLEGE_UNSAVED',
        details: JSON.stringify({
          institutionId,
          studentProfileId: studentProfile.id,
        }),
        ipAddress,
      },
    });

    return { unsaved: true };
  }

  /**
   * Save a course to student shortlist
   */
  static async saveCourse(
    userId: string,
    courseId: string,
    notes?: string | null,
    ipAddress?: string
  ): Promise<{ saved: boolean }> {
    const studentProfile = await this.getStudentProfile(userId);

    const course = await prisma.course.findFirst({
      where: {
        id: courseId,
        status: 'PUBLISHED',
        isPublished: true,
        isActive: true,
      },
      include: { institution: true },
    });

    if (!course) {
      const err: any = new Error('Cannot save unpublished or non-existent course program.');
      err.statusCode = 404;
      throw err;
    }

    await prisma.studentSavedCourse.upsert({
      where: {
        studentProfileId_courseId: {
          studentProfileId: studentProfile.id,
          courseId,
        },
      },
      update: { notes: notes || null },
      create: {
        studentProfileId: studentProfile.id,
        courseId,
        notes: notes || null,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'COURSE_SAVED',
        details: JSON.stringify({
          courseId,
          name: course.name,
          institutionId: course.institutionId,
          studentProfileId: studentProfile.id,
        }),
        ipAddress,
      },
    });

    return { saved: true };
  }

  /**
   * Remove course from student shortlist
   */
  static async unsaveCourse(
    userId: string,
    courseId: string,
    ipAddress?: string
  ): Promise<{ unsaved: boolean }> {
    const studentProfile = await this.getStudentProfile(userId);

    await prisma.studentSavedCourse.deleteMany({
      where: {
        studentProfileId: studentProfile.id,
        courseId,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'COURSE_UNSAVED',
        details: JSON.stringify({
          courseId,
          studentProfileId: studentProfile.id,
        }),
        ipAddress,
      },
    });

    return { unsaved: true };
  }

  /**
   * Get all saved colleges and courses for authenticated student
   */
  static async getSavedCollegesAndCourses(
    userId: string
  ): Promise<SavedInstitutionsAndCoursesResponse> {
    const studentProfile = await this.getStudentProfile(userId);

    const [savedInstitutionsList, savedCoursesList] = await Promise.all([
      prisma.studentSavedInstitution.findMany({
        where: { studentProfileId: studentProfile.id },
        include: {
          institution: {
            include: {
              courses: {
                where: {
                  status: 'PUBLISHED',
                  isPublished: true,
                  isActive: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.studentSavedCourse.findMany({
        where: { studentProfileId: studentProfile.id },
        include: {
          course: {
            include: { institution: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const savedInstitutions: InstitutionSummary[] = savedInstitutionsList
      .filter((s) => s.institution.status === 'PUBLISHED' && s.institution.isPublished && s.institution.isActive)
      .map((s) => this.mapInstitutionSummary(s.institution, new Set([s.institutionId])));

    const savedCourses: CourseSummary[] = savedCoursesList
      .filter((c) => c.course.status === 'PUBLISHED' && c.course.isPublished && c.course.isActive)
      .map((c) => this.mapCourse(c.course, new Set([c.courseId])));

    return {
      savedInstitutions,
      savedCourses,
    };
  }

  /**
   * Add institution to student comparison (max 4)
   */
  static async addToComparison(
    userId: string,
    institutionId: string,
    ipAddress?: string
  ): Promise<{ added: boolean; totalCount: number }> {
    const studentProfile = await this.getStudentProfile(userId);

    const count = await prisma.studentComparisonItem.count({
      where: { studentProfileId: studentProfile.id },
    });

    if (count >= 4) {
      const err: any = new Error(
        'Maximum comparison limit reached. You can compare up to 4 institutions simultaneously.'
      );
      err.statusCode = 400;
      throw err;
    }

    const institution = await prisma.institution.findFirst({
      where: {
        id: institutionId,
        status: 'PUBLISHED',
        isPublished: true,
        isActive: true,
      },
    });
    if (!institution) {
      const err: any = new Error('Cannot compare unpublished or non-existent institution.');
      err.statusCode = 404;
      throw err;
    }

    await prisma.studentComparisonItem.upsert({
      where: {
        studentProfileId_institutionId: {
          studentProfileId: studentProfile.id,
          institutionId,
        },
      },
      update: {},
      create: {
        studentProfileId: studentProfile.id,
        institutionId,
      },
    });

    const newCount = await prisma.studentComparisonItem.count({
      where: { studentProfileId: studentProfile.id },
    });

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'COLLEGE_COMPARE_ADDED',
        details: JSON.stringify({
          institutionId,
          studentProfileId: studentProfile.id,
          count: newCount,
        }),
        ipAddress,
      },
    });

    return { added: true, totalCount: newCount };
  }

  /**
   * Remove institution from comparison
   */
  static async removeFromComparison(
    userId: string,
    institutionId: string,
    ipAddress?: string
  ): Promise<{ removed: boolean }> {
    const studentProfile = await this.getStudentProfile(userId);

    await prisma.studentComparisonItem.deleteMany({
      where: {
        studentProfileId: studentProfile.id,
        institutionId,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'COLLEGE_COMPARE_REMOVED',
        details: JSON.stringify({
          institutionId,
          studentProfileId: studentProfile.id,
        }),
        ipAddress,
      },
    });

    return { removed: true };
  }

  /**
   * Clear all comparison items for student
   */
  static async clearComparison(
    userId: string,
    ipAddress?: string
  ): Promise<{ cleared: boolean }> {
    const studentProfile = await this.getStudentProfile(userId);

    await prisma.studentComparisonItem.deleteMany({
      where: { studentProfileId: studentProfile.id },
    });

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'COLLEGE_COMPARE_CLEARED',
        details: JSON.stringify({ studentProfileId: studentProfile.id }),
        ipAddress,
      },
    });

    return { cleared: true };
  }

  /**
   * Get comparative matrix of selected institutions for authenticated student
   */
  static async getComparisonMatrix(userId: string): Promise<ComparisonResponse> {
    const studentProfile = await this.getStudentProfile(userId);

    const items = await prisma.studentComparisonItem.findMany({
      where: { studentProfileId: studentProfile.id },
      include: {
        institution: {
          include: {
            courses: {
              where: {
                status: 'PUBLISHED',
                isPublished: true,
                isActive: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    const institutions: InstitutionDetail[] = items.map((item) => {
      const summary = this.mapInstitutionSummary(
        item.institution,
        undefined,
        new Set([item.institutionId])
      );
      let facilities: string[] = [];
      try {
        if (item.institution.campusFacilities) {
          facilities = JSON.parse(item.institution.campusFacilities);
        }
      } catch {
        facilities = [];
      }

      return {
        ...summary,
        campusFacilities: facilities,
        placementInfo: item.institution.placementInfo || null,
        admissionDeadlines: item.institution.admissionDeadlines || null,
        contactEmail: item.institution.contactEmail || null,
        contactPhone: item.institution.contactPhone || null,
        address: item.institution.address || null,
        scholarshipDetails: item.institution.scholarshipDetails || null,
        courses: item.institution.courses.map((c) => this.mapCourse(c)),
      };
    });

    const dimensions = [
      { key: 'country', label: 'Country & Location' },
      { key: 'institutionType', label: 'Institution Type' },
      { key: 'rankingInfo', label: 'Global Ranking' },
      { key: 'minAnnualFee', label: 'Tuition Fees (Annual)' },
      { key: 'hasScholarships', label: 'Scholarship Opportunities' },
      { key: 'entranceExams', label: 'Entrance Exams Accepted' },
      { key: 'coursesCount', label: 'Programs Available' },
      { key: 'campusFacilities', label: 'Campus Facilities' },
      { key: 'placementInfo', label: 'Placements & Career Support' },
      { key: 'admissionDeadlines', label: 'Admission Deadlines' },
      { key: 'officialWebsiteUrl', label: 'Official Website' },
    ];

    return { institutions, dimensions };
  }

  // =========================================================================
  // ADMIN & CONTENT MANAGEMENT APIS
  // =========================================================================

  /**
   * ADMIN: List all institutions across all statuses with metrics
   */
  static async adminListColleges(query: AdminCollegeSearchParams): Promise<AdminInstitutionListResponse> {
    await this.ensureCatalogSeeded();

    const page = Math.max(1, parseInt(String(query.page || '1'), 10));
    const limit = Math.max(1, Math.min(100, parseInt(String(query.limit || '10'), 10)));
    const skip = (page - 1) * limit;

    const andConditions: any[] = [];

    if (query.search && query.search.trim()) {
      const term = query.search.trim();
      andConditions.push({
        OR: [
          { name: { contains: term } },
          { city: { contains: term } },
          { country: { contains: term } },
          { overview: { contains: term } },
        ],
      });
    }

    if (query.status && query.status !== 'ALL') {
      andConditions.push({ status: query.status });
    }

    if (query.country && query.country.trim() && query.country !== 'ALL') {
      andConditions.push({ country: { contains: query.country.trim() } });
    }

    if (query.city && query.city.trim() && query.city !== 'ALL') {
      andConditions.push({ city: { contains: query.city.trim() } });
    }

    if (query.isVerified !== undefined && query.isVerified !== 'ALL') {
      andConditions.push({ isVerified: query.isVerified === 'true' });
    }

    if (query.isPublished !== undefined && query.isPublished !== 'ALL') {
      andConditions.push({ isPublished: query.isPublished === 'true' });
    }

    const where = andConditions.length > 0 ? { AND: andConditions } : {};

    const [total, records, draftCount, reviewCount, publishedCount, archivedCount, verifiedCount] = await Promise.all([
      prisma.institution.count({ where }),
      prisma.institution.findMany({
        where,
        include: { courses: true },
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.institution.count({ where: { status: 'DRAFT' } }),
      prisma.institution.count({ where: { status: 'REVIEW' } }),
      prisma.institution.count({ where: { status: 'PUBLISHED', isPublished: true } }),
      prisma.institution.count({ where: { status: 'ARCHIVED' } }),
      prisma.institution.count({ where: { isVerified: true } }),
    ]);

    const data: InstitutionSummary[] = records.map((rec) =>
      this.mapInstitutionSummary(rec)
    );

    return {
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
      statusCounts: {
        total: await prisma.institution.count(),
        draft: draftCount,
        review: reviewCount,
        published: publishedCount,
        archived: archivedCount,
        verified: verifiedCount,
      },
    };
  }

  /**
   * ADMIN: Get single institution details including all courses
   */
  static async adminGetCollegeById(id: string): Promise<InstitutionDetail> {
    const record = await prisma.institution.findUnique({
      where: { id },
      include: {
        courses: {
          orderBy: { name: 'asc' },
        },
      },
    });

    if (!record) {
      const err: any = new Error(`Institution with ID '${id}' not found.`);
      err.statusCode = 404;
      throw err;
    }

    const summary = this.mapInstitutionSummary(record);
    let facilities: string[] = [];
    try {
      if (record.campusFacilities) {
        facilities = JSON.parse(record.campusFacilities);
      }
    } catch {
      facilities = [];
    }

    const mappedCourses = (record.courses || []).map((c: any) =>
      this.mapCourse(c, undefined, {
        name: record.name,
        country: record.country,
        city: record.city,
      })
    );

    return {
      ...summary,
      campusFacilities: facilities,
      placementInfo: record.placementInfo || null,
      admissionDeadlines: record.admissionDeadlines || null,
      contactEmail: record.contactEmail || null,
      contactPhone: record.contactPhone || null,
      address: record.address || null,
      scholarshipDetails: record.scholarshipDetails || null,
      courses: mappedCourses,
    };
  }

  /**
   * ADMIN: Create new college/institution
   */
  static async adminCreateCollege(
    userId: string,
    data: AdminCreateInstitutionInput,
    ipAddress?: string
  ): Promise<InstitutionDetail> {
    const baseSlug = data.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    const randomSuffix = Math.random().toString(36).substring(2, 6);
    const slug = `${baseSlug}-${randomSuffix}`;

    const status: CatalogueStatus = data.status || 'DRAFT';
    const isPublished = data.isPublished !== undefined ? data.isPublished : status === 'PUBLISHED';
    const isVerified = data.isVerified !== undefined ? data.isVerified : false;
    const now = new Date();

    const created = await prisma.institution.create({
      data: {
        slug,
        name: data.name.trim(),
        country: data.country.trim(),
        city: data.city.trim(),
        state: data.state?.trim() || null,
        institutionType: data.institutionType?.trim() || null,
        establishedYear: data.establishedYear || null,
        overview: data.overview.trim(),
        rankingInfo: data.rankingInfo?.trim() || null,
        campusFacilities: data.campusFacilities ? JSON.stringify(data.campusFacilities) : null,
        placementInfo: data.placementInfo?.trim() || null,
        admissionDeadlines: data.admissionDeadlines?.trim() || null,
        contactEmail: data.contactEmail?.trim() || null,
        contactPhone: data.contactPhone?.trim() || null,
        address: data.address?.trim() || null,
        officialWebsiteUrl: data.officialWebsiteUrl.trim(),
        hasScholarships: Boolean(data.hasScholarships),
        scholarshipDetails: data.scholarshipDetails?.trim() || null,
        minAnnualFee: data.minAnnualFee || null,
        maxAnnualFee: data.maxAnnualFee || null,
        feeCurrency: data.feeCurrency || 'USD',
        status,
        isPublished,
        isVerified,
        publishedAt: isPublished ? now : null,
        publishedBy: isPublished ? userId : null,
        verifiedAt: isVerified ? now : null,
        verifiedBy: isVerified ? userId : null,
        isActive: true,
      },
      include: { courses: true },
    });

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'COLLEGE_CREATED',
        details: JSON.stringify({
          institutionId: created.id,
          name: created.name,
          country: created.country,
          status: created.status,
          isPublished: created.isPublished,
          isVerified: created.isVerified,
        }),
        ipAddress,
      },
    });

    return this.adminGetCollegeById(created.id);
  }

  /**
   * ADMIN: Update existing college
   */
  static async adminUpdateCollege(
    userId: string,
    id: string,
    data: AdminUpdateInstitutionInput,
    ipAddress?: string
  ): Promise<InstitutionDetail> {
    const existing = await prisma.institution.findUnique({ where: { id } });
    if (!existing) {
      const err: any = new Error(`Institution with ID '${id}' not found.`);
      err.statusCode = 404;
      throw err;
    }

    const now = new Date();
    const updateData: any = {};

    if (data.name !== undefined) updateData.name = data.name.trim();
    if (data.country !== undefined) updateData.country = data.country.trim();
    if (data.city !== undefined) updateData.city = data.city.trim();
    if (data.state !== undefined) updateData.state = data.state?.trim() || null;
    if (data.institutionType !== undefined) updateData.institutionType = data.institutionType?.trim() || null;
    if (data.establishedYear !== undefined) updateData.establishedYear = data.establishedYear;
    if (data.overview !== undefined) updateData.overview = data.overview.trim();
    if (data.rankingInfo !== undefined) updateData.rankingInfo = data.rankingInfo?.trim() || null;
    if (data.campusFacilities !== undefined) {
      updateData.campusFacilities = data.campusFacilities ? JSON.stringify(data.campusFacilities) : null;
    }
    if (data.placementInfo !== undefined) updateData.placementInfo = data.placementInfo?.trim() || null;
    if (data.admissionDeadlines !== undefined) updateData.admissionDeadlines = data.admissionDeadlines?.trim() || null;
    if (data.contactEmail !== undefined) updateData.contactEmail = data.contactEmail?.trim() || null;
    if (data.contactPhone !== undefined) updateData.contactPhone = data.contactPhone?.trim() || null;
    if (data.address !== undefined) updateData.address = data.address?.trim() || null;
    if (data.officialWebsiteUrl !== undefined) updateData.officialWebsiteUrl = data.officialWebsiteUrl.trim();
    if (data.hasScholarships !== undefined) updateData.hasScholarships = Boolean(data.hasScholarships);
    if (data.scholarshipDetails !== undefined) updateData.scholarshipDetails = data.scholarshipDetails?.trim() || null;
    if (data.minAnnualFee !== undefined) updateData.minAnnualFee = data.minAnnualFee;
    if (data.maxAnnualFee !== undefined) updateData.maxAnnualFee = data.maxAnnualFee;
    if (data.feeCurrency !== undefined) updateData.feeCurrency = data.feeCurrency;

    if (data.status !== undefined) {
      updateData.status = data.status;
      if (data.status === 'PUBLISHED') {
        updateData.isPublished = true;
        updateData.publishedAt = now;
        updateData.publishedBy = userId;
      } else if (data.status === 'ARCHIVED') {
        updateData.isPublished = false;
        updateData.archivedAt = now;
      }
    }

    if (data.isPublished !== undefined) {
      updateData.isPublished = data.isPublished;
      if (data.isPublished) {
        updateData.status = 'PUBLISHED';
        updateData.publishedAt = now;
        updateData.publishedBy = userId;
      } else {
        if (existing.status === 'PUBLISHED') updateData.status = 'DRAFT';
      }
    }

    if (data.isVerified !== undefined) {
      updateData.isVerified = data.isVerified;
      if (data.isVerified) {
        updateData.verifiedAt = now;
        updateData.verifiedBy = userId;
      } else {
        updateData.verifiedAt = null;
        updateData.verifiedBy = null;
      }
    }

    await prisma.institution.update({
      where: { id },
      data: updateData,
    });

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'COLLEGE_UPDATED',
        details: JSON.stringify({
          institutionId: id,
          updatedFields: Object.keys(updateData),
          status: updateData.status ?? existing.status,
          isPublished: updateData.isPublished ?? existing.isPublished,
        }),
        ipAddress,
      },
    });

    return this.adminGetCollegeById(id);
  }

  /**
   * ADMIN: Publish / Unpublish college
   */
  static async adminSetPublishStatus(
    userId: string,
    id: string,
    isPublished: boolean,
    statusOverride?: CatalogueStatus,
    ipAddress?: string
  ): Promise<InstitutionDetail> {
    const existing = await prisma.institution.findUnique({ where: { id } });
    if (!existing) {
      const err: any = new Error(`Institution with ID '${id}' not found.`);
      err.statusCode = 404;
      throw err;
    }

    const now = new Date();
    const newStatus: CatalogueStatus = statusOverride
      ? statusOverride
      : isPublished
      ? 'PUBLISHED'
      : 'DRAFT';

    await prisma.institution.update({
      where: { id },
      data: {
        isPublished,
        status: newStatus,
        publishedAt: isPublished ? now : null,
        publishedBy: isPublished ? userId : null,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId,
        action: isPublished ? 'COLLEGE_PUBLISHED' : 'COLLEGE_UNPUBLISHED',
        details: JSON.stringify({
          institutionId: id,
          name: existing.name,
          isPublished,
          status: newStatus,
        }),
        ipAddress,
      },
    });

    return this.adminGetCollegeById(id);
  }

  /**
   * ADMIN: Verify / Unverify college
   */
  static async adminSetVerifyStatus(
    userId: string,
    id: string,
    isVerified: boolean,
    ipAddress?: string
  ): Promise<InstitutionDetail> {
    const existing = await prisma.institution.findUnique({ where: { id } });
    if (!existing) {
      const err: any = new Error(`Institution with ID '${id}' not found.`);
      err.statusCode = 404;
      throw err;
    }

    const now = new Date();
    await prisma.institution.update({
      where: { id },
      data: {
        isVerified,
        verifiedAt: isVerified ? now : null,
        verifiedBy: isVerified ? userId : null,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'COLLEGE_VERIFIED',
        details: JSON.stringify({
          institutionId: id,
          name: existing.name,
          isVerified,
        }),
        ipAddress,
      },
    });

    return this.adminGetCollegeById(id);
  }

  /**
   * ADMIN: Archive college
   */
  static async adminArchiveCollege(
    userId: string,
    id: string,
    ipAddress?: string
  ): Promise<InstitutionDetail> {
    const existing = await prisma.institution.findUnique({ where: { id } });
    if (!existing) {
      const err: any = new Error(`Institution with ID '${id}' not found.`);
      err.statusCode = 404;
      throw err;
    }

    const now = new Date();
    await prisma.institution.update({
      where: { id },
      data: {
        status: 'ARCHIVED',
        isPublished: false,
        archivedAt: now,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'COLLEGE_ARCHIVED',
        details: JSON.stringify({
          institutionId: id,
          name: existing.name,
        }),
        ipAddress,
      },
    });

    return this.adminGetCollegeById(id);
  }

  /**
   * ADMIN: Add Course to College
   */
  static async adminCreateCourse(
    userId: string,
    institutionId: string,
    data: AdminCreateCourseInput,
    ipAddress?: string
  ): Promise<CourseSummary> {
    const institution = await prisma.institution.findUnique({ where: { id: institutionId } });
    if (!institution) {
      const err: any = new Error(`Institution with ID '${institutionId}' not found.`);
      err.statusCode = 404;
      throw err;
    }

    const status: CatalogueStatus = data.status || 'PUBLISHED';
    const isPublished = data.isPublished !== undefined ? data.isPublished : status === 'PUBLISHED';

    const course = await prisma.course.create({
      data: {
        institutionId,
        name: data.name.trim(),
        department: data.department.trim(),
        specialization: data.specialization?.trim() || null,
        level: data.level || 'Undergraduate',
        durationYears: data.durationYears || null,
        durationText: data.durationText?.trim() || null,
        description: data.description?.trim() || null,
        eligibilityCriteria: data.eligibilityCriteria?.trim() || null,
        annualTuitionFee: data.annualTuitionFee || null,
        feeCurrency: data.feeCurrency || 'USD',
        feeRange: data.feeRange?.trim() || null,
        entranceExamsRequired: data.entranceExamsRequired ? JSON.stringify(data.entranceExamsRequired) : null,
        scholarshipAvailable: Boolean(data.scholarshipAvailable),
        scholarshipDetails: data.scholarshipDetails?.trim() || null,
        applicationDeadline: data.applicationDeadline?.trim() || null,
        isPopular: Boolean(data.isPopular),
        status,
        isPublished,
        publishedAt: isPublished ? new Date() : null,
        isActive: true,
      },
      include: { institution: true },
    });

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'COURSE_CREATED',
        details: JSON.stringify({
          courseId: course.id,
          name: course.name,
          institutionId,
          status: course.status,
          isPublished: course.isPublished,
        }),
        ipAddress,
      },
    });

    return this.mapCourse(course);
  }

  /**
   * ADMIN: Update Course
   */
  static async adminUpdateCourse(
    userId: string,
    courseId: string,
    data: AdminUpdateCourseInput,
    ipAddress?: string
  ): Promise<CourseSummary> {
    const existing = await prisma.course.findUnique({
      where: { id: courseId },
      include: { institution: true },
    });
    if (!existing) {
      const err: any = new Error(`Course with ID '${courseId}' not found.`);
      err.statusCode = 404;
      throw err;
    }

    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name.trim();
    if (data.department !== undefined) updateData.department = data.department.trim();
    if (data.specialization !== undefined) updateData.specialization = data.specialization?.trim() || null;
    if (data.level !== undefined) updateData.level = data.level;
    if (data.durationYears !== undefined) updateData.durationYears = data.durationYears;
    if (data.durationText !== undefined) updateData.durationText = data.durationText?.trim() || null;
    if (data.description !== undefined) updateData.description = data.description?.trim() || null;
    if (data.eligibilityCriteria !== undefined) updateData.eligibilityCriteria = data.eligibilityCriteria?.trim() || null;
    if (data.annualTuitionFee !== undefined) updateData.annualTuitionFee = data.annualTuitionFee;
    if (data.feeCurrency !== undefined) updateData.feeCurrency = data.feeCurrency;
    if (data.feeRange !== undefined) updateData.feeRange = data.feeRange?.trim() || null;
    if (data.entranceExamsRequired !== undefined) {
      updateData.entranceExamsRequired = data.entranceExamsRequired ? JSON.stringify(data.entranceExamsRequired) : null;
    }
    if (data.scholarshipAvailable !== undefined) updateData.scholarshipAvailable = Boolean(data.scholarshipAvailable);
    if (data.scholarshipDetails !== undefined) updateData.scholarshipDetails = data.scholarshipDetails?.trim() || null;
    if (data.applicationDeadline !== undefined) updateData.applicationDeadline = data.applicationDeadline?.trim() || null;
    if (data.isPopular !== undefined) updateData.isPopular = Boolean(data.isPopular);

    if (data.status !== undefined) {
      updateData.status = data.status;
      if (data.status === 'PUBLISHED') {
        updateData.isPublished = true;
        updateData.publishedAt = new Date();
      } else if (data.status === 'ARCHIVED') {
        updateData.isPublished = false;
        updateData.archivedAt = new Date();
      }
    }

    if (data.isPublished !== undefined) {
      updateData.isPublished = data.isPublished;
      if (data.isPublished) {
        updateData.status = 'PUBLISHED';
        updateData.publishedAt = new Date();
      } else {
        if (existing.status === 'PUBLISHED') updateData.status = 'DRAFT';
      }
    }

    const updated = await prisma.course.update({
      where: { id: courseId },
      data: updateData,
      include: { institution: true },
    });

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'COURSE_UPDATED',
        details: JSON.stringify({
          courseId,
          updatedFields: Object.keys(updateData),
          status: updated.status,
          isPublished: updated.isPublished,
        }),
        ipAddress,
      },
    });

    return this.mapCourse(updated);
  }

  /**
   * ADMIN: Publish / Unpublish course
   */
  static async adminSetCoursePublishStatus(
    userId: string,
    courseId: string,
    isPublished: boolean,
    ipAddress?: string
  ): Promise<CourseSummary> {
    const existing = await prisma.course.findUnique({
      where: { id: courseId },
      include: { institution: true },
    });
    if (!existing) {
      const err: any = new Error(`Course with ID '${courseId}' not found.`);
      err.statusCode = 404;
      throw err;
    }

    const updated = await prisma.course.update({
      where: { id: courseId },
      data: {
        isPublished,
        status: isPublished ? 'PUBLISHED' : 'DRAFT',
        publishedAt: isPublished ? new Date() : null,
      },
      include: { institution: true },
    });

    await prisma.auditLog.create({
      data: {
        userId,
        action: isPublished ? 'COURSE_PUBLISHED' : 'COURSE_UNPUBLISHED',
        details: JSON.stringify({
          courseId,
          name: existing.name,
          isPublished,
        }),
        ipAddress,
      },
    });

    return this.mapCourse(updated);
  }

  /**
   * ADMIN: Delete or archive course
   */
  static async adminDeleteCourse(
    userId: string,
    courseId: string,
    ipAddress?: string
  ): Promise<{ deleted: boolean }> {
    const existing = await prisma.course.findUnique({ where: { id: courseId } });
    if (!existing) {
      const err: any = new Error(`Course with ID '${courseId}' not found.`);
      err.statusCode = 404;
      throw err;
    }

    await prisma.course.delete({ where: { id: courseId } });

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'COURSE_DELETED',
        details: JSON.stringify({
          courseId,
          name: existing.name,
          institutionId: existing.institutionId,
        }),
        ipAddress,
      },
    });

    return { deleted: true };
  }
}
