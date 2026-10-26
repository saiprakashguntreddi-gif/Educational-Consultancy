const API_BASE = 'http://localhost:5000/api/v1';

async function postJson(url: string, data: any, headers: Record<string, string> = {}) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(data),
  });
  const json = await res.json().catch(() => ({}));
  return { status: res.status, ok: res.ok, data: json };
}

async function getJson(url: string, headers: Record<string, string> = {}) {
  const res = await fetch(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json', ...headers },
  });
  const json = await res.json().catch(() => ({}));
  return { status: res.status, ok: res.ok, data: json };
}

async function main() {
  console.log('================================================================');
  console.log('VERIFYING TWO-ROLE CONSOLIDATION (STUDENT & ADMIN ONLY)');
  console.log('================================================================');

  // 1. Login as Admin
  console.log('\n[TEST 1] Logging in as ADMIN (admin@superconsciousness.internal)...');
  const adminLoginRes = await postJson(`${API_BASE}/auth/login`, {
    email: 'admin@superconsciousness.internal',
    password: 'StaffPassword123!',
  });

  if (!adminLoginRes.ok) {
    throw new Error(`Admin login failed: ${JSON.stringify(adminLoginRes.data)}`);
  }

  const adminToken = adminLoginRes.data.data.tokens.accessToken;
  const adminUser = adminLoginRes.data.data.user;
  console.log('-> Admin login successful! Role:', adminUser.role);
  if (adminUser.role !== 'ADMIN') {
    throw new Error(`Expected ADMIN role, got: ${adminUser.role}`);
  }

  const adminHeaders = { Authorization: `Bearer ${adminToken}` };

  // 2. Admin access to Admin Dashboard
  console.log('\n[TEST 2] Verifying Admin access to /admin/dashboard...');
  const dashRes = await getJson(`${API_BASE}/admin/dashboard`, adminHeaders);
  if (!dashRes.ok) {
    throw new Error(`Admin dashboard access failed: HTTP ${dashRes.status}`);
  }
  console.log('-> Admin Dashboard response status:', dashRes.status, '| Total students in DB:', dashRes.data.data?.metrics?.totalStudents);

  // 3. Admin access to Counsellor Students (Transferred responsibility)
  console.log('\n[TEST 3] Verifying Admin access to /counsellor/students...');
  const counsStudentsRes = await getJson(`${API_BASE}/counsellor/students`, adminHeaders);
  if (!counsStudentsRes.ok) {
    throw new Error(`Counsellor students access failed: HTTP ${counsStudentsRes.status}`);
  }
  console.log('-> Counsellor students route accessible by ADMIN! Count:', counsStudentsRes.data.data?.students?.length);

  // 4. Admin access to Appointments Schedule (Transferred responsibility)
  console.log('\n[TEST 4] Verifying Admin access to /appointments/counsellor/schedule...');
  const apptScheduleRes = await getJson(`${API_BASE}/appointments/counsellor/schedule`, adminHeaders);
  if (!apptScheduleRes.ok) {
    throw new Error(`Appointments schedule access failed: HTTP ${apptScheduleRes.status}`);
  }
  console.log('-> Appointments schedule accessible by ADMIN! Appointments found:', apptScheduleRes.data.data?.length);

  // 5. Admin access to Unverified Student Queue (Transferred responsibility)
  console.log('\n[TEST 5] Verifying Admin access to /profile/review...');
  const reviewRes = await getJson(`${API_BASE}/profile/review`, adminHeaders);
  if (!reviewRes.ok) {
    throw new Error(`Profile review queue access failed: HTTP ${reviewRes.status}`);
  }
  console.log('-> Profile review queue accessible by ADMIN! Unverified profiles found:', reviewRes.data.data?.total || reviewRes.data.data?.profiles?.length || 0);

  // 6. Test converted counsellor user (counsellor@superconsciousness.internal is now ADMIN)
  console.log('\n[TEST 6] Testing converted staff user (counsellor@superconsciousness.internal)...');
  const convertedLoginRes = await postJson(`${API_BASE}/auth/login`, {
    email: 'counsellor@superconsciousness.internal',
    password: 'StaffPassword123!',
  });
  if (!convertedLoginRes.ok) {
    throw new Error(`Converted staff login failed: ${JSON.stringify(convertedLoginRes.data)}`);
  }
  console.log('-> Converted staff login successful! Role:', convertedLoginRes.data.data.user.role);
  if (convertedLoginRes.data.data.user.role !== 'ADMIN') {
    throw new Error(`Expected ADMIN role for converted staff, got: ${convertedLoginRes.data.data.user.role}`);
  }

  // 7. Student Login & Isolation verification
  console.log('\n[TEST 7] Testing Student login & RBAC isolation...');
  const studentLoginRes = await postJson(`${API_BASE}/auth/login`, {
    email: 'student.module8@example.com',
    password: 'StudentPassword123!',
  });
  if (!studentLoginRes.ok) {
    throw new Error(`Student login failed: ${JSON.stringify(studentLoginRes.data)}`);
  }
  const studentToken = studentLoginRes.data.data.tokens.accessToken;
  const studentHeaders = { Authorization: `Bearer ${studentToken}` };
  console.log('-> Student login successful! Role:', studentLoginRes.data.data.user.role);

  // Student accessing their own profile
  const studentProfileRes = await getJson(`${API_BASE}/profile/me`, studentHeaders);
  if (!studentProfileRes.ok) {
    throw new Error(`Student profile/me failed: HTTP ${studentProfileRes.status}`);
  }
  console.log('-> Student profile access successful: ID:', studentProfileRes.data.data.id);

  // Student trying to access /admin/dashboard (Must be 403)
  console.log('\n[TEST 8] Verifying Student is BLOCKED from /admin/dashboard (403)...');
  const blockAdminRes = await getJson(`${API_BASE}/admin/dashboard`, studentHeaders);
  if (blockAdminRes.status === 403) {
    console.log('-> PASS: Student received HTTP 403 Forbidden as expected.');
  } else {
    throw new Error(`FAIL: Student received HTTP ${blockAdminRes.status} instead of 403!`);
  }

  // Student trying to access /counsellor/students (Must be 403)
  console.log('\n[TEST 9] Verifying Student is BLOCKED from /counsellor/students (403)...');
  const blockCounsRes = await getJson(`${API_BASE}/counsellor/students`, studentHeaders);
  if (blockCounsRes.status === 403) {
    console.log('-> PASS: Student received HTTP 403 Forbidden as expected.');
  } else {
    throw new Error(`FAIL: Student received HTTP ${blockCounsRes.status} instead of 403!`);
  }

  // Student trying to access /profile/review (Must be 403)
  console.log('\n[TEST 10] Verifying Student is BLOCKED from /profile/review (403)...');
  const blockReviewRes = await getJson(`${API_BASE}/profile/review`, studentHeaders);
  if (blockReviewRes.status === 403) {
    console.log('-> PASS: Student received HTTP 403 Forbidden as expected.');
  } else {
    throw new Error(`FAIL: Student received HTTP ${blockReviewRes.status} instead of 403!`);
  }

  console.log('\n================================================================');
  console.log('ALL 10 TWO-ROLE CONSOLIDATION VERIFICATION TESTS PASSED!');
  console.log('================================================================');
}

main().catch((err) => {
  console.error('\nTEST FAILED:', err.message);
  process.exit(1);
});
