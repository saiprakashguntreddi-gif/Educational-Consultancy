import { prisma } from '../shared/database/prisma.service';
import { hashPassword } from '../shared/utils/password';
import { Role } from '../config/roles';

async function main() {
  console.log('[SEED] Initializing clean cohort matching production portal state...');

  const staffPassword = await hashPassword('StaffPassword123!');
  const studentPassword = await hashPassword('StudentPassword123!');

  // 1. Admin Account
  const admin = await prisma.user.upsert({
    where: { email: 'admin@superconsciousness.internal' },
    update: { isActive: true, isEmailVerified: true },
    create: {
      email: 'admin@superconsciousness.internal',
      passwordHash: staffPassword,
      role: Role.ADMIN,
      isActive: true,
      isEmailVerified: true,
    },
  });
  console.log(`[SEED] Admin ready: ${admin.email}`);

  // 2. Counsellor Account & Profile
  const counsellor = await prisma.user.upsert({
    where: { email: 'counsellor@superconsciousness.internal' },
    update: { isActive: true, isEmailVerified: true },
    create: {
      email: 'counsellor@superconsciousness.internal',
      passwordHash: staffPassword,
      role: Role.COUNSELLOR,
      isActive: true,
      isEmailVerified: true,
    },
  });

  const counsellorProfile = await prisma.counsellorProfile.upsert({
    where: { userId: counsellor.id },
    update: { verificationStatus: 'ACTIVE', capacity: 30 },
    create: {
      userId: counsellor.id,
      fullName: 'Dr. Sarah Jenkins',
      qualification: 'Ph.D. in Education & Career Counselling',
      phone: '+91 9876543210',
      experienceYears: 12,
      specialization: 'STEM & Overseas University Admissions',
      bio: 'Over 12 years of experience guiding secondary students through admissions and career discovery.',
      capacity: 30,
      verificationStatus: 'ACTIVE',
      verifiedAt: new Date(),
    },
  });
  console.log(`[SEED] Active Counsellor ready: ${counsellor.email} (${counsellorProfile.fullName})`);

  // 3. Student 1: Sai Prakash (Verified, assigned to counsellor)
  const saiUser = await prisma.user.upsert({
    where: { email: 'guntreddisaiprakash1703@gmail.com' },
    update: { isActive: true, isEmailVerified: true },
    create: {
      email: 'guntreddisaiprakash1703@gmail.com',
      passwordHash: studentPassword,
      role: Role.STUDENT,
      isActive: true,
      isEmailVerified: true,
    },
  });

  const saiProfile = await prisma.studentProfile.upsert({
    where: { userId: saiUser.id },
    update: {
      fullName: 'Sai Prakash',
      gender: 'MALE',
      grade: 'Grade 12',
      contactEmail: 'guntreddisaiprakash1703@gmail.com',
      phone: '+91 9876543210',
      addressStreet: 'Vijayawada, Ranigarithota',
      addressCity: 'Vijayawada',
      addressState: 'Andhra Pradesh',
      addressPostalCode: '520001',
      addressCountry: 'India',
      board: 'Andhra Pradesh (BIEAP / BSEAP)',
      citizenship: 'India',
      passingOutYear: 2026,
      verificationStatus: 'VERIFIED',
      verifiedAt: new Date(),
      assignedCounsellorId: counsellor.id,
    },
    create: {
      userId: saiUser.id,
      fullName: 'Sai Prakash',
      gender: 'MALE',
      grade: 'Grade 12',
      contactEmail: 'guntreddisaiprakash1703@gmail.com',
      phone: '+91 9876543210',
      addressStreet: 'Vijayawada, Ranigarithota',
      addressCity: 'Vijayawada',
      addressState: 'Andhra Pradesh',
      addressPostalCode: '520001',
      addressCountry: 'India',
      board: 'Andhra Pradesh (BIEAP / BSEAP)',
      citizenship: 'India',
      passingOutYear: 2026,
      verificationStatus: 'VERIFIED',
      verifiedAt: new Date(),
      assignedCounsellorId: counsellor.id,
    },
  });

  await prisma.studentEducation.upsert({
    where: { studentProfileId: saiProfile.id },
    update: {},
    create: {
      studentProfileId: saiProfile.id,
      studyCategory: 'UNDERGRADUATE_ENGINEERING',
      targetStream: 'Engineering',
      schoolName: 'Sri Chaitanya Junior College',
      board: 'Andhra Pradesh (BIEAP / BSEAP)',
      completionYear: 2024,
      percentage: 92.5,
      subjectDetails: JSON.stringify([
        { subject: 'Mathematics', marks: 95 },
        { subject: 'Physics', marks: 91 },
        { subject: 'Chemistry', marks: 92 },
      ]),
      tenthSchoolName: 'St. Joseph High School',
      tenthBoard: 'Andhra Pradesh (BIEAP / BSEAP)',
      tenthPassingYear: 2022,
      tenthPercentage: 94.0,
      twelfthDocumentUrl: '/uploads/documents/twelfth_marksheet_sai.pdf',
      tenthDocumentUrl: '/uploads/documents/tenth_marksheet_sai.pdf',
    },
  });
  console.log(`[SEED] Student 1 ready: ${saiProfile.fullName} (${saiUser.email}) - VERIFIED & ASSIGNED`);

  // 4. Student 2: Alex Morgan (Verified, assigned to counsellor)
  const alexUser = await prisma.user.upsert({
    where: { email: 'student.demo@superconsciousness.com' },
    update: { isActive: true, isEmailVerified: true },
    create: {
      email: 'student.demo@superconsciousness.com',
      passwordHash: studentPassword,
      role: Role.STUDENT,
      isActive: true,
      isEmailVerified: true,
    },
  });

  const alexProfile = await prisma.studentProfile.upsert({
    where: { userId: alexUser.id },
    update: {
      fullName: 'Alex Morgan',
      gender: 'MALE',
      grade: 'Grade 12',
      contactEmail: 'student.demo@superconsciousness.com',
      phone: '+1-555-0199',
      addressStreet: '742 Evergreen Terrace',
      addressCity: 'Springfield',
      addressState: 'Oregon',
      addressPostalCode: '97477',
      addressCountry: 'United States',
      board: 'CBSE',
      citizenship: 'United States',
      passingOutYear: 2025,
      verificationStatus: 'VERIFIED',
      verifiedAt: new Date(),
      assignedCounsellorId: counsellor.id,
    },
    create: {
      userId: alexUser.id,
      fullName: 'Alex Morgan',
      gender: 'MALE',
      grade: 'Grade 12',
      contactEmail: 'student.demo@superconsciousness.com',
      phone: '+1-555-0199',
      addressStreet: '742 Evergreen Terrace',
      addressCity: 'Springfield',
      addressState: 'Oregon',
      addressPostalCode: '97477',
      addressCountry: 'United States',
      board: 'CBSE',
      citizenship: 'United States',
      passingOutYear: 2025,
      verificationStatus: 'VERIFIED',
      verifiedAt: new Date(),
      assignedCounsellorId: counsellor.id,
    },
  });

  await prisma.studentEducation.upsert({
    where: { studentProfileId: alexProfile.id },
    update: {},
    create: {
      studentProfileId: alexProfile.id,
      studyCategory: 'UNDERGRADUATE_ENGINEERING',
      targetStream: 'Computer Science',
      schoolName: 'Delhi Public School',
      board: 'CBSE',
      completionYear: 2024,
      percentage: 88.0,
      subjectDetails: JSON.stringify([
        { subject: 'Mathematics', marks: 90 },
        { subject: 'Physics', marks: 86 },
        { subject: 'Chemistry', marks: 88 },
      ]),
      tenthSchoolName: 'Springfield High',
      tenthBoard: 'CBSE',
      tenthPassingYear: 2022,
      tenthPercentage: 89.5,
    },
  });
  console.log(`[SEED] Student 2 ready: ${alexProfile.fullName} (${alexUser.email}) - VERIFIED & ASSIGNED`);

  // 5. Student 3: Aarav Sharma (KEPT FOR VERIFICATION, UNASSIGNED QUEUE)
  const aaravUser = await prisma.user.upsert({
    where: { email: 'aarav.verification@superconsciousness.com' },
    update: { isActive: true, isEmailVerified: true },
    create: {
      email: 'aarav.verification@superconsciousness.com',
      passwordHash: studentPassword,
      role: Role.STUDENT,
      isActive: true,
      isEmailVerified: true,
    },
  });

  const aaravProfile = await prisma.studentProfile.upsert({
    where: { userId: aaravUser.id },
    update: {
      fullName: 'Aarav Sharma',
      gender: 'MALE',
      grade: 'Grade 12',
      contactEmail: 'aarav.verification@superconsciousness.com',
      phone: '+91 9123456789',
      addressStreet: '12 Sector 14, Rohini',
      addressCity: 'New Delhi',
      addressState: 'Delhi',
      addressPostalCode: '110085',
      addressCountry: 'India',
      board: 'CBSE',
      citizenship: 'India',
      passingOutYear: 2026,
      verificationStatus: 'PENDING', // Kept for verification!
      assignedCounsellorId: null,   // Unassigned queue = 1!
    },
    create: {
      userId: aaravUser.id,
      fullName: 'Aarav Sharma',
      gender: 'MALE',
      grade: 'Grade 12',
      contactEmail: 'aarav.verification@superconsciousness.com',
      phone: '+91 9123456789',
      addressStreet: '12 Sector 14, Rohini',
      addressCity: 'New Delhi',
      addressState: 'Delhi',
      addressPostalCode: '110085',
      addressCountry: 'India',
      board: 'CBSE',
      citizenship: 'India',
      passingOutYear: 2026,
      verificationStatus: 'PENDING', // Kept for verification!
      assignedCounsellorId: null,   // Unassigned queue = 1!
    },
  });

  await prisma.studentEducation.upsert({
    where: { studentProfileId: aaravProfile.id },
    update: {
      studyCategory: 'UNDERGRADUATE_ENGINEERING',
      targetStream: 'Engineering',
      schoolName: 'Delhi Public School, R.K. Puram',
      board: 'CBSE',
      completionYear: 2024,
      percentage: 91.4,
      subjectDetails: JSON.stringify([
        { subject: 'Mathematics', marks: 95 },
        { subject: 'Physics', marks: 92 },
        { subject: 'Chemistry', marks: 89 },
      ]),
      twelfthDocumentUrl: 'data:application/pdf;base64,JVBERi0xLjQKJcTl8uXpr/3/12thMarksheetAarav',
      tenthSchoolName: 'St. Joseph High School',
      tenthBoard: 'CBSE',
      tenthPassingYear: 2022,
      tenthPercentage: 93.2,
      tenthDocumentUrl: 'data:application/pdf;base64,JVBERi0xLjQKJcTl8uXpr/3/10thMarksheetAarav',
    },
    create: {
      studentProfileId: aaravProfile.id,
      studyCategory: 'UNDERGRADUATE_ENGINEERING',
      targetStream: 'Engineering',
      schoolName: 'Delhi Public School, R.K. Puram',
      board: 'CBSE',
      completionYear: 2024,
      percentage: 91.4,
      subjectDetails: JSON.stringify([
        { subject: 'Mathematics', marks: 95 },
        { subject: 'Physics', marks: 92 },
        { subject: 'Chemistry', marks: 89 },
      ]),
      twelfthDocumentUrl: 'data:application/pdf;base64,JVBERi0xLjQKJcTl8uXpr/3/12thMarksheetAarav',
      tenthSchoolName: 'St. Joseph High School',
      tenthBoard: 'CBSE',
      tenthPassingYear: 2022,
      tenthPercentage: 93.2,
      tenthDocumentUrl: 'data:application/pdf;base64,JVBERi0xLjQKJcTl8uXpr/3/10thMarksheetAarav',
    },
  });
  console.log(`[SEED] Student 3 ready: ${aaravProfile.fullName} (${aaravUser.email}) - PENDING VERIFICATION & UNASSIGNED`);

  console.log('\n[SEED COMPLETED SUCCESS]');
  console.log('- Total Students: 3');
  console.log('- Unassigned Queue: 1');
  console.log('- Verification Queue: 1 (Aarav Sharma - Submitted 10th & 12th documents)');
  console.log('- Active Counsellors: 1 (Dr. Sarah Jenkins)');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
