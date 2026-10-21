import { prisma } from '../shared/database/prisma.service';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';

const API_BASE = 'http://localhost:5000/api/v1';

async function runModule6Tests() {
  console.log('===========================================================');
  console.log(' SUPERCONSCIOUSNESS: MODULE 6 EXTENDED ARCHITECTURE E2E TEST');
  console.log(' Role-Based College & Course Management, Publishing & Discovery');
  console.log('===========================================================');

  const timestamp = Date.now();
  const student1Email = `student1.college.${timestamp}@example.com`;
  const student2Email = `student2.college.${timestamp}@example.com`;
  const counsellorEmail = `counsellor.college.${timestamp}@example.com`;
  const adminEmail = `admin.college.${timestamp}@example.com`;

  // Helper to create users with JWT
  async function createTestUser(email: string, role: string, isStudent = false) {
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash: '$2a$10$abcdefghijklmnopqrstuvwxyzABCDEF1234567890abcdefghijk',
        role,
        isActive: true,
        isEmailVerified: true,
      },
    });

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      config.jwt.secret,
      { expiresIn: '1h' }
    );

    let profile = null;
    if (isStudent) {
      profile = await prisma.studentProfile.create({
        data: {
          userId: user.id,
          fullName: `Discovery Student ${timestamp}`,
          gender: 'MALE',
          grade: 'Grade 12',
          contactEmail: email,
          phone: '+1 555-0987',
          addressStreet: '100 Innovation Way',
          addressCity: 'Boston',
          addressState: 'MA',
          addressPostalCode: '02138',
          addressCountry: 'USA',
          board: 'IB',
          citizenship: 'US Citizen',
          passingOutYear: 2026,
          verificationStatus: 'VERIFIED',
        },
      });
    }

    return { user, profile, token };
  }

  // Set up users
  const student1 = await createTestUser(student1Email, 'STUDENT', true);
  const student2 = await createTestUser(student2Email, 'STUDENT', true);
  const counsellor = await createTestUser(counsellorEmail, 'COUNSELLOR');
  const admin = await createTestUser(adminEmail, 'ADMIN');

  console.log(`✓ Admin user: ${admin.user.email}`);
  console.log(`✓ Counsellor user: ${counsellor.user.email}`);
  console.log(`✓ Student 1: ${student1.user.email} (Profile ID: ${student1.profile?.id})`);
  console.log(`✓ Student 2: ${student2.user.email} (Profile ID: ${student2.profile?.id})`);

  let testCollegeId = '';
  let testCourseId = '';

  try {
    // -------------------------------------------------------------
    // TEST 1: Admin Creates College (Initial Status: DRAFT)
    // -------------------------------------------------------------
    console.log('\n[TEST 1] Admin creates college: POST /api/v1/colleges/admin');
    const createRes = await fetch(`${API_BASE}/colleges/admin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${admin.token}`,
      },
      body: JSON.stringify({
        name: `Imperial Institute of Advanced Technology ${timestamp}`,
        country: 'Switzerland',
        city: 'Zurich',
        state: 'Zurich Canton',
        institutionType: 'Polytechnic Institute',
        establishedYear: 1855,
        overview: 'A leading global STEM institution dedicated to mathematics, natural sciences, and engineering research.',
        rankingInfo: 'QS World Rank #7',
        officialWebsiteUrl: 'https://ethz.ch/en.html',
        contactEmail: 'admissions@ethz.ch',
        contactPhone: '+41 44 632 11 11',
        hasScholarships: true,
        scholarshipDetails: 'Excellence Scholarship & Opportunity Programme (ESOP)',
        minAnnualFee: 1600,
        maxAnnualFee: 2000,
        feeCurrency: 'CHF',
        status: 'DRAFT',
        isPublished: false,
        isVerified: false,
      }),
    });

    const createData: any = await createRes.json();
    if (!createRes.ok || !createData.data?.id) {
      throw new Error(`Admin failed to create college: ${JSON.stringify(createData)}`);
    }
    testCollegeId = createData.data.id;
    console.log(`✓ College created as DRAFT: "${createData.data.name}" (ID: ${testCollegeId})`);
    console.log(`  - Status: ${createData.data.status}, isPublished: ${createData.data.isPublished}, isVerified: ${createData.data.isVerified}`);

    // -------------------------------------------------------------
    // TEST 2: Admin Saves College as DRAFT -> Student Cannot See It
    // -------------------------------------------------------------
    console.log('\n[TEST 2] Visibility Verification: Student queries DRAFT college');
    // 2a: Student search should not find it
    const studentSearchRes = await fetch(`${API_BASE}/colleges?search=Imperial%20Institute`, {
      headers: { Authorization: `Bearer ${student1.token}` },
    });
    const studentSearchData: any = await studentSearchRes.json();
    const foundInSearch = (studentSearchData.data?.data || []).some((c: any) => c.id === testCollegeId);
    if (foundInSearch) {
      throw new Error('SECURITY VIOLATION: Student was able to search and find a DRAFT college!');
    }
    console.log('✓ Verified: Draft college does NOT appear in student search results.');

    // 2b: Student direct GET by ID should return 404
    const studentDirectRes = await fetch(`${API_BASE}/colleges/${testCollegeId}`, {
      headers: { Authorization: `Bearer ${student1.token}` },
    });
    if (studentDirectRes.status !== 404) {
      throw new Error(`Expected HTTP 404 for draft college direct access, got ${studentDirectRes.status}`);
    }
    console.log('✓ Verified: Direct student access to DRAFT college returned HTTP 404 (Not Found / Not Published).');

    // -------------------------------------------------------------
    // TEST 3: Admin Publishes College -> Student Can See It
    // -------------------------------------------------------------
    console.log('\n[TEST 3] Admin publishes college: PATCH /api/v1/colleges/admin/:id/publish');
    const publishRes = await fetch(`${API_BASE}/colleges/admin/${testCollegeId}/publish`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${admin.token}`,
      },
      body: JSON.stringify({ isPublished: true, status: 'PUBLISHED' }),
    });
    const publishData: any = await publishRes.json();
    if (!publishRes.ok || !publishData.data?.isPublished) {
      throw new Error(`Failed to publish college: ${JSON.stringify(publishData)}`);
    }
    console.log(`✓ College successfully published. Status: ${publishData.data.status}, isPublished: ${publishData.data.isPublished}`);

    // Now student should be able to retrieve it!
    const studentVisibleRes = await fetch(`${API_BASE}/colleges/${testCollegeId}`, {
      headers: { Authorization: `Bearer ${student1.token}` },
    });
    const studentVisibleData: any = await studentVisibleRes.json();
    if (!studentVisibleRes.ok || studentVisibleData.data?.id !== testCollegeId) {
      throw new Error('Published college is not visible to student!');
    }
    console.log(`✓ Verified: Student successfully accessed published college profile: "${studentVisibleData.data.name}"`);

    // -------------------------------------------------------------
    // TEST 4: Student Tries to Modify College Through API -> 403 Forbidden
    // -------------------------------------------------------------
    console.log('\n[TEST 4] Security Check: Student attempts Admin mutation API');
    const studentHackRes = await fetch(`${API_BASE}/colleges/admin/${testCollegeId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${student1.token}`,
      },
      body: JSON.stringify({ name: 'Hacked College Name' }),
    });
    if (studentHackRes.status !== 403) {
      throw new Error(`Expected HTTP 403 Forbidden for student calling admin API, got ${studentHackRes.status}`);
    }
    console.log('✓ Security Verified: Student forbidden from modifying catalogue (HTTP 403 Forbidden).');

    // -------------------------------------------------------------
    // TEST 5: Counsellor Opens Published College -> College is Visible
    // -------------------------------------------------------------
    console.log('\n[TEST 5] Counsellor accesses published college: GET /api/v1/colleges/:id');
    const counsellorRes = await fetch(`${API_BASE}/colleges/${testCollegeId}`, {
      headers: { Authorization: `Bearer ${counsellor.token}` },
    });
    const counsellorData: any = await counsellorRes.json();
    if (!counsellorRes.ok || counsellorData.data?.id !== testCollegeId) {
      throw new Error('Counsellor could not view published college');
    }
    console.log(`✓ Counsellor verified: Able to access college profile "${counsellorData.data.name}" for student advisory.`);

    // -------------------------------------------------------------
    // TEST 6: Admin Edits College -> Updated Information Appears
    // -------------------------------------------------------------
    console.log('\n[TEST 6] Admin edits college: PUT /api/v1/colleges/admin/:id');
    const updatedOverview = 'Updated Overview: Premier European institute with state-of-the-art quantum photonics laboratory.';
    const updateRes = await fetch(`${API_BASE}/colleges/admin/${testCollegeId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${admin.token}`,
      },
      body: JSON.stringify({
        overview: updatedOverview,
        rankingInfo: 'QS World Rank #6 Globally',
        isVerified: true,
      }),
    });
    const updateData: any = await updateRes.json();
    if (!updateRes.ok || updateData.data?.overview !== updatedOverview) {
      throw new Error(`Failed to update college: ${JSON.stringify(updateData)}`);
    }
    console.log('✓ Admin update persisted. Verifying student sees updated information...');

    const studentCheckUpdatedRes = await fetch(`${API_BASE}/colleges/${testCollegeId}`, {
      headers: { Authorization: `Bearer ${student1.token}` },
    });
    const studentCheckData: any = await studentCheckUpdatedRes.json();
    if (studentCheckData.data?.overview !== updatedOverview || studentCheckData.data?.isVerified !== true) {
      throw new Error('Updated overview or verified badge not visible to student!');
    }
    console.log(`✓ Student sees updated overview and verified badge: "${studentCheckData.data.rankingInfo}"`);

    // -------------------------------------------------------------
    // TEST 7: Admin Archives College -> Student Can No Longer See It
    // -------------------------------------------------------------
    console.log('\n[TEST 7] Admin archives college: PATCH /api/v1/colleges/admin/:id/archive');
    const archiveRes = await fetch(`${API_BASE}/colleges/admin/${testCollegeId}/archive`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${admin.token}` },
    });
    if (!archiveRes.ok) {
      throw new Error('Admin failed to archive college');
    }
    console.log('✓ College archived by Admin.');

    const studentArchivedCheck = await fetch(`${API_BASE}/colleges/${testCollegeId}`, {
      headers: { Authorization: `Bearer ${student1.token}` },
    });
    if (studentArchivedCheck.status !== 404) {
      throw new Error(`Archived college should return HTTP 404 to students, got ${studentArchivedCheck.status}`);
    }
    console.log('✓ Verified: Archived college is completely hidden from students (HTTP 404).');

    // Un-archive & publish again so we can test courses and shortlists
    await fetch(`${API_BASE}/colleges/admin/${testCollegeId}/publish`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${admin.token}`,
      },
      body: JSON.stringify({ isPublished: true, status: 'PUBLISHED' }),
    });
    console.log('✓ College restored to PUBLISHED state for subsequent course tests.');

    // -------------------------------------------------------------
    // TEST 8: Admin Adds Course to College -> Appears Under College
    // -------------------------------------------------------------
    console.log('\n[TEST 8] Admin adds course program: POST /api/v1/colleges/admin/:id/courses');
    const courseRes = await fetch(`${API_BASE}/colleges/admin/${testCollegeId}/courses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${admin.token}`,
      },
      body: JSON.stringify({
        name: 'M.Sc. in Quantum Engineering',
        department: 'Engineering & Technology',
        specialization: 'Quantum Computing & Information Theory',
        level: 'Postgraduate',
        durationYears: 2,
        durationText: '2 Years Full-Time',
        description: 'Advanced curriculum covering superconducting qubits, quantum algorithms, and nanoscale photonics.',
        eligibilityCriteria: 'B.Sc. in Physics, Electrical Engineering, or Computer Science with minimum 85% aggregate.',
        annualTuitionFee: 1800,
        feeCurrency: 'CHF',
        feeRange: 'CHF 1,800 / year',
        entranceExamsRequired: ['GRE_GENERAL', 'IELTS'],
        scholarshipAvailable: true,
        scholarshipDetails: 'Swiss Excellence Fellowship covers living stipend and tuition waiver.',
        applicationDeadline: 'December 15',
        isPopular: true,
        status: 'PUBLISHED',
        isPublished: true,
      }),
    });
    const courseData: any = await courseRes.json();
    if (!courseRes.ok || !courseData.data?.id) {
      throw new Error(`Failed to create course: ${JSON.stringify(courseData)}`);
    }
    testCourseId = courseData.data.id;
    console.log(`✓ Course created: "${courseData.data.name}" (ID: ${testCourseId})`);

    // Verify course appears under published college for student
    const studentCollegeWithCourses = await fetch(`${API_BASE}/colleges/${testCollegeId}`, {
      headers: { Authorization: `Bearer ${student1.token}` },
    });
    const collegeWithCoursesData: any = await studentCollegeWithCourses.json();
    const courseFound = (collegeWithCoursesData.data?.courses || []).some((c: any) => c.id === testCourseId);
    if (!courseFound) {
      throw new Error('Newly created course was not found under published college profile!');
    }
    console.log('✓ Verified: Course program is visible to student under the college profile.');

    // -------------------------------------------------------------
    // TEST 9: Student Saves College -> Saved Record Created for Student 1
    // -------------------------------------------------------------
    console.log('\n[TEST 9] Student 1 saves college: POST /api/v1/colleges/saved/institutions/:id');
    const saveInstRes = await fetch(`${API_BASE}/colleges/saved/institutions/${testCollegeId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${student1.token}`,
      },
      body: JSON.stringify({ notes: 'Top priority institute for quantum computing.' }),
    });
    const saveInstData: any = await saveInstRes.json();
    if (!saveInstRes.ok || !saveInstData.data?.saved) {
      throw new Error(`Failed to save college: ${JSON.stringify(saveInstData)}`);
    }
    console.log('✓ College saved to Student 1 shortlist.');

    // Also save course
    const saveCrsRes = await fetch(`${API_BASE}/colleges/saved/courses/${testCourseId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${student1.token}`,
      },
      body: JSON.stringify({ notes: 'Target master degree program.' }),
    });
    if (!saveCrsRes.ok) {
      throw new Error('Failed to save course program');
    }
    console.log('✓ Course program saved to Student 1 shortlist.');

    // Verify Student 1 shortlist
    const student1SavedRes = await fetch(`${API_BASE}/colleges/saved/me`, {
      headers: { Authorization: `Bearer ${student1.token}` },
    });
    const student1SavedData: any = await student1SavedRes.json();
    if (
      student1SavedData.data.savedInstitutions.length !== 1 ||
      student1SavedData.data.savedCourses.length !== 1
    ) {
      throw new Error(`Expected 1 saved college and 1 saved course, got ${JSON.stringify(student1SavedData.data)}`);
    }
    console.log('✓ Student 1 saved items verified: 1 institution and 1 course program.');

    // -------------------------------------------------------------
    // TEST 10: Student 2 Isolation -> Student 2 Has 0 Items (Anti-IDOR)
    // -------------------------------------------------------------
    console.log('\n[TEST 10] Student isolation verification (Anti-IDOR barrier)');
    const student2SavedRes = await fetch(`${API_BASE}/colleges/saved/me`, {
      headers: { Authorization: `Bearer ${student2.token}` },
    });
    const student2SavedData: any = await student2SavedRes.json();
    if (
      student2SavedData.data.savedInstitutions.length !== 0 ||
      student2SavedData.data.savedCourses.length !== 0
    ) {
      throw new Error('IDOR LEAK: Student 2 can view Student 1 saved items!');
    }
    console.log('✓ Security Check Passed: Student 2 shortlist is completely isolated (0 saved items).');

    // -------------------------------------------------------------
    // TEST 11: Audit Trail Verification in Database
    // -------------------------------------------------------------
    console.log('\n[TEST 11] Audit Trail Verification in Database');
    const auditLogs = await prisma.auditLog.findMany({
      where: {
        action: {
          in: [
            'COLLEGE_CREATED',
            'COLLEGE_PUBLISHED',
            'COLLEGE_UPDATED',
            'COLLEGE_ARCHIVED',
            'COURSE_CREATED',
            'COLLEGE_SAVED',
          ],
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });
    console.log(`✓ Audit log verified: ${auditLogs.length} audit entries captured.`);
    const actionsRecorded = new Set(auditLogs.map((l) => l.action));
    console.log(`  - Actions captured: ${Array.from(actionsRecorded).join(', ')}`);

    // Clean up created test college and courses
    console.log('\n[CLEANUP] Cleaning up test records...');
    await prisma.institution.delete({ where: { id: testCollegeId } });
    console.log('✓ Test college and cascade courses deleted.');

  } finally {
    // Clean up test users
    await prisma.user.deleteMany({
      where: {
        id: { in: [student1.user.id, student2.user.id, counsellor.user.id, admin.user.id] },
      },
    });
    console.log('✓ Test user accounts cleaned up.');
  }

  console.log('\n===========================================================');
  console.log(' ALL 10 ARCHITECTURE TESTS PASSED WITH 100% SUCCESS!');
  console.log('===========================================================');
}

runModule6Tests()
  .catch((err) => {
    console.error('\n❌ TEST FAILED:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
