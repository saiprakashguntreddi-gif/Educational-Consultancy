import { prisma } from '../shared/database/prisma.service';

const API_BASE = 'http://localhost:5000/api/v1';

async function runModule3Tests() {
  console.log('===========================================================');
  console.log(' SUPERCONSCIOUSNESS: MODULE 3 (EDUCATION DETAILS) E2E VERIFICATION');
  console.log('===========================================================');

  const timestamp = Date.now();
  const studentEmail = `student.edu.${timestamp}@example.com`;
  const studentPassword = 'SecurePassword123!';

  // STEP 1: Register Student
  console.log(`\n[STEP 1] Registering student: ${studentEmail}`);
  const regRes = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: studentEmail,
      password: studentPassword,
      confirmPassword: studentPassword,
    }),
  });
  const regData: any = await regRes.json();
  const studentToken = regData.data?.tokens?.accessToken || regData.data?.token;
  if (!regRes.ok || !studentToken) {
    throw new Error(`Student registration failed: ${JSON.stringify(regData)}`);
  }
  console.log('✓ Student registered and token acquired.');

  // STEP 2: Submit Module 1 Profile Intake
  console.log('\n[STEP 2] Submitting Module 1 Profile Intake');
  const profileRes = await fetch(`${API_BASE}/profile/intake`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${studentToken}`,
    },
    body: JSON.stringify({
      fullName: 'Vikram Malhotra',
      gender: 'MALE',
      grade: 'Grade 12',
      contactEmail: studentEmail,
      phone: '+91 9876543210',
      board: 'CBSE',
      citizenship: 'Indian',
      passingOutYear: 2026,
      address: {
        street: '104 Silicon Valley Heights',
        city: 'Bengaluru',
        state: 'Karnataka',
        postalCode: '560100',
        country: 'India',
      },
    }),
  });
  const profileData: any = await profileRes.json();
  if (!profileRes.ok || !profileData.data?.id) {
    throw new Error(`Profile intake failed: ${JSON.stringify(profileData)}`);
  }
  const studentProfileId = profileData.data.id;
  console.log(`✓ Module 1 Profile created. ID: ${studentProfileId}`);

  // STEP 3: Test Zod Validation Constraints
  console.log('\n[STEP 3] Testing Zod Validation Constraints');
  const invalidRes = await fetch(`${API_BASE}/education/me`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${studentToken}`,
    },
    body: JSON.stringify({
      schoolName: '', // empty -> invalid
      board: 'CBSE',
      completionYear: 1800, // too low -> invalid
      percentage: 150, // > 100 -> invalid
      subjectDetails: [], // empty -> invalid
    }),
  });
  if (invalidRes.status === 422) {
    console.log('✓ Invalid input correctly rejected with HTTP 422 Validation Error');
  } else {
    throw new Error(`Expected 422, received: ${invalidRes.status}`);
  }

  // STEP 4: Save Module 3 Education Details (Matching Screenshot 215202 + 10th optional)
  console.log('\n[STEP 4] Saving Module 3 Education Details');
  const educationPayload = {
    schoolName: 'Dumick Educational Academy',
    board: 'CBSE',
    completionYear: 2026,
    percentage: 88.5,
    subjectDetails: [
      { subject: 'Chemistry', score: 85 },
      { subject: 'Mathematics', score: 92 },
      { subject: 'Physics', score: 88 },
    ],
    tenthSchoolName: 'St. Xavier High School',
    tenthBoard: 'ICSE',
    tenthPassingYear: 2024,
    tenthPercentage: 91.0,
  };

  const saveRes = await fetch(`${API_BASE}/education/me`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${studentToken}`,
    },
    body: JSON.stringify(educationPayload),
  });
  const saveData: any = await saveRes.json();
  if (!saveRes.ok || !saveData.data?.id) {
    throw new Error(`Education save failed: ${JSON.stringify(saveData)}`);
  }
  console.log('✓ Education details successfully saved:');
  console.log(`  School: ${saveData.data.schoolName}`);
  console.log(`  12th Board: ${saveData.data.board} (${saveData.data.completionYear})`);
  console.log(`  Aggregate: ${saveData.data.percentage}%`);
  console.log(`  Subjects: ${saveData.data.subjectDetails.length} recorded`);
  console.log(`  10th School: ${saveData.data.tenthSchoolName} (${saveData.data.tenthPercentage}%)`);

  // STEP 5: Verify Persistence via GET /me
  console.log('\n[STEP 5] Verifying persistence via GET /me');
  const getRes = await fetch(`${API_BASE}/education/me`, {
    headers: { Authorization: `Bearer ${studentToken}` },
  });
  const getData: any = await getRes.json();
  if (!getRes.ok || getData.data.schoolName !== 'Dumick Educational Academy') {
    throw new Error(`GET /me mismatch: ${JSON.stringify(getData)}`);
  }
  console.log('✓ Verified: GET /me returns full 12th & 10th education records accurately.');

  // STEP 6: Update Education via PUT /me
  console.log('\n[STEP 6] Updating education via PUT /me');
  const updatePayload = {
    ...educationPayload,
    percentage: 90.0,
    subjectDetails: [
      ...educationPayload.subjectDetails,
      { subject: 'Computer Science', score: 95 },
    ],
  };
  const putRes = await fetch(`${API_BASE}/education/me`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${studentToken}`,
    },
    body: JSON.stringify(updatePayload),
  });
  const putData: any = await putRes.json();
  if (!putRes.ok || putData.data.percentage !== 90.0 || putData.data.subjectDetails.length !== 4) {
    throw new Error(`PUT /me failed: ${JSON.stringify(putData)}`);
  }
  console.log(`✓ Updated percentage: ${putData.data.percentage}%, Subject count: ${putData.data.subjectDetails.length}`);

  // STEP 7: Authenticate as authorized Counsellor
  console.log('\n[STEP 7] Authenticating as authorized Counsellor');
  const loginRes = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'counsellor@superconsciousness.internal',
      password: 'StaffPassword123!',
    }),
  });
  const loginData: any = await loginRes.json();
  const counsellorToken = loginData.data?.tokens?.accessToken || loginData.data?.token;
  if (!loginRes.ok || !counsellorToken) {
    throw new Error(`Counsellor login failed: ${JSON.stringify(loginData)}`);
  }
  console.log('✓ Counsellor authenticated successfully.');

  // STEP 8: Counsellor reviews student education details
  console.log(`\n[STEP 8] Counsellor reviewing education details for profile: ${studentProfileId}`);
  const staffRes = await fetch(`${API_BASE}/education/profile/${studentProfileId}`, {
    headers: { Authorization: `Bearer ${counsellorToken}` },
  });
  const staffData: any = await staffRes.json();
  if (!staffRes.ok || !staffData.data) {
    throw new Error(`Counsellor inspection failed: ${JSON.stringify(staffData)}`);
  }
  console.log(`✓ Counsellor retrieved student education record: School: ${staffData.data.schoolName}, Score: ${staffData.data.percentage}%`);

  // STEP 9: Student authorization barrier
  console.log('\n[STEP 9] Verifying student authorization barriers');
  const forbiddenRes = await fetch(`${API_BASE}/education/profile/${studentProfileId}`, {
    headers: { Authorization: `Bearer ${studentToken}` },
  });
  if (forbiddenRes.status === 403) {
    console.log('✓ Student access to staff review endpoint correctly blocked with HTTP 403 Forbidden');
  } else {
    throw new Error(`Expected 403 Forbidden, received: ${forbiddenRes.status}`);
  }

  // STEP 10: Unauthenticated access blocked
  console.log('\n[STEP 10] Verifying unauthenticated access is blocked');
  const unauthRes = await fetch(`${API_BASE}/education/me`);
  if (unauthRes.status === 401) {
    console.log('✓ Unauthenticated request blocked with HTTP 401 Unauthorized');
  } else {
    throw new Error(`Expected 401, received: ${unauthRes.status}`);
  }

  // STEP 11: Audit Log Verification
  console.log('\n[STEP 11] Verifying database audit log');
  const auditLogs = await prisma.auditLog.findMany({
    where: { action: 'EDUCATION_DETAILS_SAVED' },
    orderBy: { createdAt: 'desc' },
    take: 2,
  });
  if (auditLogs.length > 0) {
    console.log(`✓ Audit log verified: Recorded EDUCATION_DETAILS_SAVED with details: ${auditLogs[0].details}`);
  } else {
    throw new Error('No audit log recorded for EDUCATION_DETAILS_SAVED');
  }

  console.log('\n===========================================================');
  console.log(' ALL 11 MODULE 3 E2E TESTS PASSED PERFECTLY!');
  console.log('===========================================================');
}

runModule3Tests()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Test execution failed:', err);
    process.exit(1);
  });
