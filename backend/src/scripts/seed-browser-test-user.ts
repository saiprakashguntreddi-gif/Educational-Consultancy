import { prisma } from '../shared/database/prisma.service';
import { hashPassword } from '../shared/utils/password';
import { Role } from '../config/roles';

async function main() {
  const passwordHash = await hashPassword('StudentPassword123!');
  const user = await prisma.user.upsert({
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

  const profile = await prisma.studentProfile.upsert({
    where: { userId: user.id },
    update: { fullName: 'Aarav Sharma', verificationStatus: 'VERIFIED' },
    create: {
      userId: user.id,
      fullName: 'Aarav Sharma',
      gender: 'MALE',
      grade: 'Grade 12',
      contactEmail: 'student.module8@example.com',
      phone: '+91 9876543210',
      addressStreet: '12 Connaught Place',
      addressCity: 'New Delhi',
      addressState: 'Delhi',
      addressPostalCode: '110001',
      addressCountry: 'India',
      board: 'CBSE',
      citizenship: 'Indian',
      passingOutYear: 2026,
      verificationStatus: 'VERIFIED',
    },
  });

  await prisma.studentEducation.upsert({
    where: { studentProfileId: profile.id },
    update: { percentage: 91.5, board: 'CBSE' },
    create: {
      studentProfileId: profile.id,
      schoolName: 'Delhi Public School',
      board: 'CBSE',
      completionYear: 2026,
      percentage: 91.5,
      subjectDetails: JSON.stringify([{ subject: 'Mathematics', score: 95 }]),
    },
  });

  await prisma.studentPreference.upsert({
    where: { studentProfileId: profile.id },
    update: { primaryCountry: 'United Kingdom', department: 'Computer Science' },
    create: {
      studentProfileId: profile.id,
      countries: JSON.stringify(['United Kingdom']),
      primaryCountry: 'United Kingdom',
      department: 'Computer Science',
      subDepartment: 'Software Engineering',
    },
  });

  console.log('✓ Successfully prepared test student: student.module8@example.com');
}

main().catch(console.error).finally(() => prisma.$disconnect());
