import { prisma } from '../../shared/database/prisma.service';
import {
  CollegeExamRequirement,
  ExamIntelligenceOverview,
  ExamDeadlineItem,
  PreparationPlanResponse,
  PreparationPathMilestone,
  MockTestTakingPayload,
  MockTestEvaluationResult,
} from './exam-intelligence.types';

export class ExamIntelligenceService {
  /**
   * Helper to retrieve verified or active student profile
   */
  public static async getStudentProfileByUserId(userId: string) {
    const profile = await prisma.studentProfile.findUnique({
      where: { userId },
      include: {
        preference: true,
        savedInstitutions: {
          include: {
            institution: {
              include: {
                courses: true,
              },
            },
          },
        },
        savedCourses: {
          include: {
            course: {
              include: {
                institution: true,
              },
            },
          },
        },
        examPlans: {
          include: {
            exam: true,
          },
        },
        mockAttempts: {
          include: {
            mockTest: {
              include: {
                exam: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    return profile;
  }

  /**
   * Step 1: Identify exams required by selected colleges + destination/stream recommendations
   */
  public static async getIntelligenceOverview(userId: string): Promise<ExamIntelligenceOverview> {
    const profile = await this.getStudentProfileByUserId(userId);

    // 1. Fetch all active entrance exams
    const allExams = await prisma.entranceExam.findMany({
      orderBy: { code: 'asc' },
    });

    const collegeRequirementsMap = new Map<string, CollegeExamRequirement>();
    const requiredExamCodesSet = new Set<string>();

    // 2. Process student's saved institutions
    if (profile?.savedInstitutions) {
      for (const item of profile.savedInstitutions) {
        const inst = item.institution;
        if (!inst) continue;

        const reqsForInst = new Set<string>();
        const coursesSummary: CollegeExamRequirement['courses'] = [];

        // Check courses of this institution
        for (const crs of inst.courses || []) {
          let reqExams: string[] = [];
          if (crs.entranceExamsRequired) {
            try {
              reqExams = JSON.parse(crs.entranceExamsRequired);
            } catch {
              reqExams = [crs.entranceExamsRequired];
            }
          }

          reqExams.forEach((code) => {
            const normalized = code.trim().toUpperCase().replace(/\s+/g, '_');
            reqsForInst.add(normalized);
            requiredExamCodesSet.add(normalized);
          });

          coursesSummary.push({
            courseId: crs.id,
            courseName: crs.name,
            department: crs.department,
            level: crs.level,
            entranceExamsRequired: reqExams,
          });
        }

        // If institution requires SAT explicitly or has avgSatRequirement
        if (inst.avgSatRequirement && inst.avgSatRequirement > 0) {
          reqsForInst.add('SAT');
          requiredExamCodesSet.add('SAT');
        }

        collegeRequirementsMap.set(inst.id, {
          institutionId: inst.id,
          institutionName: inst.name,
          country: inst.country,
          city: inst.city,
          avgSatRequirement: inst.avgSatRequirement,
          minPercentageRequirement: inst.minPercentageRequirement,
          courses: coursesSummary,
          allRequiredExams: Array.from(reqsForInst),
        });
      }
    }

    // 3. Process student's saved courses directly
    if (profile?.savedCourses) {
      for (const item of profile.savedCourses) {
        const crs = item.course;
        const inst = crs?.institution;
        if (!crs || !inst) continue;

        let reqExams: string[] = [];
        if (crs.entranceExamsRequired) {
          try {
            reqExams = JSON.parse(crs.entranceExamsRequired);
          } catch {
            reqExams = [crs.entranceExamsRequired];
          }
        }

        reqExams.forEach((code) => {
          const normalized = code.trim().toUpperCase().replace(/\s+/g, '_');
          requiredExamCodesSet.add(normalized);
        });

        if (!collegeRequirementsMap.has(inst.id)) {
          collegeRequirementsMap.set(inst.id, {
            institutionId: inst.id,
            institutionName: inst.name,
            country: inst.country,
            city: inst.city,
            avgSatRequirement: inst.avgSatRequirement,
            minPercentageRequirement: inst.minPercentageRequirement,
            courses: [
              {
                courseId: crs.id,
                courseName: crs.name,
                department: crs.department,
                level: crs.level,
                entranceExamsRequired: reqExams,
              },
            ],
            allRequiredExams: reqExams,
          });
        }
      }
    }

    // 4. Student preferred destinations and department matching
    const preferredCountries: string[] = [];
    if (profile?.preference?.countries) {
      try {
        const parsed = JSON.parse(profile.preference.countries);
        if (Array.isArray(parsed)) preferredCountries.push(...parsed);
      } catch {
        preferredCountries.push(profile.preference.countries);
      }
    }

    // Map which institutions require each exam
    const recommendedExams = allExams.map((exam) => {
      let dests: string[] = [];
      let streams: string[] = [];
      try {
        dests = JSON.parse(exam.destinations);
      } catch {
        dests = [exam.destinations];
      }
      try {
        streams = JSON.parse(exam.relevantStreams);
      } catch {
        streams = [exam.relevantStreams];
      }

      // Check which shortlisted institutions require this exam
      const requiredByInstitutions: string[] = [];
      for (const [_, collegeReq] of collegeRequirementsMap) {
        const matches = collegeReq.allRequiredExams.some(
          (reqCode) =>
            reqCode.toUpperCase() === exam.code.toUpperCase() ||
            exam.name.toUpperCase().includes(reqCode.toUpperCase())
        );
        if (matches) {
          requiredByInstitutions.push(collegeReq.institutionName);
        }
      }

      return {
        examId: exam.id,
        code: exam.code,
        name: exam.name,
        category: exam.category,
        destinations: dests,
        relevantStreams: streams,
        requiredByInstitutions,
        hasMockTest: exam.hasMockTest,
        format: exam.format,
        durationMinutes: exam.totalDurationMinutes,
        scoreRange: exam.scoreRange,
        validity: exam.validity,
        officialWebsiteUrl: exam.officialWebsiteUrl,
      };
    });

    // 5. Build unified chronological deadline checklist
    const upcomingDeadlines: ExamDeadlineItem[] = [];
    for (const exam of allExams) {
      if (exam.importantDates) {
        try {
          const dates = JSON.parse(exam.importantDates);
          if (Array.isArray(dates)) {
            for (const d of dates) {
              upcomingDeadlines.push({
                examCode: exam.code,
                examName: exam.name,
                label: d.label || 'Upcoming Window',
                date: d.date || 'To be announced',
                deadline: d.deadline,
                officialUrl: exam.officialWebsiteUrl,
              });
            }
          }
        } catch {
          // ignore parsing error
        }
      }
    }

    // 6. Student plan summary
    const plans = profile?.examPlans || [];
    const studentPlanSummary = {
      totalPlanned: plans.filter((p) => p.status === 'PLANNED').length,
      totalPreparing: plans.filter((p) => p.status === 'PREPARING').length,
      totalRegistered: plans.filter((p) => p.status === 'REGISTERED').length,
      totalCompleted: plans.filter((p) => p.status === 'COMPLETED').length,
    };

    return {
      totalRequiredExamsCount: requiredExamCodesSet.size,
      shortlistedCollegesCount: collegeRequirementsMap.size,
      collegeRequirements: Array.from(collegeRequirementsMap.values()),
      recommendedExams,
      studentPlanSummary,
      upcomingDeadlines,
    };
  }

  /**
   * Step 3: Structured Preparation Path & Study Guidance
   */
  public static async getPreparationPlan(
    examId: string,
    userId?: string,
    targetWeeks = 8
  ): Promise<PreparationPlanResponse> {
    const exam = await prisma.entranceExam.findUnique({
      where: { id: examId },
    });

    if (!exam) {
      const err: any = new Error('Entrance exam not found.');
      err.statusCode = 404;
      throw err;
    }

    let recommendedBooks: string[] = [];
    let prepResources: { title: string; type: string; url?: string }[] = [];
    let testDayTips: string[] = [];

    try {
      if (exam.recommendedBooks) recommendedBooks = JSON.parse(exam.recommendedBooks);
    } catch {
      recommendedBooks = exam.recommendedBooks ? [exam.recommendedBooks] : [];
    }

    try {
      if (exam.prepResources) prepResources = JSON.parse(exam.prepResources);
    } catch {
      prepResources = [];
    }

    try {
      if (exam.testDayTips) testDayTips = JSON.parse(exam.testDayTips);
    } catch {
      testDayTips = exam.testDayTips ? [exam.testDayTips] : [];
    }

    // Check if user has an active plan
    let targetDate: string | undefined;
    let targetScore: string | undefined;
    if (userId) {
      const profile = await prisma.studentProfile.findUnique({ where: { userId } });
      if (profile) {
        const plan = await prisma.studentExamPlan.findUnique({
          where: {
            studentProfileId_examId: {
              studentProfileId: profile.id,
              examId: exam.id,
            },
          },
        });
        if (plan) {
          targetDate = plan.targetDate || undefined;
          targetScore = plan.targetScore || undefined;
        }
      }
    }

    // Generate structured preparation milestones
    const timeline: PreparationPathMilestone[] = [
      {
        week: 1,
        phase: 'Diagnostic & Baseline Evaluation',
        objective: 'Take the initial diagnostic mock test to identify baseline strengths and critical gaps.',
        tasks: [
          `Review official test format (${exam.format}) and section timings`,
          'Take full-length diagnostic mock test in untimed or timed setting',
          'Document error log by topic and difficulty level',
        ],
        recommendedResources: prepResources.slice(0, 1),
      },
      {
        week: 2,
        phase: 'Foundations & Concept Mastery',
        objective: 'Review core curriculum benchmarks, formulae, and fundamental grammar/verbal rules.',
        tasks: [
          `Study recommended books: ${recommendedBooks.slice(0, 2).join(', ') || 'Official Guide'}`,
          'Complete 50 foundational practice questions per section',
          'Establish daily 45-minute timed practice habit',
        ],
        recommendedResources: prepResources.slice(0, 2),
      },
      {
        week: 3,
        phase: 'Pacing & Sectional Drills',
        objective: 'Train time-management and test pacing to avoid running out of time in longer sections.',
        tasks: [
          'Execute timed sectional mini-drills with strict question timeouts',
          'Focus on eliminating distractor options under high pressure',
          'Review error log twice weekly with detailed explanations',
        ],
        recommendedResources: prepResources.slice(1, 3),
      },
      {
        week: 4,
        phase: 'Midpoint Practice Test & Calibration',
        objective: 'Gauge accuracy improvement and recalibrate target score milestones.',
        tasks: [
          'Take full-length Practice Test under authentic exam conditions',
          'Evaluate section-wise progress against baseline score',
          'Schedule guidance check-in with your assigned counsellor',
        ],
        recommendedResources: prepResources,
      },
      {
        week: 5,
        phase: 'Weak-Area Remediation & High-Yield Strategy',
        objective: 'Deep-dive into the lowest-scoring 20% of question types to maximize point return.',
        tasks: [
          'Target hardest question categories identified in error tracker',
          'Refine guessing and elimination heuristics',
          'Review advanced formulas and vocabulary flashcards',
        ],
        recommendedResources: prepResources.slice(0, 2),
      },
      {
        week: 6,
        phase: 'Official Portal Registration & Logistics',
        objective: 'Secure test date slot and prepare mandatory registration credentials.',
        tasks: [
          `Visit official registration portal: ${exam.officialWebsiteUrl}`,
          'Confirm valid ID document matches name spelling exactly',
          'Select test center with convenient travel logistics',
        ],
        recommendedResources: [{ title: 'Official Registration Portal', type: 'Portal', url: exam.officialWebsiteUrl }],
      },
      {
        week: 7,
        phase: 'Full Simulated Mocks & Stamina Training',
        objective: 'Replicate exact test-day timing, breaks, and mental stamina.',
        tasks: [
          'Complete final full-length timed mock test at the exact test hour',
          'Finalize time management strategy per section',
          'Keep score above target threshold',
        ],
        recommendedResources: prepResources,
      },
      {
        week: 8,
        phase: 'Test-Day Readiness & Final Polish',
        objective: 'Taper study volume, pack required gear, and maintain peak mental freshness.',
        tasks: [
          'Review Test-Day Tips: ' + (testDayTips[0] || 'Arrive 45 minutes early with valid identification'),
          'Verify admission ticket and approved calculator/pencils',
          'Ensure 8 hours of rest before the test morning',
        ],
        recommendedResources: [{ title: 'Test Day Guidelines', type: 'Guide', url: exam.officialWebsiteUrl }],
      },
    ];

    return {
      examId: exam.id,
      examCode: exam.code,
      examName: exam.name,
      targetDate,
      targetScore,
      recommendedBooks,
      prepResources,
      testDayTips,
      timeline,
    };
  }

  /**
   * Step 5: Load Timed Mock Test Payload (Anti-Cheat: Strips Answers & Explanations)
   */
  public static async getMockTestForTaking(testId: string): Promise<MockTestTakingPayload> {
    const mockTest = await prisma.mockTest.findUnique({
      where: { id: testId },
      include: {
        exam: true,
        questions: {
          orderBy: { orderIndex: 'asc' },
        },
      },
    });

    if (!mockTest) {
      const err: any = new Error('Mock test not found.');
      err.statusCode = 404;
      throw err;
    }

    const sectionsSet = new Set<string>();
    const safeQuestions = mockTest.questions.map((q) => {
      sectionsSet.add(q.section);
      let parsedOptions: string[] = [];
      try {
        parsedOptions = JSON.parse(q.options);
      } catch {
        parsedOptions = [q.options];
      }

      return {
        id: q.id,
        section: q.section,
        questionText: q.questionText,
        options: parsedOptions,
        marks: q.marks,
        orderIndex: q.orderIndex,
        // ANTI-CHEAT: correctOptionIndex and explanation are deliberately omitted here!
      };
    });

    return {
      id: mockTest.id,
      examId: mockTest.examId,
      examName: mockTest.exam.name,
      examCode: mockTest.exam.code,
      title: mockTest.title,
      description: mockTest.description,
      durationMinutes: mockTest.durationMinutes,
      totalMarks: mockTest.totalMarks,
      sections: Array.from(sectionsSet),
      questions: safeQuestions,
    };
  }

  /**
   * Step 5: Server-side Evaluation, Diagnostic Breakdown & Score Calculation
   */
  public static async evaluateMockTest(
    userId: string,
    testId: string,
    answers: Record<string, number>,
    timeSpentSeconds: number
  ): Promise<MockTestEvaluationResult> {
    const profile = await prisma.studentProfile.findUnique({ where: { userId } });
    if (!profile) {
      const err: any = new Error('Student profile not found. Please complete profile intake.');
      err.statusCode = 400;
      throw err;
    }

    const mockTest = await prisma.mockTest.findUnique({
      where: { id: testId },
      include: {
        exam: true,
        questions: {
          orderBy: { orderIndex: 'asc' },
        },
      },
    });

    if (!mockTest) {
      const err: any = new Error('Mock test not found.');
      err.statusCode = 404;
      throw err;
    }

    let totalScore = 0;
    let totalMarks = 0;

    const sectionStats = new Map<
      string,
      { totalQuestions: number; correctAnswers: number; marksObtained: number; totalMarks: number }
    >();

    const questionReview = mockTest.questions.map((q) => {
      totalMarks += q.marks;

      let options: string[] = [];
      try {
        options = JSON.parse(q.options);
      } catch {
        options = [q.options];
      }

      const selectedOptionIndex = answers[q.id] !== undefined ? answers[q.id] : null;
      const isCorrect = selectedOptionIndex === q.correctOptionIndex;
      const marksAwarded = isCorrect ? q.marks : 0;
      totalScore += marksAwarded;

      // Track section stats
      if (!sectionStats.has(q.section)) {
        sectionStats.set(q.section, {
          totalQuestions: 0,
          correctAnswers: 0,
          marksObtained: 0,
          totalMarks: 0,
        });
      }
      const s = sectionStats.get(q.section)!;
      s.totalQuestions += 1;
      s.totalMarks += q.marks;
      if (isCorrect) {
        s.correctAnswers += 1;
        s.marksObtained += q.marks;
      }

      return {
        questionId: q.id,
        section: q.section,
        questionText: q.questionText,
        options,
        selectedOptionIndex,
        correctOptionIndex: q.correctOptionIndex,
        isCorrect,
        marksAwarded,
        explanation: q.explanation,
      };
    });

    const percentage = totalMarks > 0 ? Math.round((totalScore / totalMarks) * 1000) / 10 : 0;

    const sectionBreakdown = Array.from(sectionStats.entries()).map(([section, stats]) => ({
      section,
      totalQuestions: stats.totalQuestions,
      correctAnswers: stats.correctAnswers,
      marksObtained: stats.marksObtained,
      totalMarks: stats.totalMarks,
      accuracyPercentage:
        stats.totalMarks > 0
          ? Math.round((stats.marksObtained / stats.totalMarks) * 1000) / 10
          : 0,
    }));

    let performanceVerdict: 'EXCELLENT' | 'GOOD' | 'NEEDS_IMPROVEMENT' = 'GOOD';
    const recommendations: string[] = [];

    if (percentage >= 80) {
      performanceVerdict = 'EXCELLENT';
      recommendations.push('Strong foundational and analytical mastery across tested domains.');
      recommendations.push('Focus on speed optimization and pacing under simulated conditions.');
    } else if (percentage >= 60) {
      performanceVerdict = 'GOOD';
      recommendations.push('Solid core comprehension; target sections with accuracy below 70%.');
      recommendations.push('Review question rationales for incorrect items to avoid recurring errors.');
    } else {
      performanceVerdict = 'NEEDS_IMPROVEMENT';
      recommendations.push('Review fundamental concepts using the recommended preparation books.');
      recommendations.push('Schedule a follow-up review with your educational counsellor.');
    }

    // Save StudentMockAttempt record
    const attempt = await prisma.studentMockAttempt.create({
      data: {
        studentProfileId: profile.id,
        mockTestId: mockTest.id,
        score: totalScore,
        totalMarks,
        percentage,
        timeSpentSeconds,
        answers: JSON.stringify(answers),
        status: 'COMPLETED',
      },
    });

    // Create AuditLog entry
    await prisma.auditLog.create({
      data: {
        userId,
        action: 'MOCK_TEST_EVALUATED',
        details: JSON.stringify({
          attemptId: attempt.id,
          mockTestId: mockTest.id,
          examCode: mockTest.exam.code,
          score: totalScore,
          totalMarks,
          percentage,
          timeSpentSeconds,
        }),
      },
    });

    return {
      attemptId: attempt.id,
      mockTestId: mockTest.id,
      mockTestTitle: mockTest.title,
      examCode: mockTest.exam.code,
      score: totalScore,
      totalMarks,
      percentage,
      timeSpentSeconds,
      status: 'COMPLETED',
      sectionBreakdown,
      questionReview,
      performanceVerdict,
      recommendations,
    };
  }

  /**
   * Step 6: Save or Update Student Exam Plan for Counsellor Follow-up
   */
  public static async saveExamPlan(
    userId: string,
    data: {
      examId: string;
      status?: string;
      targetDate?: string;
      targetScore?: string;
      notes?: string;
    }
  ) {
    const profile = await prisma.studentProfile.findUnique({ where: { userId } });
    if (!profile) {
      const err: any = new Error('Student profile not found. Please complete profile intake.');
      err.statusCode = 400;
      throw err;
    }

    const plan = await prisma.studentExamPlan.upsert({
      where: {
        studentProfileId_examId: {
          studentProfileId: profile.id,
          examId: data.examId,
        },
      },
      update: {
        status: data.status || 'PLANNED',
        targetDate: data.targetDate,
        targetScore: data.targetScore,
        notes: data.notes,
      },
      create: {
        studentProfileId: profile.id,
        examId: data.examId,
        status: data.status || 'PLANNED',
        targetDate: data.targetDate,
        targetScore: data.targetScore,
        notes: data.notes,
      },
      include: {
        exam: true,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'EXAM_PLAN_SAVED',
        details: JSON.stringify({
          planId: plan.id,
          examCode: plan.exam.code,
          status: plan.status,
          targetDate: plan.targetDate,
          targetScore: plan.targetScore,
        }),
      },
    });

    return plan;
  }

  /**
   * Update existing exam plan item
   */
  public static async updateExamPlan(
    userId: string,
    planId: string,
    data: {
      status?: string;
      targetDate?: string;
      targetScore?: string;
      currentScore?: string;
      notes?: string;
    }
  ) {
    const profile = await prisma.studentProfile.findUnique({ where: { userId } });
    if (!profile) {
      const err: any = new Error('Student profile not found.');
      err.statusCode = 400;
      throw err;
    }

    const existing = await prisma.studentExamPlan.findFirst({
      where: {
        id: planId,
        studentProfileId: profile.id,
      },
    });

    if (!existing) {
      const err: any = new Error('Exam plan record not found.');
      err.statusCode = 404;
      throw err;
    }

    const updated = await prisma.studentExamPlan.update({
      where: { id: planId },
      data: {
        status: data.status !== undefined ? data.status : existing.status,
        targetDate: data.targetDate !== undefined ? data.targetDate : existing.targetDate,
        targetScore: data.targetScore !== undefined ? data.targetScore : existing.targetScore,
        currentScore: data.currentScore !== undefined ? data.currentScore : existing.currentScore,
        notes: data.notes !== undefined ? data.notes : existing.notes,
      },
      include: {
        exam: true,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'EXAM_PLAN_UPDATED',
        details: JSON.stringify({
          planId: updated.id,
          examCode: updated.exam.code,
          status: updated.status,
          currentScore: updated.currentScore,
        }),
      },
    });

    return updated;
  }

  /**
   * Delete an exam plan item
   */
  public static async deleteExamPlan(userId: string, planId: string) {
    const profile = await prisma.studentProfile.findUnique({ where: { userId } });
    if (!profile) {
      const err: any = new Error('Student profile not found.');
      err.statusCode = 400;
      throw err;
    }

    const existing = await prisma.studentExamPlan.findFirst({
      where: {
        id: planId,
        studentProfileId: profile.id,
      },
    });

    if (!existing) {
      const err: any = new Error('Exam plan record not found.');
      err.statusCode = 404;
      throw err;
    }

    await prisma.studentExamPlan.delete({ where: { id: planId } });

    await prisma.auditLog.create({
      data: {
        userId,
        action: 'EXAM_PLAN_DELETED',
        details: JSON.stringify({ planId }),
      },
    });

    return { deleted: true };
  }

  /**
   * Counsellor / Staff Review of a Student's Exam Intelligence and Mock Performance
   */
  public static async getStudentIntelligenceForStaff(
    studentProfileId: string,
    staffUserId: string
  ) {
    const profile = await prisma.studentProfile.findUnique({
      where: { id: studentProfileId },
      include: {
        user: { select: { email: true, role: true } },
        preference: true,
        examPlans: {
          include: {
            exam: true,
          },
        },
        mockAttempts: {
          include: {
            mockTest: {
              include: {
                exam: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        savedInstitutions: {
          include: {
            institution: {
              include: {
                courses: true,
              },
            },
          },
        },
      },
    });

    if (!profile) {
      const err: any = new Error('Student profile not found.');
      err.statusCode = 404;
      throw err;
    }

    // Log staff access
    await prisma.auditLog.create({
      data: {
        userId: staffUserId,
        action: 'STAFF_REVIEWED_EXAM_INTELLIGENCE',
        details: JSON.stringify({
          studentProfileId,
          studentName: profile.fullName,
          studentEmail: profile.contactEmail,
        }),
      },
    });

    return {
      studentProfileId: profile.id,
      fullName: profile.fullName,
      email: profile.contactEmail,
      grade: profile.grade,
      board: profile.board,
      targetCountries: profile.preference?.countries,
      targetDepartment: profile.preference?.department,
      examPlans: profile.examPlans,
      mockAttempts: profile.mockAttempts,
      shortlistedInstitutionsCount: profile.savedInstitutions.length,
    };
  }
}
