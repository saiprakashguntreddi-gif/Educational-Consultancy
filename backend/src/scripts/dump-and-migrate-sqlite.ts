import sqlite3 from 'sqlite3';
import path from 'path';
import { prisma } from '../shared/database/prisma.service';

const dbPath = path.resolve(__dirname, '../../prisma/dev.db');
console.log('Connecting to local SQLite file:', dbPath);

const sqlite = new sqlite3.Database(dbPath);

function querySqlite<T = any>(sql: string): Promise<T[]> {
  return new Promise((resolve, reject) => {
    sqlite.all(sql, [], (err, rows) => {
      if (err) reject(err);
      else resolve(rows as T[]);
    });
  });
}

async function run() {
  const users = await querySqlite('SELECT * FROM User');
  console.log(`\nFound ${users.length} users in local SQLite dev.db`);

  // Map sqlite userId -> sqlite user email
  const userEmailById = new Map<string, string>();
  for (const u of users) {
    userEmailById.set(u.id, u.email);
  }

  // 1. Ensure all users exist in Neon
  for (const u of users) {
    const existingInNeon = await prisma.user.findUnique({
      where: { email: u.email },
    });

    if (!existingInNeon) {
      console.log(`[USER] Copying ${u.email} to Neon...`);
      await prisma.user.create({
        data: {
          email: u.email,
          passwordHash: u.passwordHash,
          role: u.role,
          isActive: Boolean(u.isActive),
          isEmailVerified: Boolean(u.isEmailVerified),
          createdAt: new Date(u.createdAt),
          updatedAt: new Date(u.updatedAt),
        },
      });
      console.log(`[USER OK] ${u.email}`);
    }
  }

  // 2. Fetch fresh users map from Neon by email
  const allNeonUsers = await prisma.user.findMany();
  const neonUserIdByEmail = new Map<string, string>();
  for (const u of allNeonUsers) {
    neonUserIdByEmail.set(u.email, u.id);
  }

  // 3. Migrate Student Profiles
  const profiles = await querySqlite('SELECT * FROM StudentProfile');
  console.log(`\nFound ${profiles.length} student profiles in local SQLite:`);

  // Map sqlite profileId -> Neon profileId
  const neonProfileIdBySqliteProfileId = new Map<string, string>();

  for (const p of profiles) {
    const email = userEmailById.get(p.userId);
    if (!email) continue;

    const neonUserId = neonUserIdByEmail.get(email);
    if (!neonUserId) continue;

    const existingProfile = await prisma.studentProfile.findUnique({
      where: { userId: neonUserId },
    });

    if (!existingProfile) {
      console.log(`[PROFILE] Creating profile for ${p.fullName} (${email})...`);
      const created = await prisma.studentProfile.create({
        data: {
          userId: neonUserId,
          fullName: p.fullName,
          gender: p.gender || 'OTHER',
          grade: p.grade || 'Grade 12',
          contactEmail: p.contactEmail || email,
          phone: p.phone || '',
          addressStreet: p.addressStreet || '',
          addressCity: p.addressCity || '',
          addressState: p.addressState || '',
          addressPostalCode: p.addressPostalCode || '',
          addressCountry: p.addressCountry || '',
          board: p.board || 'CBSE',
          citizenship: p.citizenship || 'India',
          passingOutYear: p.passingOutYear || 2026,
          verificationStatus: p.verificationStatus || 'PENDING',
          verifiedAt: p.verifiedAt ? new Date(p.verifiedAt) : null,
          verifiedBy: p.verifiedBy,
          verificationNotes: p.verificationNotes,
          isEnrolled: Boolean(p.isEnrolled),
          enrolledAt: p.enrolledAt ? new Date(p.enrolledAt) : null,
          policyAgreed: Boolean(p.policyAgreed),
          policyAgreedAt: p.policyAgreedAt ? new Date(p.policyAgreedAt) : null,
          createdAt: new Date(p.createdAt),
          updatedAt: new Date(p.updatedAt),
        },
      });
      neonProfileIdBySqliteProfileId.set(p.id, created.id);
      console.log(`[PROFILE OK] ${p.fullName}`);
    } else {
      neonProfileIdBySqliteProfileId.set(p.id, existingProfile.id);
      console.log(`[PROFILE EXISTS] ${p.fullName}`);
    }
  }

  // 4. Migrate Education Records
  const educations = await querySqlite('SELECT * FROM StudentEducation');
  for (const edu of educations) {
    const neonProfileId = neonProfileIdBySqliteProfileId.get(edu.studentProfileId);
    if (!neonProfileId) continue;

    const existingEdu = await prisma.studentEducation.findUnique({
      where: { studentProfileId: neonProfileId },
    });

    if (!existingEdu) {
      console.log(`[EDUCATION] Creating education for profile ${neonProfileId}...`);
      await prisma.studentEducation.create({
        data: {
          studentProfileId: neonProfileId,
          schoolName: edu.schoolName || '',
          board: edu.board || '',
          completionYear: edu.completionYear || 2024,
          percentage: edu.percentage || 0,
          subjectDetails: edu.subjectDetails || '',
          tenthSchoolName: edu.tenthSchoolName,
          tenthBoard: edu.tenthBoard,
          tenthPassingYear: edu.tenthPassingYear,
          tenthPercentage: edu.tenthPercentage,
          studyCategory: edu.studyCategory,
          targetStream: edu.targetStream,
          twelfthDocumentUrl: edu.twelfthDocumentUrl,
          tenthDocumentUrl: edu.tenthDocumentUrl,
          undergradDegree: edu.undergradDegree,
          undergradCollege: edu.undergradCollege,
          undergradPassingYear: edu.undergradPassingYear,
          undergradPercentage: edu.undergradPercentage,
          undergradDocumentUrl: edu.undergradDocumentUrl,
          createdAt: new Date(edu.createdAt),
          updatedAt: new Date(edu.updatedAt),
        },
      });
    }
  }

  // 5. Migrate Preferences
  const preferences = await querySqlite('SELECT * FROM StudentPreference');
  for (const pref of preferences) {
    const neonProfileId = neonProfileIdBySqliteProfileId.get(pref.studentProfileId);
    if (!neonProfileId) continue;

    const existingPref = await prisma.studentPreference.findUnique({
      where: { studentProfileId: neonProfileId },
    });

    if (!existingPref) {
      console.log(`[PREFERENCES] Creating preferences for profile ${neonProfileId}...`);
      await prisma.studentPreference.create({
        data: {
          studentProfileId: neonProfileId,
          countries: pref.countries || '[]',
          primaryCountry: pref.primaryCountry,
          department: pref.department || '',
          subDepartment: pref.subDepartment || '',
          createdAt: new Date(pref.createdAt),
          updatedAt: new Date(pref.updatedAt),
        },
      });
    }
  }

  console.log('\n✅ All SQLite users and data have been migrated to Neon PostgreSQL successfully!');
  sqlite.close();
  await prisma.$disconnect();
}

run().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
