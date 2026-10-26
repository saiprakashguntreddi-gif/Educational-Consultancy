import { prisma } from '../shared/database/prisma.service';
import { hashPassword } from '../shared/utils/password';
import { Role } from '../config/roles';
import { CounsellorService } from '../modules/counsellor/counsellor.service';
import { AdminService } from '../modules/admin/admin.service';

async function runVerification() {
  console.log('================================================================');
  console.log(' SUPERCONSCIOUSNESS: MODULE 13 & MODULE 14 E2E VERIFICATION');
  console.log(' Counsellor & Administration Suite + Manage Students');
  console.log('================================================================\n');

  const ts = Date.now();
  const passwordHash = await hashPassword('TestPassword123!');

  // 1. Setup Test Counsellors and Admin
  const counsellorA = await prisma.user.upsert({
    where: { email: `counsellor.a.${ts}@example.com` },
    update: {},
    create: {
      email: `counsellor.a.${ts}@example.com`,
      passwordHash,
      role: Role.ADMIN,
      isActive: true,
      isEmailVerified: true,
    },
  });

  const counsellorB = await prisma.user.upsert({
    where: { email: `counsellor.b.${ts}@example.com` },
    update: {},
    create: {
      email: `counsellor.b.${ts}@example.com`,
      passwordHash,
      role: Role.ADMIN,
      isActive: true,
      isEmailVerified: true,
    },
  });

  const adminUser = await prisma.user.upsert({
    where: { email: `admin.suite.${ts}@example.com` },
    update: {},
    create: {
      email: `admin.suite.${ts}@example.com`,
      passwordHash,
      role: Role.ADMIN,
      isActive: true,
      isEmailVerified: true,
    },
  });

  console.log('✔ Staff test accounts provisioned:');
  console.log(`  - Counsellor A: ${counsellorA.email} (${counsellorA.id})`);
  console.log(`  - Counsellor B: ${counsellorB.email} (${counsellorB.id})`);
  console.log(`  - Admin: ${adminUser.email} (${adminUser.id})\n`);

  // 2. Test Staff Student Account Creation (Module 13 requirement)
  console.log('--- TEST 1: Staff Direct Student Account Creation ---');
  const createdStudent = await CounsellorService.createStudentAccount(
    counsellorA.id,
    Role.ADMIN,
    {
      email: `student.onboarded.${ts}@example.com`,
      password: 'StudentPassword123!',
      fullName: 'Aarav Patel',
      gender: 'MALE',
      grade: 'Grade 12',
      contactEmail: `student.onboarded.${ts}@example.com`,
      phone: '+91 98765 43210',
      address: {
        street: '42 MG Road',
        city: 'Bengaluru',
        state: 'Karnataka',
        postalCode: '560001',
        country: 'India',
      },
      board: 'CBSE',
      citizenship: 'Indian',
      passingOutYear: 2026,
      assignToSelf: true,
    }
  );

  console.log('✔ Student created successfully by Counsellor A:');
  console.log(`  Student Profile ID: ${createdStudent.profile.id}`);
  console.log(`  Assigned Counsellor: ${createdStudent.profile.assignedCounsellorId}`);
  if (createdStudent.profile.assignedCounsellorId !== counsellorA.id) {
    throw new Error('FAILED: Student was not auto-assigned to Counsellor A');
  }

  // 3. Test Counsellor Dashboard Metrics (Module 13 requirement)
  console.log('\n--- TEST 2: Counsellor Dashboard Metrics ---');
  const dashboard = await CounsellorService.getCounsellorDashboard(counsellorA.id);
  console.log('✔ Dashboard metrics retrieved:', dashboard.metrics);
  if (dashboard.metrics.assignedStudents < 1) {
    throw new Error('FAILED: Expected at least 1 assigned student for Counsellor A');
  }

  // 4. Test Manage Students: List Assigned Students, Search & Filter (Module 14 requirement)
  console.log('\n--- TEST 3: Manage Students Search and Filtering ---');
  const listByName = await CounsellorService.listAssignedStudents(counsellorA.id, {
    search: 'Aarav',
  });
  console.log(`✔ Search by name ('Aarav') matched: ${listByName.students.length} record(s)`);
  if (listByName.students.length === 0 || listByName.students[0].fullName !== 'Aarav Patel') {
    throw new Error('FAILED: Search by name did not return Aarav Patel');
  }

  const listByBoard = await CounsellorService.listAssignedStudents(counsellorA.id, {
    board: 'CBSE',
    passingOutYear: '2026',
  });
  console.log(`✔ Filter by Board='CBSE' and Year='2026' matched: ${listByBoard.students.length} record(s)`);
  if (listByBoard.students.length === 0) {
    throw new Error('FAILED: Filter by board/year did not return student');
  }

  // 5. Test IDOR Security Defense (Module 13 / 14 critical requirement)
  console.log('\n--- TEST 4: IDOR Protection & Authorization ---');
  // Counsellor A is assigned to Aarav; Counsellor B is NOT assigned to Aarav
  try {
    await CounsellorService.getStudent360(createdStudent.profile.id, {
      userId: counsellorB.id,
      role: Role.ADMIN,
    });
    // Note: since Aarav is assigned to A, B should NOT have access!
    throw new Error('FAILED_IDOR_VULNERABILITY: Counsellor B was allowed to access Counsellor A student!');
  } catch (err: any) {
    if (err.message === 'FORBIDDEN_IDOR') {
      console.log('✔ IDOR Prevention Verified: Counsellor B received FORBIDDEN_IDOR when accessing Counsellor A student');
    } else {
      throw err;
    }
  }

  // Admin MUST be able to access any student
  const adminAccess = await CounsellorService.getStudent360(createdStudent.profile.id, {
    userId: adminUser.id,
    role: Role.ADMIN,
  });
  console.log(`✔ Admin Access Verified: Admin successfully inspected student (Name: ${adminAccess.fullName})`);

  // 6. Test Guidance Action Plans (Module 13 guidance workflow)
  console.log('\n--- TEST 5: Action Plan & Milestones Workflow ---');
  const actionItem = await CounsellorService.createActionPlan(createdStudent.profile.id, counsellorA.id, {
    title: 'Complete SAT Practice Test & Register for Spring Window',
    description: 'Target score: 1450+. Finish Bluebook Practice Test 1 and review math errors with counsellor.',
    category: 'ENTRANCE_EXAM',
    targetDate: '2026-11-15',
    priority: 'HIGH',
  });
  console.log('✔ Action Plan Milestone created:', {
    id: actionItem.id,
    title: actionItem.title,
    status: actionItem.status,
    priority: actionItem.priority,
  });

  const updatedAction = await CounsellorService.updateActionPlan(
    actionItem.id,
    counsellorA.id,
    Role.ADMIN,
    { status: 'COMPLETED' }
  );
  console.log('✔ Action Plan Milestone updated to COMPLETED:', {
    id: updatedAction.id,
    status: updatedAction.status,
    completedAt: updatedAction.completedAt,
  });
  if (updatedAction.status !== 'COMPLETED' || !updatedAction.completedAt) {
    throw new Error('FAILED: Action plan completion status not set properly');
  }

  // 7. Test Counsellor Advisory Notes (Module 13 requirement)
  console.log('\n--- TEST 6: Counsellor Advisory Notes ---');
  const note = await CounsellorService.createNote(createdStudent.profile.id, counsellorA.id, {
    title: 'Initial Profile Strategy Review',
    content: 'Student expresses strong interest in US Artificial Intelligence programs. Academics in Grade 11: 92% PCM. Recommended SAT prep path.',
    isPrivate: true,
  });
  console.log('✔ Counsellor note recorded:', { id: note.id, title: note.title, isPrivate: note.isPrivate });

  const notesList = await CounsellorService.getNotes(createdStudent.profile.id, {
    userId: counsellorA.id,
    role: Role.ADMIN,
  });
  console.log(`✔ Notes list retrieved: ${notesList.length} note(s) found`);
  if (notesList.length === 0) {
    throw new Error('FAILED: Notes list empty');
  }

  // 8. Test Admin Student Assignment & Reassignment (Module 13 Admin requirement)
  console.log('\n--- TEST 7: Admin Counsellor Assignment & Roster Management ---');
  const reassigned = await AdminService.assignCounsellor(
    createdStudent.profile.id,
    counsellorB.id,
    adminUser.id
  );
  console.log(`✔ Admin reassigned student to Counsellor B: (Assigned Counsellor: ${reassigned.assignedCounsellor?.email})`);
  if (reassigned.assignedCounsellorId !== counsellorB.id) {
    throw new Error('FAILED: Admin reassignment failed');
  }

  // Verify Counsellor B now has access
  const counsellorBAccess = await CounsellorService.getStudent360(createdStudent.profile.id, {
    userId: counsellorB.id,
    role: Role.ADMIN,
  });
  console.log(`✔ Counsellor B now authorized for reassigned student: ${counsellorBAccess.fullName}`);

  // 9. Test Admin Platform Dashboard & Workload Directory (Module 13 requirement)
  console.log('\n--- TEST 8: Admin Platform Dashboard & Directory ---');
  const adminDash = await AdminService.getAdminDashboard();
  console.log('✔ Admin platform dashboard KPIs:', adminDash.kpis);
  if (adminDash.kpis.totalStudents < 1 || adminDash.kpis.totalCounsellors < 1) {
    throw new Error('FAILED: Admin KPI counts unexpected');
  }

  const counsellorsDir = await AdminService.listCounsellors();
  console.log(`✔ Counsellor directory retrieved: ${counsellorsDir.length} counsellors`);
  const counsellorBWorkload = counsellorsDir.find((c) => c.id === counsellorB.id);
  console.log('  Counsellor B caseload:', counsellorBWorkload?.assignedStudentsCount);
  if (!counsellorBWorkload || counsellorBWorkload.assignedStudentsCount < 1) {
    throw new Error('FAILED: Counsellor B caseload should reflect reassigned student');
  }

  // 10. Test CSV Export (Module 13 requirement)
  console.log('\n--- TEST 9: Secure CSV Roster Export ---');
  const counsellorCsv = await CounsellorService.exportAssignedStudentsCsv(counsellorB.id);
  console.log(`✔ Counsellor CSV export generated (${counsellorCsv.length} bytes, lines: ${counsellorCsv.split('\n').length})`);
  if (!counsellorCsv.includes('Aarav Patel')) {
    throw new Error('FAILED: Exported CSV did not contain assigned student');
  }

  const adminCsv = await AdminService.exportAllStudentsCsv();
  console.log(`✔ Admin Platform CSV export generated (${adminCsv.length} bytes, lines: ${adminCsv.split('\n').length})`);
  if (!adminCsv.includes('Aarav Patel')) {
    throw new Error('FAILED: Platform CSV export did not contain student');
  }

  // 11. Test Audit Logs (Module 13 governance requirement)
  console.log('\n--- TEST 10: Audit Logs Verification ---');
  const auditLogs = await AdminService.getAuditLogs({ limit: 10 });
  console.log(`✔ Platform audit logs retrieved: ${auditLogs.logs.length} entries`);
  const hasStaffCreationLog = auditLogs.logs.some((l) => l.action === 'STUDENT_ACCOUNT_CREATED_BY_STAFF');
  const hasAssignLog = auditLogs.logs.some((l) => l.action === 'COUNSELLOR_ASSIGNED_TO_STUDENT');
  console.log('  - STUDENT_ACCOUNT_CREATED_BY_STAFF logged:', hasStaffCreationLog);
  console.log('  - COUNSELLOR_ASSIGNED_TO_STUDENT logged:', hasAssignLog);
  if (!hasStaffCreationLog || !hasAssignLog) {
    throw new Error('FAILED: Expected critical actions to be present in AuditLog');
  }

  console.log('\n================================================================');
  console.log(' 🎉 ALL 10 TESTS PASSED: MODULE 13 & 14 BACKEND VERIFIED 100%!');
  console.log('================================================================\n');
}

runVerification()
  .catch((e) => {
    console.error('VERIFICATION_FAILED:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
