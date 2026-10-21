import { prisma } from '../shared/database/prisma.service';
import { hashPassword } from '../shared/utils/password';
import { Role } from '../config/roles';

async function main() {
  const passwordHash = await hashPassword('StudentPassword123!');
  const email = 'student.demo@superconsciousness.com';

  const user = await prisma.user.upsert({
    where: { email },
    update: { isActive: true, isEmailVerified: true },
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
    update: {},
    create: {
      userId: user.id,
      fullName: 'Alex Morgan',
      gender: 'MALE',
      grade: '12',
      contactEmail: email,
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
    },
  });

  console.log(`Demo Student ready: ${user.email} (Profile: ${profile.fullName}, ID: ${profile.id})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
