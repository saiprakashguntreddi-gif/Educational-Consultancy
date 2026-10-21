import { prisma } from '../../shared/database/prisma.service';
import { SavePreferencesDto } from './preferences.validation';
import { StudentPreferenceRecord, DepartmentPreferencePair } from './preferences.types';

export class PreferencesService {
  /**
   * Save or update preferences for the authenticated student
   * Module 2 requires student profile to exist (from Module 1)
   */
  public static async savePreferences(
    userId: string,
    dto: SavePreferencesDto
  ): Promise<StudentPreferenceRecord> {
    const profile = await prisma.studentProfile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new Error('Student profile intake (Module 1) must be submitted before setting preferences');
    }

    const countriesNotFinalized = Boolean(dto.countriesNotFinalized);
    const coursesNotFinalized = Boolean(dto.coursesNotFinalized);

    const countryList = countriesNotFinalized ? [] : (dto.countries || []);
    const primaryCountry = countriesNotFinalized
      ? null
      : dto.primaryCountry || (countryList.length > 0 ? countryList[0] : null);

    // Encode countries payload
    const countriesPayload = JSON.stringify({
      notFinalized: countriesNotFinalized,
      list: countryList,
    });

    // Prepare department preferences
    let pairs: DepartmentPreferencePair[] = [];
    if (!coursesNotFinalized) {
      if (dto.departmentPreferences && dto.departmentPreferences.length > 0) {
        pairs = dto.departmentPreferences.filter((p) => p.department && p.subDepartment);
      } else if (dto.department && dto.subDepartment) {
        pairs = [{ department: dto.department, subDepartment: dto.subDepartment }];
      }
    }

    const primaryDept = coursesNotFinalized
      ? 'Not finalized'
      : pairs.length > 0
      ? pairs[0].department
      : dto.department || 'Not finalized';

    // Summary representation for view mode: e.g. "Engineering & Technology (Computer/Software Engineering)"
    const summary = coursesNotFinalized
      ? 'Not finalized'
      : pairs.length > 0
      ? pairs.map((p) => `${p.department} (${p.subDepartment})`).join(' | ')
      : dto.subDepartment || 'Not finalized';

    const subDepartmentPayload = JSON.stringify({
      notFinalized: coursesNotFinalized,
      pairs,
      summary,
    });

    const preference = await prisma.studentPreference.upsert({
      where: { studentProfileId: profile.id },
      create: {
        studentProfileId: profile.id,
        countries: countriesPayload,
        primaryCountry,
        department: primaryDept,
        subDepartment: subDepartmentPayload,
      },
      update: {
        countries: countriesPayload,
        primaryCountry,
        department: primaryDept,
        subDepartment: subDepartmentPayload,
      },
    });

    // Record audit log for preference update
    await prisma.auditLog.create({
      data: {
        userId,
        action: 'PREFERENCES_SAVED',
        details: JSON.stringify({
          preferenceId: preference.id,
          studentProfileId: profile.id,
          countries: countryList,
          countriesNotFinalized,
          primaryCountry,
          department: primaryDept,
          departmentPreferences: pairs,
          coursesNotFinalized,
        }),
      },
    });

    return this.mapToRecord(preference);
  }

  /**
   * Get student preferences for the authenticated student by User ID
   */
  public static async getPreferencesByUserId(userId: string): Promise<StudentPreferenceRecord | null> {
    const profile = await prisma.studentProfile.findUnique({
      where: { userId },
    });

    if (!profile) return null;

    const preference = await prisma.studentPreference.findUnique({
      where: { studentProfileId: profile.id },
    });

    if (!preference) return null;
    return this.mapToRecord(preference);
  }

  /**
   * Get student preferences by Student Profile ID (for Counsellor / Admin review)
   */
  public static async getPreferencesByProfileId(
    studentProfileId: string
  ): Promise<StudentPreferenceRecord | null> {
    const preference = await prisma.studentPreference.findUnique({
      where: { studentProfileId },
    });

    if (!preference) return null;
    return this.mapToRecord(preference);
  }

  /**
   * Format raw Prisma record into StudentPreferenceRecord with backward compatibility
   */
  private static mapToRecord(raw: any): StudentPreferenceRecord {
    let parsedCountries: string[] = [];
    let countriesNotFinalized = false;

    try {
      if (typeof raw.countries === 'string') {
        const parsed = JSON.parse(raw.countries);
        if (Array.isArray(parsed)) {
          parsedCountries = parsed;
          countriesNotFinalized = parsed.length === 0 || (parsed.length === 1 && parsed[0] === 'Not finalized');
        } else if (parsed && typeof parsed === 'object') {
          parsedCountries = Array.isArray(parsed.list) ? parsed.list : [];
          countriesNotFinalized = Boolean(parsed.notFinalized);
        }
      } else if (Array.isArray(raw.countries)) {
        parsedCountries = raw.countries;
      }
    } catch {
      parsedCountries = [];
    }

    let departmentPreferences: DepartmentPreferencePair[] = [];
    let coursesNotFinalized = false;
    let displaySubDept = raw.subDepartment || '';

    try {
      if (typeof raw.subDepartment === 'string' && raw.subDepartment.startsWith('{')) {
        const parsed = JSON.parse(raw.subDepartment);
        coursesNotFinalized = Boolean(parsed.notFinalized);
        departmentPreferences = Array.isArray(parsed.pairs) ? parsed.pairs : [];
        displaySubDept = parsed.summary || (coursesNotFinalized ? 'Not finalized' : '');
      } else {
        coursesNotFinalized = raw.department === 'Not finalized' || raw.subDepartment === 'Not finalized';
        if (raw.department && raw.subDepartment && !coursesNotFinalized) {
          departmentPreferences = [{ department: raw.department, subDepartment: raw.subDepartment }];
          displaySubDept = `${raw.department} (${raw.subDepartment})`;
        }
      }
    } catch {
      departmentPreferences = [];
    }

    return {
      id: raw.id,
      studentProfileId: raw.studentProfileId,
      countries: parsedCountries,
      countriesNotFinalized,
      primaryCountry: raw.primaryCountry ?? null,
      department: raw.department,
      subDepartment: displaySubDept,
      coursesNotFinalized,
      departmentPreferences,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    };
  }
}
