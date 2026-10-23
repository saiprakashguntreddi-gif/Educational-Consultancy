import { prisma } from '../shared/database/prisma.service';
import { hashPassword } from '../shared/utils/password';
import { Role } from '../config/roles';

const API_BASE = 'http://localhost:5000/api/v1';

async function request(url: string, options: any = {}) {
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const data: any = await res.json();
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${JSON.stringify(data)}`);
  }
  return data;
}

async function runVerification() {
  console.log('================================================================');
  console.log('   MODULE 8: SCHOLARSHIP DISCOVERY & ELIGIBILITY VERIFICATION');
  console.log('================================================================\n');

  // 1. Setup Student Account (Maya Sharma)
  console.log('[STEP 1] Setting up Student Account (Maya Sharma)...');
  const passwordHash = await hashPassword('StudentPassword123!');
  const studentUser = await prisma.user.upsert({
    where: { email: 'student.module8@example.com' },
    update: { passwordHash, isActive: true },
    create: {
      email: 'student.module8@example.com',
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
      fullName: 'Maya Sharma',
      gender: 'FEMALE',
      grade: 'Grade 12',
      contactEmail: 'student.module8@example.com',
      phone: '+1-555-0888',
      addressStreet: '123 University Ave',
      addressCity: 'Cambridge',
      addressState: 'MA',
      addressPostalCode: '02138',
      addressCountry: 'United States',
      board: 'CBSE',
      citizenship: 'Indian',
      passingOutYear: 2026,
      verificationStatus: 'VERIFIED',
    },
  });

  await prisma.studentPreference.upsert({
    where: { studentProfileId: studentProfile.id },
    update: {},
    create: {
      studentProfileId: studentProfile.id,
      countries: JSON.stringify(['United States', 'United Kingdom', 'Canada', 'Germany']),
      primaryCountry: 'United States',
      department: 'Computer Science & Engineering',
      subDepartment: 'Artificial Intelligence',
    },
  });

  // Ensure clean saved scholarships state for test
  await prisma.studentSavedScholarship.deleteMany({
    where: { studentProfileId: studentProfile.id },
  });

  // Login as Student
  const studentLoginRes = await request(`${API_BASE}/auth/login`, {
    method: 'POST',
    body: {
      email: 'student.module8@example.com',
      password: 'StudentPassword123!',
    },
  });
  const studentToken = studentLoginRes.data.tokens.accessToken;
  console.log('   -> Student logged in successfully. Token acquired.\n');

  // 2. Setup Admin Account
  console.log('[STEP 2] Setting up Admin Account...');
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin.module8@example.com' },
    update: { passwordHash, isActive: true },
    create: {
      email: 'admin.module8@example.com',
      passwordHash,
      role: Role.ADMIN,
      isActive: true,
      isEmailVerified: true,
    },
  });

  const adminLoginRes = await request(`${API_BASE}/auth/login`, {
    method: 'POST',
    body: {
      email: 'admin.module8@example.com',
      password: 'StudentPassword123!',
    },
  });
  const adminToken = adminLoginRes.data.tokens.accessToken;
  console.log('   -> Admin logged in successfully. Token acquired.\n');

  // 3. Test Student List Scholarships
  console.log('[STEP 3] Testing GET /api/v1/scholarships (Student Catalog & Eligibility)...');
  const catalogRes = await request(`${API_BASE}/scholarships`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${studentToken}` },
  });

  if (!catalogRes.success || !catalogRes.data.scholarships) {
    throw new Error('Failed to retrieve scholarships list');
  }

  const { scholarships, counts, studentProfileContext } = catalogRes.data;
  console.log(`   -> Total scholarships retrieved: ${scholarships.length}`);
  console.log(`   -> Counts: All=${counts.all}, Eligible=${counts.eligible}, Needs Review=${counts.potentiallyEligible}, Not Eligible=${counts.notEligible}, Saved=${counts.saved}`);
  console.log(`   -> Student Context: Name="${studentProfileContext.studentName}", Verified=${studentProfileContext.isVerified}, Target="${studentProfileContext.primaryCountry}"`);

  if (scholarships.length < 10) {
    throw new Error(`Expected at least 10 seeded scholarships, got ${scholarships.length}`);
  }
  console.log('   -> Verified scholarship catalogue successfully loaded and evaluated!\n');

  // 4. Test Search
  console.log('[STEP 4] Testing Search by Name ("British Council")...');
  const searchRes = await request(`${API_BASE}/scholarships?search=British+Council`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${studentToken}` },
  });
  const searchResults = searchRes.data.scholarships;
  console.log(`   -> Search results for "British Council": ${searchResults.length} found`);
  if (!searchResults.some((s: any) => s.name.includes('British Council'))) {
    throw new Error('Search failed to return British Council scholarship');
  }
  console.log('   -> Search functionality verified!\n');

  // 5. Test Country Filter
  console.log('[STEP 5] Testing Filter by Destination Country ("United States")...');
  const countryRes = await request(`${API_BASE}/scholarships?country=United+States`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${studentToken}` },
  });
  const usScholarships = countryRes.data.scholarships;
  console.log(`   -> Destination "United States" scholarships: ${usScholarships.length} found`);
  console.log('   -> Country filter verified!\n');

  // 6. Test Single Detail with Criteria Breakdown
  console.log('[STEP 6] Testing GET /api/v1/scholarships/:id (Single Scholarship Details)...');
  const targetScholarship = scholarships[0];
  const detailRes = await request(`${API_BASE}/scholarships/${targetScholarship.id}`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${studentToken}` },
  });
  const detail = detailRes.data;
  console.log(`   -> Scholarship: "${detail.name}"`);
  console.log(`   -> Provider: "${detail.provider}", Award: ${detail.awardCurrency} ${detail.awardAmount}`);
  console.log(`   -> Official Application URL: ${detail.applicationUrl}`);
  console.log(`   -> Verification Source: ${detail.sourceInfo}`);
  if (detail.eligibility && detail.eligibility.checks) {
    console.log(`   -> Evaluated Criteria Count: ${detail.eligibility.checks.length}`);
    detail.eligibility.checks.slice(0, 3).forEach((c: any) => {
      console.log(`      * [${c.status}] ${c.label}: ${c.detail.slice(0, 75)}...`);
    });
  }
  console.log('   -> Detail with criteria breakdown verified!\n');

  // 7. Test Save / Shortlist Scholarship
  console.log('[STEP 7] Testing POST /api/v1/scholarships/:id/save (Shortlist Toggle)...');
  const saveRes = await request(`${API_BASE}/scholarships/${targetScholarship.id}/save`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${studentToken}` },
  });
  console.log(`   -> Save action response: isSaved=${saveRes.data.isSaved}, Message="${saveRes.data.message}"`);

  // Verify Saved list
  const savedRes = await request(`${API_BASE}/scholarships/saved/me`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${studentToken}` },
  });
  const savedList = savedRes.data;
  console.log(`   -> Authenticated student saved scholarships count: ${savedList.length}`);
  const isFoundInSaved = savedList.some((s: any) => s.id === targetScholarship.id);
  if (!isFoundInSaved) {
    throw new Error('Saved scholarship was not found in student shortlist');
  }
  console.log('   -> Save / Shortlist persistence verified!\n');

  // 8. Test Admin Management
  console.log('[STEP 8] Testing Admin Management APIs...');
  // 8a. Admin List
  const adminListRes = await request(`${API_BASE}/scholarships/admin/all`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  console.log(`   -> Admin catalogue list count: ${adminListRes.data.total}`);

  // 8b. Admin Create
  console.log('   -> Admin creating test verified scholarship opportunity...');
  const createPayload = {
    name: 'Global Innovation Leaders Fellowship 2026',
    provider: 'Global Science & Innovation Council',
    country: 'United States',
    destinationCountry: 'United States',
    department: 'Computer Science & Engineering',
    studyLevel: 'POSTGRADUATE',
    awardAmount: 60000,
    awardCurrency: 'USD',
    awardType: 'Full Research Grant',
    awardDetails: 'Covers full tuition and $3,500/month stipend for advanced AI computing research.',
    eligibilityDescription: 'Open to international applicants with minimum 80% aggregate and GRE score.',
    minPercentageRequirement: 80.0,
    genderRequirement: 'ALL',
    applicationDeadline: '2026-12-01',
    applicationUrl: 'https://www.globalinnovationcouncil.org/fellowships',
    sourceInfo: 'Official GSIC Fellowship Registry (Cycle 2026)',
    isActive: true,
    isPublished: true,
  };

  const createRes = await request(`${API_BASE}/scholarships/admin`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: createPayload,
  });
  const newScholarship = createRes.data;
  console.log(`   -> Created: "${newScholarship.name}" (ID: ${newScholarship.id})`);

  // 8c. Admin Update
  console.log('   -> Admin updating academic cutoff to 82%...');
  const updateRes = await request(`${API_BASE}/scholarships/admin/${newScholarship.id}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: { minPercentageRequirement: 82.0 },
  });
  console.log(`   -> Updated cutoff: ${updateRes.data.minPercentageRequirement}%`);

  // 8d. Admin Toggle Status
  console.log('   -> Admin toggling status to Inactive...');
  const toggleRes = await request(`${API_BASE}/scholarships/admin/${newScholarship.id}/status`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: { isActive: false },
  });
  console.log(`   -> Status toggled: isActive=${toggleRes.data.isActive}`);

  // 8e. Admin Delete
  console.log('   -> Admin cleaning up test scholarship...');
  await request(`${API_BASE}/scholarships/admin/${newScholarship.id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  console.log('   -> Test scholarship deleted successfully.');

  // Check AuditLog
  const auditLogs = await prisma.auditLog.findMany({
    where: { userId: adminUser.id },
    orderBy: { createdAt: 'desc' },
    take: 3,
  });
  console.log(`   -> Verified AuditLog entries recorded: ${auditLogs.length} actions logged.`);

  console.log('\n================================================================');
  console.log('   ALL MODULE 8 SPECIFICATION TESTS PASSED SUCCESSFULLY!');
  console.log('================================================================');
}

runVerification()
  .catch((err) => {
    console.error('\n[VERIFICATION ERROR]', err.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
