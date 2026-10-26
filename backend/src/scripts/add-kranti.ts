import { prisma } from '../shared/database/prisma.service';
import { hashPassword } from '../shared/utils/password';
import { Role } from '../config/roles';

async function main() {
  const email = 'krantishantveer@gmail.com';
  const fullName = 'Kranti Shantveer';
  const passwordHash = await hashPassword('StudentPassword123!');

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
    update: {
      fullName,
      contactEmail: email,
    },
    create: {
      userId: user.id,
      fullName,
      gender: 'MALE',
      grade: 'Grade 12',
      contactEmail: email,
      phone: '+91 9876543210',
      addressStreet: '123 Main Street',
      addressCity: 'Bangalore',
      addressState: 'Karnataka',
      addressPostalCode: '560001',
      addressCountry: 'India',
      board: 'CBSE',
      citizenship: 'India',
      passingOutYear: 2026,
      verificationStatus: 'PENDING',
    },
  });

  console.log(`✅ Successfully added ${fullName} (${email}) to Neon database with profile ID ${profile.id}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
