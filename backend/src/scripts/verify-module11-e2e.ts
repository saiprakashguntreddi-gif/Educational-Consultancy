/**
 * End-to-End Verification Test for Module 11: Eight-Pathway Assessment Suite
 */
import { prisma } from '../shared/database/prisma.service';
import { hashPassword } from '../shared/utils/password';
import { Role } from '../config/roles';
import { AssessmentsService } from '../modules/assessments/assessments.service';
import { ASSESSMENT_PATHWAYS_CATALOG } from '../modules/assessments/assessments.data';

async function runModule11Tests() {
  console.log('================================================================');
  console.log('   MODULE 11: EIGHT-PATHWAY ASSESSMENT SUITE E2E TEST SUITE    ');
  console.log('================================================================\n');

  try {
    // 1. Setup Test Users
    console.log('[SETUP] Initializing test users & student profile...');
    const passwordHash = await hashPassword('Password123!');
    const studentUser = await prisma.user.upsert({
      where: { email: 'student.module11@example.com' },
      update: { passwordHash, isActive: true },
      create: {
        email: 'student.module11@example.com',
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
        fullName: 'Kavya Nair',
        gender: 'FEMALE',
        grade: 'Grade 10',
        contactEmail: studentUser.email,
        phone: '+91-9876543210',
        addressStreet: '42 Knowledge Park',
        addressCity: 'Bengaluru',
        addressState: 'Karnataka',
        addressPostalCode: '560001',
        addressCountry: 'India',
        board: 'ICSE',
        citizenship: 'Indian',
        passingOutYear: 2026,
        verificationStatus: 'VERIFIED',
      },
    });

    // Ensure student preference
    await prisma.studentPreference.upsert({
      where: { studentProfileId: studentProfile.id },
      update: {},
      create: {
        studentProfileId: studentProfile.id,
        countries: JSON.stringify(['India', 'United States', 'Singapore']),
        primaryCountry: 'India',
        department: 'Science & Technology',
        subDepartment: 'Computer Science & AI',
      },
    });

    const counsellorUser = await prisma.user.upsert({
      where: { email: 'counsellor.module11@example.com' },
      update: { passwordHash, isActive: true, role: Role.ADMIN },
      create: {
        email: 'counsellor.module11@example.com',
        passwordHash,
        role: Role.ADMIN,
        isActive: true,
        isEmailVerified: true,
      },
    });

    console.log(`✓ Test accounts ready: Student (${studentUser.email}), Counsellor (${counsellorUser.email})\n`);

    // [TEST 1] All 8 Pathways Catalog Coverage
    console.log('[TEST 1] Testing All 8 Assessment Pathways Definitions');
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

    if (ASSESSMENT_PATHWAYS_CATALOG.length !== 8) {
      throw new Error(`Expected exactly 8 pathways, but found ${ASSESSMENT_PATHWAYS_CATALOG.length}`);
    }

    expectedPathways.forEach((code) => {
      const p = ASSESSMENT_PATHWAYS_CATALOG.find((item) => item.code === code);
      if (!p) throw new Error(`Missing pathway: ${code}`);
      if (!p.title || !p.version || p.dimensions.length === 0 || p.questions.length === 0) {
        throw new Error(`Invalid pathway definition for ${code}`);
      }
    });

    const studentList = await AssessmentsService.listPathways(studentUser.id);
    console.log(`✓ Confirmed all 8 pathways loaded with instructions & disclaimers (Total: ${studentList.pathways.length})`);

    // [TEST 2] Controlled Access Code Generation by Counsellor
    console.log('\n[TEST 2] Testing Controlled Access Code Generation by Counsellor');
    const newCode = await AssessmentsService.generateAccessCode({
      pathwayCode: 'POST_10TH_STREAM',
      assignedStudentEmail: studentUser.email,
      maxUses: 1,
      validityDays: 14,
      notes: 'Diagnostic assignment for Kavya Nair - 10th ICSE Stream Choice',
      counsellorUserId: counsellorUser.id,
    });

    if (!newCode.code || newCode.status !== 'ACTIVE' || newCode.pathwayCode !== 'POST_10TH_STREAM') {
      throw new Error('Access code generation failed.');
    }
    console.log(`✓ Generated Access Code: ${newCode.code} (Expires: ${newCode.expiresAt.slice(0, 10)})`);

    // [TEST 3] Access Code Verification by Student
    console.log('\n[TEST 3] Testing Student Access Code Verification');
    const verified = await AssessmentsService.verifyAndUnlockCode(newCode.code, studentUser.id);
    if (!verified.valid || verified.pathwayCode !== 'POST_10TH_STREAM') {
      throw new Error('Access code verification failed.');
    }
    console.log(`✓ Successfully verified access code ${verified.code} for pathway ${verified.pathwayCode}`);

    // [TEST 4] Test Initialization & Auto-Save Progress Protection
    console.log('\n[TEST 4] Testing Attempt Initialization, Progress Protection & Auto-Save');
    const attempt = await AssessmentsService.startOrResumeAttempt(
      'POST_10TH_STREAM',
      studentUser.id,
      newCode.code
    );

    if (attempt.status !== 'IN_PROGRESS' || attempt.pathwayCode !== 'POST_10TH_STREAM') {
      throw new Error('Attempt initialization failed.');
    }
    console.log(`✓ Started attempt: ${attempt.id} (Status: ${attempt.status})`);

    // Simulate auto-save at Question 1
    const savedAttempt = await AssessmentsService.saveAttemptProgress(attempt.id, studentUser.id, {
      currentQuestionIndex: 1,
      answers: { stream_q1: 's1_a' },
      timeSpentSeconds: 65,
    });

    if (savedAttempt.currentQuestionIndex !== 1 || savedAttempt.answers['stream_q1'] !== 's1_a') {
      throw new Error('Auto-save progress failed.');
    }
    console.log(`✓ Auto-saved checkpoint: Question 1 saved, timeSpent: 65s`);

    // Test Resume: Starting again should return the existing in-progress attempt with saved answer
    const resumedAttempt = await AssessmentsService.startOrResumeAttempt('POST_10TH_STREAM', studentUser.id);
    if (resumedAttempt.id !== attempt.id || resumedAttempt.answers['stream_q1'] !== 's1_a') {
      throw new Error('Incomplete attempt resumption failed.');
    }
    console.log(`✓ Successfully resumed incomplete attempt at Question ${resumedAttempt.currentQuestionIndex + 1}`);

    // [TEST 5] Complete Assessment & Deterministic Scoring Engine
    console.log('\n[TEST 5] Testing Submission & Deterministic Scoring Engine');
    const report = await AssessmentsService.submitAttempt(attempt.id, studentUser.id, {
      answers: {
        stream_q1: 's1_a', // Science PCM +4
        stream_q2: 's2_a', // Science PCM +4, Commerce Math +2
      },
      timeSpentSeconds: 420,
    });

    if (
      !report.id ||
      report.dimensions.length === 0 ||
      report.dominantClusters.length === 0 ||
      report.matchingStreams.length === 0 ||
      report.careerSuggestions.length === 0
    ) {
      throw new Error('Diagnostic report generation failed.');
    }

    const pcmDimension = report.dimensions.find((d) => d.dimensionCode === 'SCIENCE_PCM');
    if (!pcmDimension || pcmDimension.rawScore < 8) {
      throw new Error(`Scoring calculation error. Expected PCM rawScore >= 8, got ${pcmDimension?.rawScore}`);
    }

    console.log(`✓ Diagnostic Report generated: ID ${report.id}`);
    console.log(`   - Dominant Cluster: ${report.dominantClusters.join(', ')}`);
    console.log(`   - Top Stream Recommendation: ${report.matchingStreams[0]}`);
    console.log(`   - Top Career Match: ${report.careerSuggestions[0].title} (${report.careerSuggestions[0].fitLevel})`);
    console.log(`   - Science PCM Score: ${pcmDimension.percentage}% (Band: ${pcmDimension.band})`);

    // [TEST 6] Counsellor Integrated Review (Report + Academics + Shortlists)
    console.log('\n[TEST 6] Testing Counsellor Integrated Review & Evidence Aggregation');
    const integratedReview = await AssessmentsService.getCounsellorIntegratedReview(studentProfile.id);

    if (
      !integratedReview.studentProfile ||
      integratedReview.assessmentsCompleted.length === 0 ||
      !integratedReview.preferences
    ) {
      throw new Error('Counsellor integrated review failed.');
    }
    console.log(`✓ Integrated Review loaded for student "${integratedReview.studentProfile.fullName}":`);
    console.log(`   - Academics: Grade ${integratedReview.studentProfile.grade}, Board: ${integratedReview.studentProfile.board}`);
    console.log(`   - Target Department: ${integratedReview.preferences.department}`);
    console.log(`   - Completed Assessments Count: ${integratedReview.assessmentsCompleted.length}`);

    // [TEST 7] Counsellor Action Plan & Discussion Points Attachment
    console.log('\n[TEST 7] Testing Counsellor Action Plan & Discussion Points');
    const updatedReport = await AssessmentsService.saveCounsellorActionPlan(
      report.id,
      counsellorUser.id,
      {
        discussionPoints: [
          'Strong affinity for analytical physics and computing.',
          'Evaluate CBSE vs ICSE transition for 11th grade PCM curriculum.',
          'Discuss JEE Main and SAT preparation timeline.',
        ],
        actionMilestones: [
          { title: 'Finalize 11th Grade Science (PCM + CS) enrollment', targetDeadline: '2026-05-15', status: 'PENDING' },
          { title: 'Begin foundation mathematics bridge modules', targetDeadline: '2026-06-01', status: 'PENDING' },
        ],
        summaryNotes: 'Kavya shows high aptitude for computer science and mathematical physics. Recommended proceeding with Science PCM.',
      }
    );

    if (!updatedReport.counsellorActionPlan || updatedReport.counsellorActionPlan.actionMilestones.length !== 2) {
      throw new Error('Action plan attachment failed.');
    }
    console.log(`✓ Counsellor Action Plan saved with ${updatedReport.counsellorActionPlan.actionMilestones.length} milestones.`);
    console.log(`   - Counsellor Note: "${updatedReport.counsellorActionPlan.summaryNotes}"`);

    console.log('\n================================================================');
    console.log('   ALL MODULE 11 E2E VERIFICATION TESTS PASSED (7/7)           ');
    console.log('================================================================');
  } catch (err) {
    console.error('\n❌ Module 11 E2E verification test failed:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runModule11Tests();
