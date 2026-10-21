import { prisma } from '../shared/database/prisma.service';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';

const API_BASE = 'http://localhost:5000/api/v1';

async function runModule5Tests() {
  console.log('===========================================================');
  console.log(' SUPERCONSCIOUSNESS: MODULE 5 (PERSONAL INFO) E2E TEST');
  console.log('===========================================================');

  const timestamp = Date.now();
  const student1Email = `student1.personal.${timestamp}@example.com`;
  const student2Email = `student2.personal.${timestamp}@example.com`;
  const counsellorEmail = `counsellor.personal.${timestamp}@example.com`;

  // Helper to register user + profile
  async function registerUser(email: string, role: string = 'STUDENT', initialPhone?: string) {
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash: '$2a$10$abcdefghijklmnopqrstuvwxyzABCDEF1234567890abcdefghijk',
        role: role as any,
      },
    });

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      config.jwt.secret,
      { expiresIn: '1h' }
    );

    let profile: any = null;
    if (role === 'STUDENT') {
      profile = await prisma.studentProfile.create({
        data: {
          userId: user.id,
          fullName: `Student ${timestamp}`,
          gender: 'MALE',
          grade: 'Grade 12',
          contactEmail: email,
          phone: initialPhone || '+1 555-0100',
          addressStreet: '100 University Ave',
          addressCity: 'New York',
          addressState: 'NY',
          addressPostalCode: '10001',
          addressCountry: 'USA',
          board: 'CBSE',
          citizenship: 'US Citizen',
          passingOutYear: 2026,
          verificationStatus: 'VERIFIED',
        },
      });
    }

    return { user, profile, token };
  }

  // 1. Setup Student 1, Student 2, Counsellor
  console.log('\n[SETUP] Creating test accounts...');
  const { user: student1, profile: profile1, token: token1 } = await registerUser(
    student1Email,
    'STUDENT',
    '+1 555-0100'
  );
  const { user: student2, profile: profile2, token: token2 } = await registerUser(
    student2Email,
    'STUDENT',
    '+1 555-0200'
  );
  const { user: counsellor, token: counsellorToken } = await registerUser(
    counsellorEmail,
    'COUNSELLOR'
  );

  console.log(`✓ Student 1: ${student1Email} (Profile ID: ${profile1.id})`);
  console.log(`✓ Student 2: ${student2Email} (Profile ID: ${profile2.id})`);
  console.log(`✓ Counsellor: ${counsellorEmail}`);

  // 2. Fetch Initial Personal Info
  console.log('\n[TEST 1] GET /api/v1/personal/me for Student 1');
  const initRes = await fetch(`${API_BASE}/personal/me`, {
    headers: { Authorization: `Bearer ${token1}` },
  });
  const initData: any = await initRes.json();
  if (!initRes.ok || !initData.data) {
    throw new Error(`Failed to get personal info: ${JSON.stringify(initData)}`);
  }
  console.log('✓ Initial personal info retrieved successfully:');
  console.log(`  - primaryPhone: ${initData.data.primaryPhone}`);
  console.log(`  - primaryEmail: ${initData.data.primaryEmail}`);
  console.log(`  - activities count: ${initData.data.activities.length}`);
  console.log(`  - achievements count: ${initData.data.achievements.length}`);

  if (initData.data.primaryPhone !== '+1 555-0100') {
    throw new Error(`Expected primaryPhone '+1 555-0100', got '${initData.data.primaryPhone}'`);
  }
  if (initData.data.primaryEmail !== student1Email) {
    throw new Error(`Expected primaryEmail '${student1Email}', got '${initData.data.primaryEmail}'`);
  }

  // 3. Update Contact & Guardian Details
  console.log('\n[TEST 2] PUT /api/v1/personal/me/contact-guardian');
  const updatePayload = {
    primaryPhone: '+1 555-9999',
    alternateEmail: 'student1.alt@example.com',
    guardianName: 'Alexander Hamilton Sr.',
    guardianRelationship: 'Father',
    guardianPhone: '+1 555-8888',
    guardianEmail: 'ahamilton.sr@example.com',
  };

  const updateRes = await fetch(`${API_BASE}/personal/me/contact-guardian`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token1}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updatePayload),
  });
  const updateData: any = await updateRes.json();
  if (!updateRes.ok || !updateData.data) {
    throw new Error(`Failed to update contact/guardian: ${JSON.stringify(updateData)}`);
  }
  console.log('✓ Contact and guardian details updated successfully:');
  console.log(`  - primaryPhone: ${updateData.data.primaryPhone}`);
  console.log(`  - alternateEmail: ${updateData.data.alternateEmail}`);
  console.log(`  - guardianName: ${updateData.data.guardian.name}`);
  console.log(`  - guardianRelationship: ${updateData.data.guardian.relationship}`);

  // Check database sync for StudentProfile.phone
  const refreshedProfile = await prisma.studentProfile.findUnique({
    where: { id: profile1.id },
  });
  if (refreshedProfile?.phone !== '+1 555-9999') {
    throw new Error(
      `Sync failure: StudentProfile.phone was not updated! Expected '+1 555-9999', found '${refreshedProfile?.phone}'`
    );
  }
  console.log('✓ Verified StudentProfile.phone successfully synchronized in database!');

  // 4. Extracurricular Activities: Add 2 activities
  console.log('\n[TEST 3] POST /api/v1/personal/me/activities (Adding 2 activities)');
  const act1Res = await fetch(`${API_BASE}/personal/me/activities`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token1}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      activityName: 'Robotics Engineering Club',
      category: 'Leadership & STEM',
      organization: 'Lincoln High STEM Society',
      period: '2024 - Present',
      description: 'Lead mechanical builder and software team co-captain.',
      recognition: 'Regional Champions 2025',
    }),
  });
  const act1Data: any = await act1Res.json();
  if (!act1Res.ok || !act1Data.data?.id) {
    throw new Error(`Failed to add activity 1: ${JSON.stringify(act1Data)}`);
  }
  const activity1Id = act1Data.data.id;
  console.log(`✓ Activity 1 created: ID=${activity1Id}, Name="${act1Data.data.activityName}"`);

  const act2Res = await fetch(`${API_BASE}/personal/me/activities`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token1}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      activityName: 'Youth Animal Shelter Volunteer',
      category: 'Volunteering',
      organization: 'City Paws Foundation',
      period: 'Summer 2024',
      description: 'Cared for animals and organized community adoption drives.',
      recognition: '100+ Hours Volunteer Certificate',
    }),
  });
  const act2Data: any = await act2Res.json();
  if (!act2Res.ok || !act2Data.data?.id) {
    throw new Error(`Failed to add activity 2: ${JSON.stringify(act2Data)}`);
  }
  const activity2Id = act2Data.data.id;
  console.log(`✓ Activity 2 created: ID=${activity2Id}, Name="${act2Data.data.activityName}"`);

  // 5. Update Activity 1
  console.log('\n[TEST 4] PUT /api/v1/personal/me/activities/:id (Editing activity 1)');
  const updateActRes = await fetch(`${API_BASE}/personal/me/activities/${activity1Id}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token1}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      recognition: 'National Finalist Captain & Gold Trophy 2026',
    }),
  });
  const updateActData: any = await updateActRes.json();
  if (!updateActRes.ok || updateActData.data?.recognition !== 'National Finalist Captain & Gold Trophy 2026') {
    throw new Error(`Failed to update activity: ${JSON.stringify(updateActData)}`);
  }
  console.log(`✓ Activity 1 updated: Recognition="${updateActData.data.recognition}"`);

  // 6. Achievements: Add 2 achievements
  console.log('\n[TEST 5] POST /api/v1/personal/me/achievements (Adding 2 achievements)');
  const ach1Res = await fetch(`${API_BASE}/personal/me/achievements`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token1}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title: 'State Mathematics Olympiad Gold Medal',
      category: 'Academic Competition',
      issuer: 'State Science & Mathematics Association',
      dateYear: 'May 2025',
      description: 'Ranked 1st statewide out of 1,200 qualified high school entrants.',
      certificateUrl: 'https://credentials.example.com/math-gold-2025.pdf',
    }),
  });
  const ach1Data: any = await ach1Res.json();
  if (!ach1Res.ok || !ach1Data.data?.id) {
    throw new Error(`Failed to add achievement 1: ${JSON.stringify(ach1Data)}`);
  }
  const achievement1Id = ach1Data.data.id;
  console.log(`✓ Achievement 1 created: ID=${achievement1Id}, Title="${ach1Data.data.title}"`);

  const ach2Res = await fetch(`${API_BASE}/personal/me/achievements`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token1}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title: 'Duke of Edinburgh Silver Award',
      category: 'Extracurricular & Leadership',
      issuer: 'The Duke of Edinburgh International Award',
      dateYear: '2024',
      description: 'Completed 6 months of adventurous journey and community service.',
    }),
  });
  const ach2Data: any = await ach2Res.json();
  if (!ach2Res.ok || !ach2Data.data?.id) {
    throw new Error(`Failed to add achievement 2: ${JSON.stringify(ach2Data)}`);
  }
  const achievement2Id = ach2Data.data.id;
  console.log(`✓ Achievement 2 created: ID=${achievement2Id}, Title="${ach2Data.data.title}"`);

  // 7. Test Security & IDOR Isolation (Student 2 cannot touch Student 1's entries)
  console.log('\n[TEST 6] Security / IDOR: Student 2 attempting to modify/delete Student 1 records');
  const hackActRes = await fetch(`${API_BASE}/personal/me/activities/${activity1Id}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token2}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ activityName: 'Hacked Activity' }),
  });
  if (hackActRes.status !== 404 && hackActRes.status !== 403) {
    throw new Error(`Security breach! Student 2 was able to modify Student 1's activity (Status: ${hackActRes.status})`);
  }
  console.log(`✓ Rejected Student 2 cross-student activity update with HTTP ${hackActRes.status} (Not Found / Forbidden)`);

  const hackAchRes = await fetch(`${API_BASE}/personal/me/achievements/${achievement1Id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token2}` },
  });
  if (hackAchRes.status !== 404 && hackAchRes.status !== 403) {
    throw new Error(`Security breach! Student 2 was able to delete Student 1's achievement (Status: ${hackAchRes.status})`);
  }
  console.log(`✓ Rejected Student 2 cross-student achievement delete with HTTP ${hackAchRes.status}`);

  // 8. Staff Review Route
  console.log('\n[TEST 7] Counsellor Staff Review: GET /api/v1/personal/profile/:studentProfileId');
  const staffRes = await fetch(`${API_BASE}/personal/profile/${profile1.id}`, {
    headers: { Authorization: `Bearer ${counsellorToken}` },
  });
  const staffData: any = await staffRes.json();
  if (!staffRes.ok || !staffData.data) {
    throw new Error(`Counsellor review failed: ${JSON.stringify(staffData)}`);
  }
  console.log('✓ Counsellor successfully reviewed Student 1 personal dossier:');
  console.log(`  - Primary Email: ${staffData.data.primaryEmail}`);
  console.log(`  - Primary Phone: ${staffData.data.primaryPhone}`);
  console.log(`  - Guardian: ${staffData.data.guardian.name} (${staffData.data.guardian.relationship})`);
  console.log(`  - Activities count: ${staffData.data.activities.length}`);
  console.log(`  - Achievements count: ${staffData.data.achievements.length}`);

  // Test unauthorized role on staff route
  const studentStaffRes = await fetch(`${API_BASE}/personal/profile/${profile1.id}`, {
    headers: { Authorization: `Bearer ${token1}` },
  });
  if (studentStaffRes.status !== 403) {
    throw new Error(`Expected HTTP 403 for student accessing staff review route, got ${studentStaffRes.status}`);
  }
  console.log(`✓ Verified student blocked from staff review route with HTTP 403 Forbidden`);

  // 9. Delete Activity 2 and Achievement 2
  console.log('\n[TEST 8] Student 1 deleting individual activity and achievement');
  const delActRes = await fetch(`${API_BASE}/personal/me/activities/${activity2Id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token1}` },
  });
  if (!delActRes.ok) {
    throw new Error(`Failed to delete activity 2: ${await delActRes.text()}`);
  }
  console.log(`✓ Activity 2 deleted.`);

  const delAchRes = await fetch(`${API_BASE}/personal/me/achievements/${achievement2Id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token1}` },
  });
  if (!delAchRes.ok) {
    throw new Error(`Failed to delete achievement 2: ${await delAchRes.text()}`);
  }
  console.log(`✓ Achievement 2 deleted.`);

  // Verify counts in personal info
  const finalCheckRes = await fetch(`${API_BASE}/personal/me`, {
    headers: { Authorization: `Bearer ${token1}` },
  });
  const finalCheckData: any = await finalCheckRes.json();
  if (finalCheckData.data.activities.length !== 1 || finalCheckData.data.achievements.length !== 1) {
    throw new Error(`Counts mismatch after deletion: activities=${finalCheckData.data.activities.length}, achievements=${finalCheckData.data.achievements.length}`);
  }
  console.log(`✓ Post-deletion counts verified: 1 activity and 1 achievement remaining.`);

  // 10. Input Validation rejection
  console.log('\n[TEST 9] Input Validation Error Handling');
  const invalidPhoneRes = await fetch(`${API_BASE}/personal/me/contact-guardian`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token1}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ primaryPhone: 'abc' }), // Invalid phone
  });
  if (invalidPhoneRes.status !== 422) {
    throw new Error(`Expected HTTP 422 for invalid phone number, got ${invalidPhoneRes.status}`);
  }
  console.log(`✓ Rejected invalid phone number with HTTP 422 Unprocessable Entity.`);

  const invalidEmailRes = await fetch(`${API_BASE}/personal/me/contact-guardian`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token1}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ alternateEmail: 'not-an-email' }),
  });
  if (invalidEmailRes.status !== 422) {
    throw new Error(`Expected HTTP 422 for invalid email, got ${invalidEmailRes.status}`);
  }
  console.log(`✓ Rejected invalid alternate email with HTTP 422 Unprocessable Entity.`);

  // Cleanup test users
  console.log('\n[CLEANUP] Removing test accounts...');
  await prisma.user.deleteMany({
    where: {
      id: { in: [student1.id, student2.id, counsellor.id] },
    },
  });
  console.log('✓ Test cleanup complete.');

  console.log('\n===========================================================');
  console.log(' ALL MODULE 5 E2E TESTS PASSED WITH 100% SUCCESS!');
  console.log('===========================================================');
}

runModule5Tests()
  .catch((err) => {
    console.error('\n❌ MODULE 5 TEST FAILED:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
