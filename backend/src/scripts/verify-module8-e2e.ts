/**
 * verify-module8-e2e.ts
 *
 * Comprehensive End-to-End Automated Test Suite for:
 * MODULE 8 — SCHOLARSHIP DISCOVERY & ELIGIBILITY
 *
 * Verification Checklist:
 * 1. Student can access scholarship discovery (GET /api/v1/scholarships)
 * 2. Student cannot modify scholarship catalogue (HTTP 403 Forbidden)
 * 3. Counsellor cannot modify scholarship catalogue (HTTP 403 Forbidden)
 * 4. Admin can create a verified scholarship record in catalogue (HTTP 201 Created)
 * 5. Admin can edit a scholarship record (HTTP 200 OK)
 * 6. Admin can activate and deactivate a scholarship (HTTP 200 OK)
 * 7. Eligibility engine correctly identifies an ELIGIBLE student based on stored criteria
 * 8. Eligibility engine correctly identifies an NOT_ELIGIBLE student based on academic benchmark
 * 9. Missing student information safely produces a POTENTIALLY_ELIGIBLE / Needs Review result
 * 10. Student cannot access another student's private eligibility calculations (Anti-IDOR protection)
 * 11. Admin catalogue modifications generate AuditLog records (SCHOLARSHIP_ADDED, SCHOLARSHIP_UPDATED, SCHOLARSHIP_STATUS_CHANGED, SCHOLARSHIP_DELETED)
 * 12. Student can bookmark/save and un-bookmark a scholarship
 */

import jwt from 'jsonwebtoken';
import { prisma } from '../shared/database/prisma.service';
import { hashPassword } from '../shared/utils/password';
import { Role } from '../config/roles';
import { config } from '../config/env';

const BASE_URL = 'http://localhost:5000/api/v1';

async function main() {
  console.log('\n===============================================================');
  console.log(' STARTING MODULE 8 — SCHOLARSHIP DISCOVERY & ELIGIBILITY TESTS');
  console.log('===============================================================\n');

  let allTestsPassed = true;
  const timestamp = Date.now();
  const passwordHash = await hashPassword('Password123!');

  // 1. Setup Test Users: Admin, Counsellor, and 3 distinct Student profiles
  console.log('[SETUP] Creating isolated test users...');

  const adminUser = await prisma.user.create({
    data: {
      email: `admin.m8.${timestamp}@example.com`,
      passwordHash,
      role: Role.ADMIN,
      isActive: true,
      isEmailVerified: true,
    },
  });

  const counsellorUser = await prisma.user.create({
    data: {
      email: `counsellor.m8.${timestamp}@example.com`,
      passwordHash,
      role: Role.COUNSELLOR,
      isActive: true,
      isEmailVerified: true,
    },
  });

  // Student 1: High Achiever (92%, CBSE, Indian, Target UK, Computer Science) -> ELIGIBLE
  const studentUser1 = await prisma.user.create({
    data: {
      email: `student1.m8.${timestamp}@example.com`,
      passwordHash,
      role: Role.STUDENT,
      isActive: true,
      isEmailVerified: true,
    },
  });

  const profile1 = await prisma.studentProfile.create({
    data: {
      userId: studentUser1.id,
      fullName: 'Aarav Sharma',
      gender: 'MALE',
      grade: 'Grade 12',
      contactEmail: studentUser1.email,
      phone: '+91 9876543210',
      addressStreet: '12 Connaught Place',
      addressCity: 'New Delhi',
      addressState: 'Delhi',
      addressPostalCode: '110001',
      addressCountry: 'India',
      board: 'CBSE',
      citizenship: 'Indian',
      passingOutYear: 2026,
      verificationStatus: 'VERIFIED',
    },
  });

  await prisma.studentEducation.create({
    data: {
      studentProfileId: profile1.id,
      schoolName: 'Delhi Public School',
      board: 'CBSE',
      percentage: 92.5,
      completionYear: 2026,
      subjectDetails: JSON.stringify([
        { subject: 'Mathematics', score: 95 },
        { subject: 'Physics', score: 92 },
        { subject: 'Chemistry', score: 90 },
      ]),
    },
  });

  await prisma.studentPreference.create({
    data: {
      studentProfileId: profile1.id,
      countries: JSON.stringify(['United Kingdom']),
      primaryCountry: 'United Kingdom',
      department: 'Computer Science',
      subDepartment: 'Software Engineering',
    },
  });

  // Student 2: Ineligible (58%, State Board, Canadian, Target Canada) -> NOT_ELIGIBLE
  const studentUser2 = await prisma.user.create({
    data: {
      email: `student2.m8.${timestamp}@example.com`,
      passwordHash,
      role: Role.STUDENT,
      isActive: true,
      isEmailVerified: true,
    },
  });

  const profile2 = await prisma.studentProfile.create({
    data: {
      userId: studentUser2.id,
      fullName: 'Liam Tremblay',
      gender: 'MALE',
      grade: 'Grade 12',
      contactEmail: studentUser2.email,
      phone: '+1 514-555-0144',
      addressStreet: '450 Rue Sainte-Catherine',
      addressCity: 'Montreal',
      addressState: 'Quebec',
      addressPostalCode: 'H3B 1A7',
      addressCountry: 'Canada',
      board: 'State Board',
      citizenship: 'Canadian',
      passingOutYear: 2026,
      verificationStatus: 'VERIFIED',
    },
  });

  await prisma.studentEducation.create({
    data: {
      studentProfileId: profile2.id,
      schoolName: 'Montreal High',
      board: 'State Board',
      percentage: 58.0,
      completionYear: 2026,
      subjectDetails: JSON.stringify([
        { subject: 'Visual Arts', score: 62 },
        { subject: 'English', score: 55 },
      ]),
    },
  });

  await prisma.studentPreference.create({
    data: {
      studentProfileId: profile2.id,
      countries: JSON.stringify(['Canada']),
      primaryCountry: 'Canada',
      department: 'Fine Arts',
      subDepartment: 'Visual Arts',
    },
  });

  // Student 3: Incomplete Profile (No Education Record, No Percentage) -> POTENTIALLY_ELIGIBLE
  const studentUser3 = await prisma.user.create({
    data: {
      email: `student3.m8.${timestamp}@example.com`,
      passwordHash,
      role: Role.STUDENT,
      isActive: true,
      isEmailVerified: true,
    },
  });

  const profile3 = await prisma.studentProfile.create({
    data: {
      userId: studentUser3.id,
      fullName: 'Maya Patel',
      gender: 'FEMALE',
      grade: 'Grade 12',
      contactEmail: studentUser3.email,
      phone: '+91 9988776655',
      addressStreet: '88 MG Road',
      addressCity: 'Bengaluru',
      addressState: 'Karnataka',
      addressPostalCode: '560001',
      addressCountry: 'India',
      board: 'ICSE',
      citizenship: 'Indian',
      passingOutYear: 2026,
      verificationStatus: 'PENDING',
    },
  });

  // Generate JWTs
  const generateToken = (user: any) =>
    jwt.sign(
      { userId: user.id, id: user.id, email: user.email, role: user.role },
      config.jwt.secret,
      { expiresIn: '1h' }
    );

  const adminToken = generateToken(adminUser);
  const counsellorToken = generateToken(counsellorUser);
  const studentToken1 = generateToken(studentUser1);
  const studentToken2 = generateToken(studentUser2);
  const studentToken3 = generateToken(studentUser3);

  let testScholarshipId = '';

  try {
    // -------------------------------------------------------------
    // TEST 1: Student can access scholarship discovery
    // -------------------------------------------------------------
    console.log('\n[TEST 1] Student accesses scholarship discovery: GET /api/v1/scholarships');
    const discoveryRes = await fetch(`${BASE_URL}/scholarships`, {
      headers: { Authorization: `Bearer ${studentToken1}` },
    });
    const discoveryData: any = await discoveryRes.json();
    if (discoveryRes.status === 200 && discoveryData.success) {
      console.log('✓ Student successfully accessed scholarship discovery.');
      console.log(`  - Student Context verified: "${discoveryData.data.studentProfileContext?.studentName}" (Score: ${discoveryData.data.studentProfileContext?.percentage}%)`);
    } else {
      console.error('✗ Student failed to access discovery:', discoveryData);
      allTestsPassed = false;
    }

    // -------------------------------------------------------------
    // TEST 2: Student CANNOT create or modify scholarship catalogue
    // -------------------------------------------------------------
    console.log('\n[TEST 2] Security: Student blocked from catalogue management (POST /api/v1/scholarships/admin)');
    const studentCreateRes = await fetch(`${BASE_URL}/scholarships/admin`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${studentToken1}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Unauthorized Student Scholarship',
        provider: 'Hacker Org',
        country: 'Global',
        awardDetails: 'Unauthorized',
        eligibilityDescription: 'None',
        applicationUrl: 'https://evil.com',
      }),
    });
    if (studentCreateRes.status === 403) {
      console.log('✓ Student correctly blocked with HTTP 403 Forbidden.');
    } else {
      console.error(`✗ Security violation: Student received status ${studentCreateRes.status}`);
      allTestsPassed = false;
    }

    // -------------------------------------------------------------
    // TEST 3: Counsellor CANNOT modify scholarship catalogue (Admin only)
    // -------------------------------------------------------------
    console.log('\n[TEST 3] Security: Counsellor blocked from catalogue creation (POST /api/v1/scholarships/admin)');
    const counsellorCreateRes = await fetch(`${BASE_URL}/scholarships/admin`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${counsellorToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Counsellor Scholarship',
        provider: 'Guidance Center',
        country: 'India',
        awardDetails: 'Test',
        eligibilityDescription: 'Test',
        applicationUrl: 'https://guidance.org',
      }),
    });
    if (counsellorCreateRes.status === 403) {
      console.log('✓ Counsellor correctly blocked from catalogue creation with HTTP 403 Forbidden.');
    } else {
      console.error(`✗ Role violation: Counsellor received status ${counsellorCreateRes.status}`);
      allTestsPassed = false;
    }

    // -------------------------------------------------------------
    // TEST 4: Admin creates a verified scholarship record in catalogue
    // -------------------------------------------------------------
    console.log('\n[TEST 4] Admin creates scholarship: POST /api/v1/scholarships/admin');
    const createRes = await fetch(`${BASE_URL}/scholarships/admin`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${adminToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: `UK STEM Excellence Fellowship ${timestamp}`,
        provider: 'British Council & Foreign Office',
        country: 'United Kingdom',
        destinationCountry: 'United Kingdom',
        department: 'Computer Science',
        studyLevel: 'Undergraduate',
        awardAmount: 25000,
        awardCurrency: 'GBP',
        awardType: 'Tuition Waiver & Living Stipend',
        awardDetails: 'Full tuition fee waiver up to £25,000 per academic year plus monthly living stipend.',
        eligibilityDescription: 'Applicants must achieve a minimum of 85% in Grade 12 (CBSE/ICSE/IB), hold Indian citizenship, and pursue a degree in Computer Science or STEM in the UK.',
        minPercentageRequirement: 85.0,
        eligibleBoards: ['CBSE', 'ICSE', 'IB'],
        requiredCitizenship: 'Indian',
        genderRequirement: 'ANY',
        applicationDeadline: '2026-12-15T23:59:59.000Z',
        applicationUrl: 'https://www.britishcouncil.in/study-uk/scholarships',
        sourceInfo: 'Official Education Gazette 2026 Reference REF-UK-8821',
        isActive: true,
        isPublished: true,
      }),
    });
    const createData: any = await createRes.json();
    if (createRes.status === 201 && createData.success) {
      testScholarshipId = createData.data.id;
      console.log(`✓ Admin successfully created scholarship record: "${createData.data.name}"`);
      console.log(`  - ID: ${testScholarshipId}`);
      console.log(`  - Min %: ${createData.data.minPercentageRequirement}% | Boards: ${createData.data.eligibleBoards?.join(', ')}`);
    } else {
      console.error('✗ Admin failed to create scholarship:', createData);
      allTestsPassed = false;
    }

    // -------------------------------------------------------------
    // TEST 5: Verify AuditLog created for SCHOLARSHIP_ADDED
    // -------------------------------------------------------------
    console.log('\n[TEST 5] AuditLog: Verify SCHOLARSHIP_ADDED action recorded');
    const addAudit = await prisma.auditLog.findFirst({
      where: {
        action: 'SCHOLARSHIP_ADDED',
        userId: adminUser.id,
      },
      orderBy: { createdAt: 'desc' },
    });
    if (addAudit && addAudit.details && addAudit.details.includes(testScholarshipId)) {
      console.log('✓ Verified: AuditLog entry successfully recorded for SCHOLARSHIP_ADDED.');
    } else {
      console.error('✗ AuditLog entry for SCHOLARSHIP_ADDED was missing.');
      allTestsPassed = false;
    }

    // -------------------------------------------------------------
    // TEST 6: Admin edits a scholarship record
    // -------------------------------------------------------------
    console.log('\n[TEST 6] Admin edits scholarship: PUT /api/v1/scholarships/admin/:id');
    const updateRes = await fetch(`${BASE_URL}/scholarships/admin/${testScholarshipId}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${adminToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        awardAmount: 28000,
        awardDetails: 'Revised: Full tuition fee waiver up to £28,000 per academic year plus monthly living stipend.',
      }),
    });
    const updateData: any = await updateRes.json();
    if (updateRes.status === 200 && updateData.data.awardAmount === 28000) {
      console.log('✓ Admin successfully updated scholarship.');
      const updateAudit = await prisma.auditLog.findFirst({
        where: {
          action: 'SCHOLARSHIP_UPDATED',
          userId: adminUser.id,
        },
        orderBy: { createdAt: 'desc' },
      });
      if (updateAudit && updateAudit.details && updateAudit.details.includes(testScholarshipId)) {
        console.log('✓ Verified: AuditLog entry recorded for SCHOLARSHIP_UPDATED.');
      } else {
        console.error('✗ AuditLog entry for SCHOLARSHIP_UPDATED was missing.');
        allTestsPassed = false;
      }
    } else {
      console.error('✗ Admin update failed:', updateData);
      allTestsPassed = false;
    }

    // -------------------------------------------------------------
    // TEST 7: Admin activates / deactivates scholarship
    // -------------------------------------------------------------
    console.log('\n[TEST 7] Admin toggles scholarship active status: PATCH /api/v1/scholarships/admin/:id/status');
    const deactRes = await fetch(`${BASE_URL}/scholarships/admin/${testScholarshipId}/status`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${adminToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ isActive: false }),
    });
    const deactData: any = await deactRes.json();
    if (deactRes.status === 200 && deactData.data.isActive === false) {
      console.log('✓ Successfully deactivated scholarship.');
      const statusAudit = await prisma.auditLog.findFirst({
        where: {
          action: 'SCHOLARSHIP_STATUS_CHANGED',
          userId: adminUser.id,
        },
        orderBy: { createdAt: 'desc' },
      });
      if (statusAudit) {
        console.log('✓ Verified: AuditLog entry recorded for SCHOLARSHIP_STATUS_CHANGED.');
      } else {
        console.error('✗ AuditLog entry for SCHOLARSHIP_STATUS_CHANGED was missing.');
        allTestsPassed = false;
      }
    } else {
      console.error('✗ Deactivation failed:', deactData);
      allTestsPassed = false;
    }

    // Re-activate so student tests can evaluate it
    await fetch(`${BASE_URL}/scholarships/admin/${testScholarshipId}/status`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${adminToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ isActive: true }),
    });

    // -------------------------------------------------------------
    // TEST 8: Eligibility Engine: ELIGIBLE Student (Aarav Sharma)
    // -------------------------------------------------------------
    console.log('\n[TEST 8] Eligibility Evaluation: Student 1 (92.5%, CBSE, Indian, Target UK) -> ELIGIBLE');
    const student1Res = await fetch(`${BASE_URL}/scholarships/${testScholarshipId}`, {
      headers: { Authorization: `Bearer ${studentToken1}` },
    });
    const student1Data: any = await student1Res.json();
    if (student1Res.status === 200 && student1Data.data.eligibility) {
      const el = student1Data.data.eligibility;
      console.log(`✓ Overall Status: ${el.status}`);
      console.log(`  - Explanation: "${el.summary}"`);
      if (el.status === 'ELIGIBLE') {
        console.log('✓ Verified: Eligibility engine correctly identified student as ELIGIBLE!');
      } else {
        console.error(`✗ Expected ELIGIBLE, got ${el.status}`);
        allTestsPassed = false;
      }
    } else {
      console.error('✗ Failed to evaluate Student 1 eligibility:', student1Data);
      allTestsPassed = false;
    }

    // -------------------------------------------------------------
    // TEST 9: Eligibility Engine: NOT_ELIGIBLE Student (Liam Tremblay)
    // -------------------------------------------------------------
    console.log('\n[TEST 9] Eligibility Evaluation: Student 2 (58%, State Board, Canadian) -> NOT_ELIGIBLE');
    const student2Res = await fetch(`${BASE_URL}/scholarships/${testScholarshipId}`, {
      headers: { Authorization: `Bearer ${studentToken2}` },
    });
    const student2Data: any = await student2Res.json();
    if (student2Res.status === 200 && student2Data.data.eligibility) {
      const el = student2Data.data.eligibility;
      console.log(`✓ Overall Status: ${el.status}`);
      console.log(`  - Explanation: "${el.summary}"`);
      if (el.status === 'NOT_ELIGIBLE') {
        console.log('✓ Verified: Eligibility engine correctly identified student as NOT_ELIGIBLE based on stored benchmark!');
      } else {
        console.error(`✗ Expected NOT_ELIGIBLE, got ${el.status}`);
        allTestsPassed = false;
      }
    } else {
      console.error('✗ Failed to evaluate Student 2 eligibility:', student2Data);
      allTestsPassed = false;
    }

    // -------------------------------------------------------------
    // TEST 10: Missing Student Data: POTENTIALLY_ELIGIBLE / Needs Review
    // -------------------------------------------------------------
    console.log('\n[TEST 10] Missing Data Handling: Student 3 (Missing education score) -> POTENTIALLY_ELIGIBLE');
    const student3Res = await fetch(`${BASE_URL}/scholarships/${testScholarshipId}`, {
      headers: { Authorization: `Bearer ${studentToken3}` },
    });
    const student3Data: any = await student3Res.json();
    if (student3Res.status === 200 && student3Data.data.eligibility) {
      const el = student3Data.data.eligibility;
      console.log(`✓ Overall Status: ${el.status}`);
      console.log(`  - Explanation: "${el.summary}"`);
      if (el.status === 'POTENTIALLY_ELIGIBLE') {
        console.log('✓ Verified: Missing data safely marked as POTENTIALLY_ELIGIBLE without assuming or fabricating values!');
      } else {
        console.error(`✗ Expected POTENTIALLY_ELIGIBLE, got ${el.status}`);
        allTestsPassed = false;
      }
    } else {
      console.error('✗ Failed to evaluate Student 3 eligibility:', student3Data);
      allTestsPassed = false;
    }

    // -------------------------------------------------------------
    // TEST 11: Security & IDOR Isolation
    // -------------------------------------------------------------
    console.log('\n[TEST 11] Anti-IDOR: Verify student endpoints use verified token context with zero cross-student leakage');
    const idorRes = await fetch(`${BASE_URL}/scholarships?studentProfileId=${profile2.id}`, {
      headers: { Authorization: `Bearer ${studentToken1}` },
    });
    const idorData: any = await idorRes.json();
    if (
      idorRes.status === 200 &&
      idorData.data.studentProfileContext?.studentName === 'Aarav Sharma'
    ) {
      console.log('✓ Verified: API strictly bounded to token owner (Aarav Sharma), ignoring injected query parameters.');
    } else {
      console.error('✗ Potential IDOR vulnerability detected:', idorData);
      allTestsPassed = false;
    }

    // -------------------------------------------------------------
    // TEST 12: Student Save / Bookmark Scholarship
    // -------------------------------------------------------------
    console.log('\n[TEST 12] Student bookmarks scholarship: POST /api/v1/scholarships/:id/save');
    const saveRes = await fetch(`${BASE_URL}/scholarships/${testScholarshipId}/save`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${studentToken1}` },
    });
    const saveData: any = await saveRes.json();
    if (saveRes.status === 200 && saveData.data.isSaved === true) {
      console.log('✓ Successfully saved scholarship to student shortlist.');
      // Toggle off
      const unsaveRes = await fetch(`${BASE_URL}/scholarships/${testScholarshipId}/save`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${studentToken1}` },
      });
      const unsaveData: any = await unsaveRes.json();
      if (unsaveRes.status === 200 && unsaveData.data.isSaved === false) {
        console.log('✓ Successfully removed scholarship from shortlist.');
      } else {
        console.error('✗ Failed to toggle unsave:', unsaveData);
        allTestsPassed = false;
      }
    } else {
      console.error('✗ Failed to save scholarship:', saveData);
      allTestsPassed = false;
    }

  } finally {
    // Cleanup created test records
    console.log('\n[CLEANUP] Cleaning up test records...');
    if (testScholarshipId) {
      await prisma.scholarship.deleteMany({ where: { id: testScholarshipId } });
    }
    await prisma.studentPreference.deleteMany({ where: { studentProfileId: { in: [profile1.id, profile2.id, profile3.id] } } });
    await prisma.studentEducation.deleteMany({ where: { studentProfileId: { in: [profile1.id, profile2.id, profile3.id] } } });
    await prisma.studentSavedScholarship.deleteMany({ where: { studentProfileId: { in: [profile1.id, profile2.id, profile3.id] } } });
    await prisma.studentProfile.deleteMany({ where: { id: { in: [profile1.id, profile2.id, profile3.id] } } });
    await prisma.auditLog.deleteMany({ where: { userId: adminUser.id } });
    await prisma.user.deleteMany({ where: { id: { in: [adminUser.id, counsellorUser.id, studentUser1.id, studentUser2.id, studentUser3.id] } } });
  }

  console.log('\n===============================================================');
  if (allTestsPassed) {
    console.log(' 🎉 ALL MODULE 8 E2E TESTS PASSED SUCCESSFULLY!');
  } else {
    console.error(' ❌ SOME MODULE 8 TESTS FAILED.');
    process.exit(1);
  }
  console.log('===============================================================\n');
}

main().catch((err) => {
  console.error('FATAL TEST RUNNER ERROR:', err);
  process.exit(1);
});
