import { prisma } from '../shared/database/prisma.service';
import { hashPassword } from '../shared/utils/password';
import { Role } from '../config/roles';

const API_BASE = 'http://localhost:5000/api/v1';
const FRONTEND_BASE = 'http://localhost:3000';

async function request(url: string, options: { method?: string; body?: any; headers?: Record<string, string> } = {}) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };
  const res = await fetch(url, {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  let data: any = null;
  const text = await res.text();
  try {
    data = JSON.parse(text);
  } catch {
    data = text;
  }
  return { status: res.status, ok: res.ok, data };
}

async function testFullSuite() {
  console.log('================================================================');
  console.log(' MODULE 11: FULL INTEGRATION & VERIFICATION SUITE');
  console.log('================================================================');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, desc: string) {
    if (condition) {
      console.log(`[PASS] ${desc}`);
      passed++;
    } else {
      console.error(`[FAIL] ${desc}`);
      failed++;
    }
  }

  // 1. Verify Frontend Server
  try {
    const feRes = await request(FRONTEND_BASE);
    assert(feRes.status === 200 && typeof feRes.data === 'string' && feRes.data.includes('<div id="root">'), 'Frontend server is active on port 3000 and serves root HTML');
  } catch (err: any) {
    assert(false, `Frontend server check failed: ${err.message}`);
  }

  // 2. Setup Student & Counsellor Users
  const studentEmail = 'student.m11test@superconsciousness.com';
  const counsellorEmail = 'counsellor.m11test@superconsciousness.internal';
  const passwordHash = await hashPassword('Password123!');

  const studentUser = await prisma.user.upsert({
    where: { email: studentEmail },
    update: { isActive: true, isEmailVerified: true },
    create: {
      email: studentEmail,
      passwordHash,
      role: Role.STUDENT,
      isActive: true,
      isEmailVerified: true,
    },
  });

  const studentProfile = await prisma.studentProfile.upsert({
    where: { userId: studentUser.id },
    update: {},
    create: {
      userId: studentUser.id,
      fullName: 'Maya Sharma',
      gender: 'FEMALE',
      grade: '11',
      contactEmail: studentEmail,
      phone: '+91-9876543210',
      addressStreet: '12 Linking Road',
      addressCity: 'Mumbai',
      addressState: 'Maharashtra',
      addressPostalCode: '400050',
      addressCountry: 'India',
      board: 'CBSE',
      citizenship: 'Indian',
      passingOutYear: 2026,
      verificationStatus: 'VERIFIED',
    },
  });

  await prisma.user.upsert({
    where: { email: counsellorEmail },
    update: { isActive: true, isEmailVerified: true },
    create: {
      email: counsellorEmail,
      passwordHash,
      role: Role.COUNSELLOR,
      isActive: true,
      isEmailVerified: true,
    },
  });

  // Login both
  const studentLogin = await request(`${API_BASE}/auth/login`, {
    method: 'POST',
    body: { email: studentEmail, password: 'Password123!' },
  });
  const studentToken = studentLogin.data?.data?.tokens?.accessToken;
  const studentAuth = { headers: { Authorization: `Bearer ${studentToken}` } };

  const counsellorLogin = await request(`${API_BASE}/auth/login`, {
    method: 'POST',
    body: { email: counsellorEmail, password: 'Password123!' },
  });
  const counsellorToken = counsellorLogin.data?.data?.tokens?.accessToken;
  const counsellorAuth = { headers: { Authorization: `Bearer ${counsellorToken}` } };

  assert(Boolean(studentToken && counsellorToken), 'Student and Counsellor authentication successful');

  // 3. Test Catalog of 8 Pathways
  const catalogRes = await request(`${API_BASE}/assessments/pathways`, studentAuth);
  console.log('catalogRes status:', catalogRes.status, 'body:', JSON.stringify(catalogRes.data));
  assert(catalogRes.data?.success === true, 'Catalog API returned success');
  assert(catalogRes.data.data.pathways.length === 8, `Catalog contains all 8 required pathways (found: ${catalogRes.data.data.pathways.length})`);
  assert(typeof catalogRes.data.data.disclaimer === 'string', 'Ethical and guidance disclaimer is present in catalog response');

  const expectedPathways = [
    'LEARNING_STYLE',
    'POST_10TH_STREAM',
    'CAREER_PERSONALITY',
    'MULTIPLE_INTELLIGENCES',
    'ENGINEERING_BRANCH',
    'MANAGEMENT_COMMERCE',
    'HUMANITIES_LAW_POLICY',
    'COGNITIVE_PROBLEM_SOLVING',
  ];

  for (const code of expectedPathways) {
    const detail = await request(`${API_BASE}/assessments/pathways/${code}`, studentAuth);
    assert(detail.data?.success && detail.data.data.questions.length >= 3, `Pathway ${code} detail loaded with ${detail.data.data.questions.length} questions`);
  }

  // 4. Test Access Code Validation & Generation
  // 4a. Seeded access code
  const verifySeeded = await request(`${API_BASE}/assessments/access-codes/verify`, {
    method: 'POST',
    body: { code: 'SC-STREAM-2026' },
    ...studentAuth,
  });
  assert(verifySeeded.data?.success && verifySeeded.data.data?.valid, 'Seeded code SC-STREAM-2026 successfully verified');

  // 4b. Invalid code
  const verifyBad = await request(`${API_BASE}/assessments/access-codes/verify`, {
    method: 'POST',
    body: { code: 'INVALID-CODE-999' },
    ...studentAuth,
  });
  assert(!verifyBad.ok || (verifyBad.data && !verifyBad.data.data?.valid), 'Invalid code correctly rejected');

  // 4c. Counsellor generates controlled access code
  const genRes = await request(`${API_BASE}/assessments/access-codes/generate`, {
    method: 'POST',
    body: {
      pathwayCode: 'ENGINEERING_BRANCH',
      assignedStudentEmail: studentEmail,
      validityDays: 14,
      maxUses: 1,
      notes: 'Assigning to Maya for branch specialization analysis.',
    },
    ...counsellorAuth,
  });
  assert(genRes.data?.success && Boolean(genRes.data.data?.code), `Counsellor generated access code: ${genRes.data?.data?.code}`);
  const dynamicCode = genRes.data.data.code;

  // 5. Student Starts Assessment, Navigates, Autosaves Progress
  const startRes = await request(`${API_BASE}/assessments/attempts/ENGINEERING_BRANCH/start`, {
    method: 'POST',
    body: { accessCode: dynamicCode },
    ...studentAuth,
  });
  assert(startRes.data?.success && Boolean(startRes.data.data?.id), 'Student assessment attempt successfully started');
  const attemptId = startRes.data.data.id;

  // 5b. Autosave progress (simulate answering questions one by one)
  const saveProgress1 = await request(`${API_BASE}/assessments/attempts/${attemptId}/save-progress`, {
    method: 'POST',
    body: {
      currentQuestionIndex: 1,
      answers: { eng_q1: 'e1_a' },
      timeSpentSeconds: 45,
    },
    ...studentAuth,
  });
  console.log('saveProgress1 status:', saveProgress1.status, 'body:', JSON.stringify(saveProgress1.data));
  assert(saveProgress1.data?.success && Object.keys(saveProgress1.data.data?.answers || {}).length === 1, 'Question 1 autosaved successfully');

  const saveProgress2 = await request(`${API_BASE}/assessments/attempts/${attemptId}/save-progress`, {
    method: 'POST',
    body: {
      currentQuestionIndex: 2,
      answers: {
        eng_q1: 'e1_a',
        eng_q2: 'e2_a',
        eng_q3: 'e3_a',
      },
      timeSpentSeconds: 120,
    },
    ...studentAuth,
  });
  assert(saveProgress2.data?.success && Object.keys(saveProgress2.data.data?.answers || {}).length === 3, 'Progress updated with 3 answered questions');

  // 6. Submit Assessment & Verify Diagnostic Report
  const submitRes = await request(`${API_BASE}/assessments/attempts/${attemptId}/submit`, {
    method: 'POST',
    body: {
      answers: {
        eng_q1: 'e1_a',
        eng_q2: 'e2_a',
        eng_q3: 'e3_a',
      },
      timeSpentSeconds: 150,
    },
    ...studentAuth,
  });
  assert(submitRes.data?.success && Boolean(submitRes.data.data?.id), 'Assessment successfully submitted and report generated');
  const report = submitRes.data.data;

  // Verify Report Contents
  assert(Array.isArray(report.dimensions) && report.dimensions.length > 0 && typeof report.dimensions[0].percentage === 'number', `Report contains valid dimension breakdown with percentage scores (e.g. ${report.dimensions[0].label}: ${report.dimensions[0].percentage}%)`);
  assert(Array.isArray(report.dominantClusters) && report.dominantClusters.length > 0, `Report identified dominant clusters: ${report.dominantClusters.join(', ')}`);
  assert(Array.isArray(report.matchingStreams) && report.matchingStreams.length > 0, `Report identified matching streams: ${report.matchingStreams.join(', ')}`);
  assert(Array.isArray(report.careerSuggestions) && report.careerSuggestions.length > 0, `Report provided career trajectories: ${report.careerSuggestions.map((c: any) => c.title).join(', ')}`);
  assert(Array.isArray(report.keyStrengths) && report.keyStrengths.length > 0, 'Report provides detailed strengths based on responses');
  assert(Array.isArray(report.counsellorDiscussionPrompts) && report.counsellorDiscussionPrompts.length > 0, 'Report provides counsellor discussion prompts');
  assert(Boolean(report.ethicsDisclaimer), 'Ethical guidance and disclaimer clearly included in report');

  // Prevent duplicate submissions
  const dupRes = await request(`${API_BASE}/assessments/attempts/${attemptId}/submit`, {
    method: 'POST',
    body: { answers: {}, timeSpentSeconds: 150 },
    ...studentAuth,
  });
  console.log('dupRes status:', dupRes.status, 'body:', JSON.stringify(dupRes.data));
  assert(!dupRes.ok || dupRes.status === 400 || dupRes.data?.success === false, 'Duplicate submission correctly prevented with HTTP 400');

  // 7. Counsellor Review & Action Plan Attachment
  const counsellorReview = await request(`${API_BASE}/assessments/counsellor/review/${studentProfile.id}`, counsellorAuth);
  assert(counsellorReview.data.success && counsellorReview.data.data.assessmentsCompleted.length >= 1, 'Counsellor retrieved student integrated assessment review');

  // Attach action plan
  const planRes = await request(`${API_BASE}/assessments/counsellor/reports/${report.id}/action-plan`, {
    method: 'POST',
    body: {
      discussionPoints: [
        'Focus on Computer Engineering fundamentals',
        'Target internships in algorithms and system architecture',
      ],
      actionMilestones: [
        {
          title: 'Review Tier-1 college options for Computer Engineering',
          targetDeadline: '2026-11-15',
          status: 'IN_PROGRESS',
        },
        {
          title: 'Register for entrance exam mock series',
          targetDeadline: '2026-12-01',
          status: 'PENDING',
        },
      ],
      summaryNotes: 'Maya demonstrated outstanding logical and architectural affinity towards CS and AI systems.',
    },
    ...counsellorAuth,
  });
  assert(planRes.data.success && planRes.data.data.counsellorActionPlan?.actionMilestones.length === 2, 'Counsellor action plan successfully attached and persisted');

  // 8. Regression Verification: Check Module 9 (Fees & College Tiers) & Module 10 (Exam Intelligence)
  const tierRes = await request(`${API_BASE}/fees/tier-summary`, studentAuth);
  assert(tierRes.status === 200 && tierRes.data?.success === true, 'Module 9 (Fees & College Tiers) API is healthy and operational');

  const examRes = await request(`${API_BASE}/exam-intelligence/overview`, studentAuth);
  assert(examRes.status === 200 && examRes.data?.success === true, 'Module 10 (Exam Intelligence) API is healthy and operational');

  console.log('================================================================');
  console.log(` RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

testFullSuite()
  .catch((err) => {
    console.error('Test suite uncaught error:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
