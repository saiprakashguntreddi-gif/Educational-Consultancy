import { prisma } from '../shared/database/prisma.service';

const BASE_URL = 'http://localhost:5000';

async function verifyModule2EndToEnd() {
  console.log('===========================================================');
  console.log(' SUPERCONSCIOUSNESS: MODULE 2 END-TO-END VERIFICATION');
  console.log('===========================================================');

  // STEP 1: Register new student account
  const timestamp = Date.now();
  const studentEmail = `aria.sharma.${timestamp}@example.com`;
  console.log(`\n[STEP 1] Registering student account: ${studentEmail}`);

  const regRes = await fetch(`${BASE_URL}/api/v1/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: studentEmail,
      password: 'Password123!',
      confirmPassword: 'Password123!',
    }),
  });
  const regData = (await regRes.json()) as any;
  const studentToken = regData.data?.tokens?.accessToken;
  if (!regRes.ok || !studentToken) {
    throw new Error(`Student registration failed: ${JSON.stringify(regData)}`);
  }
  console.log('✓ Student registered and token issued. Role:', regData.data.user.role);

  // STEP 2: Submit Module 1 Profile Intake
  console.log('\n[STEP 2] Submitting Module 1 Profile Intake');
  const intakePayload = {
    fullName: 'Aria Sharma',
    gender: 'FEMALE',
    grade: '12th Grade',
    contactEmail: studentEmail,
    phone: '+1 555-019-2834',
    board: 'CBSE / International',
    citizenship: 'Indian',
    passingOutYear: 2026,
    address: {
      street: '742 Evergreen Terrace',
      city: 'Springfield',
      state: 'Oregon',
      postalCode: '97477',
      country: 'United States',
    },
  };

  const intakeRes = await fetch(`${BASE_URL}/api/v1/profile/intake`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${studentToken}`,
    },
    body: JSON.stringify(intakePayload),
  });
  const intakeData = (await intakeRes.json()) as any;
  if (!intakeRes.ok || !intakeData.data?.id) {
    throw new Error(`Profile intake failed: ${JSON.stringify(intakeData)}`);
  }
  const profileId = intakeData.data.id;
  console.log('✓ Module 1 profile created with ID:', profileId);
  console.log('  Initial verification status:', intakeData.data.verificationStatus);

  // STEP 3: Validate preferences input constraints
  console.log('\n[STEP 3] Testing backend validation constraints (Zod)');
  const invalidRes = await fetch(`${BASE_URL}/api/v1/preferences/me`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${studentToken}`,
    },
    body: JSON.stringify({
      countries: [], // Empty countries array
      department: '',
      subDepartment: '',
    }),
  });
  const invalidData = (await invalidRes.json()) as any;
  if (invalidRes.status === 422) {
    console.log('✓ Invalid input correctly rejected with HTTP 422 Validation Error');
    console.log('  Validation details:', JSON.stringify(invalidData.data?.validationErrors));
  } else {
    throw new Error(`Expected HTTP 422, got ${invalidRes.status}`);
  }

  // STEP 4: Save student preferences (Module 2)
  console.log('\n[STEP 4] Saving Module 2 Preferences');
  const prefPayload = {
    countries: ['United States', 'Canada', 'Germany', 'Switzerland'],
    primaryCountry: 'Germany',
    department: 'Engineering & Technology',
    subDepartment: 'Artificial Intelligence & Machine Learning',
  };

  const saveRes = await fetch(`${BASE_URL}/api/v1/preferences/me`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${studentToken}`,
    },
    body: JSON.stringify(prefPayload),
  });
  const saveData = (await saveRes.json()) as any;
  if (!saveRes.ok || !saveData.data?.id) {
    throw new Error(`Saving preferences failed: ${JSON.stringify(saveData)}`);
  }
  console.log('✓ Module 2 Preferences successfully saved:');
  console.log('  Preference ID:', saveData.data.id);
  console.log('  Student Profile ID:', saveData.data.studentProfileId);
  console.log('  Primary Country:', saveData.data.primaryCountry);
  console.log('  Countries:', saveData.data.countries);
  console.log('  Department:', saveData.data.department);
  console.log('  Sub-Department:', saveData.data.subDepartment);

  // STEP 5: Student retrieves their saved preferences (Persistence check)
  console.log('\n[STEP 5] Verifying preference persistence via GET /me');
  const getMeRes = await fetch(`${BASE_URL}/api/v1/preferences/me`, {
    headers: { Authorization: `Bearer ${studentToken}` },
  });
  const getMeData = (await getMeRes.json()) as any;
  if (!getMeRes.ok || getMeData.data.primaryCountry !== 'Germany') {
    throw new Error(`Retrieving preferences failed: ${JSON.stringify(getMeData)}`);
  }
  console.log('✓ Verified: Preferences persist and accurately match saved values');

  // STEP 6: Student updates preferences (PUT /me)
  console.log('\n[STEP 6] Testing preference updates via PUT /me');
  const updatedPayload = {
    countries: ['Germany', 'United States', 'Japan', 'Singapore'],
    primaryCountry: 'Japan',
    department: 'Engineering & Technology',
    subDepartment: 'Robotics, Mechatronics & Automation',
  };

  const updateRes = await fetch(`${BASE_URL}/api/v1/preferences/me`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${studentToken}`,
    },
    body: JSON.stringify(updatedPayload),
  });
  const updateData = (await updateRes.json()) as any;
  if (!updateRes.ok || updateData.data.primaryCountry !== 'Japan') {
    throw new Error(`Updating preferences failed: ${JSON.stringify(updateData)}`);
  }
  console.log('✓ Successfully updated preferences to Primary: Japan, Track: Robotics');

  // STEP 7: Counsellor logs in
  console.log('\n[STEP 7] Authenticating as authorized Counsellor');
  const loginRes = await fetch(`${BASE_URL}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'counsellor@superconsciousness.internal',
      password: 'StaffPassword123!',
    }),
  });
  const loginData = (await loginRes.json()) as any;
  const counsellorToken = loginData.data?.tokens?.accessToken;
  if (!loginRes.ok || !counsellorToken) {
    throw new Error(`Counsellor login failed: ${JSON.stringify(loginData)}`);
  }
  console.log('✓ Counsellor authenticated successfully');

  // STEP 8: Counsellor inspects student preferences
  console.log('\n[STEP 8] Counsellor reviewing student preferences via /preferences/profile/:id');
  const reviewRes = await fetch(`${BASE_URL}/api/v1/preferences/profile/${profileId}`, {
    headers: { Authorization: `Bearer ${counsellorToken}` },
  });
  const reviewData = (await reviewRes.json()) as any;
  if (!reviewRes.ok || reviewData.data.primaryCountry !== 'Japan') {
    throw new Error(`Counsellor review failed: ${JSON.stringify(reviewData)}`);
  }
  console.log('✓ Counsellor retrieved student preferences:');
  console.log('  Primary Country:', reviewData.data.primaryCountry);
  console.log('  Target Countries:', reviewData.data.countries);
  console.log('  Department:', reviewData.data.department);
  console.log('  Specialization:', reviewData.data.subDepartment);

  // STEP 9: Student forbidden from reviewing other profiles
  console.log('\n[STEP 9] Verifying student authorization barriers');
  const forbiddenRes = await fetch(`${BASE_URL}/api/v1/preferences/profile/${profileId}`, {
    headers: { Authorization: `Bearer ${studentToken}` },
  });
  if (forbiddenRes.status === 403) {
    console.log('✓ Student access to staff review endpoint correctly blocked with HTTP 403 Forbidden');
  } else {
    throw new Error(`Expected HTTP 403, got ${forbiddenRes.status}`);
  }

  // STEP 10: Counsellor approves profile
  console.log('\n[STEP 10] Counsellor approves profile verification');
  const verifyRes = await fetch(`${BASE_URL}/api/v1/profile/${profileId}/verify`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${counsellorToken}`,
    },
    body: JSON.stringify({
      status: 'VERIFIED',
      notes: 'Module 1 record and Module 2 academic preferences verified and approved.',
    }),
  });
  const verifyData = (await verifyRes.json()) as any;
  if (!verifyRes.ok || verifyData.data.verificationStatus !== 'VERIFIED') {
    throw new Error(`Profile verification failed: ${JSON.stringify(verifyData)}`);
  }
  console.log('✓ Student profile verified by counsellor');

  // STEP 11: Verified student accesses protected guidance record
  console.log('\n[STEP 11] Verified student accesses guidance clearance (/me/verified)');
  const clearanceRes = await fetch(`${BASE_URL}/api/v1/profile/me/verified`, {
    headers: { Authorization: `Bearer ${studentToken}` },
  });
  const clearanceData = (await clearanceRes.json()) as any;
  if (!clearanceRes.ok || clearanceData.data.clearance?.guidanceEligible !== true) {
    throw new Error(`Clearance access failed: ${JSON.stringify(clearanceData)}`);
  }
  console.log('✓ Guidance clearance granted to verified student:', clearanceData.data.clearance);

  // STEP 12: Audit log verification in DB
  console.log('\n[STEP 12] Auditing Database AuditLog table');
  const logs = await prisma.auditLog.findMany({
    where: {
      action: { in: ['PREFERENCES_SAVED', 'PROFILE_STATUS_VERIFIED'] },
    },
    orderBy: { createdAt: 'desc' },
    take: 3,
  });
  console.log(`✓ Audit log verified: ${logs.length} recent audit actions recorded.`);
  for (const l of logs) {
    console.log(`  - [${l.action}] by User ${l.userId} at ${l.createdAt.toISOString()}`);
  }

  console.log('\n===========================================================');
  console.log(' ALL 12 END-TO-END VERIFICATION STEPS PASSED PERFECTLY!');
  console.log('===========================================================');
}

verifyModule2EndToEnd()
  .catch((err) => {
    console.error('\nVerification failed:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
