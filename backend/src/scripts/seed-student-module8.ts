import { prisma } from '../shared/database/prisma.service';
import { hashPassword } from '../shared/utils/password';
import { Role } from '../config/roles';

async function seedModule8Student() {
  const passwordHash = await hashPassword('StudentPassword123!');
  const email = 'student.module8@example.com';

  const user = await prisma.user.upsert({
    where: { email },
    update: { passwordHash, isActive: true, isEmailVerified: true },
    create: {
      email,
      passwordHash,
      role: Role.STUDENT,
      isActive: true,
      isEmailVerified: true,
    },
  });

  const profile = await prisma.studentProfile.upsert({
    where: { userId: user.id },
    update: { verificationStatus: 'VERIFIED' },
    create: {
      userId: user.id,
      fullName: 'Maya Sharma',
      gender: 'FEMALE',
      grade: 'Grade 12',
      contactEmail: email,
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

  // Ensure preference is linked
  await prisma.studentPreference.upsert({
    where: { studentProfileId: profile.id },
    update: {},
    create: {
      studentProfileId: profile.id,
      countries: JSON.stringify(['United States', 'United Kingdom', 'Canada', 'Germany']),
      primaryCountry: 'United States',
      department: 'Computer Science & Engineering',
      subDepartment: 'Artificial Intelligence & Machine Learning',
    },
  });

  console.log(`[SEED] student.module8@example.com created and verified! (User ID: ${user.id})`);
}

seedModule8Student()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
