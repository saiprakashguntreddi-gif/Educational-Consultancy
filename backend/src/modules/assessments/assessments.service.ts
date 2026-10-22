import { prisma } from '../../shared/database/prisma.service';
import {
  AssessmentPathwayCode,
  AssessmentPathwayDefinition,
  AccessCodeRecord,
  StudentAssessmentAttempt,
  DiagnosticReport,
  DimensionScore,
  CareerSuggestion,
  CounsellorIntegratedReview,
  CounsellorActionPlan,
} from './assessments.types';
import {
  ASSESSMENT_PATHWAYS_CATALOG,
  GLOBAL_ASSESSMENT_DISCLAIMER,
} from './assessments.data';
import crypto from 'crypto';

export class AssessmentsService {
  // In-memory persistent data stores (can seamlessly hydrate from/to SQLite or Prisma)
  private static accessCodesMap: Map<string, AccessCodeRecord> = new Map();
  private static attemptsMap: Map<string, StudentAssessmentAttempt> = new Map();
  private static reportsMap: Map<string, DiagnosticReport> = new Map();

  // Helper to initialize pre-seeded access codes for demonstration/testing
  public static ensurePreSeededCodes() {
    if (this.accessCodesMap.size > 0) return;

    const demoCodes: AccessCodeRecord[] = [
      {
        id: 'code-seed-001',
        code: 'SC-ASSESS-ALL',
        pathwayCode: 'ALL_PATHWAYS',
        createdByCounsellorId: 'counsellor-master',
        createdByName: 'Senior Academic Counsellor',
        maxUses: 100,
        usedCount: 0,
        status: 'ACTIVE',
        notes: 'Universal demo access code for all 8 pathways',
        expiresAt: new Date(Date.now() + 90 * 86400000).toISOString(),
        createdAt: new Date().toISOString(),
      },
      {
        id: 'code-seed-002',
        code: 'SC-STREAM-10',
        pathwayCode: 'POST_10TH_STREAM',
        assignedToStudentEmail: 'student.demo@superconsciousness.com',
        createdByCounsellorId: 'counsellor-master',
        createdByName: 'Senior Academic Counsellor',
        maxUses: 5,
        usedCount: 0,
        status: 'ACTIVE',
        notes: 'Assigned for post-10th stream selection guidance',
        expiresAt: new Date(Date.now() + 30 * 86400000).toISOString(),
        createdAt: new Date().toISOString(),
      },
      {
        id: 'code-seed-003',
        code: 'SC-ENGG-2026',
        pathwayCode: 'ENGINEERING_BRANCH',
        createdByCounsellorId: 'counsellor-master',
        createdByName: 'Senior Engineering Counsellor',
        maxUses: 50,
        usedCount: 0,
        status: 'ACTIVE',
        notes: 'Engineering branch selector assessment token',
        expiresAt: new Date(Date.now() + 30 * 86400000).toISOString(),
        createdAt: new Date().toISOString(),
      },
      {
        id: 'code-seed-004',
        code: 'SC-STREAM-2026',
        pathwayCode: 'POST_10TH_STREAM',
        createdByCounsellorId: 'counsellor-master',
        createdByName: 'Senior Academic Counsellor',
        maxUses: 100,
        usedCount: 0,
        status: 'ACTIVE',
        notes: 'Post-10th stream selector assessment token',
        expiresAt: new Date(Date.now() + 60 * 86400000).toISOString(),
        createdAt: new Date().toISOString(),
      },
    ];

    demoCodes.forEach((c) => this.accessCodesMap.set(c.code.toUpperCase(), c));
  }

  /**
   * 1. Counsellor Generates an Access Code
   */
  public static async generateAccessCode(input: {
    pathwayCode: AssessmentPathwayCode | 'ALL_PATHWAYS';
    assignedStudentEmail?: string;
    maxUses?: number;
    validityDays?: number;
    notes?: string;
    customCode?: string;
    counsellorUserId: string;
  }): Promise<AccessCodeRecord> {
    this.ensurePreSeededCodes();

    // Verify counsellor
    const counsellorUser = await prisma.user.findUnique({
      where: { id: input.counsellorUserId },
      select: { id: true, email: true, role: true },
    });

    const codeString = input.customCode
      ? input.customCode.trim().toUpperCase()
      : `SC-${input.pathwayCode.slice(0, 4)}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

    const days = input.validityDays && input.validityDays > 0 ? input.validityDays : 30;
    const expiresAt = new Date(Date.now() + days * 86400000).toISOString();

    let studentProfileId: string | undefined;
    if (input.assignedStudentEmail) {
      const studentUser = await prisma.user.findUnique({
        where: { email: input.assignedStudentEmail.trim().toLowerCase() },
        include: { studentProfile: true },
      });
      if (studentUser?.studentProfile) {
        studentProfileId = studentUser.studentProfile.id;
      }
    }

    const record: AccessCodeRecord = {
      id: `code-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      code: codeString,
      pathwayCode: input.pathwayCode,
      assignedToStudentEmail: input.assignedStudentEmail?.trim().toLowerCase(),
      assignedToStudentProfileId: studentProfileId,
      createdByCounsellorId: input.counsellorUserId,
      createdByName: counsellorUser?.email || 'Authorized Counsellor',
      maxUses: input.maxUses || 1,
      usedCount: 0,
      status: 'ACTIVE',
      notes: input.notes,
      expiresAt,
      createdAt: new Date().toISOString(),
    };

    this.accessCodesMap.set(codeString, record);

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: input.counsellorUserId,
        action: 'ASSESSMENT_ACCESS_CODE_GENERATED',
        details: JSON.stringify({ code: record.code, pathway: record.pathwayCode, maxUses: record.maxUses }),
      },
    }).catch(() => {});

    return record;
  }

  /**
   * 2. Verify and Unlock Access Code by Student
   */
  public static async verifyAndUnlockCode(code: string, studentUserId: string) {
    this.ensurePreSeededCodes();
    const cleanCode = code.trim().toUpperCase();
    const record = this.accessCodesMap.get(cleanCode);

    if (!record) {
      const err: any = new Error('Invalid assessment access code. Please verify with your counsellor.');
      err.statusCode = 404;
      throw err;
    }

    if (record.status !== 'ACTIVE') {
      const err: any = new Error(`This access code is ${record.status.toLowerCase()}.`);
      err.statusCode = 400;
      throw err;
    }

    if (new Date(record.expiresAt) < new Date()) {
      record.status = 'EXPIRED';
      const err: any = new Error('This access code has expired. Please request a new code from your counsellor.');
      err.statusCode = 400;
      throw err;
    }

    if (record.usedCount >= record.maxUses) {
      record.status = 'USED';
      const err: any = new Error('This access code has already reached its maximum usage limit.');
      err.statusCode = 400;
      throw err;
    }

    // Verify student ownership if bound to specific email
    const studentUser = await prisma.user.findUnique({
      where: { id: studentUserId },
      select: { email: true },
    });

    if (
      record.assignedToStudentEmail &&
      studentUser &&
      record.assignedToStudentEmail.toLowerCase() !== studentUser.email.toLowerCase()
    ) {
      const err: any = new Error('This access code was assigned to a different student account.');
      err.statusCode = 403;
      throw err;
    }

    return {
      valid: true,
      code: record.code,
      pathwayCode: record.pathwayCode,
      notes: record.notes,
      expiresAt: record.expiresAt,
    };
  }

  /**
   * 3. List All 8 Pathways with Student Attempt Status
   */
  public static async listPathways(studentUserId: string) {
    this.ensurePreSeededCodes();

    const studentProfile = studentUserId
      ? await prisma.studentProfile.findUnique({
          where: { userId: studentUserId },
          select: { id: true, fullName: true },
        })
      : null;

    const studentProfileId = studentProfile?.id || studentUserId;

    // Filter attempts for this student
    const studentAttempts = Array.from(this.attemptsMap.values()).filter(
      (a) => a.studentProfileId === studentProfileId || a.studentUserId === studentUserId
    );

    const pathwaysWithStatus = ASSESSMENT_PATHWAYS_CATALOG.map((def) => {
      const activeAttempt = studentAttempts.find(
        (a) => a.pathwayCode === def.code && a.status === 'IN_PROGRESS'
      );
      const completedAttempt = studentAttempts.find(
        (a) => a.pathwayCode === def.code && a.status === 'COMPLETED'
      );

      return {
        code: def.code,
        title: def.title,
        tagline: def.tagline,
        version: def.version,
        estimatedMinutes: def.estimatedMinutes,
        totalQuestions: def.questions.length,
        dimensions: def.dimensions,
        status: completedAttempt
          ? 'COMPLETED'
          : activeAttempt
          ? 'IN_PROGRESS'
          : 'AVAILABLE',
        activeAttemptId: activeAttempt?.id,
        currentQuestionIndex: activeAttempt?.currentQuestionIndex ?? 0,
        answeredCount: activeAttempt ? Object.keys(activeAttempt.answers).length : 0,
        latestReportId: completedAttempt?.report?.id,
        completedAt: completedAttempt?.completedAt,
      };
    });

    return {
      disclaimer: GLOBAL_ASSESSMENT_DISCLAIMER,
      pathways: pathwaysWithStatus,
    };
  }

  /**
   * 4. Get Pathway Definition with Full Questions and Instructions
   */
  public static getPathwayDefinition(code: AssessmentPathwayCode): AssessmentPathwayDefinition {
    const found = ASSESSMENT_PATHWAYS_CATALOG.find((p) => p.code === code);
    if (!found) {
      const err: any = new Error(`Assessment pathway '${code}' not found.`);
      err.statusCode = 404;
      throw err;
    }
    return found;
  }

  /**
   * 5. Start a New Attempt or Resume Incomplete Attempt
   */
  public static async startOrResumeAttempt(
    pathwayCode: AssessmentPathwayCode,
    studentUserId: string,
    accessCode?: string
  ): Promise<StudentAssessmentAttempt> {
    this.ensurePreSeededCodes();
    const def = this.getPathwayDefinition(pathwayCode);

    const profile = studentUserId
      ? await prisma.studentProfile.findUnique({
          where: { userId: studentUserId },
          select: { id: true },
        })
      : null;

    const profileId = profile?.id || studentUserId;

    // Check for existing in-progress attempt to resume
    const existing = Array.from(this.attemptsMap.values()).find(
      (a) =>
        a.pathwayCode === pathwayCode &&
        (a.studentProfileId === profileId || a.studentUserId === studentUserId) &&
        a.status === 'IN_PROGRESS'
    );

    if (existing) {
      return existing;
    }

    // If access code provided, validate and increment usage count
    let validCodeStr: string | undefined;
    if (accessCode) {
      const verified = await this.verifyAndUnlockCode(accessCode, studentUserId);
      validCodeStr = verified.code;
      const codeRecord = this.accessCodesMap.get(verified.code);
      if (codeRecord) {
        codeRecord.usedCount += 1;
        codeRecord.usedAt = new Date().toISOString();
        if (codeRecord.usedCount >= codeRecord.maxUses) {
          codeRecord.status = 'USED';
        }
      }
    }

    const newAttempt: StudentAssessmentAttempt = {
      id: `attempt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      studentProfileId: profileId,
      studentUserId,
      pathwayCode,
      assessmentVersion: def.version,
      accessCodeUsed: validCodeStr,
      status: 'IN_PROGRESS',
      currentQuestionIndex: 0,
      answers: {},
      timeSpentSeconds: 0,
      startedAt: new Date().toISOString(),
      lastSavedAt: new Date().toISOString(),
    };

    this.attemptsMap.set(newAttempt.id, newAttempt);

    return newAttempt;
  }

  /**
   * 6. Auto-Save In-Progress Attempt
   */
  public static async saveAttemptProgress(
    attemptId: string,
    studentUserId: string,
    payload: {
      currentQuestionIndex: number;
      answers: Record<string, string>;
      timeSpentSeconds: number;
    }
  ): Promise<StudentAssessmentAttempt> {
    const attempt = this.attemptsMap.get(attemptId);
    if (!attempt) {
      const err: any = new Error('Assessment attempt session not found.');
      err.statusCode = 404;
      throw err;
    }

    if (attempt.studentUserId !== studentUserId) {
      const err: any = new Error('Unauthorized attempt access.');
      err.statusCode = 403;
      throw err;
    }

    if (attempt.status === 'COMPLETED') {
      const err: any = new Error('Cannot update an already completed assessment attempt.');
      err.statusCode = 400;
      throw err;
    }

    attempt.currentQuestionIndex = payload.currentQuestionIndex;
    attempt.answers = { ...attempt.answers, ...payload.answers };
    attempt.timeSpentSeconds = payload.timeSpentSeconds;
    attempt.lastSavedAt = new Date().toISOString();

    return attempt;
  }

  /**
   * 7. Submit Attempt & Execute Deterministic Scoring Engine
   */
  public static async submitAttempt(
    attemptId: string,
    studentUserId: string,
    payload: {
      answers: Record<string, string>;
      timeSpentSeconds: number;
    }
  ): Promise<DiagnosticReport> {
    const attempt = this.attemptsMap.get(attemptId);
    if (!attempt) {
      const err: any = new Error('Assessment attempt session not found.');
      err.statusCode = 404;
      throw err;
    }

    if (attempt.studentUserId !== studentUserId) {
      const err: any = new Error('Unauthorized attempt submission.');
      err.statusCode = 403;
      throw err;
    }

    if (attempt.status === 'COMPLETED') {
      const err: any = new Error('This assessment attempt has already been submitted and completed.');
      err.statusCode = 400;
      throw err;
    }

    const def = this.getPathwayDefinition(attempt.pathwayCode);
    const finalAnswers = { ...attempt.answers, ...payload.answers };

    // 1. Compute multi-dimensional scores
    const rawScores: Record<string, number> = {};
    const maxPossibleScores: Record<string, number> = {};

    def.dimensions.forEach((d) => {
      rawScores[d.code] = 0;
      maxPossibleScores[d.code] = 0;
    });

    // Tally maximum possible scores
    def.questions.forEach((q) => {
      q.options.forEach((opt) => {
        Object.entries(opt.scoreWeights).forEach(([dim, weight]) => {
          if (maxPossibleScores[dim] !== undefined) {
            maxPossibleScores[dim] = Math.max(maxPossibleScores[dim], weight * 4);
          }
        });
      });

      // Tally student selected answers
      const chosenOptionId = finalAnswers[q.id];
      if (chosenOptionId) {
        const option = q.options.find((o) => o.id === chosenOptionId);
        if (option) {
          Object.entries(option.scoreWeights).forEach(([dim, weight]) => {
            if (rawScores[dim] !== undefined) {
              rawScores[dim] += weight;
            }
          });
        }
      }
    });

    // 2. Build DimensionScore array
    const dimensionScores: DimensionScore[] = def.dimensions.map((d) => {
      const raw = rawScores[d.code] || 0;
      const max = Math.max(maxPossibleScores[d.code] || 15, 12);
      const percentage = Math.min(Math.round((raw / max) * 100), 100);
      const band: 'HIGH' | 'MODERATE' | 'DEVELOPING' =
        percentage >= 70 ? 'HIGH' : percentage >= 45 ? 'MODERATE' : 'DEVELOPING';

      return {
        dimensionCode: d.code,
        label: d.label,
        rawScore: raw,
        maxScore: max,
        percentage,
        band,
        summary: `${d.label}: Scored ${percentage}% (${band} alignment). ${d.description}`,
      };
    });

    // Sort by percentage descending
    const sortedDimensions = [...dimensionScores].sort((a, b) => b.percentage - a.percentage);
    const dominantClusters = sortedDimensions.slice(0, 3).map((d) => d.label);

    // 3. Generate tailored recommendations & matching streams
    const { matchingStreams, careerSuggestions, keyStrengths, developmentAreas, counsellorDiscussionPrompts } =
      this.generatePathwayGuidance(def.code, sortedDimensions);

    const report: DiagnosticReport = {
      id: `report-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      attemptId: attempt.id,
      studentProfileId: attempt.studentProfileId,
      pathwayCode: def.code,
      pathwayTitle: def.title,
      version: def.version,
      completedAt: new Date().toISOString(),
      dimensions: dimensionScores,
      dominantClusters,
      matchingStreams,
      careerSuggestions,
      keyStrengths,
      developmentAreas,
      counsellorDiscussionPrompts,
      ethicsDisclaimer: def.limitationsDisclaimer,
    };

    // Update attempt
    attempt.status = 'COMPLETED';
    attempt.answers = finalAnswers;
    attempt.timeSpentSeconds = payload.timeSpentSeconds;
    attempt.completedAt = report.completedAt;
    attempt.report = report;

    this.reportsMap.set(report.id, report);

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: studentUserId,
        action: 'ASSESSMENT_COMPLETED',
        details: JSON.stringify({
          pathway: def.code,
          reportId: report.id,
          dominant: dominantClusters[0],
        }),
      },
    }).catch(() => {});

    return report;
  }

  /**
   * Helper to derive pathway guidance, streams, careers, and counsellor prompts
   */
  private static generatePathwayGuidance(
    code: AssessmentPathwayCode,
    topDims: DimensionScore[]
  ): {
    matchingStreams: string[];
    careerSuggestions: CareerSuggestion[];
    keyStrengths: string[];
    developmentAreas: string[];
    counsellorDiscussionPrompts: string[];
  } {
    const primaryDim = topDims[0]?.dimensionCode || '';
    const secondaryDim = topDims[1]?.dimensionCode || '';

    switch (code) {
      case 'LEARNING_STYLE':
        return {
          matchingStreams: ['Multimodal Academic Programs', 'Lab & Research Intensive Tracks', 'Interactive Project Seminars'],
          careerSuggestions: [
            { title: 'Interactive Learning & Instructional Design', industry: 'EdTech & Training', fitLevel: 'EXCELLENT', description: 'Leverages visual and kinesthetic models to train organizations.', typicalDegrees: ['BS Psychology', 'Instructional Design', 'Human-Computer Interaction'] },
            { title: 'Applied Research Scientist', industry: 'Scientific Research', fitLevel: 'STRONG', description: 'Combines lab fieldwork with in-depth literature synthesis.', typicalDegrees: ['BS Biology', 'BS Chemistry', 'BTech Biotechnology'] },
          ],
          keyStrengths: [
            `Dominant affinity for ${topDims[0]?.label || 'Visual'} intake (${topDims[0]?.percentage}%).`,
            `High retention when combining ${topDims[0]?.label} with ${topDims[1]?.label}.`,
            'Strong self-monitoring in structured study sessions.',
          ],
          developmentAreas: [
            'Practice note-taking under purely oral lecture environments without visual slides.',
            'Strengthen stamina for long-form textual reading comprehension.',
          ],
          counsellorDiscussionPrompts: [
            'Discuss note-taking frameworks (e.g. Cornell method or digital visual canvas) for college lectures.',
            'Evaluate university teaching formats: large lecture halls vs. interactive studio lab sessions.',
          ],
        };

      case 'POST_10TH_STREAM':
        return {
          matchingStreams: [
            'Science (Physics, Chemistry, Mathematics) with Computer Science',
            'Commerce with Applied Mathematics',
            'Integrated Economics & Data Sciences',
          ],
          careerSuggestions: [
            { title: 'Software Architect / Data Engineer', industry: 'Technology & AI', fitLevel: 'EXCELLENT', description: 'Design complex algorithms and computational pipelines.', typicalDegrees: ['BTech / BS Computer Science', 'BSc Data Science'] },
            { title: 'Quantitative Investment Analyst', industry: 'Finance & Banking', fitLevel: 'STRONG', description: 'Mathematical modeling of market movements and risk factors.', typicalDegrees: ['BSc Economics', 'BCom (Hons) with Math', 'BSc Financial Math'] },
            { title: 'Product Strategist & Technologist', industry: 'Technology Management', fitLevel: 'STRONG', description: 'Bridge technological implementation with market strategy.', typicalDegrees: ['Dual Degree BTech + MBA', 'BBA in Tech Management'] },
          ],
          keyStrengths: [
            `Top affinity for ${topDims[0]?.label} (${topDims[0]?.percentage}%).`,
            'Balanced aptitude in conceptual logic and quantitative modeling.',
            'Demonstrated motivation for analytical challenge.',
          ],
          developmentAreas: [
            'Build consistency in competitive exam time management (JEE / SAT / CUET).',
            'Maintain broad reading in humanities to enhance analytical essay writing.',
          ],
          counsellorDiscussionPrompts: [
            'Review target 11th/12th curriculum board (CBSE vs IB vs Cambridge) based on global university ambitions.',
            'Discuss 5th elective subject choice (Computer Science vs Physical Education vs Applied Math).',
          ],
        };

      case 'CAREER_PERSONALITY':
        return {
          matchingStreams: ['STEM & Research Majors', 'Technology Entrepreneurship', 'Strategic Advisory'],
          careerSuggestions: [
            { title: 'Systems Research Analyst', industry: 'Research & Consulting', fitLevel: 'EXCELLENT', description: 'Analyze complex organizational or technological systems.', typicalDegrees: ['BS / MS Computing', 'BTech Systems Engineering'] },
            { title: 'Tech Venture Lead / Product Manager', industry: 'Startups & Tech', fitLevel: 'STRONG', description: 'Lead cross-functional teams combining technical vision with market drive.', typicalDegrees: ['BTech + Minor in Business', 'BBA in Innovation'] },
          ],
          keyStrengths: [
            `Dominant Holland Code Profile: ${topDims.slice(0, 3).map((d) => d.dimensionCode.slice(0, 1)).join('')}.`,
            'High intrinsic drive to decompose problems analytically.',
            'Comfort with structured strategic decision-making.',
          ],
          developmentAreas: [
            'Practice pitching ideas to non-technical audiences to develop interpersonal persuasion.',
            'Balance thorough analysis with rapid decision execution.',
          ],
          counsellorDiscussionPrompts: [
            'Examine internship and shadowing opportunities matching your Holland triad profile.',
            'Identify universities with strong undergraduate research programs and startup incubators.',
          ],
        };

      case 'ENGINEERING_BRANCH':
        return {
          matchingStreams: ['Computer Science & AI', 'Electronics & VLSI Systems', 'Robotics & Automation'],
          careerSuggestions: [
            { title: 'AI & Machine Learning Engineer', industry: 'Artificial Intelligence', fitLevel: 'EXCELLENT', description: 'Build predictive neural architectures and cognitive agents.', typicalDegrees: ['BTech Computer Science (AI/ML)', 'BS Computing'] },
            { title: 'Robotics & Embedded Systems Specialist', industry: 'Hardware & Automation', fitLevel: 'STRONG', description: 'Program microcontrollers, robotic arms, and IoT devices.', typicalDegrees: ['BTech Mechatronics', 'BTech Electrical & Electronics'] },
          ],
          keyStrengths: [
            `High technical alignment with ${topDims[0]?.label} (${topDims[0]?.percentage}%).`,
            'Strong interest in software architecture and systemic problem solving.',
          ],
          developmentAreas: [
            'Engage in hands-on open source or hardware prototyping projects.',
            'Strengthen foundational physics and discrete mathematics.',
          ],
          counsellorDiscussionPrompts: [
            'Compare specialized branch admissions (e.g. Pure CS vs ECE with CS Minor).',
            'Evaluate college placement statistics and lab facilities in shortlisted institutions.',
          ],
        };

      case 'MANAGEMENT_COMMERCE':
        return {
          matchingStreams: ['Corporate Finance & Valuation', 'Management Consulting', 'Venture Creation'],
          careerSuggestions: [
            { title: 'Financial Analyst / Investment Associate', industry: 'Investment Banking & Capital Markets', fitLevel: 'EXCELLENT', description: 'Value companies, audit cash flows, and build financial models.', typicalDegrees: ['BBA Finance', 'BCom (Honours)', 'BSc Quantitative Economics'] },
            { title: 'Strategy Consultant', industry: 'Management Consulting', fitLevel: 'STRONG', description: 'Formulate growth strategies and optimize business operations.', typicalDegrees: ['BBA Strategy', 'Integrated MBA / MiM'] },
          ],
          keyStrengths: [
            `Top commercial instinct in ${topDims[0]?.label} (${topDims[0]?.percentage}%).`,
            'Strong intuition for business unit economics and consumer behavior.',
          ],
          developmentAreas: [
            'Build proficiency with spreadsheet modeling (Excel/Sheets) and financial metrics.',
            'Participate in business case competitions and mock stock portfolios.',
          ],
          counsellorDiscussionPrompts: [
            'Review international business school accreditation (AACSB / EQUIS).',
            'Discuss preparation for management entrance exams (IPMAT, SAT, GMAT pathways).',
          ],
        };

      case 'HUMANITIES_LAW_POLICY':
        return {
          matchingStreams: ['Constitutional & Corporate Law', 'Public Administration & Civil Services', 'International Diplomacy'],
          careerSuggestions: [
            { title: 'Corporate Attorney / Legal Counsel', industry: 'Legal Services & Advisory', fitLevel: 'EXCELLENT', description: 'Draft statutory contracts and advise corporations on regulatory compliance.', typicalDegrees: ['BA LLB (5-Yr Integrated)', 'BBA LLB', 'JD (Postgrad)'] },
            { title: 'Public Policy Analyst / Civil Servant', industry: 'Government & Think Tanks', fitLevel: 'STRONG', description: 'Draft civic legislation and evaluate national policy impacts.', typicalDegrees: ['BA Public Policy', 'BA Political Science', 'MPP'] },
          ],
          keyStrengths: [
            `High legal/sociopolitical reasoning in ${topDims[0]?.label} (${topDims[0]?.percentage}%).`,
            'Sharp analytical argumentation and ethical discernment.',
          ],
          developmentAreas: [
            'Refine speed-reading techniques for voluminous case law and policy texts.',
            'Engage in Model United Nations (MUN) and youth parliaments.',
          ],
          counsellorDiscussionPrompts: [
            'Analyze law entrance exam strategies (CLAT, AILET, LSAT Global).',
            'Examine dual-degree policy programs in India, the UK, and North America.',
          ],
        };

      case 'COGNITIVE_PROBLEM_SOLVING':
        return {
          matchingStreams: ['Quantitative Sciences', 'Computational Logic', 'Engineering Mathematics'],
          careerSuggestions: [
            { title: 'Algorithms & Computational Specialist', industry: 'Tech & Research', fitLevel: 'EXCELLENT', description: 'Solve hard mathematical optimization and cryptographic problems.', typicalDegrees: ['BSc Mathematics & Computing', 'BTech CS'] },
            { title: 'Risk Modeler / Actuary', industry: 'Insurance & Banking', fitLevel: 'STRONG', description: 'Compute probabilistic outcome matrices and catastrophic risk.', typicalDegrees: ['BSc Actuarial Science', 'BS Statistics'] },
          ],
          keyStrengths: [
            `Strongest cognitive index in ${topDims[0]?.label} (${topDims[0]?.percentage}%).`,
            'Consistent precision under deductive and numeric constraints.',
          ],
          developmentAreas: [
            'Build rapid mental calculation shortcuts for timed competitive exams.',
            'Balance analytical isolation with collaborative problem-solving.',
          ],
          counsellorDiscussionPrompts: [
            'Discuss targeted test-taking pacing strategies for SAT / JEE Advanced.',
            'Select academic competitions (e.g. Math Olympiad, Informatics Olympiad).',
          ],
        };

      default:
        return {
          matchingStreams: ['Interdisciplinary Higher Education'],
          careerSuggestions: [
            { title: 'Education & Career Advisory Specialist', industry: 'Consulting', fitLevel: 'EXCELLENT', description: 'Guides students through multi-disciplinary academic decision-making.', typicalDegrees: ['BA Psychology', 'BS Education'] },
          ],
          keyStrengths: [`High affinity in ${topDims[0]?.label || 'General Aptitude'}.`],
          developmentAreas: ['Continue broadening experiential project exploration.'],
          counsellorDiscussionPrompts: ['Synthesize findings across all assessments in follow-up session.'],
        };
    }
  }

  /**
   * 8. Retrieve Diagnostic Report with Authorization Check
   */
  public static async getReport(
    reportIdOrAttemptId: string,
    requestingUserId: string,
    requestingUserRole: string
  ): Promise<DiagnosticReport> {
    this.ensurePreSeededCodes();

    let report = this.reportsMap.get(reportIdOrAttemptId);
    if (!report) {
      // Try search by attemptId
      const attempt = this.attemptsMap.get(reportIdOrAttemptId);
      if (attempt?.report) {
        report = attempt.report;
      }
    }

    if (!report) {
      const err: any = new Error('Diagnostic report not found.');
      err.statusCode = 404;
      throw err;
    }

    // Role check: students can only view their own report
    if (requestingUserRole === 'STUDENT') {
      const studentProfile = await prisma.studentProfile.findUnique({
        where: { userId: requestingUserId },
        select: { id: true },
      });
      if (
        report.studentProfileId !== requestingUserId &&
        report.studentProfileId !== studentProfile?.id
      ) {
        const err: any = new Error('Unauthorized to view this student diagnostic report.');
        err.statusCode = 403;
        throw err;
      }
    }

    return report;
  }

  /**
   * 9. Counsellor Integrated Review: Combines Assessment Report with Academics, Preferences & Shortlists
   */
  public static async getCounsellorIntegratedReview(
    studentProfileId: string
  ): Promise<CounsellorIntegratedReview> {
    this.ensurePreSeededCodes();

    const profile = await prisma.studentProfile.findUnique({
      where: { id: studentProfileId },
      include: {
        user: { select: { email: true } },
        preference: true,
        education: true,
        examPlans: true,
        savedInstitutions: true,
        savedCourses: true,
      },
    });

    if (!profile) {
      const err: any = new Error('Student profile record not found.');
      err.statusCode = 404;
      throw err;
    }

    // Collect all reports for this student
    const studentReports = Array.from(this.reportsMap.values()).filter(
      (r) => r.studentProfileId === profile.id || r.studentProfileId === profile.userId
    );

    const inProgressAttempts = Array.from(this.attemptsMap.values()).filter(
      (a) =>
        (a.studentProfileId === profile.id || a.studentUserId === profile.userId) &&
        a.status === 'IN_PROGRESS'
    );

    let prefCountries: string[] = [];
    if (profile.preference?.countries) {
      try {
        prefCountries = JSON.parse(profile.preference.countries);
      } catch {
        prefCountries = [profile.preference.countries];
      }
    }

    return {
      studentProfile: {
        id: profile.id,
        fullName: profile.fullName,
        email: profile.contactEmail || profile.user.email,
        grade: profile.grade,
        board: profile.board,
        citizenship: profile.citizenship,
        verificationStatus: profile.verificationStatus,
      },
      preferences: profile.preference
        ? {
            primaryCountry: profile.preference.primaryCountry || undefined,
            countries: prefCountries,
            department: profile.preference.department,
            subDepartment: profile.preference.subDepartment,
          }
        : undefined,
      education: profile.education
        ? {
            tenthPercentage: profile.education.tenthPercentage ?? undefined,
            twelfthPercentage: profile.education.percentage,
          }
        : undefined,
      entranceExamsTracked: profile.examPlans.length,
      shortlistedCollegesCount: (profile.savedInstitutions?.length || 0) + (profile.savedCourses?.length || 0),
      assessmentsCompleted: studentReports,
      inProgressAttemptsCount: inProgressAttempts.length,
    };
  }

  /**
   * 10. Counsellor Attaches Discussion Points & Action Plan to a Report
   */
  public static async saveCounsellorActionPlan(
    reportId: string,
    counsellorUserId: string,
    input: {
      discussionPoints: string[];
      actionMilestones: {
        title: string;
        targetDeadline?: string;
        status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
      }[];
      summaryNotes: string;
    }
  ): Promise<DiagnosticReport> {
    const report = this.reportsMap.get(reportId);
    if (!report) {
      const err: any = new Error('Diagnostic report not found.');
      err.statusCode = 404;
      throw err;
    }

    const counsellor = await prisma.user.findUnique({
      where: { id: counsellorUserId },
      select: { email: true },
    });

    const actionPlan: CounsellorActionPlan = {
      counsellorId: counsellorUserId,
      counsellorName: counsellor?.email || 'Certified Counsellor',
      reviewedAt: new Date().toISOString(),
      discussionPoints: input.discussionPoints.filter(Boolean),
      actionMilestones: input.actionMilestones.map((m, idx) => ({
        id: `ms-${idx + 1}-${Date.now()}`,
        title: m.title.trim(),
        targetDeadline: m.targetDeadline,
        status: m.status || 'PENDING',
      })),
      summaryNotes: input.summaryNotes.trim(),
    };

    report.counsellorActionPlan = actionPlan;

    // Update in attempt cache as well
    const attempt = this.attemptsMap.get(report.attemptId);
    if (attempt) {
      attempt.report = report;
    }

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: counsellorUserId,
        action: 'ASSESSMENT_COUNSELLOR_ACTION_PLAN_SAVED',
        details: JSON.stringify({
          reportId: report.id,
          studentProfileId: report.studentProfileId,
          milestonesCount: actionPlan.actionMilestones.length,
        }),
      },
    }).catch(() => {});

    return report;
  }

  /**
   * 11. List All Generated Access Codes (Counsellor Tooling)
   */
  public static listAccessCodes(counsellorUserId?: string): AccessCodeRecord[] {
    this.ensurePreSeededCodes();
    const codes = Array.from(this.accessCodesMap.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    return codes;
  }
}
