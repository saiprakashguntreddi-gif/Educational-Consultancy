import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';
import { prisma } from '../shared/database/prisma.service';

const friendDbPath = path.resolve(__dirname, '../../prisma/friend_dev.db');

async function main() {
  if (!fs.existsSync(friendDbPath)) {
    console.error(`❌ File not found: ${friendDbPath}`);
    console.error(`Please ask your friend for their 'dev.db' file, rename it to 'friend_dev.db', and place it in 'backend/prisma/'`);
    process.exit(1);
  }

  console.log(`[IMPORT] Found friend's database: ${friendDbPath}`);
  const sqlite = new sqlite3.Database(friendDbPath);

  const query = <T = any>(sql: string): Promise<T[]> => {
    return new Promise((resolve, reject) => {
      sqlite.all(sql, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows as T[]);
      });
    });
  };

  try {
    // 1. Migrate Users (Preserving original password hashes!)
    const users = await query('SELECT * FROM User');
    console.log(`\nFound ${users.length} users in friend's database.`);

    for (const u of users) {
      const existing = await prisma.user.findUnique({ where: { email: u.email } });
      if (existing) {
        // Update password hash to match friend's exact password hash
        await prisma.user.update({
          where: { email: u.email },
          data: {
            passwordHash: u.passwordHash,
            role: u.role,
            isActive: Boolean(u.isActive),
            isEmailVerified: Boolean(u.isEmailVerified),
          },
        });
        console.log(`[USER UPDATED] ${u.email} (Password hash synced)`);
      } else {
        await prisma.user.create({
          data: {
            id: u.id,
            email: u.email,
            passwordHash: u.passwordHash,
            role: u.role,
            isActive: Boolean(u.isActive),
            isEmailVerified: Boolean(u.isEmailVerified),
            createdAt: new Date(u.createdAt),
            updatedAt: new Date(u.updatedAt),
          },
        });
        console.log(`[USER CREATED] ${u.email}`);
      }
    }

    // Map Neon User IDs by email
    const allNeonUsers = await prisma.user.findMany();
    const neonUserIdByEmail = new Map<string, string>();
    for (const nu of allNeonUsers) {
      neonUserIdByEmail.set(nu.email, nu.id);
    }

    const sqliteUserEmailById = new Map<string, string>();
    for (const u of users) {
      sqliteUserEmailById.set(u.id, u.email);
    }

    // 2. Migrate Student Profiles
    let profiles: any[] = [];
    try {
      profiles = await query('SELECT * FROM StudentProfile');
    } catch {
      profiles = [];
    }

    const neonProfileIdBySqliteProfileId = new Map<string, string>();

    for (const p of profiles) {
      const email = sqliteUserEmailById.get(p.userId) || p.contactEmail;
      const neonUserId = neonUserIdByEmail.get(email);
      if (!neonUserId) continue;

      const existingProfile = await prisma.studentProfile.findUnique({
        where: { userId: neonUserId },
      });

      if (existingProfile) {
        await prisma.studentProfile.update({
          where: { userId: neonUserId },
          data: {
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
          },
        });
        neonProfileIdBySqliteProfileId.set(p.id, existingProfile.id);
        console.log(`[PROFILE UPDATED] ${p.fullName} (${email})`);
      } else {
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
        console.log(`[PROFILE CREATED] ${p.fullName} (${email})`);
      }
    }

    // 3. Migrate Education Records
    try {
      const educations = await query('SELECT * FROM StudentEducation');
      for (const edu of educations) {
        const neonProfileId = neonProfileIdBySqliteProfileId.get(edu.studentProfileId);
        if (!neonProfileId) continue;

        const existingEdu = await prisma.studentEducation.findUnique({
          where: { studentProfileId: neonProfileId },
        });

        if (!existingEdu) {
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
          console.log(`[EDUCATION MIGRATED] for profile ${neonProfileId}`);
        }
      }
    } catch {
      // Optional table
    }

    // 4. Migrate Preferences
    try {
      const preferences = await query('SELECT * FROM StudentPreference');
      for (const pref of preferences) {
        const neonProfileId = neonProfileIdBySqliteProfileId.get(pref.studentProfileId);
        if (!neonProfileId) continue;

        const existingPref = await prisma.studentPreference.findUnique({
          where: { studentProfileId: neonProfileId },
        });

        if (!existingPref) {
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
          console.log(`[PREFERENCES MIGRATED] for profile ${neonProfileId}`);
        }
      }
    } catch {
      // Optional table
    }

    console.log('\n🎉 [COMPLETE] All users, original passwords, and profiles imported into Neon successfully!');
  } finally {
    sqlite.close();
    await prisma.$disconnect();
    process.exit(0);
  }
}

main().catch((err) => {
  console.error('Migration error:', err);
  process.exit(1);
});
