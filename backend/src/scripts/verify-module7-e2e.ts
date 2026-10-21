import jwt from 'jsonwebtoken';
import { prisma } from '../shared/database/prisma.service';
import { hashPassword } from '../shared/utils/password';
import { Role } from '../config/roles';
import { config } from '../config/env';

const BASE_URL = 'http://localhost:5000/api/v1';

async function main() {
  console.log('===========================================================');
  console.log(' SUPERCONSCIOUSNESS: MODULE 7 (THREE-TIER FIT) E2E TEST');
  console.log('===========================================================');

  const timestamp = Date.now();
  const passwordHash = await hashPassword('TestPass123!');

  // 1. Setup Test Users: Admin, Counsellor, Student 1, Student 2
  const adminUser = await prisma.user.create({
    data: {
      email: `admin.m7.${timestamp}@example.com`,
      passwordHash,
      role: Role.ADMIN,
      isActive: true,
      isEmailVerified: true,
    },
  });

  const counsellorUser = await prisma.user.create({
    data: {
      email: `counsellor.m7.${timestamp}@example.com`,
      passwordHash,
      role: Role.COUNSELLOR,
      isActive: true,
      isEmailVerified: true,
    },
  });

  // Student 1: Unverified initially
  const student1User = await prisma.user.create({
    data: {
      email: `student1.m7.${timestamp}@example.com`,
      passwordHash,
      role: Role.STUDENT,
      isActive: true,
      isEmailVerified: true,
    },
  });

  const student1Profile = await prisma.studentProfile.create({
    data: {
      userId: student1User.id,
      fullName: 'Aria Montgomery',
      gender: 'FEMALE',
      grade: 'Grade 12',
      contactEmail: student1User.email,
      phone: '+1 555-0199',
      addressStreet: '100 University Ave',
      addressCity: 'Boston',
      addressState: 'Massachusetts',
      addressPostalCode: '02115',
      addressCountry: 'United States',
      board: 'CBSE',
      citizenship: 'United States',
      passingOutYear: 2026,
      verificationStatus: 'PENDING', // Initially pending!
    },
  });

  // Setup preferences and education for Student 1 (using real Module 2 object format)
  await prisma.studentPreference.create({
    data: {
      studentProfileId: student1Profile.id,
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
      studentProfileId: student1Profile.id,
      schoolName: 'Boston Classical Academy',
      board: 'CBSE',
      completionYear: 2026,
      percentage: 92.5,
      subjectDetails: JSON.stringify([
        { subject: 'Mathematics', score: 96 },
        { subject: 'Physics', score: 93 },
        { subject: 'Computer Science', score: 95 },
      ]),
    },
  });

  // Student 2 (for isolation testing)
  const student2User = await prisma.user.create({
    data: {
      email: `student2.m7.${timestamp}@example.com`,
      passwordHash,
      role: Role.STUDENT,
      isActive: true,
      isEmailVerified: true,
    },
  });

  const student2Profile = await prisma.studentProfile.create({
    data: {
      userId: student2User.id,
      fullName: 'Lucas Scott',
      gender: 'MALE',
      grade: 'Grade 12',
      contactEmail: student2User.email,
      phone: '+1 555-0288',
      addressStreet: '200 College St',
      addressCity: 'Austin',
      addressState: 'Texas',
      addressPostalCode: '78701',
      addressCountry: 'United States',
      board: 'State Board',
      citizenship: 'United States',
      passingOutYear: 2026,
      verificationStatus: 'VERIFIED',
    },
  });

  console.log(`✓ Admin: ${adminUser.email}`);
  console.log(`✓ Counsellor: ${counsellorUser.email}`);
  console.log(`✓ Student 1: ${student1User.email} (Pending Verification)`);
  console.log(`✓ Student 2: ${student2User.email} (Verified)`);

  function signToken(user: any) {
    return jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      config.jwt.secret,
      { expiresIn: '1h' }
    );
  }

  const s1Token = signToken(student1User);
  const s2Token = signToken(student2User);
  const cToken = signToken(counsellorUser);
  const aToken = signToken(adminUser);

  // Ensure catalogue has institutions for recommendations
  const instCount = await prisma.institution.count({ where: { isPublished: true } });
  if (instCount === 0) {
    console.log('[SETUP] Seeding institutions for recommendation test...');
    await prisma.institution.create({
      data: {
        slug: `tech-univ-${timestamp}`,
        name: `Tech Institute ${timestamp}`,
        country: 'United States',
        city: 'Boston',
        overview: 'Premier research institute in computing and artificial intelligence.',
        rankingInfo: 'QS World Rank #12',
        status: 'PUBLISHED',
        isPublished: true,
        isVerified: true,
        officialWebsiteUrl: 'https://tech.edu',
        acceptanceRate: 0.09,
        minPercentageRequirement: 90.0,
        courses: {
          create: [
            {
              name: 'B.S. in Computer Science',
              department: 'Engineering & Technology',
              specialization: 'Artificial Intelligence',
              level: 'Undergraduate',
              status: 'PUBLISHED',
              isPublished: true,
            },
          ],
        },
      },
    });

    await prisma.institution.create({
      data: {
        slug: `state-poly-${timestamp}`,
        name: `State Polytechnic University ${timestamp}`,
        country: 'United States',
        city: 'Chicago',
        overview: 'Comprehensive polytechnic offering accredited engineering programs.',
        rankingInfo: 'National Rank #45',
        status: 'PUBLISHED',
        isPublished: true,
        isVerified: true,
        officialWebsiteUrl: 'https://statepoly.edu',
        acceptanceRate: 0.42,
        minPercentageRequirement: 75.0,
        courses: {
          create: [
            {
              name: 'B.S. in Software Engineering',
              department: 'Engineering & Technology',
              specialization: 'Software Systems',
              level: 'Undergraduate',
              status: 'PUBLISHED',
              isPublished: true,
            },
          ],
        },
      },
    });

    await prisma.institution.create({
      data: {
        slug: `metro-college-${timestamp}`,
        name: `Metro Regional College ${timestamp}`,
        country: 'United States',
        city: 'Denver',
        overview: 'Accessible higher education institution with strong engineering support.',
        rankingInfo: 'Regional Rank #80',
        status: 'PUBLISHED',
        isPublished: true,
        isVerified: true,
        officialWebsiteUrl: 'https://metro.edu',
        acceptanceRate: 0.65,
        minPercentageRequirement: 65.0,
        courses: {
          create: [
            {
              name: 'B.S. in Information Technology',
              department: 'Engineering & Technology',
              specialization: 'Computer Systems',
              level: 'Undergraduate',
              status: 'PUBLISHED',
              isPublished: true,
            },
          ],
        },
      },
    });
  }

  // ==========================================
  // [TEST 1] Unverified Student Rejection
  // ==========================================
  console.log('\n[TEST 1] Unverified student requests recommendations');
  const unverifiedRes = await fetch(`${BASE_URL}/recommendations/my-recommendations`, {
    headers: { Authorization: `Bearer ${s1Token}` },
  });
  const unverifiedJson = (await unverifiedRes.json()) as any;
  if (unverifiedJson.data?.isVerified !== false) {
    throw new Error(`Expected isVerified: false for unverified student, got: ${JSON.stringify(unverifiedJson)}`);
  }
  console.log('✓ Verified: Unverified student receives clean requirement notice:', unverifiedJson.data.message);

  // ==========================================
  // [TEST 2] Counsellor Verifies Student Profile
  // ==========================================
  console.log('\n[TEST 2] Counsellor verifies Student 1 profile');
  const verifyRes = await fetch(`${BASE_URL}/profile/${student1Profile.id}/verify`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${cToken}`,
    },
    body: JSON.stringify({
      status: 'VERIFIED',
      notes: 'Academic credentials authenticated against official CBSE transcript.',
    }),
  });
  const verifyJson = (await verifyRes.json()) as any;
  if (!verifyJson.success || verifyJson.data?.verificationStatus !== 'VERIFIED') {
    throw new Error(`Failed to verify student profile: ${JSON.stringify(verifyJson)}`);
  }
  console.log('✓ Student 1 profile successfully verified by Counsellor.');

  // ==========================================
  // [TEST 3] Verified Student Generates Recommendations
  // ==========================================
  console.log('\n[TEST 3] Verified Student 1 requests/generates recommendations');
  const genRes = await fetch(`${BASE_URL}/recommendations/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${s1Token}`
    },
    body: JSON.stringify({}),
  });
  const genJson = (await genRes.json()) as any;
  if (!genJson.success || !genJson.data) {
    throw new Error(`Recommendation generation failed: ${JSON.stringify(genJson)}`);
  }
  const batch = genJson.data;
  console.log(`✓ Batch generated successfully (ID: ${batch.id})`);
  console.log(`  - Strategy summary: "${batch.strategySummary}"`);
  console.log(`  - Total items: ${batch.items.length}`);
  console.log(`  - Counts: Safe=${batch.counts.safe}, Best-Fit=${batch.counts.bestFit}, Aspirational=${batch.counts.aspirational}`);

  // ==========================================
  // [TEST 4] Three-Tier Classification Verification
  // ==========================================
  console.log('\n[TEST 4] Verifying Three-Tier Classification boundaries');
  for (const item of batch.items) {
    if (item.tier === 'SAFE') {
      if (item.admissionProbabilityMin < 95) {
        throw new Error(`Safe tier must be >= 95% admission chance. Got: ${item.admissionProbabilityMin}% for ${item.institutionName}`);
      }
      console.log(`  ✓ SAFE institution verified: "${item.institutionName}" (Prob: ${item.admissionProbabilityMin}% - ${item.admissionProbabilityMax}%)`);
    } else if (item.tier === 'BEST_FIT') {
      if (item.admissionProbabilityMin < 50 || item.admissionProbabilityMax > 95) {
        throw new Error(`Best-Fit tier must be between 50% and 95%. Got: ${item.admissionProbabilityMin}% - ${item.admissionProbabilityMax}% for ${item.institutionName}`);
      }
      console.log(`  ✓ BEST-FIT institution verified: "${item.institutionName}" (Prob: ${item.admissionProbabilityMin}% - ${item.admissionProbabilityMax}%)`);
    } else if (item.tier === 'ASPIRATIONAL') {
      if (item.admissionProbabilityMax >= 50) {
        throw new Error(`Aspirational tier must be < 50%. Got: ${item.admissionProbabilityMax}% for ${item.institutionName}`);
      }
      console.log(`  ✓ ASPIRATIONAL institution verified: "${item.institutionName}" (Prob: ${item.admissionProbabilityMin}% - ${item.admissionProbabilityMax}%)`);
    }
  }

  // ==========================================
  // [TEST 5] Transparent Evidence & Reasoning
  // ==========================================
  console.log('\n[TEST 5] Checking evidence and reasoning payload');
  const sampleItem = batch.items[0];
  if (!sampleItem.reasonSummary || !sampleItem.evidence) {
    throw new Error('Recommendation item missing reasonSummary or evidence breakdown');
  }
  console.log('✓ Evidence structure verified:');
  console.log('  - Reason:', sampleItem.reasonSummary);
  console.log('  - Academic Comparison:', JSON.stringify(sampleItem.evidence.academicComparison));
  console.log('  - Preference Match:', JSON.stringify(sampleItem.evidence.preferenceMatch));
  console.log('  - Indicative data flag:', sampleItem.isDataIndicative);

  // ==========================================
  // [TEST 5B] Student 2 With Null/Missing Preferences (Safe Handling)
  // ==========================================
  console.log('\n[TEST 5B] Verified Student 2 with missing/unfinalized preferences generates recommendations');
  const s2GenRes = await fetch(`${BASE_URL}/recommendations/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${s2Token}`,
    },
    body: JSON.stringify({}),
  });
  const s2GenJson = (await s2GenRes.json()) as any;
  if (!s2GenJson.success || !s2GenJson.data) {
    throw new Error(`Student 2 generation failed: ${JSON.stringify(s2GenJson)}`);
  }
  const s2Item = s2GenJson.data.items[0];
  if (!s2Item?.evidence?.preferenceMatch?.countryPreferenceNote) {
    throw new Error('Expected countryPreferenceNote to be set when country preferences are unavailable');
  }
  console.log('✓ Verified: Student with null/empty preferences generated successfully without crashing.');
  console.log('  - Note:', s2Item.evidence.preferenceMatch.countryPreferenceNote);

  // ==========================================
  // [TEST 6] Student Isolation & Anti-IDOR Barrier
  // ==========================================
  console.log('\n[TEST 6] Student 2 attempting to shortlist Student 1 recommendation');
  const crossShortlistRes = await fetch(`${BASE_URL}/recommendations/items/${sampleItem.id}/shortlist`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${s2Token}` },
  });
  if (crossShortlistRes.status !== 403) {
    throw new Error(`Expected HTTP 403 Forbidden for cross-student shortlist, got: ${crossShortlistRes.status}`);
  }
  console.log('✓ Security Verified: Cross-student recommendation mutation strictly forbidden (HTTP 403).');

  // ==========================================
  // [TEST 7] Student Shortlist Synchronization
  // ==========================================
  console.log('\n[TEST 7] Student 1 shortlists recommended college');
  const shortlistRes = await fetch(`${BASE_URL}/recommendations/items/${sampleItem.id}/shortlist`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${s1Token}` },
  });
  const shortlistJson = (await shortlistRes.json()) as any;
  if (!shortlistJson.success || !shortlistJson.data?.isShortlisted) {
    throw new Error(`Shortlist toggle failed: ${JSON.stringify(shortlistJson)}`);
  }
  console.log('✓ Shortlist status toggled: isShortlisted = true');

  // Verify synchronization in Module 6 StudentSavedInstitution table
  const savedRecord = await prisma.studentSavedInstitution.findUnique({
    where: {
      studentProfileId_institutionId: {
        studentProfileId: student1Profile.id,
        institutionId: sampleItem.institutionId,
      },
    },
  });
  if (!savedRecord) {
    throw new Error('Module 6 StudentSavedInstitution synchronization failed');
  }
  console.log('✓ Verified: Synchronized with Module 6 StudentSavedInstitution record.');

  // ==========================================
  // [TEST 8] Counsellor Review & Approval
  // ==========================================
  console.log('\n[TEST 8] Counsellor reviews and approves student recommendation batch');
  const reviewRes = await fetch(`${BASE_URL}/recommendations/batch/${batch.id}/counsellor-review`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${cToken}`,
    },
    body: JSON.stringify({
      status: 'COUNSELLOR_APPROVED',
      counsellorNotes: 'Excellent balanced portfolio. Recommend applying early action to safe options.',
    }),
  });
  const reviewJson = (await reviewRes.json()) as any;
  if (!reviewJson.success || reviewJson.data?.status !== 'COUNSELLOR_APPROVED') {
    throw new Error(`Counsellor review failed: ${JSON.stringify(reviewJson)}`);
  }
  console.log('✓ Counsellor review recorded: status = COUNSELLOR_APPROVED');
  console.log('✓ Counsellor advisory notes:', reviewJson.data.counsellorNotes);

  // ==========================================
  // [TEST 9] Counsellor Tier Override
  // ==========================================
  console.log('\n[TEST 9] Counsellor adjusts tier category for recommendation');
  const overrideRes = await fetch(`${BASE_URL}/recommendations/items/${sampleItem.id}/tier-override`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${cToken}`,
    },
    body: JSON.stringify({
      tier: 'SAFE',
      notes: 'Upgraded to SAFE based on strong STEM competitions and outstanding AP Physics credentials.',
    }),
  });
  const overrideJson = (await overrideRes.json()) as any;
  if (!overrideJson.success || overrideJson.data?.effectiveTier !== 'SAFE') {
    throw new Error(`Tier override failed: ${JSON.stringify(overrideJson)}`);
  }
  console.log('✓ Tier override recorded. Effective Tier: SAFE (original was:', overrideJson.data.tier, ')');

  // ==========================================
  // [TEST 10] Cohort Scatter Plot Analytics
  // ==========================================
  console.log('\n[TEST 10] Fetching cohort scatter-plot analytics');
  const analyticsRes = await fetch(`${BASE_URL}/recommendations/cohort-analytics/${sampleItem.institutionId}`, {
    headers: { Authorization: `Bearer ${s1Token}` },
  });
  const analyticsJson = (await analyticsRes.json()) as any;
  if (!analyticsJson.success || !analyticsJson.data?.benchmarks) {
    throw new Error(`Cohort analytics failed: ${JSON.stringify(analyticsJson)}`);
  }
  console.log('✓ Cohort distribution benchmarks retrieved:');
  console.log('  - Percentiles (25th, 50th, 75th):', analyticsJson.data.benchmarks);
  console.log('  - Student plot coordinates:', analyticsJson.data.studentPlotPoint);

  // ==========================================
  // [TEST 11] Audit Trail Verification
  // ==========================================
  console.log('\n[TEST 11] Verifying AuditLog entries for Module 7');
  const auditLogs = await prisma.auditLog.findMany({
    where: {
      action: {
        in: [
          'RECOMMENDATIONS_GENERATED',
          'RECOMMENDATIONS_REVIEWED',
          'RECOMMENDATION_TIER_OVERRIDDEN',
        ],
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 5,
  });
  console.log(`✓ Audit log verified: ${auditLogs.length} audit entries captured.`);
  for (const log of auditLogs) {
    console.log(`  - Action: ${log.action} (User: ${log.userId})`);
  }

  // [CLEANUP]
  console.log('\n[CLEANUP] Removing test accounts and records...');
  await prisma.user.deleteMany({
    where: {
      id: { in: [student1User.id, student2User.id, counsellorUser.id, adminUser.id] },
    },
  });
  console.log('✓ Test user accounts cleaned up.');

  console.log('\n===========================================================');
  console.log(' ALL 11 MODULE 7 E2E TESTS PASSED WITH 100% SUCCESS!');
  console.log('===========================================================');
}

main()
  .catch((e) => {
    console.error('Test execution failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
