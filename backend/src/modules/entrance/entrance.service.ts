import { prisma } from '../../shared/database/prisma.service';
import {
  EntranceExamRecord,
  StudentExamPlanInput,
  StudentExamPlanRecord,
  ExamCatalogFilterQuery,
  MockTestClientView,
  MockTestSubmissionInput,
  MockTestResultRecord,
  QuestionResultBreakdown,
} from './entrance.types';
import { seedEntranceExamsCatalog } from './entrance.seed';

export class EntranceService {
  /**
   * Helper to deserialize EntranceExam database model into EntranceExamRecord
   */
  private static mapToExamRecord(
    record: any,
    isRecommended = false,
    planStatus: string | null = null
  ): EntranceExamRecord {
    const parseJson = (val: any, fallback: any = []) => {
      if (!val) return fallback;
      if (typeof val === 'object') return val;
      try {
        return JSON.parse(val);
      } catch {
        return fallback;
      }
    };

    return {
      id: record.id,
      code: record.code,
      name: record.name,
      category: record.category,
      description: record.description,
      destinations: parseJson(record.destinations, []),
      relevantStreams: parseJson(record.relevantStreams, []),
      format: record.format,
      sections: parseJson(record.sections, []),
      totalDurationMinutes: record.totalDurationMinutes,
      scoreRange: record.scoreRange,
      scoringDetails: record.scoringDetails,
      validity: record.validity,
      importantDates: parseJson(record.importantDates, []),
      officialWebsiteUrl: record.officialWebsiteUrl,
      prepResources: parseJson(record.prepResources, []),
      recommendedBooks: parseJson(record.recommendedBooks, []),
      testDayTips: parseJson(record.testDayTips, []),
      hasMockTest: record.hasMockTest,
      isRecommendedForStudent: isRecommended,
      studentPlanStatus: planStatus,
      createdAt: record.createdAt.toISOString(),
      updatedAt: record.updatedAt.toISOString(),
    };
  }

  /**
   * Ensure the exam catalog is initialized in the database.
   */
  static async ensureCatalogInitialized() {
    const count = await prisma.entranceExam.count();
    if (count === 0) {
      await seedEntranceExamsCatalog();
    }
  }

  /**
   * Get exams catalog with smart filtering and personalized student matching.
   */
  static async getExamsCatalog(
    userId?: string,
    filters?: ExamCatalogFilterQuery
  ): Promise<EntranceExamRecord[]> {
    await this.ensureCatalogInitialized();

    // Fetch all exams
    const exams = await prisma.entranceExam.findMany({
      orderBy: { name: 'asc' },
    });

    // Student preferences & saved plan lookup for personalization
    let studentPreferredCountries: string[] = [];
    let studentPreferredDepartment = '';
    const planMap = new Map<string, string>(); // examId -> planStatus

    if (userId) {
      const studentProfile = await prisma.studentProfile.findUnique({
        where: { userId },
        include: {
          preference: true,
          examPlans: true,
        },
      });

      if (studentProfile) {
        if (studentProfile.preference) {
          try {
            const parsed = JSON.parse(studentProfile.preference.countries);
            if (Array.isArray(parsed)) {
              studentPreferredCountries = parsed.map((c: string) => c.toLowerCase());
            } else if (parsed && typeof parsed === 'object' && Array.isArray(parsed.list)) {
              studentPreferredCountries = parsed.list.map((c: string) => c.toLowerCase());
            }
          } catch {
            studentPreferredCountries = [];
          }
          studentPreferredDepartment = (studentProfile.preference.department || '').toLowerCase();
        }

        for (const plan of studentProfile.examPlans) {
          planMap.set(plan.examId, plan.status);
        }
      }
    }

    // Map and filter exams
    const results: EntranceExamRecord[] = [];

    for (const exam of exams) {
      const parsedDestinations: string[] = [];
      try {
        const d = JSON.parse(exam.destinations);
        if (Array.isArray(d)) parsedDestinations.push(...d);
      } catch {}

      const parsedStreams: string[] = [];
      try {
        const s = JSON.parse(exam.relevantStreams);
        if (Array.isArray(s)) parsedStreams.push(...s);
      } catch {}

      // Check recommendation matching
      const matchesCountry = studentPreferredCountries.some((c) =>
        parsedDestinations.some((d) => d.toLowerCase().includes(c) || c.includes(d.toLowerCase()))
      );
      const matchesStream =
        parsedStreams.includes('All') ||
        (studentPreferredDepartment &&
          parsedStreams.some(
            (s) =>
              s.toLowerCase().includes(studentPreferredDepartment) ||
              studentPreferredDepartment.includes(s.toLowerCase())
          ));

      const isRecommended = Boolean(matchesCountry || matchesStream);
      const planStatus = planMap.get(exam.id) || null;

      // Apply query filters
      if (filters?.category && filters.category !== 'ALL' && exam.category !== filters.category) {
        continue;
      }

      if (filters?.destination && filters.destination !== 'ALL') {
        const targetDest = filters.destination.toLowerCase();
        const hasDest = parsedDestinations.some((d) => d.toLowerCase().includes(targetDest));
        if (!hasDest) continue;
      }

      if (filters?.search && filters.search.trim()) {
        const term = filters.search.trim().toLowerCase();
        const matchCode = exam.code.toLowerCase().includes(term);
        const matchName = exam.name.toLowerCase().includes(term);
        const matchDesc = exam.description.toLowerCase().includes(term);
        const matchDest = parsedDestinations.some((d) => d.toLowerCase().includes(term));
        if (!matchCode && !matchName && !matchDesc && !matchDest) continue;
      }

      results.push(this.mapToExamRecord(exam, isRecommended, planStatus));
    }

    // Sort: Recommended first, then alphabetical
    results.sort((a, b) => {
      if (a.isRecommendedForStudent && !b.isRecommendedForStudent) return -1;
      if (!a.isRecommendedForStudent && b.isRecommendedForStudent) return 1;
      return a.name.localeCompare(b.name);
    });

    return results;
  }

  /**
   * Get single exam details.
   */
  static async getExamById(examId: string, userId?: string): Promise<EntranceExamRecord> {
    await this.ensureCatalogInitialized();

    const exam = await prisma.entranceExam.findUnique({
      where: { id: examId },
    });

    if (!exam) {
      const err: any = new Error('Entrance exam not found in registry.');
      err.statusCode = 404;
      throw err;
    }

    let planStatus: string | null = null;
    if (userId) {
      const profile = await prisma.studentProfile.findUnique({
        where: { userId },
      });
      if (profile) {
        const plan = await prisma.studentExamPlan.findUnique({
          where: {
            studentProfileId_examId: {
              studentProfileId: profile.id,
              examId: exam.id,
            },
          },
        });
        if (plan) planStatus = plan.status;
      }
    }

    return this.mapToExamRecord(exam, false, planStatus);
  }

  /**
   * Get student's saved exam plan.
   */
  static async getStudentExamPlan(userId: string) {
    const profile = await prisma.studentProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      return {
        items: [],
        counts: { total: 0, planned: 0, preparing: 0, registered: 0, completed: 0, mockTestsTaken: 0 },
      };
    }

    const plans = await prisma.studentExamPlan.findMany({
      where: { studentProfileId: profile.id },
      include: {
        exam: true,
      },
      orderBy: { updatedAt: 'desc' },
    });

    const mockAttemptCount = await prisma.studentMockAttempt.count({
      where: { studentProfileId: profile.id },
    });

    const items: StudentExamPlanRecord[] = plans.map((p) => ({
      id: p.id,
      studentProfileId: p.studentProfileId,
      examId: p.examId,
      exam: this.mapToExamRecord(p.exam, false, p.status),
      status: p.status as any,
      targetDate: p.targetDate,
      targetScore: p.targetScore,
      currentScore: p.currentScore,
      notes: p.notes,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    }));

    const counts = {
      total: items.length,
      planned: items.filter((i) => i.status === 'PLANNED').length,
      preparing: items.filter((i) => i.status === 'PREPARING').length,
      registered: items.filter((i) => i.status === 'REGISTERED').length,
      completed: items.filter((i) => i.status === 'COMPLETED').length,
      mockTestsTaken: mockAttemptCount,
    };

    return { items, counts };
  }

  /**
   * Save or update an exam in student's plan.
   */
  static async saveExamPlanItem(
    userId: string,
    input: StudentExamPlanInput,
    ipAddress?: string
  ): Promise<StudentExamPlanRecord> {
    const profile = await prisma.studentProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      const err: any = new Error('Student profile not found. Please complete profile intake first.');
      err.statusCode = 404;
      throw err;
    }

    const exam = await prisma.entranceExam.findUnique({
      where: { id: input.examId },
    });

    if (!exam) {
      const err: any = new Error('Selected entrance exam not found.');
      err.statusCode = 404;
      throw err;
    }

    const planRecord = await prisma.studentExamPlan.upsert({
      where: {
        studentProfileId_examId: {
          studentProfileId: profile.id,
          examId: exam.id,
        },
      },
      create: {
        studentProfileId: profile.id,
        examId: exam.id,
        status: input.status,
        targetDate: input.targetDate?.trim() || null,
        targetScore: input.targetScore?.trim() || null,
        currentScore: input.currentScore?.trim() || null,
        notes: input.notes?.trim() || null,
      },
      update: {
        status: input.status,
        targetDate: input.targetDate !== undefined ? input.targetDate?.trim() || null : undefined,
        targetScore: input.targetScore !== undefined ? input.targetScore?.trim() || null : undefined,
        currentScore: input.currentScore !== undefined ? input.currentScore?.trim() || null : undefined,
        notes: input.notes !== undefined ? input.notes?.trim() || null : undefined,
      },
      include: {
        exam: true,
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId,
        action: 'EXAM_PLAN_SAVED',
        details: JSON.stringify({
          planId: planRecord.id,
          examCode: exam.code,
          status: planRecord.status,
          targetScore: planRecord.targetScore,
        }),
        ipAddress: ipAddress || null,
      },
    });

    return {
      id: planRecord.id,
      studentProfileId: planRecord.studentProfileId,
      examId: planRecord.examId,
      exam: this.mapToExamRecord(planRecord.exam, false, planRecord.status),
      status: planRecord.status as any,
      targetDate: planRecord.targetDate,
      targetScore: planRecord.targetScore,
      currentScore: planRecord.currentScore,
      notes: planRecord.notes,
      createdAt: planRecord.createdAt.toISOString(),
      updatedAt: planRecord.updatedAt.toISOString(),
    };
  }

  /**
   * Update existing exam plan item.
   */
  static async updateExamPlanItem(
    userId: string,
    planId: string,
    updates: Partial<StudentExamPlanInput>,
    ipAddress?: string
  ): Promise<StudentExamPlanRecord> {
    const profile = await prisma.studentProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      const err: any = new Error('Student profile not found.');
      err.statusCode = 404;
      throw err;
    }

    const existing = await prisma.studentExamPlan.findUnique({
      where: { id: planId },
      include: { exam: true },
    });

    if (!existing || existing.studentProfileId !== profile.id) {
      const err: any = new Error('Exam plan item not found or unauthorized.');
      err.statusCode = 404;
      throw err;
    }

    const updated = await prisma.studentExamPlan.update({
      where: { id: planId },
      data: {
        status: updates.status || undefined,
        targetDate: updates.targetDate !== undefined ? updates.targetDate?.trim() || null : undefined,
        targetScore: updates.targetScore !== undefined ? updates.targetScore?.trim() || null : undefined,
        currentScore: updates.currentScore !== undefined ? updates.currentScore?.trim() || null : undefined,
        notes: updates.notes !== undefined ? updates.notes?.trim() || null : undefined,
      },
      include: {
        exam: true,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'EXAM_PLAN_UPDATED',
        details: JSON.stringify({ planId, status: updated.status }),
        ipAddress: ipAddress || null,
      },
    });

    return {
      id: updated.id,
      studentProfileId: updated.studentProfileId,
      examId: updated.examId,
      exam: this.mapToExamRecord(updated.exam, false, updated.status),
      status: updated.status as any,
      targetDate: updated.targetDate,
      targetScore: updated.targetScore,
      currentScore: updated.currentScore,
      notes: updated.notes,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    };
  }

  /**
   * Remove exam from student's plan.
   */
  static async removeExamPlanItem(userId: string, planId: string, ipAddress?: string): Promise<boolean> {
    const profile = await prisma.studentProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      const err: any = new Error('Student profile not found.');
      err.statusCode = 404;
      throw err;
    }

    const existing = await prisma.studentExamPlan.findUnique({
      where: { id: planId },
      include: { exam: true },
    });

    if (!existing || existing.studentProfileId !== profile.id) {
      const err: any = new Error('Exam plan item not found or unauthorized.');
      err.statusCode = 404;
      throw err;
    }

    await prisma.studentExamPlan.delete({
      where: { id: planId },
    });

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'EXAM_PLAN_REMOVED',
        details: JSON.stringify({ planId, examCode: existing.exam.code }),
        ipAddress: ipAddress || null,
      },
    });

    return true;
  }

  /**
   * Get available mock tests for an exam.
   */
  static async getMockTestsForExam(examId: string): Promise<any[]> {
    await this.ensureCatalogInitialized();

    const mockTests = await prisma.mockTest.findMany({
      where: { examId },
      include: {
        questions: {
          select: { id: true, section: true },
        },
      },
    });

    return mockTests.map((t) => ({
      id: t.id,
      examId: t.examId,
      title: t.title,
      description: t.description,
      durationMinutes: t.durationMinutes,
      totalMarks: t.totalMarks,
      passingMarks: t.passingMarks,
      questionCount: t.questions.length,
    }));
  }

  /**
   * Get mock test for student taking the test.
   * Crucial: omits correctOptionIndex and explanations to prevent cheating.
   */
  static async getMockTestForTaking(testId: string): Promise<MockTestClientView> {
    await this.ensureCatalogInitialized();

    const test = await prisma.mockTest.findUnique({
      where: { id: testId },
      include: {
        exam: true,
        questions: {
          orderBy: { orderIndex: 'asc' },
        },
      },
    });

    if (!test) {
      const err: any = new Error('Mock test not found.');
      err.statusCode = 404;
      throw err;
    }

    const safeQuestions = test.questions.map((q) => {
      let parsedOptions: string[] = [];
      try {
        parsedOptions = JSON.parse(q.options);
      } catch {
        parsedOptions = [];
      }

      return {
        id: q.id,
        section: q.section,
        questionText: q.questionText,
        options: parsedOptions,
        marks: q.marks,
        orderIndex: q.orderIndex,
      };
    });

    return {
      id: test.id,
      examId: test.examId,
      examCode: test.exam.code,
      examName: test.exam.name,
      title: test.title,
      description: test.description,
      durationMinutes: test.durationMinutes,
      totalMarks: test.totalMarks,
      passingMarks: test.passingMarks,
      questions: safeQuestions,
    };
  }

  /**
   * Submit mock test answers, calculate scores, store attempt, and return breakdown.
   */
  static async submitMockTest(
    userId: string,
    testId: string,
    input: MockTestSubmissionInput,
    ipAddress?: string
  ): Promise<MockTestResultRecord> {
    const profile = await prisma.studentProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      const err: any = new Error('Student profile not found. Please complete profile intake first.');
      err.statusCode = 404;
      throw err;
    }

    const test = await prisma.mockTest.findUnique({
      where: { id: testId },
      include: {
        exam: true,
        questions: {
          orderBy: { orderIndex: 'asc' },
        },
      },
    });

    if (!test) {
      const err: any = new Error('Mock test not found.');
      err.statusCode = 404;
      throw err;
    }

    let achievedScore = 0;
    let totalMarks = 0;
    const breakdown: QuestionResultBreakdown[] = [];

    for (const q of test.questions) {
      totalMarks += q.marks;
      const userSelected = input.answers[q.id];
      const isAnswered = typeof userSelected === 'number';
      const isCorrect = isAnswered && userSelected === q.correctOptionIndex;

      let marksAwarded = 0;
      if (isCorrect) {
        marksAwarded = q.marks;
        achievedScore += q.marks;
      }

      let parsedOptions: string[] = [];
      try {
        parsedOptions = JSON.parse(q.options);
      } catch {
        parsedOptions = [];
      }

      breakdown.push({
        questionId: q.id,
        section: q.section,
        questionText: q.questionText,
        options: parsedOptions,
        selectedOptionIndex: isAnswered ? userSelected : null,
        correctOptionIndex: q.correctOptionIndex,
        isCorrect,
        marksAwarded,
        explanation: q.explanation,
      });
    }

    const percentage = totalMarks > 0 ? Math.round((achievedScore / totalMarks) * 100) : 0;

    const attempt = await prisma.studentMockAttempt.create({
      data: {
        studentProfileId: profile.id,
        mockTestId: test.id,
        score: achievedScore,
        totalMarks,
        percentage,
        timeSpentSeconds: input.timeSpentSeconds,
        answers: JSON.stringify(input.answers),
        status: 'COMPLETED',
        completedAt: new Date(),
      },
    });

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'MOCK_TEST_COMPLETED',
        details: JSON.stringify({
          attemptId: attempt.id,
          testId: test.id,
          examCode: test.exam.code,
          score: achievedScore,
          percentage,
        }),
        ipAddress: ipAddress || null,
      },
    });

    return {
      id: attempt.id,
      mockTestId: test.id,
      mockTestTitle: test.title,
      examName: test.exam.name,
      score: achievedScore,
      totalMarks,
      percentage,
      timeSpentSeconds: input.timeSpentSeconds,
      completedAt: attempt.completedAt?.toISOString() || new Date().toISOString(),
      breakdown,
    };
  }

  /**
   * Get student's past mock attempts.
   */
  static async getStudentMockAttempts(userId: string) {
    const profile = await prisma.studentProfile.findUnique({
      where: { userId },
    });

    if (!profile) return [];

    const attempts = await prisma.studentMockAttempt.findMany({
      where: { studentProfileId: profile.id },
      include: {
        mockTest: {
          include: { exam: true },
        },
      },
      orderBy: { completedAt: 'desc' },
    });

    return attempts.map((a) => ({
      id: a.id,
      mockTestId: a.mockTestId,
      mockTestTitle: a.mockTest.title,
      examCode: a.mockTest.exam.code,
      examName: a.mockTest.exam.name,
      score: a.score,
      totalMarks: a.totalMarks,
      percentage: a.percentage,
      timeSpentSeconds: a.timeSpentSeconds,
      completedAt: a.completedAt?.toISOString() || a.createdAt.toISOString(),
    }));
  }

  /**
   * Counsellor / Admin review endpoint for a student's exam plan.
   */
  static async getStudentExamPlanByProfileId(studentProfileId: string) {
    const plans = await prisma.studentExamPlan.findMany({
      where: { studentProfileId },
      include: { exam: true },
      orderBy: { updatedAt: 'desc' },
    });

    const mockAttempts = await prisma.studentMockAttempt.findMany({
      where: { studentProfileId },
      include: { mockTest: { include: { exam: true } } },
      orderBy: { completedAt: 'desc' },
    });

    return {
      plans: plans.map((p) => ({
        id: p.id,
        examCode: p.exam.code,
        examName: p.exam.name,
        category: p.exam.category,
        status: p.status,
        targetDate: p.targetDate,
        targetScore: p.targetScore,
        currentScore: p.currentScore,
        notes: p.notes,
        updatedAt: p.updatedAt.toISOString(),
      })),
      mockAttempts: mockAttempts.map((a) => ({
        id: a.id,
        testTitle: a.mockTest.title,
        examName: a.mockTest.exam.name,
        score: a.score,
        totalMarks: a.totalMarks,
        percentage: a.percentage,
        timeSpentSeconds: a.timeSpentSeconds,
        completedAt: a.completedAt?.toISOString(),
      })),
    };
  }
}
