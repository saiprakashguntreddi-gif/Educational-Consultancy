/**
 * End-to-End Verification Test for Module 10: Entrance Exam Intelligence & Mock Tests
 * Validates:
 * 1. College-to-Exam Requirements mapping & Intelligence overview
 * 2. Preparation Path & Milestones generation
 * 3. Anti-cheating security: correctOptionIndex and explanation are NOT leaked before submission
 * 4. Timed Mock Test submission, server-side scoring, section breakdown, and audit logging
 * 5. Student Exam Plan saving, updating, and audit logging
 * 6. Counsellor / Staff follow-up review endpoint
 */
import { prisma } from '../shared/database/prisma.service';
import { hashPassword } from '../shared/utils/password';
import { Role } from '../config/roles';
import { ExamIntelligenceService } from '../modules/exam-intelligence/exam-intelligence.service';

async function runE2ETests() {
  console.log('================================================================');
  console.log('   MODULE 10: ENTRANCE EXAM INTELLIGENCE & MOCK TESTS E2E TEST  ');
  console.log('================================================================\n');

  try {
    // 1. Setup Student 1 User and Profile
    const passwordHash = await hashPassword('StudentPassword123!');
    const studentUser = await prisma.user.upsert({
      where: { email: 'student.module10@example.com' },
      update: { passwordHash, isActive: true },
      create: {
        email: 'student.module10@example.com',
        passwordHash,
        role: Role.STUDENT,
        isActive: true,
        isEmailVerified: true,
      },
    });

    const studentProfile = await prisma.studentProfile.upsert({
      where: { userId: studentUser.id },
      update: { verificationStatus: 'VERIFIED' },
      create: {
        userId: studentUser.id,
        fullName: 'Aarav Patel',
        gender: 'MALE',
        grade: 'Grade 12',
        contactEmail: 'aarav.patel@example.com',
        phone: '+919876543210',
        addressStreet: '42 MG Road',
        addressCity: 'Bengaluru',
        addressState: 'Karnataka',
        addressPostalCode: '560001',
        addressCountry: 'India',
        board: 'CBSE',
        citizenship: 'Indian',
        passingOutYear: 2026,
        verificationStatus: 'VERIFIED',
      },
    });

    // 2. Setup Admin / Staff User
    const counsellorUser = await prisma.user.upsert({
      where: { email: 'counsellor.module10@example.com' },
      update: { passwordHash, isActive: true, role: Role.ADMIN },
      create: {
        email: 'counsellor.module10@example.com',
        passwordHash,
        role: Role.ADMIN,
        isActive: true,
        isEmailVerified: true,
      },
    });

    console.log('✓ Test users ready: Student (' + studentUser.email + '), Counsellor (' + counsellorUser.email + ')');

    // 3. Test Step 1: Intelligence Overview & College-to-Exam Requirement Mapping
    console.log('\n[TEST 1] Testing Step 1: College-to-Exam Intelligence Overview');
    const overview = await ExamIntelligenceService.getIntelligenceOverview(studentUser.id);
    console.log(`✓ Overview loaded successfully:`);
    console.log(`   - Recommended entrance exams: ${overview.recommendedExams.length}`);
    console.log(`   - Upcoming deadlines tracked: ${overview.upcomingDeadlines.length}`);
    console.log(`   - Shortlisted college requirements: ${overview.collegeRequirements.length}`);

    if (overview.recommendedExams.length === 0) {
      throw new Error('Expected at least 1 entrance exam in catalogue.');
    }
    const satExam = overview.recommendedExams.find((e) => e.code === 'SAT');
    if (!satExam) {
      throw new Error('Expected SAT exam in recommended exams.');
    }
    console.log(`✓ Confirmed SAT present with format: "${satExam.format}", score range: "${satExam.scoreRange}".`);

    // 4. Test Step 3: Preparation Path & Milestones
    console.log('\n[TEST 2] Testing Step 3: Structured Preparation Path & Milestones');
    const prepPlan = await ExamIntelligenceService.getPreparationPlan(satExam.examId, studentUser.id);
    console.log(`✓ Preparation plan generated for ${prepPlan.examName}:`);
    console.log(`   - Recommended books: ${prepPlan.recommendedBooks.join(', ')}`);
    console.log(`   - Timeline milestones: ${prepPlan.timeline.length} weeks`);
    if (prepPlan.timeline.length !== 8) {
      throw new Error(`Expected 8 preparation milestones, received ${prepPlan.timeline.length}`);
    }
    console.log(`   - Week 1: "${prepPlan.timeline[0].phase}" - ${prepPlan.timeline[0].objective}`);

    // 5. Test Step 5: Anti-Cheat Protection on Mock Test Loading
    console.log('\n[TEST 3] Testing Step 5: Timed Mock Test Anti-Cheat Protection');
    const mockTests = await prisma.mockTest.findMany({
      where: { exam: { code: 'SAT' } },
      include: { exam: true },
    });

    if (mockTests.length === 0) {
      throw new Error('No mock test found for SAT in database.');
    }
    const testId = mockTests[0].id;
    const takingPayload = await ExamIntelligenceService.getMockTestForTaking(testId);

    console.log(`✓ Mock test "${takingPayload.title}" loaded with ${takingPayload.questions.length} questions.`);
    for (const q of takingPayload.questions) {
      if ((q as any).correctOptionIndex !== undefined) {
        throw new Error('SECURITY VIOLATION: Mock test leaked correctOptionIndex before submission!');
      }
      if ((q as any).explanation !== undefined) {
        throw new Error('SECURITY VIOLATION: Mock test leaked explanation before submission!');
      }
    }
    console.log('✓ Anti-cheat verified: Zero correct answers or explanations exposed to the client prior to submit.');

    // 6. Test Step 5: Server-side Evaluation & Diagnostic Breakdown
    console.log('\n[TEST 4] Testing Step 5: Server-side Evaluation & Section Breakdown');
    const actualTest = await prisma.mockTest.findUnique({
      where: { id: testId },
      include: { questions: true },
    });

    // Simulate answering: answer first question correctly, others option 0
    const submittedAnswers: Record<string, number> = {};
    if (actualTest?.questions && actualTest.questions.length > 0) {
      submittedAnswers[actualTest.questions[0].id] = actualTest.questions[0].correctOptionIndex;
      for (let i = 1; i < actualTest.questions.length; i++) {
        submittedAnswers[actualTest.questions[i].id] = 0;
      }
    }

    const evalResult = await ExamIntelligenceService.evaluateMockTest(
      studentUser.id,
      testId,
      submittedAnswers,
      185 // 3 mins 5 secs
    );

    console.log(`✓ Evaluation completed:`);
    console.log(`   - Score: ${evalResult.score}/${evalResult.totalMarks} (${evalResult.percentage}%)`);
    console.log(`   - Verdict: ${evalResult.performanceVerdict}`);
    console.log(`   - Section breakdown: ${evalResult.sectionBreakdown.map((s) => `${s.section}: ${s.accuracyPercentage}%`).join(' | ')}`);
    console.log(`   - Questions reviewed with explanations: ${evalResult.questionReview.length}`);

    // Verify AuditLog record
    const mockAuditLog = await prisma.auditLog.findFirst({
      where: { userId: studentUser.id, action: 'MOCK_TEST_EVALUATED' },
      orderBy: { createdAt: 'desc' },
    });
    if (!mockAuditLog) {
      throw new Error('Expected AuditLog entry for MOCK_TEST_EVALUATED.');
    }
    console.log(`✓ AuditLog recorded: "${mockAuditLog.action}"`);

    // 7. Test Step 6: Save and Update Student Exam Plan
    console.log('\n[TEST 5] Testing Step 6: Personal Exam Plan & Follow-up');
    const plan = await ExamIntelligenceService.saveExamPlan(studentUser.id, {
      examId: satExam.examId,
      status: 'PREPARING',
      targetDate: '2026-05-02',
      targetScore: '1500',
      notes: 'Focus on digital math module 2 hard question drills',
    });
    console.log(`✓ Saved personal exam plan: ${plan.exam.code} - ${plan.status} (Target: ${plan.targetScore})`);

    const updatedPlan = await ExamIntelligenceService.updateExamPlan(studentUser.id, plan.id, {
      status: 'REGISTERED',
      currentScore: '1480',
    });
    console.log(`✓ Updated personal exam plan: status changed to ${updatedPlan.status}, score: ${updatedPlan.currentScore}`);

    const planAuditLog = await prisma.auditLog.findFirst({
      where: { userId: studentUser.id, action: 'EXAM_PLAN_UPDATED' },
      orderBy: { createdAt: 'desc' },
    });
    if (!planAuditLog) {
      throw new Error('Expected AuditLog entry for EXAM_PLAN_UPDATED.');
    }
    console.log(`✓ AuditLog recorded: "${planAuditLog.action}"`);

    // 8. Test Step 6: Counsellor / Staff Review of Student Intelligence
    console.log('\n[TEST 6] Testing Staff / Counsellor Follow-up Review Endpoint');
    const staffReview = await ExamIntelligenceService.getStudentIntelligenceForStaff(
      studentProfile.id,
      counsellorUser.id
    );
    console.log(`✓ Staff review retrieved for student ${staffReview.fullName}:`);
    console.log(`   - Exam plans count: ${staffReview.examPlans.length}`);
    console.log(`   - Mock attempts count: ${staffReview.mockAttempts.length}`);

    const staffAuditLog = await prisma.auditLog.findFirst({
      where: { userId: counsellorUser.id, action: 'STAFF_REVIEWED_EXAM_INTELLIGENCE' },
      orderBy: { createdAt: 'desc' },
    });
    if (!staffAuditLog) {
      throw new Error('Expected AuditLog entry for STAFF_REVIEWED_EXAM_INTELLIGENCE.');
    }
    console.log(`✓ Staff audit log recorded: "${staffAuditLog.action}"`);

    console.log('\n================================================================');
    console.log('   ALL MODULE 10 BACKEND & LOGIC VERIFICATIONS PASSED (6/6)    ');
    console.log('================================================================\n');
  } catch (error) {
    console.error('\n❌ Module 10 verification test failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runE2ETests();
