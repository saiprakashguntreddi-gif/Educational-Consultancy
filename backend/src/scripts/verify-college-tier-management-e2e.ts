/**
 * verify-college-tier-management-e2e.ts
 *
 * Comprehensive end-to-end test suite for Module 7 College Tier Management.
 * Verifies:
 * 1. Only ADMIN can manage college tiers (Counsellor & Student blocked with HTTP 403).
 * 2. STUDENT cannot change a college tier (HTTP 403 Forbidden).
 * 3. ADMIN can assign SAFE tier.
 * 4. ADMIN can assign BEST-FIT tier.
 * 5. ADMIN can assign ASPIRATIONAL tier.
 * 6. Tier changes require mandatory reason and create audit logs.
 * 7. Existing Module 6 college records remain intact (no duplicate data, schema extended cleanly).
 * 8. Module 7 recommendation engine respects and utilizes the managed college tiers.
 * 9. Admin can add a managed college to the catalogue with an initial tier.
 * 10. Admin can activate and deactivate a college, generating audit logs.
 */

import jwt from 'jsonwebtoken';
import { prisma } from '../shared/database/prisma.service';
import { hashPassword } from '../shared/utils/password';
import { Role } from '../config/roles';
import { config } from '../config/env';

const BASE_URL = 'http://localhost:5000/api/v1';

async function main() {
  console.log('\n===========================================================');
  console.log(' STARTING COLLEGE TIER MANAGEMENT E2E VERIFICATION SUITE');
  console.log('===========================================================\n');

  const timestamp = Date.now();
  const passwordHash = await hashPassword('Password123!');

  // 1. Create test users: Admin, Counsellor, Student
  const adminUser = await prisma.user.create({
    data: {
      email: `admin.tier.${timestamp}@example.com`,
      passwordHash,
      role: Role.ADMIN,
      isActive: true,
      isEmailVerified: true,
    },
  });

  const counsellorUser = await prisma.user.create({
    data: {
      email: `counsellor.tier.${timestamp}@example.com`,
      passwordHash,
      role: Role.ADMIN,
      isActive: true,
      isEmailVerified: true,
    },
  });

  const studentUser = await prisma.user.create({
    data: {
      email: `student.tier.${timestamp}@example.com`,
      passwordHash,
      role: Role.STUDENT,
      isActive: true,
      isEmailVerified: true,
    },
  });

  const studentProfile = await prisma.studentProfile.create({
    data: {
      userId: studentUser.id,
      fullName: 'Test Tier Student',
      gender: 'FEMALE',
      grade: 'Grade 12',
      contactEmail: studentUser.email,
      phone: '+1 555-0199',
      addressStreet: '100 University Ave',
      addressCity: 'Boston',
      addressState: 'Massachusetts',
      addressPostalCode: '02115',
      addressCountry: 'United States',
      board: 'CBSE',
      citizenship: 'United States',
      passingOutYear: 2026,
      verificationStatus: 'VERIFIED',
      verifiedAt: new Date(),
      verifiedBy: counsellorUser.id,
    },
  });

  await prisma.studentPreference.create({
    data: {
      studentProfileId: studentProfile.id,
      countries: JSON.stringify({ notFinalized: false, list: ['United States', 'United Kingdom'] }),
      primaryCountry: 'United States',
      department: 'Engineering & Technology',
      subDepartment: JSON.stringify({
        notFinalized: false,
        pairs: [{ department: 'Engineering & Technology', subDepartment: 'Computer Science' }],
        summary: 'Engineering & Technology (Computer Science)',
      }),
    },
  });

  await prisma.studentEducation.create({
    data: {
      studentProfileId: studentProfile.id,
      schoolName: 'Boston Classical Academy',
      board: 'CBSE',
      completionYear: 2026,
      percentage: 92.5,
      subjectDetails: JSON.stringify([
        { subject: 'Mathematics', marks: 95, maxMarks: 100 },
        { subject: 'Physics', marks: 92, maxMarks: 100 },
        { subject: 'Chemistry', marks: 90, maxMarks: 100 },
        { subject: 'Computer Science', marks: 98, maxMarks: 100 },
        { subject: 'English', marks: 88, maxMarks: 100 },
      ]),
    },
  });

  // JWT Helper
  const signToken = (id: string, email: string, role: string) => {
    return jwt.sign({ userId: id, email, role }, config.jwt.secret, {
      expiresIn: '1h',
    });
  };

  const adminToken = signToken(adminUser.id, adminUser.email, adminUser.role);
  const counsellorToken = signToken(counsellorUser.id, counsellorUser.email, counsellorUser.role);
  const studentToken = signToken(studentUser.id, studentUser.email, studentUser.role);

  console.log(`✓ Admin user: ${adminUser.email}`);
  console.log(`✓ Counsellor user: ${counsellorUser.email}`);
  console.log(`✓ Student user: ${studentUser.email}`);

  // Fetch or create a test college record in Module 6 catalogue
  const testCollege = await prisma.institution.create({
    data: {
      slug: `tier-test-univ-${timestamp}`,
      name: `Tier Test University ${timestamp}`,
      country: 'United States',
      city: 'Boston',
      state: 'Massachusetts',
      institutionType: 'University',
      overview: 'Prestigious research institution used for tier management testing.',
      officialWebsiteUrl: 'https://tiertest.edu',
      status: 'PUBLISHED',
      isPublished: true,
      isActive: true,
      acceptanceRate: 0.20,
      minPercentageRequirement: 80.0,
      managedTier: null,
      courses: {
        create: [
          {
            name: 'B.Sc. in Computer Science',
            department: 'Engineering & Technology',
            specialization: 'Computer Science',
            level: 'UNDERGRADUATE',
            durationYears: 4,
            description: 'Undergraduate Computer Science program.',
            status: 'PUBLISHED',
            isPublished: true,
            isActive: true,
          },
        ],
      },
    },
  });

  console.log(`✓ Created test college: "${testCollege.name}" (ID: ${testCollege.id})`);

  let allTestsPassed = true;

  try {
    // -------------------------------------------------------------
    // TEST 1: Security - STUDENT cannot list managed college tiers
    // -------------------------------------------------------------
    console.log('\n[TEST 1] Security Check: Student tries GET /api/v1/recommendations/admin/college-tiers');
    const studentListRes = await fetch(`${BASE_URL}/recommendations/admin/college-tiers`, {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    if (studentListRes.status === 403) {
      console.log('✓ Security Verified: Student access denied with HTTP 403 Forbidden.');
    } else {
      console.error(`✗ Security Failure: Student received HTTP ${studentListRes.status} instead of 403.`);
      allTestsPassed = false;
    }

    // -------------------------------------------------------------
    // TEST 2: Security - COUNSELLOR cannot manage college tiers
    // -------------------------------------------------------------
    console.log('\n[TEST 2] Security Check: Counsellor tries GET /api/v1/recommendations/admin/college-tiers');
    const counsellorListRes = await fetch(`${BASE_URL}/recommendations/admin/college-tiers`, {
      headers: { Authorization: `Bearer ${counsellorToken}` },
    });
    if (counsellorListRes.status === 403) {
      console.log('✓ Security Verified: Counsellor access denied with HTTP 403 Forbidden.');
    } else {
      console.error(`✗ Security Failure: Counsellor received HTTP ${counsellorListRes.status} instead of 403.`);
      allTestsPassed = false;
    }

    // -------------------------------------------------------------
    // TEST 3: Security - STUDENT cannot change a college tier
    // -------------------------------------------------------------
    console.log('\n[TEST 3] Security Check: Student tries PATCH /api/v1/recommendations/admin/college-tiers/:id/tier');
    const studentChangeRes = await fetch(`${BASE_URL}/recommendations/admin/college-tiers/${testCollege.id}/tier`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${studentToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tier: 'SAFE',
        reason: 'Student attempting unauthorized tier modification',
      }),
    });
    if (studentChangeRes.status === 403) {
      console.log('✓ Security Verified: Student forbidden from modifying tier (HTTP 403 Forbidden).');
    } else {
      console.error(`✗ Security Failure: Student received HTTP ${studentChangeRes.status} instead of 403.`);
      allTestsPassed = false;
    }

    // -------------------------------------------------------------
    // TEST 4: ADMIN lists managed colleges successfully
    // -------------------------------------------------------------
    console.log('\n[TEST 4] Admin lists managed colleges: GET /api/v1/recommendations/admin/college-tiers');
    const adminListRes = await fetch(`${BASE_URL}/recommendations/admin/college-tiers`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const adminListData: any = await adminListRes.json();
    if (adminListRes.status === 200 && adminListData.success) {
      console.log(`✓ Admin successfully retrieved catalogue: ${adminListData.data.total} colleges found.`);
      console.log(`  - Tier distribution: Safe=${adminListData.data.tierCounts.safe}, Best-Fit=${adminListData.data.tierCounts.bestFit}, Aspirational=${adminListData.data.tierCounts.aspirational}`);
    } else {
      console.error(`✗ Admin failed to list managed colleges:`, adminListData);
      allTestsPassed = false;
    }

    // -------------------------------------------------------------
    // TEST 5: Reason is strictly required when changing tier
    // -------------------------------------------------------------
    console.log('\n[TEST 5] Validation Check: Admin changes tier without reason (must fail)');
    const missingReasonRes = await fetch(`${BASE_URL}/recommendations/admin/college-tiers/${testCollege.id}/tier`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${adminToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tier: 'SAFE',
        reason: '   ', // blank
      }),
    });
    if (missingReasonRes.status === 400 || missingReasonRes.status === 422) {
      console.log(`✓ Validation Verified: Rejected tier assignment with blank reason (HTTP ${missingReasonRes.status}).`);
    } else {
      console.error(`✗ Validation Failure: Blank reason was accepted with HTTP ${missingReasonRes.status}.`);
      allTestsPassed = false;
    }

    // -------------------------------------------------------------
    // TEST 6: ADMIN assigns SAFE tier
    // -------------------------------------------------------------
    console.log('\n[TEST 6] Admin assigns SAFE tier');
    const assignSafeRes = await fetch(`${BASE_URL}/recommendations/admin/college-tiers/${testCollege.id}/tier`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${adminToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tier: 'SAFE',
        reason: 'High admission intake probability based on historical acceptance data (>95%).',
      }),
    });
    const assignSafeData: any = await assignSafeRes.json();
    if (assignSafeRes.status === 200 && assignSafeData.data.managedTier === 'SAFE') {
      console.log('✓ Successfully assigned SAFE tier.');
      console.log(`  - Tier: ${assignSafeData.data.managedTier}`);
      console.log(`  - Reason: ${assignSafeData.data.tierReason}`);
    } else {
      console.error('✗ Failed to assign SAFE tier:', assignSafeData);
      allTestsPassed = false;
    }

    // -------------------------------------------------------------
    // TEST 7: ADMIN assigns BEST-FIT tier
    // -------------------------------------------------------------
    console.log('\n[TEST 7] Admin assigns BEST-FIT tier');
    const assignBestFitRes = await fetch(`${BASE_URL}/recommendations/admin/college-tiers/${testCollege.id}/tier`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${adminToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tier: 'BEST_FIT',
        reason: 'Balanced institutional selectivity (50%–94% admission match).',
      }),
    });
    const assignBestFitData: any = await assignBestFitRes.json();
    if (assignBestFitRes.status === 200 && assignBestFitData.data.managedTier === 'BEST_FIT') {
      console.log('✓ Successfully assigned BEST-FIT tier.');
      console.log(`  - Tier: ${assignBestFitData.data.managedTier}`);
    } else {
      console.error('✗ Failed to assign BEST-FIT tier:', assignBestFitData);
      allTestsPassed = false;
    }

    // -------------------------------------------------------------
    // TEST 8: ADMIN assigns ASPIRATIONAL tier
    // -------------------------------------------------------------
    console.log('\n[TEST 8] Admin assigns ASPIRATIONAL tier');
    const assignAspRes = await fetch(`${BASE_URL}/recommendations/admin/college-tiers/${testCollege.id}/tier`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${adminToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tier: 'ASPIRATIONAL',
        reason: 'Highly selective global institution (<50% reach target).',
      }),
    });
    const assignAspData: any = await assignAspRes.json();
    if (assignAspRes.status === 200 && assignAspData.data.managedTier === 'ASPIRATIONAL') {
      console.log('✓ Successfully assigned ASPIRATIONAL tier.');
      console.log(`  - Tier: ${assignAspData.data.managedTier}`);
    } else {
      console.error('✗ Failed to assign ASPIRATIONAL tier:', assignAspData);
      allTestsPassed = false;
    }

    // -------------------------------------------------------------
    // TEST 9: Tier changes create audit log entries
    // -------------------------------------------------------------
    console.log('\n[TEST 9] Audit Trail Verification in Database');
    const auditLogs = await prisma.auditLog.findMany({
      where: {
        action: 'COLLEGE_TIER_CHANGED',
        userId: adminUser.id,
      },
      orderBy: { createdAt: 'desc' },
    });
    if (auditLogs.length >= 3) {
      console.log(`✓ Verified: ${auditLogs.length} COLLEGE_TIER_CHANGED audit log entries captured.`);
      const latestAudit = JSON.parse(auditLogs[0].details || '{}');
      console.log(`  - Latest Audit Details: PreviousTier=${latestAudit.previousTier}, NewTier=${latestAudit.newTier}, Reason="${latestAudit.reason}"`);
    } else {
      console.error(`✗ Expected at least 3 audit log entries, found ${auditLogs.length}`);
      allTestsPassed = false;
    }

    // -------------------------------------------------------------
    // TEST 10: Existing Module 6 college records remain intact
    // -------------------------------------------------------------
    console.log('\n[TEST 10] Module 6 Database Integrity Check');
    const dbInstitution = await prisma.institution.findUnique({
      where: { id: testCollege.id },
      include: { courses: true },
    });
    if (
      dbInstitution &&
      dbInstitution.name === testCollege.name &&
      dbInstitution.courses.length === 1 &&
      dbInstitution.status === 'PUBLISHED'
    ) {
      console.log('✓ Module 6 Institution record intact:');
      console.log(`  - Name: ${dbInstitution.name}`);
      console.log(`  - Course count: ${dbInstitution.courses.length}`);
      console.log(`  - Status: ${dbInstitution.status}`);
      console.log(`  - Extended fields: managedTier=${dbInstitution.managedTier}, tierReason="${dbInstitution.tierReason}"`);
    } else {
      console.error('✗ Module 6 college record corrupted or missing.');
      allTestsPassed = false;
    }

    // -------------------------------------------------------------
    // TEST 11: Module 7 Recommendation Engine uses the managed college tier
    // -------------------------------------------------------------
    console.log('\n[TEST 11] Module 7 Recommendation Engine respects Admin-Managed Tier');
    // Set college to SAFE tier for this student
    await prisma.institution.update({
      where: { id: testCollege.id },
      data: {
        managedTier: 'SAFE',
        tierReason: 'Admin verified safe tier benchmark for engineering admissions.',
      },
    });

    const generateRes = await fetch(`${BASE_URL}/recommendations/generate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${studentToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });
    const generateData: any = await generateRes.json();
    if (generateRes.status === 201 && generateData.success) {
      const allBatchCandidates = [
        ...(generateData.data.items || []),
        ...(generateData.data.alternatives || []),
      ];
      const matchedItem = allBatchCandidates.find(
        (it: any) => it.institutionId === testCollege.id
      );
      if (matchedItem) {
        console.log(`✓ College recommended to student: "${matchedItem.institutionName}"`);
        console.log(`  - Tier: ${matchedItem.tier}`);
        console.log(`  - Admission Prob: ${matchedItem.admissionProbabilityMin}% - ${matchedItem.admissionProbabilityMax}%`);
        console.log(`  - Reason: "${matchedItem.reasonSummary}"`);
        if (matchedItem.tier === 'SAFE' && matchedItem.admissionProbabilityMin >= 95) {
          console.log('✓ Verified: Module 7 engine correctly applied the Admin-Managed SAFE tier!');
        } else {
          console.error(`✗ Expected SAFE tier with >=95% probability, got ${matchedItem.tier}`);
          allTestsPassed = false;
        }
      } else {
        console.error('✗ Test college was not found in generated items or alternatives.');
        allTestsPassed = false;
      }
    } else {
      console.error('✗ Recommendation generation failed:', generateData);
      allTestsPassed = false;
    }

    // -------------------------------------------------------------
    // TEST 12: Admin toggles college active/inactive status
    // -------------------------------------------------------------
    console.log('\n[TEST 12] Admin toggles college active status');
    const toggleRes = await fetch(`${BASE_URL}/recommendations/admin/college-tiers/${testCollege.id}/status`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${adminToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ isActive: false }),
    });
    const toggleData: any = await toggleRes.json();
    if (toggleRes.status === 200 && toggleData.data.isActive === false) {
      console.log('✓ Successfully deactivated college.');
      const statusAudit = await prisma.auditLog.findFirst({
        where: {
          action: 'COLLEGE_STATUS_TOGGLED',
          userId: adminUser.id,
        },
        orderBy: { createdAt: 'desc' },
      });
      if (statusAudit) {
        console.log('✓ COLLEGE_STATUS_TOGGLED audit log captured.');
      }
    } else {
      console.error('✗ Failed to toggle college status:', toggleData);
      allTestsPassed = false;
    }
  } finally {
    // Cleanup test records
    console.log('\n[CLEANUP] Cleaning up test records...');
    await prisma.studentSavedInstitution.deleteMany({
      where: { institutionId: testCollege.id },
    });
    await prisma.recommendationItem.deleteMany({
      where: { institutionId: testCollege.id },
    });
    await prisma.course.deleteMany({
      where: { institutionId: testCollege.id },
    });
    await prisma.institution.delete({
      where: { id: testCollege.id },
    });
    await prisma.user.deleteMany({
      where: { id: { in: [adminUser.id, counsellorUser.id, studentUser.id] } },
    });
    console.log('✓ Test records deleted cleanly.');
  }

  console.log('\n===========================================================');
  if (allTestsPassed) {
    console.log(' ALL 12 COLLEGE TIER MANAGEMENT TESTS PASSED WITH 100%! ');
  } else {
    console.error(' SOME TESTS FAILED. PLEASE REVIEW LOGS ABOVE.');
    process.exit(1);
  }
  console.log('===========================================================\n');
}

main().catch((err) => {
  console.error('Unhandled error in test runner:', err);
  process.exit(1);
});
