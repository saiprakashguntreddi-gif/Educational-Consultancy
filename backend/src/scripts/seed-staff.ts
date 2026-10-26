import { prisma } from '../shared/database/prisma.service';
import { hashPassword } from '../shared/utils/password';
import { Role } from '../config/roles';

async function main() {
  const passwordHash = await hashPassword('StaffPassword123!');

  const adminConsultant = await prisma.user.upsert({
    where: { email: 'counsellor@superconsciousness.internal' },
    update: { role: Role.ADMIN },
    create: {
      email: 'counsellor@superconsciousness.internal',
      passwordHash,
      role: Role.ADMIN,
      isActive: true,
      isEmailVerified: true,
    },
  });
  console.log(`[SEED] Authorized Staff verified: ${adminConsultant.email} (Role: ${adminConsultant.role})`);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@superconsciousness.internal' },
    update: { passwordHash, role: Role.ADMIN },
    create: {
      email: 'admin@superconsciousness.internal',
      passwordHash,
      role: Role.ADMIN,
      isActive: true,
      isEmailVerified: true,
    },
  });
  console.log(`[SEED] Authorized Administrator verified: ${admin.email} (Role: ${admin.role})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
