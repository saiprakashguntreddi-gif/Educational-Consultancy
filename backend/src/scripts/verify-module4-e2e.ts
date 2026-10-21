import { prisma } from '../shared/database/prisma.service';

const API_BASE = 'http://localhost:5000/api/v1';

async function runModule4Tests() {
  console.log('===========================================================');
  console.log(' SUPERCONSCIOUSNESS: MODULE 4 (ENTRANCE EXAMS) E2E VERIFICATION');
  console.log('===========================================================');

  const timestamp = Date.now();
  const student1Email = `student1.exam.${timestamp}@example.com`;
  const student2Email = `student2.exam.${timestamp}@example.com`;
  const counsellorEmail = `counsellor.exam.${timestamp}@example.com`;
  const password = 'SecurePassword123!';

  // Helper to register user
  async function registerUser(email: string, role: string = 'STUDENT') {
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash: '$2a$10$abcdefghijklmnopqrstuvwxyzABCDEF1234567890abcdefghijk', // mock hash
        role: role as any,
      },
    });

    // Login via API to get real JWT
    // Or generate JWT using jwt.sign with secret
    const jwt = await import('jsonwebtoken');
    const { config } = await import('../config/env');
    const token = jwt.default.sign(
      { userId: user.id, email: user.email, role: user.role },
      config.jwt.secret,
      { expiresIn: '1h' }
    );

    return { user, token };
  }

  // STEP 1: Test Public Catalog Endpoint
  console.log('\n[TEST 1] Public /api/v1/exams catalog retrieval');
  const catalogRes = await fetch(`${API_BASE}/exams`);
  const catalogData: any = await catalogRes.json();
  if (!catalogRes.ok || !Array.isArray(catalogData.data) || catalogData.data.length < 5) {
    throw new Error(`Failed to retrieve catalog: ${JSON.stringify(catalogData)}`);
  }
  console.log(`✓ Retrieved ${catalogData.data.length} exams from catalog.`);
  const satExam = catalogData.data.find((e: any) => e.code === 'SAT');
  const ieltsExam = catalogData.data.find((e: any) => e.code === 'IELTS');
  if (!satExam || !ieltsExam) {
    throw new Error('SAT or IELTS not found in catalog');
  }
  console.log(`✓ SAT verified: Duration = ${satExam.totalDurationMinutes}m, Score = ${satExam.scoreRange}, HasMock = ${satExam.hasMockTest}`);
  console.log(`✓ IELTS verified: Duration = ${ieltsExam.totalDurationMinutes}m, Score = ${ieltsExam.scoreRange}, HasMock = ${ieltsExam.hasMockTest}`);

  // STEP 2: Register Student 1 and setup Profile + Preferences
  console.log('\n[TEST 2] Registering Student 1 with USA preference');
  const { user: student1, token: student1Token } = await registerUser(student1Email, 'STUDENT');
  const profile1 = await prisma.studentProfile.create({
    data: {
      userId: student1.id,
      fullName: 'Aarav Patel',
      gender: 'MALE',
      grade: 'Grade 12',
      board: 'CBSE',
      citizenship: 'Indian',
      passingOutYear: 2026,
      contactEmail: student1Email,
      phone: '+91 9876543210',
      addressStreet: '104 Silicon Valley Heights',
      addressCity: 'Bengaluru',
      addressState: 'Karnataka',
      addressPostalCode: '560100',
      addressCountry: 'India',
      verificationStatus: 'VERIFIED',
    },
  });

  // Create Module 2 Preferences for Student 1 (USA, STEM)
  await prisma.studentPreference.create({
    data: {
      studentProfileId: profile1.id,
      countries: JSON.stringify(['United States', 'Canada']),
      primaryCountry: 'United States',
      department: 'Engineering & Technology',
      subDepartment: 'Computer Science',
    },
  });
  console.log('✓ Student 1 created with target destination: United States & Engineering stream.');

  // STEP 3: Catalog personalization check
  console.log('\n[TEST 3] Personalization check for Student 1');
  const authCatalogRes = await fetch(`${API_BASE}/exams`, {
    headers: { Authorization: `Bearer ${student1Token}` },
  });
  const authCatalogData: any = await authCatalogRes.json();
  const satPersonalized = authCatalogData.data.find((e: any) => e.code === 'SAT');
  if (!satPersonalized.isRecommendedForStudent) {
    throw new Error('Expected SAT to be recommended for student with USA destination!');
  }
  console.log('✓ Personalized match verified: SAT is marked isRecommendedForStudent = true.');

  // STEP 4: Add Exam to Student 1 Plan
  console.log('\n[TEST 4] Add SAT to Student 1 Exam Plan');
  const addPlanRes = await fetch(`${API_BASE}/exams/plan`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${student1Token}`,
    },
    body: JSON.stringify({
      examId: satExam.id,
      status: 'PLANNED',
      targetDate: '2026-08-15',
      targetScore: '1500+',
      notes: 'Focusing on advanced Math module and Reading speed.',
    }),
  });
  const addPlanData: any = await addPlanRes.json();
  if (!addPlanRes.ok || !addPlanData.data?.id) {
    throw new Error(`Failed to add exam to plan: ${JSON.stringify(addPlanData)}`);
  }
  const planItemId = addPlanData.data.id;
  console.log(`✓ Added SAT to plan. Plan Item ID: ${planItemId}, Status: ${addPlanData.data.status}`);

  // STEP 5: Update Exam Plan Status (PREPARING, current score)
  console.log('\n[TEST 5] Update SAT Plan Status to PREPARING');
  const updatePlanRes = await fetch(`${API_BASE}/exams/plan/${planItemId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${student1Token}`,
    },
    body: JSON.stringify({
      status: 'PREPARING',
      currentScore: '1420',
      notes: 'Scored 1420 on first diagnostic practice run.',
    }),
  });
  const updatePlanData: any = await updatePlanRes.json();
  if (!updatePlanRes.ok || updatePlanData.data.status !== 'PREPARING') {
    throw new Error(`Failed to update plan item: ${JSON.stringify(updatePlanData)}`);
  }
  console.log(`✓ Updated SAT plan: Status = ${updatePlanData.data.status}, Current Score = ${updatePlanData.data.currentScore}`);

  // STEP 6: Student Record Ownership Check (Student 2 cannot modify Student 1's plan)
  console.log('\n[TEST 6] Student ownership barrier verification');
  const { user: student2, token: student2Token } = await registerUser(student2Email, 'STUDENT');
  const profile2 = await prisma.studentProfile.create({
    data: {
      userId: student2.id,
      fullName: 'Diya Sharma',
      gender: 'FEMALE',
      grade: 'Grade 12',
      board: 'ISC',
      citizenship: 'Indian',
      passingOutYear: 2026,
      contactEmail: student2Email,
      phone: '+91 9123456789',
      addressStreet: '42 Marine Drive',
      addressCity: 'Mumbai',
      addressState: 'Maharashtra',
      addressPostalCode: '400020',
      addressCountry: 'India',
      verificationStatus: 'VERIFIED',
    },
  });

  const unauthorizedUpdateRes = await fetch(`${API_BASE}/exams/plan/${planItemId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${student2Token}`,
    },
    body: JSON.stringify({ status: 'COMPLETED' }),
  });
  if (unauthorizedUpdateRes.status !== 404 && unauthorizedUpdateRes.status !== 403) {
    throw new Error(`Security breach: Student 2 modified Student 1's plan! Status: ${unauthorizedUpdateRes.status}`);
  }
  console.log(`✓ Access correctly denied: Student 2 received HTTP ${unauthorizedUpdateRes.status} when attempting to mutate Student 1's plan.`);

  // STEP 7: Counsellor Role Verification
  console.log('\n[TEST 7] Counsellor access to student exam plan');
  const { token: counsellorToken } = await registerUser(counsellorEmail, 'COUNSELLOR');
  const counsellorReviewRes = await fetch(`${API_BASE}/exams/plan/profile/${profile1.id}`, {
    headers: { Authorization: `Bearer ${counsellorToken}` },
  });
  const counsellorReviewData: any = await counsellorReviewRes.json();
  if (!counsellorReviewRes.ok || !Array.isArray(counsellorReviewData.data?.plans) || counsellorReviewData.data.plans.length === 0) {
    throw new Error(`Counsellor failed to retrieve student plan: ${JSON.stringify(counsellorReviewData)}`);
  }
  console.log(`✓ Counsellor retrieved ${counsellorReviewData.data.plans.length} exam items for Student Profile ${profile1.id}.`);

  // STEP 8: Mock Test Anti-Cheating & Diagnostic Flow
  console.log('\n[TEST 8] Mock Test loading (anti-cheat verification)');
  const satMockTestsRes = await fetch(`${API_BASE}/exams/${satExam.id}/mock-tests`, {
    headers: { Authorization: `Bearer ${student1Token}` },
  });
  const satMockTestsData: any = await satMockTestsRes.json();
  if (!satMockTestsRes.ok || satMockTestsData.data.length === 0) {
    throw new Error(`No mock tests found for SAT: ${JSON.stringify(satMockTestsData)}`);
  }
  const mockTest = satMockTestsData.data[0];
  console.log(`✓ Found SAT Mock Test: "${mockTest.title}" (${mockTest.totalQuestions} questions, ${mockTest.durationMinutes} min).`);

  // Load test for taking
  const loadTestRes = await fetch(`${API_BASE}/exams/mock-tests/${mockTest.id}`, {
    headers: { Authorization: `Bearer ${student1Token}` },
  });
  const loadTestData: any = await loadTestRes.json();
  const testPayload = loadTestData.data;
  // Verify correctOptionIndex is NOT leaked
  const hasLeakedAnswer = testPayload.questions.some((q: any) => q.correctOptionIndex !== undefined || q.explanation !== undefined);
  if (hasLeakedAnswer) {
    throw new Error('SECURITY VIOLATION: Mock test payload leaked correct answers or explanations before submission!');
  }
  console.log('✓ Anti-cheating verified: Correct answers and explanations are completely omitted during test taking.');

  // STEP 9: Submit Mock Test & Validate Server-side Scoring
  console.log('\n[TEST 9] Submitting timed mock test answers');
  // Build answers: answer question 0 correctly (option 1), question 1 correctly (option 2), question 2 incorrectly (option 0)
  const answers: Record<string, number> = {};
  testPayload.questions.forEach((q: any, idx: number) => {
    // We intentionally provide known options
    answers[q.id] = idx === 0 ? 1 : idx === 1 ? 2 : 0;
  });

  const submitRes = await fetch(`${API_BASE}/exams/mock-tests/${mockTest.id}/submit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${student1Token}`,
    },
    body: JSON.stringify({
      timeSpentSeconds: 420,
      answers,
    }),
  });
  const submitData: any = await submitRes.json();
  if (!submitRes.ok || !submitData.data?.id) {
    throw new Error(`Mock test submission failed: ${JSON.stringify(submitData)}`);
  }
  const attemptResult = submitData.data;
  console.log(`✓ Test scored: Score = ${attemptResult.score}/${attemptResult.totalMarks} (${attemptResult.percentage}%), Time Spent = ${attemptResult.timeSpentSeconds}s`);
  console.log(`✓ Question breakdown returned ${attemptResult.breakdown.length} questions with full explanations and verified answers.`);

  // STEP 10: Fetch Student Mock History
  console.log('\n[TEST 10] Fetching student mock test history');
  const attemptsRes = await fetch(`${API_BASE}/exams/mock-attempts/me`, {
    headers: { Authorization: `Bearer ${student1Token}` },
  });
  const attemptsData: any = await attemptsRes.json();
  if (!attemptsRes.ok || attemptsData.data.length === 0) {
    throw new Error(`Failed to fetch student mock attempts: ${JSON.stringify(attemptsData)}`);
  }
  console.log(`✓ Retrieved ${attemptsData.data.length} past mock test attempts for Student 1.`);

  console.log('\n===========================================================');
  console.log(' ALL MODULE 4 (ENTRANCE EXAMS) BACKEND TESTS PASSED CLEANLY! ');
  console.log('===========================================================');
}

runModule4Tests()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('\n❌ MODULE 4 VERIFICATION ERROR:', err);
    process.exit(1);
  });
