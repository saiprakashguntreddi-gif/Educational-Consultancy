import { prisma } from '../shared/database/prisma.service';

async function main() {
  const users = await prisma.user.findMany({
    include: {
      studentProfile: true,
      counsellorProfile: true,
    },
  });
  console.log('CURRENT USERS IN DATABASE:');
  console.log(JSON.stringify(users.map(u => ({
    id: u.id,
    email: u.email,
    role: u.role,
    name: u.studentProfile?.fullName || u.counsellorProfile?.fullName || 'N/A',
  })), null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
