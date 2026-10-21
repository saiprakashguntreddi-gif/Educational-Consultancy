import { prisma } from '../shared/database/prisma.service';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import { Role } from '../config/roles';

const BASE_URL = 'http://localhost:5000';

async function runTests() {
  console.log('--- STARTING MODULE 2 PREFERENCES TEST SUITE ---');

  // 1. Health check
  const healthRes = await fetch(`${BASE_URL}/api/health`);
  const healthData = (await healthRes.json()) as any;
  console.log('✓ Health Endpoint Check:', healthData.data?.module2);

  // 2. Find student profile in database
  const studentUser = await prisma.user.findFirst({
    where: { role: Role.STUDENT },
    include: { studentProfile: true },
  });

  if (!studentUser || !studentUser.studentProfile) {
    throw new Error('No student user with profile found in database. Cannot run tests.');
  }

  console.log(`✓ Student Found: ${studentUser.email} (Profile ID: ${studentUser.studentProfile.id})`);

  // Generate valid student JWT
  const studentToken = jwt.sign(
    { userId: studentUser.id, email: studentUser.email, role: Role.STUDENT },
    config.jwt.secret,
    { expiresIn: '1h' }
  );

  // Counsellor user & JWT
  const counsellorUser = await prisma.user.findFirst({
    where: { role: Role.COUNSELLOR },
  });
  if (!counsellorUser) {
    throw new Error('No counsellor user found in database.');
  }
  const counsellorToken = jwt.sign(
    { userId: counsellorUser.id, email: counsellorUser.email, role: Role.COUNSELLOR },
    config.jwt.secret,
    { expiresIn: '1h' }
  );

  // TEST 1: Unauthorized access without token
  const unauthRes = await fetch(`${BASE_URL}/api/v1/preferences/me`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      countries: ['United States'],
      department: 'Engineering & Technology',
      subDepartment: 'Computer Science',
    }),
  });
  if (unauthRes.status === 401) {
    console.log('✓ Test 1 Passed: Unauthorized request correctly blocked with 401');
  } else {
    throw new Error(`Test 1 Failed: Expected 401, got ${unauthRes.status}`);
  }

  // TEST 2: Validation failure - empty countries array
  const emptyCountriesRes = await fetch(`${BASE_URL}/api/v1/preferences/me`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${studentToken}`,
    },
    body: JSON.stringify({
      countries: [],
      department: 'Engineering & Technology',
      subDepartment: 'Computer Science',
    }),
  });
  const emptyCountriesData = (await emptyCountriesRes.json()) as any;
  if (emptyCountriesRes.status === 422) {
    console.log('✓ Test 2 Passed: Validation error on empty countries (HTTP 422):', emptyCountriesData.data?.validationErrors?.[0]?.message);
  } else {
    throw new Error(`Test 2 Failed: Expected 422, got ${emptyCountriesRes.status}`);
  }

  // TEST 3: Validation failure - missing department
  const missingDeptRes = await fetch(`${BASE_URL}/api/v1/preferences/me`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${studentToken}`,
    },
    body: JSON.stringify({
      countries: ['Germany'],
      department: '',
      subDepartment: 'Computer Science',
    }),
  });
  if (missingDeptRes.status === 422) {
    console.log('✓ Test 3 Passed: Validation error on empty department (HTTP 422)');
  } else {
    throw new Error(`Test 3 Failed: Expected 422, got ${missingDeptRes.status}`);
  }

  // TEST 4: Successful save of student preferences
  const payload = {
    countries: ['United States', 'United Kingdom', 'Canada', 'Germany'],
    primaryCountry: 'United States',
    department: 'Engineering & Technology',
    subDepartment: 'Artificial Intelligence & Machine Learning',
  };

  const saveRes = await fetch(`${BASE_URL}/api/v1/preferences/me`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${studentToken}`,
    },
    body: JSON.stringify(payload),
  });
  const saveData = (await saveRes.json()) as any;
  if (saveRes.status === 200 && saveData.success && saveData.data.id) {
    console.log('✓ Test 4 Passed: Preferences saved successfully for student profile:', saveData.data.studentProfileId);
    console.log('  Persisted record ID:', saveData.data.id);
    console.log('  Countries:', saveData.data.countries);
    console.log('  Primary Country:', saveData.data.primaryCountry);
    console.log('  Department:', saveData.data.department);
    console.log('  Sub-Department:', saveData.data.subDepartment);
  } else {
    throw new Error(`Test 4 Failed: Expected 200, got ${saveRes.status}: ${JSON.stringify(saveData)}`);
  }

  // TEST 5: Student retrieves their own saved preferences
  const getMeRes = await fetch(`${BASE_URL}/api/v1/preferences/me`, {
    headers: { Authorization: `Bearer ${studentToken}` },
  });
  const getMeData = (await getMeRes.json()) as any;
  if (getMeRes.status === 200 && getMeData.data.primaryCountry === 'United States') {
    console.log('✓ Test 5 Passed: Student retrieved their own preferences via GET /me');
  } else {
    throw new Error(`Test 5 Failed: Expected 200 with saved data, got ${getMeRes.status}`);
  }

  // TEST 6: Counsellor reviews student preferences via profile ID
  const counsellorReviewRes = await fetch(
    `${BASE_URL}/api/v1/preferences/profile/${studentUser.studentProfile.id}`,
    {
      headers: { Authorization: `Bearer ${counsellorToken}` },
    }
  );
  const counsellorReviewData = (await counsellorReviewRes.json()) as any;
  if (counsellorReviewRes.status === 200 && counsellorReviewData.data.department === 'Engineering & Technology') {
    console.log('✓ Test 6 Passed: Counsellor authorized to inspect student preferences by profile ID');
  } else {
    throw new Error(`Test 6 Failed: Expected 200, got ${counsellorReviewRes.status}`);
  }

  // TEST 7: Student forbidden from using counsellor endpoint
  const studentForbiddenRes = await fetch(
    `${BASE_URL}/api/v1/preferences/profile/${studentUser.studentProfile.id}`,
    {
      headers: { Authorization: `Bearer ${studentToken}` },
    }
  );
  if (studentForbiddenRes.status === 403) {
    console.log('✓ Test 7 Passed: Student forbidden from counsellor inspection endpoint (HTTP 403)');
  } else {
    throw new Error(`Test 7 Failed: Expected 403, got ${studentForbiddenRes.status}`);
  }

  // TEST 8: Verify Audit Log persisted in database
  const audit = await prisma.auditLog.findFirst({
    where: {
      userId: studentUser.id,
      action: 'PREFERENCES_SAVED',
    },
    orderBy: { createdAt: 'desc' },
  });
  if (audit) {
    console.log('✓ Test 8 Passed: Audit log recorded PREFERENCES_SAVED at', audit.createdAt);
    console.log('  Audit details:', audit.details);
  } else {
    throw new Error('Test 8 Failed: Expected audit log entry for PREFERENCES_SAVED');
  }

  console.log('\n--- ALL MODULE 2 BACKEND TEST SUITE CHECKS PASSED (8/8) ---');
}

runTests()
  .catch((e) => {
    console.error('Test Suite Failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
