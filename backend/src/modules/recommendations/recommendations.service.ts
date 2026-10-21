import { prisma } from '../../shared/database/prisma.service';
import {
  RecommendationBatchDto,
  RecommendationItemDto,
  RecommendationTier,
  RecommendationBatchStatus,
  EvidenceDetails,
  MyRecommendationsResponse,
  CounsellorReviewInput,
  TierOverrideInput,
  ManagedCollegeDto,
  ManagedCollegesResponse,
  AssignCollegeTierInput,
  CreateManagedCollegeInput,
  UpdateManagedCollegeInput,
} from './recommendations.types';

function notFound(message: string): never {
  const err: any = new Error(message);
  err.statusCode = 404;
  throw err;
}

function badRequest(message: string): never {
  const err: any = new Error(message);
  err.statusCode = 400;
  throw err;
}

function forbidden(message: string): never {
  const err: any = new Error(message);
  err.statusCode = 403;
  throw err;
}

export class RecommendationsService {
  /**
   * Helper: Map database RecommendationItem to DTO
   */
  private static mapItemToDto(item: any): RecommendationItemDto {
    let evidence: EvidenceDetails;
    try {
      evidence = typeof item.evidenceDetails === 'string'
        ? JSON.parse(item.evidenceDetails)
        : item.evidenceDetails;
    } catch {
      evidence = {
        academicComparison: {
          studentPercentage: 0,
          percentageMargin: 0,
          academicRating: 'COMPETITIVE_ALIGNMENT',
        },
        preferenceMatch: {
          isPrimaryDestinationMatch: false,
          destinationCountry: item.institution?.country || 'Unknown',
          matchedDepartment: 'General',
          matchedSpecializations: [],
          programsOfferedCount: 0,
        },
        entranceExamMatch: {
          requiredExams: [],
          studentExamsPlannedOrCleared: [],
          isExamRequirementFulfilled: true,
        },
        financialMatch: {
          hasScholarshipsAvailable: !!item.institution?.hasScholarships,
          affordabilityNote: 'Standard institutional tuition',
        },
        cohortContext: {
          studentPlotPoint: { gpaOrPercentage: 0 },
        },
      };
    }

    const effectiveTier = (item.counsellorTierOverride || item.tier) as RecommendationTier;

    return {
      id: item.id,
      batchId: item.batchId,
      institutionId: item.institutionId,
      institutionName: item.institution?.name || 'Institution',
      institutionSlug: item.institution?.slug || '',
      institutionCity: item.institution?.city || '',
      institutionCountry: item.institution?.country || '',
      institutionType: item.institution?.institutionType || null,
      rankingInfo: item.institution?.rankingInfo || null,
      logoUrl: item.institution?.logoUrl || null,
      bannerImageUrl: item.institution?.bannerImageUrl || null,
      officialWebsiteUrl: item.institution?.officialWebsiteUrl || '',

      courseId: item.courseId || null,
      courseName: item.course?.name || null,
      courseDepartment: item.course?.department || null,

      tier: item.tier as RecommendationTier,
      counsellorTierOverride: item.counsellorTierOverride as RecommendationTier | null,
      effectiveTier,
      fitScore: Math.round(item.fitScore),
      admissionProbabilityMin: Math.round(item.admissionProbabilityMin),
      admissionProbabilityMax: Math.round(item.admissionProbabilityMax),
      isDataIndicative: item.isDataIndicative,
      dataLimitationNote: item.dataLimitationNote || null,
      reasonSummary: item.reasonSummary,
      evidence,
      counsellorNotes: item.counsellorNotes || null,
      isShortlisted: !!item.isShortlisted,
      isAlternative: !!item.isAlternative,
      createdAt: item.createdAt ? item.createdAt.toISOString() : new Date().toISOString(),
    };
  }

  /**
   * Helper: Map batch to DTO with counts
   */
  private static mapBatchToDto(batch: any): RecommendationBatchDto {
    const allItems = (batch.items || []).map((i: any) => this.mapItemToDto(i));
    const mainItems = allItems.filter((i: RecommendationItemDto) => !i.isAlternative);
    const alternatives = allItems.filter((i: RecommendationItemDto) => i.isAlternative);

    const safeCount = mainItems.filter((i: RecommendationItemDto) => i.effectiveTier === 'SAFE').length;
    const bestFitCount = mainItems.filter((i: RecommendationItemDto) => i.effectiveTier === 'BEST_FIT').length;
    const aspirationalCount = mainItems.filter((i: RecommendationItemDto) => i.effectiveTier === 'ASPIRATIONAL').length;
    const shortlistedCount = allItems.filter((i: RecommendationItemDto) => i.isShortlisted).length;

    return {
      id: batch.id,
      studentProfileId: batch.studentProfileId,
      studentFullName: batch.studentProfile?.fullName || 'Student',
      status: batch.status as RecommendationBatchStatus,
      strategySummary: batch.strategySummary || 'Balanced three-tier application strategy',
      counsellorId: batch.counsellorId || null,
      counsellorNotes: batch.counsellorNotes || null,
      reviewedAt: batch.reviewedAt ? batch.reviewedAt.toISOString() : null,
      generatedAt: batch.generatedAt ? batch.generatedAt.toISOString() : batch.createdAt.toISOString(),
      updatedAt: batch.updatedAt ? batch.updatedAt.toISOString() : new Date().toISOString(),

      counts: {
        total: mainItems.length,
        safe: safeCount,
        bestFit: bestFitCount,
        aspirational: aspirationalCount,
        alternatives: alternatives.length,
        shortlisted: shortlistedCount,
      },

      items: mainItems,
      alternatives,
    };
  }

  /**
   * Helper: Safely normalize student preference data regardless of storage format.
   * Handles:
   * - JSON object: { notFinalized: boolean, list: string[] }
   * - JSON array string: "[\"United States\", \"Canada\"]"
   * - Raw array: ["United States", "Canada"]
   * - Comma-separated string: "United States, Canada"
   * - Plain string: "United States"
   * - Null / undefined / empty values
   * Also extracts clean department, subDepartment, and specializations without raw JSON leakage.
   */
  private static normalizeStudentPreferences(rawPreference: any): {
    preferredCountries: string[];
    primaryCountry: string | null;
    hasCountryPreference: boolean;
    preferredDept: string | null;
    preferredSubDept: string | null;
    targetSpecializations: string[];
    hasCoursePreference: boolean;
  } {
    let preferredCountries: string[] = [];
    let countriesNotFinalized = false;
    let primaryCountry: string | null = null;

    if (rawPreference) {
      // 1. Normalize Countries
      if (typeof rawPreference.countries === 'string') {
        const trimmed = rawPreference.countries.trim();
        if (trimmed) {
          try {
            const parsed = JSON.parse(trimmed);
            if (Array.isArray(parsed)) {
              preferredCountries = parsed.filter(
                (c): c is string => typeof c === 'string' && c.trim().length > 0 && c !== 'Not finalized'
              );
              countriesNotFinalized =
                parsed.length === 0 || (parsed.length === 1 && parsed[0] === 'Not finalized');
            } else if (parsed && typeof parsed === 'object') {
              countriesNotFinalized = Boolean(parsed.notFinalized);
              if (Array.isArray(parsed.list)) {
                preferredCountries = parsed.list.filter(
                  (c: any): c is string => typeof c === 'string' && c.trim().length > 0 && c !== 'Not finalized'
                );
              }
            } else if (typeof parsed === 'string' && parsed !== 'Not finalized') {
              preferredCountries = [parsed.trim()];
            }
          } catch {
            // Plain text or comma-separated
            if (trimmed.includes(',')) {
              preferredCountries = trimmed
                .split(',')
                .map((c: string) => c.trim())
                .filter((c: string) => c.length > 0 && c !== 'Not finalized');
            } else if (trimmed !== 'Not finalized') {
              preferredCountries = [trimmed];
            }
          }
        }
      } else if (Array.isArray(rawPreference.countries)) {
        preferredCountries = (rawPreference.countries as any[]).filter(
          (c: any): c is string => typeof c === 'string' && c.trim().length > 0 && c !== 'Not finalized'
        );
      } else if (rawPreference.countries && typeof rawPreference.countries === 'object') {
        countriesNotFinalized = Boolean(rawPreference.countries.notFinalized);
        if (Array.isArray(rawPreference.countries.list)) {
          preferredCountries = rawPreference.countries.list.filter(
            (c: any): c is string => typeof c === 'string' && c.trim().length > 0 && c !== 'Not finalized'
          );
        }
      }

      if (countriesNotFinalized) {
        preferredCountries = [];
      }

      // 2. Normalize Primary Country
      if (typeof rawPreference.primaryCountry === 'string') {
        const trimmedPrimary = rawPreference.primaryCountry.trim();
        if (trimmedPrimary && trimmedPrimary !== 'Not finalized' && !countriesNotFinalized) {
          primaryCountry = trimmedPrimary;
        }
      }

      if (primaryCountry) {
        const exists = preferredCountries.some(
          (c: string) => c.toLowerCase() === primaryCountry!.toLowerCase()
        );
        if (!exists) {
          preferredCountries.unshift(primaryCountry);
        }
      } else if (preferredCountries.length > 0) {
        primaryCountry = preferredCountries[0];
      }

      // 3. Normalize Department & SubDepartment
      let preferredDept: string | null = null;
      let preferredSubDept: string | null = null;
      const targetSpecializations: string[] = [];
      let coursesNotFinalized = false;

      if (typeof rawPreference.department === 'string') {
        const trimmedDept = rawPreference.department.trim();
        if (trimmedDept && trimmedDept !== 'Not finalized') {
          preferredDept = trimmedDept;
        } else {
          coursesNotFinalized = true;
        }
      }

      if (typeof rawPreference.subDepartment === 'string') {
        const trimmedSub = rawPreference.subDepartment.trim();
        if (trimmedSub) {
          try {
            const parsed = JSON.parse(trimmedSub);
            if (parsed && typeof parsed === 'object') {
              coursesNotFinalized = Boolean(parsed.notFinalized) || coursesNotFinalized;
              if (Array.isArray(parsed.pairs)) {
                for (const pair of parsed.pairs) {
                  if (pair.department && !preferredDept) {
                    preferredDept = pair.department;
                  }
                  if (pair.subDepartment && typeof pair.subDepartment === 'string') {
                    const subTrimmed = pair.subDepartment.trim();
                    if (!targetSpecializations.includes(subTrimmed)) {
                      targetSpecializations.push(subTrimmed);
                    }
                    if (!preferredSubDept) {
                      preferredSubDept = subTrimmed;
                    }
                  }
                }
              }
              if (!preferredSubDept && typeof parsed.summary === 'string' && parsed.summary !== 'Not finalized') {
                preferredSubDept = parsed.summary.trim();
              }
            } else if (typeof parsed === 'string' && parsed !== 'Not finalized') {
              preferredSubDept = parsed.trim();
              targetSpecializations.push(parsed.trim());
            }
          } catch {
            if (trimmedSub !== 'Not finalized') {
              preferredSubDept = trimmedSub;
              targetSpecializations.push(trimmedSub);
            }
          }
        }
      }

      if (coursesNotFinalized) {
        preferredDept = null;
        preferredSubDept = null;
        targetSpecializations.length = 0;
      }

      return {
        preferredCountries,
        primaryCountry,
        hasCountryPreference: preferredCountries.length > 0,
        preferredDept,
        preferredSubDept,
        targetSpecializations,
        hasCoursePreference: Boolean(preferredDept || preferredSubDept || targetSpecializations.length > 0),
      };
    }

    return {
      preferredCountries: [],
      primaryCountry: null,
      hasCountryPreference: false,
      preferredDept: null,
      preferredSubDept: null,
      targetSpecializations: [],
      hasCoursePreference: false,
    };
  }

  /**
   * Get authenticated student's active recommendations.
   * Enforces that the profile must be verified.
   */
  public static async getMyRecommendations(userId: string): Promise<MyRecommendationsResponse> {
    const profile = await prisma.studentProfile.findUnique({
      where: { userId },
      include: { preference: true, education: true },
    });

    if (!profile) {
      notFound('Student profile not found. Please complete profile intake first.');
    }

    // Require verified profile
    if (profile.verificationStatus !== 'VERIFIED') {
      return {
        isVerified: false,
        verificationStatus: profile.verificationStatus,
        message:
          'Profile verification required. A certified counsellor must verify your academic profile before generating official application recommendations.',
        batch: null,
      };
    }

    // Find latest batch
    let batch = await prisma.recommendationBatch.findFirst({
      where: { studentProfileId: profile.id },
      orderBy: { generatedAt: 'desc' },
      include: {
        studentProfile: true,
        items: {
          include: {
            institution: true,
            course: true,
          },
          orderBy: [{ isAlternative: 'asc' }, { fitScore: 'desc' }],
        },
      },
    });

    // If verified student has no batch yet, generate the initial balanced batch automatically
    if (!batch) {
      const generated = await this.generateRecommendations(userId, profile.id);
      return {
        isVerified: true,
        verificationStatus: 'VERIFIED',
        batch: generated,
      };
    }

    return {
      isVerified: true,
      verificationStatus: 'VERIFIED',
      batch: this.mapBatchToDto(batch),
    };
  }

  /**
   * Core Recommendation Engine Algorithm:
   * Generates or regenerates a balanced three-tier recommendation batch.
   */
  public static async generateRecommendations(
    requestingUserId: string,
    targetStudentProfileId?: string,
    isTriggeredByStaff = false
  ): Promise<RecommendationBatchDto> {
    // 1. Identify student profile
    let profile: any;
    if (targetStudentProfileId) {
      profile = await prisma.studentProfile.findUnique({
        where: { id: targetStudentProfileId },
        include: {
          preference: true,
          education: true,
          examPlans: { include: { exam: true } },
          activities: true,
          achievements: true,
          savedInstitutions: true,
        },
      });
    } else {
      profile = await prisma.studentProfile.findUnique({
        where: { userId: requestingUserId },
        include: {
          preference: true,
          education: true,
          examPlans: { include: { exam: true } },
          activities: true,
          achievements: true,
          savedInstitutions: true,
        },
      });
    }

    if (!profile) {
      notFound('Student profile not found.');
    }

    // 2. Strict Verification Gate
    if (profile.verificationStatus !== 'VERIFIED') {
      badRequest(
        'Profile verification required. A counsellor must verify this student record before generating official application recommendations.'
      );
    }

    // 3. Extract Student Attributes
    const studentPercentage = profile.education?.percentage || 75.0;
    const studentBoard = profile.education?.board || profile.board || 'CBSE';

    // Normalize student preferences safely
    const normalizedPrefs = this.normalizeStudentPreferences(profile.preference);
    const {
      preferredCountries,
      primaryCountry,
      hasCountryPreference,
      preferredDept,
      preferredSubDept,
      targetSpecializations,
      hasCoursePreference,
    } = normalizedPrefs;

    // Student exam codes & scores
    const studentExamCodes = (profile.examPlans || []).map((ep: any) => ep.exam?.code || '');
    let studentSatScore = 0;
    for (const plan of profile.examPlans || []) {
      if (plan.exam?.code === 'SAT' && plan.currentScore) {
        const parsed = parseInt(plan.currentScore, 10);
        if (!isNaN(parsed)) studentSatScore = parsed;
      }
    }

    // Saved institution IDs to mark existing shortlist state
    const savedInstitutionIds = new Set(
      (profile.savedInstitutions || []).map((s: any) => s.institutionId)
    );

    // 4. Query Published College Catalogue
    const institutions = await prisma.institution.findMany({
      where: {
        isPublished: true,
        status: 'PUBLISHED',
        isActive: true,
      },
      include: {
        courses: {
          where: {
            isPublished: true,
            status: 'PUBLISHED',
            isActive: true,
          },
        },
      },
    });

    if (institutions.length === 0) {
      badRequest(
        'No published colleges are available in the catalogue. An administrator must publish institutions first.'
      );
    }

    // 5. Evaluate and Score Each Institution
    interface EvaluatedCandidate {
      institution: any;
      targetCourse: any | null;
      tier: RecommendationTier;
      fitScore: number;
      admissionProbabilityMin: number;
      admissionProbabilityMax: number;
      isDataIndicative: boolean;
      dataLimitationNote: string | null;
      reasonSummary: string;
      evidence: EvidenceDetails;
    }

    const evaluatedCandidates: EvaluatedCandidate[] = [];

    for (const inst of institutions) {
      // Find matching course programs
      let matchingDeptCourses: any[] = [];
      if (preferredDept) {
        matchingDeptCourses = inst.courses.filter(
          (c: any) => c.department && c.department.toLowerCase() === preferredDept.toLowerCase()
        );
      } else {
        matchingDeptCourses = inst.courses;
      }

      let matchingSubDeptCourses: any[] = [];
      if (targetSpecializations.length > 0) {
        matchingSubDeptCourses = matchingDeptCourses.filter((c: any) => {
          if (!c.specialization) return false;
          const cSpec = c.specialization.toLowerCase();
          return targetSpecializations.some(
            (ts) => cSpec.includes(ts.toLowerCase()) || ts.toLowerCase().includes(cSpec)
          );
        });
      } else if (preferredSubDept) {
        matchingSubDeptCourses = matchingDeptCourses.filter(
          (c: any) =>
            c.specialization &&
            c.specialization.toLowerCase().includes(preferredSubDept.toLowerCase())
        );
      }
      const targetCourse = matchingSubDeptCourses[0] || matchingDeptCourses[0] || inst.courses[0] || null;

      // --- Alignment Scoring (0 - 100) ---
      let fitScore = 40; // baseline

      // A. Destination Match (up to 25 pts)
      let destScore = 0;
      const isPrimaryDest = !!(
        primaryCountry && inst.country.toLowerCase() === primaryCountry.toLowerCase()
      );
      const isSecondaryDest = preferredCountries.some(
        (c: string) => c.toLowerCase() === inst.country.toLowerCase()
      );

      if (hasCountryPreference) {
        if (isPrimaryDest) destScore = 25;
        else if (isSecondaryDest) destScore = 18;
        else destScore = 5;
      } else {
        // Country preference not specified or not finalized: neutral baseline
        destScore = 15;
      }
      fitScore += destScore;

      // B. Department & Course Match (up to 25 pts)
      let courseMatchScore = 0;
      if (hasCoursePreference) {
        if (matchingSubDeptCourses.length > 0) courseMatchScore = 25;
        else if (matchingDeptCourses.length > 0) courseMatchScore = 18;
        else courseMatchScore = 5;
      } else {
        // Course preference not finalized: neutral baseline
        courseMatchScore = 15;
      }
      fitScore += courseMatchScore;

      // C. Selectivity & Acceptance Rate Evaluation
      const hasOfficialCohort = !!(inst.acceptanceRate !== null && inst.acceptanceRate !== undefined);
      const acceptanceRate = inst.acceptanceRate !== null && inst.acceptanceRate !== undefined
        ? inst.acceptanceRate
        : (inst.rankingInfo && inst.rankingInfo.includes('Rank #') && parseInt(inst.rankingInfo.split('#')[1]) <= 20)
        ? 0.08
        : (inst.rankingInfo && inst.rankingInfo.includes('Rank #') && parseInt(inst.rankingInfo.split('#')[1]) <= 100)
        ? 0.22
        : 0.58;

      const benchmarkMinPercentage = inst.minPercentageRequirement !== null && inst.minPercentageRequirement !== undefined
        ? inst.minPercentageRequirement
        : (acceptanceRate <= 0.10)
        ? 88.0
        : (acceptanceRate <= 0.30)
        ? 78.0
        : 65.0;

      const percentageMargin = studentPercentage - benchmarkMinPercentage;

      // D. Entrance Exam Check (up to 15 pts)
      let requiredExams: string[] = [];
      try {
        if (targetCourse?.entranceExamsRequired) {
          requiredExams = JSON.parse(targetCourse.entranceExamsRequired);
        }
      } catch {
        requiredExams = [];
      }
      const isExamFulfilled = requiredExams.length === 0 || requiredExams.some((re) => studentExamCodes.includes(re));
      if (isExamFulfilled) fitScore += 15;
      else fitScore += 5;

      // E. Financial Alignment (up to 10 pts)
      if (inst.hasScholarships || (targetCourse && targetCourse.scholarshipAvailable)) {
        fitScore += 10;
      } else {
        fitScore += 5;
      }

      // Academic Margin contribution (up to 15 pts)
      if (percentageMargin >= 10) fitScore += 15;
      else if (percentageMargin >= 0) fitScore += 10;
      else if (percentageMargin >= -5) fitScore += 5;

      fitScore = Math.min(99, Math.max(35, fitScore));

      // --- THREE-TIER CLASSIFICATION ---
      let tier: RecommendationTier;
      let probMin: number;
      let probMax: number;
      let reason: string;
      let academicRating: 'COMFORTABLE_SURPASS' | 'COMPETITIVE_ALIGNMENT' | 'REACH_TARGET';

      // Check if Admin has defined a managed tier for this college in College Tier Management
      if (inst.managedTier) {
        tier = inst.managedTier as RecommendationTier;
        if (tier === 'SAFE') {
          probMin = 95;
          probMax = 99;
          academicRating = percentageMargin >= 0 ? 'COMFORTABLE_SURPASS' : 'COMPETITIVE_ALIGNMENT';
          reason = inst.tierReason
            ? `Admin assigned Safe tier (>95% likelihood). ${inst.tierReason}`
            : `Classified as Safe (>95% admission likelihood) based on institutional benchmarks and managed catalogue criteria.`;
        } else if (tier === 'ASPIRATIONAL') {
          probMin = Math.max(10, Math.round(acceptanceRate * 100));
          probMax = 49;
          academicRating = 'REACH_TARGET';
          reason = inst.tierReason
            ? `Admin assigned Aspirational tier (<50% reach target). ${inst.tierReason}`
            : `Classified as an ambitious Aspirational reach target (<50% admission likelihood) based on institutional selectivity.`;
        } else {
          // BEST_FIT
          probMin = 50;
          probMax = 94;
          academicRating = 'COMPETITIVE_ALIGNMENT';
          reason = inst.tierReason
            ? `Admin assigned Best-Fit tier (50%–94% match). ${inst.tierReason}`
            : `Classified as a balanced Best-Fit competitive match (50%–94% admission chance) aligned with your target profile.`;
        }
      }
      // Rule: Highly selective colleges (acceptance rate <= 15%) or large negative margin are ASPIRATIONAL
      else if (acceptanceRate <= 0.15 || percentageMargin < -3) {
        tier = 'ASPIRATIONAL';
        probMin = Math.max(10, Math.round(acceptanceRate * 100));
        probMax = 49;
        academicRating = 'REACH_TARGET';
        reason = `Highly selective global institution (${Math.round(acceptanceRate * 100)}% admission rate). An ambitious aspirational target that elevates your overall portfolio strategy.`;
      }
      // Rule: If credentials comfortably surpass benchmark (+8% or more) and institution has reasonable acceptance rate (>35%) -> SAFE
      else if (percentageMargin >= 8 && acceptanceRate >= 0.35) {
        tier = 'SAFE';
        probMin = 95;
        probMax = 99;
        academicRating = 'COMFORTABLE_SURPASS';
        reason = `Your academic aggregate (${studentPercentage}%) comfortably exceeds the target admission threshold (${benchmarkMinPercentage}%) by ${percentageMargin > 0 ? '+' : ''}${percentageMargin.toFixed(1)}%. High admission likelihood (>95%).`;
      }
      // Otherwise -> BEST_FIT (50% to 94%)
      else {
        tier = 'BEST_FIT';
        probMin = 50;
        probMax = 94;
        academicRating = 'COMPETITIVE_ALIGNMENT';
        reason = `Your credentials directly align with the median admitted cohort profile (${benchmarkMinPercentage}% benchmark). Balanced competitive match for your target specialization.`;
      }

      // Evidence breakdown
      const evidence: EvidenceDetails = {
        academicComparison: {
          studentPercentage,
          studentBoard,
          institutionBenchmarkMin: benchmarkMinPercentage,
          institutionBenchmarkAvg: benchmarkMinPercentage + 5,
          acceptanceRate: Math.round(acceptanceRate * 100) / 100,
          percentageMargin: parseFloat(percentageMargin.toFixed(1)),
          academicRating,
        },
        preferenceMatch: {
          isPrimaryDestinationMatch: isPrimaryDest,
          destinationCountry: inst.country,
          matchedDepartment: preferredDept || 'General Studies / All Disciplines',
          matchedSpecializations: matchingSubDeptCourses.map((c: any) => c.specialization || c.name),
          programsOfferedCount: matchingDeptCourses.length,
          countryPreferenceNote: !hasCountryPreference
            ? 'Destination country preference was not specified or finalized; institution evaluated across global catalogue.'
            : undefined,
        },
        entranceExamMatch: {
          requiredExams,
          studentExamsPlannedOrCleared: studentExamCodes.filter((c: string) => requiredExams.includes(c)),
          isExamRequirementFulfilled: isExamFulfilled,
          scoreComparisonNote: studentSatScore > 0 ? `SAT score: ${studentSatScore}` : undefined,
        },
        financialMatch: {
          annualTuitionFeeMin: inst.minAnnualFee || targetCourse?.annualTuitionFee || undefined,
          annualTuitionFeeMax: inst.maxAnnualFee || targetCourse?.annualTuitionFee || undefined,
          feeCurrency: inst.feeCurrency || targetCourse?.feeCurrency || 'USD',
          hasScholarshipsAvailable: !!(inst.hasScholarships || targetCourse?.scholarshipAvailable),
          affordabilityNote: inst.hasScholarships
            ? 'Merit and department scholarships available for qualifying candidates.'
            : 'Standard published tuition fee tier.',
        },
        cohortContext: {
          percentile25thGpa: parseFloat((benchmarkMinPercentage - 2).toFixed(1)),
          percentile50thGpa: parseFloat((benchmarkMinPercentage + 3).toFixed(1)),
          percentile75thGpa: parseFloat((benchmarkMinPercentage + 8).toFixed(1)),
          percentile25thSat: 1280,
          percentile75thSat: 1510,
          studentPlotPoint: {
            gpaOrPercentage: studentPercentage,
            standardizedScore: studentSatScore > 0 ? studentSatScore : undefined,
          },
          totalCohortSampleSize: hasOfficialCohort ? 'Official cohort data' : 'Estimated from published eligibility criteria',
        },
      };

      evaluatedCandidates.push({
        institution: inst,
        targetCourse,
        tier,
        fitScore,
        admissionProbabilityMin: probMin,
        admissionProbabilityMax: probMax,
        isDataIndicative: !hasOfficialCohort || !hasCountryPreference,
        dataLimitationNote: !hasOfficialCohort && !hasCountryPreference
          ? 'Historical admission statistics are indicative estimates based on published academic eligibility, and country preferences are unfinalized.'
          : !hasOfficialCohort
          ? 'Historical admission statistics are indicative estimates based on published academic eligibility and institutional selectivity.'
          : !hasCountryPreference
          ? 'Country preferences are unfinalized; recommendations evaluate academic eligibility across global catalogue.'
          : null,
        reasonSummary: reason,
        evidence,
      });
    }

    // 6. Assemble Balanced Application Strategy
    // Strategy goal: 2 Safe, 3-4 Best-Fit, 2 Aspirational
    const safeCandidates = evaluatedCandidates.filter((c) => c.tier === 'SAFE').sort((a, b) => b.fitScore - a.fitScore);
    const bestFitCandidates = evaluatedCandidates.filter((c) => c.tier === 'BEST_FIT').sort((a, b) => b.fitScore - a.fitScore);
    const aspirationalCandidates = evaluatedCandidates.filter((c) => c.tier === 'ASPIRATIONAL').sort((a, b) => b.fitScore - a.fitScore);

    const selectedSafe = safeCandidates.slice(0, 2);
    const alternativeSafe = safeCandidates.slice(2);

    const selectedBestFit = bestFitCandidates.slice(0, 4);
    const alternativeBestFit = bestFitCandidates.slice(4);

    const selectedAspirational = aspirationalCandidates.slice(0, 2);
    const alternativeAspirational = aspirationalCandidates.slice(2);

    // Primary balanced list
    const primarySelections = [...selectedSafe, ...selectedBestFit, ...selectedAspirational];

    // Alternative colleges recommendations
    const alternativeSelections = [...alternativeSafe, ...alternativeBestFit, ...alternativeAspirational].slice(0, 4);

    if (primarySelections.length === 0 && evaluatedCandidates.length > 0) {
      primarySelections.push(...evaluatedCandidates.slice(0, 3));
    }

    const countriesLabel = preferredCountries.length > 0
      ? preferredCountries.slice(0, 2).join(' & ')
      : 'global study destinations (unspecified)';
    const deptLabel = preferredDept || 'various disciplines';

    const strategySummary = `Balanced Application Portfolio: ${selectedSafe.length} Safe (>95%), ${selectedBestFit.length} Best-Fit (50-94%), and ${selectedAspirational.length} Aspirational (<50%) aligned with ${deptLabel} in ${countriesLabel}.`;

    // 7. Persist to Database (Transaction)
    const oldBatches = await prisma.recommendationBatch.findMany({
      where: { studentProfileId: profile.id },
      select: { id: true },
    });
    if (oldBatches.length > 0) {
      await prisma.recommendationBatch.deleteMany({
        where: { studentProfileId: profile.id },
      });
    }

    const createdBatch = await prisma.recommendationBatch.create({
      data: {
        studentProfileId: profile.id,
        status: isTriggeredByStaff ? 'UNDER_REVIEW' : 'GENERATED',
        strategySummary,
        counsellorId: isTriggeredByStaff ? requestingUserId : null,
      },
    });

    // Insert items
    for (const item of primarySelections) {
      await prisma.recommendationItem.create({
        data: {
          batchId: createdBatch.id,
          institutionId: item.institution.id,
          courseId: item.targetCourse?.id || null,
          tier: item.tier,
          fitScore: item.fitScore,
          admissionProbabilityMin: item.admissionProbabilityMin,
          admissionProbabilityMax: item.admissionProbabilityMax,
          isDataIndicative: item.isDataIndicative,
          dataLimitationNote: item.dataLimitationNote,
          reasonSummary: item.reasonSummary,
          evidenceDetails: JSON.stringify(item.evidence),
          isShortlisted: savedInstitutionIds.has(item.institution.id),
          isAlternative: false,
        },
      });
    }

    for (const item of alternativeSelections) {
      await prisma.recommendationItem.create({
        data: {
          batchId: createdBatch.id,
          institutionId: item.institution.id,
          courseId: item.targetCourse?.id || null,
          tier: item.tier,
          fitScore: item.fitScore,
          admissionProbabilityMin: item.admissionProbabilityMin,
          admissionProbabilityMax: item.admissionProbabilityMax,
          isDataIndicative: item.isDataIndicative,
          dataLimitationNote: item.dataLimitationNote,
          reasonSummary: item.reasonSummary,
          evidenceDetails: JSON.stringify(item.evidence),
          isShortlisted: savedInstitutionIds.has(item.institution.id),
          isAlternative: true,
        },
      });
    }

    // 8. Audit Log Entry
    await prisma.auditLog.create({
      data: {
        userId: requestingUserId,
        action: 'RECOMMENDATIONS_GENERATED',
        details: JSON.stringify({
          batchId: createdBatch.id,
          studentProfileId: profile.id,
          primaryCount: primarySelections.length,
          alternativeCount: alternativeSelections.length,
          safeCount: selectedSafe.length,
          bestFitCount: selectedBestFit.length,
          aspirationalCount: selectedAspirational.length,
        }),
      },
    });

    // 9. Fetch and Return complete Batch
    const fullBatch = await prisma.recommendationBatch.findUnique({
      where: { id: createdBatch.id },
      include: {
        studentProfile: true,
        items: {
          include: {
            institution: true,
            course: true,
          },
          orderBy: [{ isAlternative: 'asc' }, { fitScore: 'desc' }],
        },
      },
    });

    return this.mapBatchToDto(fullBatch);
  }

  /**
   * Counsellor / Admin: Fetch recommendation batch for a specific student profile
   */
  public static async getStudentRecommendationsForStaff(
    studentProfileId: string
  ): Promise<RecommendationBatchDto | null> {
    const profile = await prisma.studentProfile.findUnique({
      where: { id: studentProfileId },
    });
    if (!profile) {
      notFound('Student profile not found.');
    }

    const batch = await prisma.recommendationBatch.findFirst({
      where: { studentProfileId },
      orderBy: { generatedAt: 'desc' },
      include: {
        studentProfile: true,
        items: {
          include: {
            institution: true,
            course: true,
          },
          orderBy: [{ isAlternative: 'asc' }, { fitScore: 'desc' }],
        },
      },
    });

    if (!batch) {
      return null;
    }

    return this.mapBatchToDto(batch);
  }

  /**
   * Counsellor Review: Update batch status, advisory notes, and approval
   */
  public static async reviewBatchByCounsellor(
    batchId: string,
    counsellorUserId: string,
    input: CounsellorReviewInput
  ): Promise<RecommendationBatchDto> {
    const batch = await prisma.recommendationBatch.findUnique({
      where: { id: batchId },
    });
    if (!batch) {
      notFound('Recommendation batch not found.');
    }

    const updated = await prisma.recommendationBatch.update({
      where: { id: batchId },
      data: {
        status: input.status,
        counsellorNotes: input.counsellorNotes || batch.counsellorNotes,
        counsellorId: counsellorUserId,
        reviewedAt: new Date(),
      },
      include: {
        studentProfile: true,
        items: {
          include: {
            institution: true,
            course: true,
          },
          orderBy: [{ isAlternative: 'asc' }, { fitScore: 'desc' }],
        },
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: counsellorUserId,
        action: 'RECOMMENDATIONS_REVIEWED',
        details: JSON.stringify({
          batchId,
          newStatus: input.status,
          hasNotes: !!input.counsellorNotes,
        }),
      },
    });

    return this.mapBatchToDto(updated);
  }

  /**
   * Counsellor Override: Adjust tier assignment for an individual recommendation
   */
  public static async overrideItemTierByCounsellor(
    itemId: string,
    counsellorUserId: string,
    input: TierOverrideInput
  ): Promise<RecommendationItemDto> {
    const item = await prisma.recommendationItem.findUnique({
      where: { id: itemId },
      include: { batch: true, institution: true, course: true },
    });
    if (!item) {
      notFound('Recommendation item not found.');
    }

    // Update probabilities according to overridden tier
    let probMin = item.admissionProbabilityMin;
    let probMax = item.admissionProbabilityMax;
    if (input.tier === 'SAFE') {
      probMin = 95;
      probMax = 99;
    } else if (input.tier === 'BEST_FIT') {
      probMin = 50;
      probMax = 94;
    } else if (input.tier === 'ASPIRATIONAL') {
      probMin = 15;
      probMax = 49;
    }

    const updated = await prisma.recommendationItem.update({
      where: { id: itemId },
      data: {
        counsellorTierOverride: input.tier,
        counsellorNotes: input.notes || item.counsellorNotes,
        admissionProbabilityMin: probMin,
        admissionProbabilityMax: probMax,
      },
      include: { institution: true, course: true },
    });

    await prisma.auditLog.create({
      data: {
        userId: counsellorUserId,
        action: 'RECOMMENDATION_TIER_OVERRIDDEN',
        details: JSON.stringify({
          itemId,
          originalTier: item.tier,
          overriddenTier: input.tier,
          counsellorNotes: input.notes,
        }),
      },
    });

    return this.mapItemToDto(updated);
  }

  /**
   * Student Shortlist Toggle: Add or remove recommended college from student shortlist
   */
  public static async toggleShortlist(
    itemId: string,
    studentUserId: string
  ): Promise<{ isShortlisted: boolean; message: string }> {
    const profile = await prisma.studentProfile.findUnique({
      where: { userId: studentUserId },
    });
    if (!profile) {
      notFound('Student profile not found.');
    }

    const item = await prisma.recommendationItem.findUnique({
      where: { id: itemId },
      include: { batch: true },
    });

    if (!item) {
      notFound('Recommendation item not found.');
    }

    // Enforce student ownership barrier
    if (item.batch.studentProfileId !== profile.id) {
      forbidden('You can only shortlist recommendations from your own profile.');
    }

    const newShortlistState = !item.isShortlisted;

    await prisma.recommendationItem.update({
      where: { id: itemId },
      data: { isShortlisted: newShortlistState },
    });

    // Synchronize with Module 6 StudentSavedInstitution
    if (newShortlistState) {
      await prisma.studentSavedInstitution.upsert({
        where: {
          studentProfileId_institutionId: {
            studentProfileId: profile.id,
            institutionId: item.institutionId,
          },
        },
        update: {},
        create: {
          studentProfileId: profile.id,
          institutionId: item.institutionId,
          notes: `Added from Three-Tier Recommendation Engine (${item.counsellorTierOverride || item.tier})`,
        },
      });
    } else {
      await prisma.studentSavedInstitution.deleteMany({
        where: {
          studentProfileId: profile.id,
          institutionId: item.institutionId,
        },
      });
    }

    return {
      isShortlisted: newShortlistState,
      message: newShortlistState
        ? 'College added to your application shortlist.'
        : 'College removed from your application shortlist.',
    };
  }

  /**
   * Cohort Scatter Plot Analytics:
   * Returns benchmark distribution and student position
   */
  public static async getCohortAnalytics(institutionId: string, studentUserId?: string) {
    const institution = await prisma.institution.findUnique({
      where: { id: institutionId },
    });
    if (!institution) {
      notFound('Institution not found.');
    }

    let studentPlotPoint = { gpaOrPercentage: 80, standardizedScore: 1350 };
    if (studentUserId) {
      const profile = await prisma.studentProfile.findUnique({
        where: { userId: studentUserId },
        include: { education: true, examPlans: { include: { exam: true } } },
      });
      if (profile?.education?.percentage) {
        studentPlotPoint.gpaOrPercentage = profile.education.percentage;
      }
      for (const p of profile?.examPlans || []) {
        if (p.exam?.code === 'SAT' && p.currentScore) {
          const parsed = parseInt(p.currentScore, 10);
          if (!isNaN(parsed)) studentPlotPoint.standardizedScore = parsed;
        }
      }
    }

    const benchmarkMin = institution.minPercentageRequirement || 75.0;

    return {
      institutionId: institution.id,
      institutionName: institution.name,
      acceptanceRate: institution.acceptanceRate || 0.45,
      isOfficialCohort: !!institution.acceptanceRate,
      limitationNote: !institution.acceptanceRate
        ? 'Historical admission statistics are indicative estimates based on published academic eligibility and institutional selectivity.'
        : null,
      benchmarks: {
        percentile25thPercentage: Math.max(60, benchmarkMin - 3),
        percentile50thPercentage: benchmarkMin + 2,
        percentile75thPercentage: Math.min(99, benchmarkMin + 7),
        percentile25thSat: 1250,
        percentile50thSat: 1380,
        percentile75thSat: 1490,
      },
      studentPlotPoint,
    };
  }

  // ========================================================
  // COLLEGE TIER MANAGEMENT (ADMIN PORTAL)
  // ========================================================

  /**
   * Admin: List managed colleges with tier filter, search, courses, and tier counts
   */
  public static async adminListManagedColleges(params: {
    search?: string;
    tier?: string;
    isActive?: string;
    page?: number;
    limit?: number;
  }): Promise<ManagedCollegesResponse> {
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(100, Math.max(1, params.limit || 20));
    const skip = (page - 1) * limit;

    const where: any = {};

    if (params.search) {
      const q = params.search.trim();
      where.OR = [
        { name: { contains: q } },
        { country: { contains: q } },
        { city: { contains: q } },
      ];
    }

    if (params.tier && params.tier !== 'ALL') {
      if (params.tier === 'UNASSIGNED') {
        where.managedTier = null;
      } else {
        where.managedTier = params.tier;
      }
    }

    if (params.isActive !== undefined && params.isActive !== '') {
      where.isActive = params.isActive === 'true';
    }

    const [total, institutions, totalCount, safeCount, bestFitCount, aspirationalCount, unassignedCount] =
      await Promise.all([
        prisma.institution.count({ where }),
        prisma.institution.findMany({
          where,
          include: {
            courses: {
              select: {
                id: true,
                name: true,
                department: true,
                level: true,
                annualTuitionFee: true,
                feeCurrency: true,
              },
            },
          },
          orderBy: [{ managedTier: 'asc' }, { name: 'asc' }],
          skip,
          take: limit,
        }),
        prisma.institution.count(),
        prisma.institution.count({ where: { managedTier: 'SAFE' } }),
        prisma.institution.count({ where: { managedTier: 'BEST_FIT' } }),
        prisma.institution.count({ where: { managedTier: 'ASPIRATIONAL' } }),
        prisma.institution.count({ where: { managedTier: null } }),
      ]);

    const data: ManagedCollegeDto[] = institutions.map((inst: any) => ({
      id: inst.id,
      slug: inst.slug,
      name: inst.name,
      country: inst.country,
      city: inst.city,
      state: inst.state,
      institutionType: inst.institutionType,
      overview: inst.overview,
      officialWebsiteUrl: inst.officialWebsiteUrl,
      rankingInfo: inst.rankingInfo,
      isActive: inst.isActive,
      isPublished: inst.isPublished,
      managedTier: inst.managedTier as RecommendationTier | null,
      tierReason: inst.tierReason,
      tierAssignedAt: inst.tierAssignedAt ? inst.tierAssignedAt.toISOString() : null,
      tierAssignedBy: inst.tierAssignedBy,
      acceptanceRate: inst.acceptanceRate,
      minPercentageRequirement: inst.minPercentageRequirement,
      avgSatRequirement: inst.avgSatRequirement,
      coursesCount: inst.courses.length,
      courses: inst.courses,
      createdAt: inst.createdAt.toISOString(),
      updatedAt: inst.updatedAt.toISOString(),
    }));

    return {
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
      tierCounts: {
        total: totalCount,
        safe: safeCount,
        bestFit: bestFitCount,
        aspirational: aspirationalCount,
        unassigned: unassignedCount,
      },
    };
  }

  /**
   * Admin: Assign or change initial/managed tier for a college in the catalogue
   */
  public static async adminAssignCollegeTier(
    institutionId: string,
    adminUserId: string,
    input: AssignCollegeTierInput
  ): Promise<ManagedCollegeDto> {
    const institution = await prisma.institution.findUnique({
      where: { id: institutionId },
      include: {
        courses: {
          select: {
            id: true,
            name: true,
            department: true,
            level: true,
            annualTuitionFee: true,
            feeCurrency: true,
          },
        },
      },
    });

    if (!institution) {
      notFound('College not found in catalogue.');
    }

    if (!input.reason || !input.reason.trim()) {
      badRequest('A reason is strictly required when modifying or assigning a college tier.');
    }

    const previousTier = institution.managedTier;

    const updated = await prisma.institution.update({
      where: { id: institutionId },
      data: {
        managedTier: input.tier,
        tierReason: input.reason.trim(),
        tierAssignedAt: new Date(),
        tierAssignedBy: adminUserId,
      },
      include: {
        courses: {
          select: {
            id: true,
            name: true,
            department: true,
            level: true,
            annualTuitionFee: true,
            feeCurrency: true,
          },
        },
      },
    });

    // Record audit log
    await prisma.auditLog.create({
      data: {
        userId: adminUserId,
        action: 'COLLEGE_TIER_CHANGED',
        details: JSON.stringify({
          institutionId: updated.id,
          institutionName: updated.name,
          previousTier,
          newTier: input.tier,
          reason: input.reason.trim(),
          timestamp: new Date().toISOString(),
        }),
      },
    });

    return {
      id: updated.id,
      slug: updated.slug,
      name: updated.name,
      country: updated.country,
      city: updated.city,
      state: updated.state,
      institutionType: updated.institutionType,
      overview: updated.overview,
      officialWebsiteUrl: updated.officialWebsiteUrl,
      rankingInfo: updated.rankingInfo,
      isActive: updated.isActive,
      isPublished: updated.isPublished,
      managedTier: updated.managedTier as RecommendationTier | null,
      tierReason: updated.tierReason,
      tierAssignedAt: updated.tierAssignedAt ? updated.tierAssignedAt.toISOString() : null,
      tierAssignedBy: updated.tierAssignedBy,
      acceptanceRate: updated.acceptanceRate,
      minPercentageRequirement: updated.minPercentageRequirement,
      avgSatRequirement: updated.avgSatRequirement,
      coursesCount: updated.courses.length,
      courses: updated.courses,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    };
  }

  /**
   * Admin: Activate or deactivate a college in the managed catalogue
   */
  public static async adminToggleCollegeStatus(
    institutionId: string,
    adminUserId: string,
    isActive: boolean
  ): Promise<ManagedCollegeDto> {
    const institution = await prisma.institution.findUnique({
      where: { id: institutionId },
      include: {
        courses: {
          select: {
            id: true,
            name: true,
            department: true,
            level: true,
            annualTuitionFee: true,
            feeCurrency: true,
          },
        },
      },
    });

    if (!institution) {
      notFound('College not found in catalogue.');
    }

    const previousState = institution.isActive;

    const updated = await prisma.institution.update({
      where: { id: institutionId },
      data: { isActive },
      include: {
        courses: {
          select: {
            id: true,
            name: true,
            department: true,
            level: true,
            annualTuitionFee: true,
            feeCurrency: true,
          },
        },
      },
    });

    // Record audit log
    await prisma.auditLog.create({
      data: {
        userId: adminUserId,
        action: 'COLLEGE_STATUS_TOGGLED',
        details: JSON.stringify({
          institutionId: updated.id,
          institutionName: updated.name,
          previousState,
          newState: isActive,
          timestamp: new Date().toISOString(),
        }),
      },
    });

    return {
      id: updated.id,
      slug: updated.slug,
      name: updated.name,
      country: updated.country,
      city: updated.city,
      state: updated.state,
      institutionType: updated.institutionType,
      overview: updated.overview,
      officialWebsiteUrl: updated.officialWebsiteUrl,
      rankingInfo: updated.rankingInfo,
      isActive: updated.isActive,
      isPublished: updated.isPublished,
      managedTier: updated.managedTier as RecommendationTier | null,
      tierReason: updated.tierReason,
      tierAssignedAt: updated.tierAssignedAt ? updated.tierAssignedAt.toISOString() : null,
      tierAssignedBy: updated.tierAssignedBy,
      acceptanceRate: updated.acceptanceRate,
      minPercentageRequirement: updated.minPercentageRequirement,
      avgSatRequirement: updated.avgSatRequirement,
      coursesCount: updated.courses.length,
      courses: updated.courses,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    };
  }

  /**
   * Admin: Add a college to the catalogue with an assigned initial tier
   */
  public static async adminCreateManagedCollege(
    adminUserId: string,
    input: CreateManagedCollegeInput
  ): Promise<ManagedCollegeDto> {
    const slugBase = input.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    const slug = `${slugBase}-${Date.now().toString().slice(-6)}`;

    const created = await prisma.institution.create({
      data: {
        name: input.name.trim(),
        slug,
        country: input.country.trim(),
        city: input.city.trim(),
        state: input.state?.trim() || null,
        institutionType: input.institutionType?.trim() || 'University',
        overview: input.overview.trim(),
        officialWebsiteUrl: input.officialWebsiteUrl.trim(),
        status: 'PUBLISHED',
        isPublished: true,
        isVerified: true,
        publishedBy: adminUserId,
        verifiedBy: adminUserId,
        publishedAt: new Date(),
        verifiedAt: new Date(),
        isActive: true,
        managedTier: input.initialTier,
        tierReason: input.reason?.trim() || 'Initial college tier assignment by Administrator.',
        tierAssignedAt: new Date(),
        tierAssignedBy: adminUserId,
        minPercentageRequirement: input.minPercentageRequirement ?? null,
        acceptanceRate: input.acceptanceRate ?? null,
        avgSatRequirement: input.avgSatRequirement ?? null,
        rankingInfo: input.rankingInfo?.trim() || null,
      },
      include: {
        courses: {
          select: {
            id: true,
            name: true,
            department: true,
            level: true,
            annualTuitionFee: true,
            feeCurrency: true,
          },
        },
      },
    });

    // Record audit log
    await prisma.auditLog.create({
      data: {
        userId: adminUserId,
        action: 'MANAGED_COLLEGE_ADDED',
        details: JSON.stringify({
          institutionId: created.id,
          institutionName: created.name,
          country: created.country,
          initialTier: input.initialTier,
          reason: input.reason,
          timestamp: new Date().toISOString(),
        }),
      },
    });

    return {
      id: created.id,
      slug: created.slug,
      name: created.name,
      country: created.country,
      city: created.city,
      state: created.state,
      institutionType: created.institutionType,
      overview: created.overview,
      officialWebsiteUrl: created.officialWebsiteUrl,
      rankingInfo: created.rankingInfo,
      isActive: created.isActive,
      isPublished: created.isPublished,
      managedTier: created.managedTier as RecommendationTier | null,
      tierReason: created.tierReason,
      tierAssignedAt: created.tierAssignedAt ? created.tierAssignedAt.toISOString() : null,
      tierAssignedBy: created.tierAssignedBy,
      acceptanceRate: created.acceptanceRate,
      minPercentageRequirement: created.minPercentageRequirement,
      avgSatRequirement: created.avgSatRequirement,
      coursesCount: 0,
      courses: [],
      createdAt: created.createdAt.toISOString(),
      updatedAt: created.updatedAt.toISOString(),
    };
  }

  /**
   * Admin: Update college details & benchmarks
   */
  public static async adminUpdateManagedCollege(
    institutionId: string,
    adminUserId: string,
    input: UpdateManagedCollegeInput
  ): Promise<ManagedCollegeDto> {
    const institution = await prisma.institution.findUnique({
      where: { id: institutionId },
    });
    if (!institution) {
      notFound('College not found in catalogue.');
    }

    const previousTier = institution.managedTier;
    const tierChanged = input.managedTier && input.managedTier !== previousTier;

    const data: any = {};
    if (input.name !== undefined) data.name = input.name.trim();
    if (input.country !== undefined) data.country = input.country.trim();
    if (input.city !== undefined) data.city = input.city.trim();
    if (input.state !== undefined) data.state = input.state?.trim() || null;
    if (input.institutionType !== undefined) data.institutionType = input.institutionType?.trim() || null;
    if (input.overview !== undefined) data.overview = input.overview.trim();
    if (input.officialWebsiteUrl !== undefined) data.officialWebsiteUrl = input.officialWebsiteUrl.trim();
    if (input.rankingInfo !== undefined) data.rankingInfo = input.rankingInfo?.trim() || null;
    if (input.acceptanceRate !== undefined) data.acceptanceRate = input.acceptanceRate;
    if (input.minPercentageRequirement !== undefined) data.minPercentageRequirement = input.minPercentageRequirement;
    if (input.avgSatRequirement !== undefined) data.avgSatRequirement = input.avgSatRequirement;
    if (input.isActive !== undefined) data.isActive = input.isActive;

    if (input.managedTier) {
      data.managedTier = input.managedTier;
      if (input.tierReason) data.tierReason = input.tierReason.trim();
      data.tierAssignedAt = new Date();
      data.tierAssignedBy = adminUserId;
    }

    const updated = await prisma.institution.update({
      where: { id: institutionId },
      data,
      include: {
        courses: {
          select: {
            id: true,
            name: true,
            department: true,
            level: true,
            annualTuitionFee: true,
            feeCurrency: true,
          },
        },
      },
    });

    if (tierChanged) {
      await prisma.auditLog.create({
        data: {
          userId: adminUserId,
          action: 'COLLEGE_TIER_CHANGED',
          details: JSON.stringify({
            institutionId: updated.id,
            institutionName: updated.name,
            previousTier,
            newTier: input.managedTier,
            reason: input.tierReason,
            timestamp: new Date().toISOString(),
          }),
        },
      });
    }

    return {
      id: updated.id,
      slug: updated.slug,
      name: updated.name,
      country: updated.country,
      city: updated.city,
      state: updated.state,
      institutionType: updated.institutionType,
      overview: updated.overview,
      officialWebsiteUrl: updated.officialWebsiteUrl,
      rankingInfo: updated.rankingInfo,
      isActive: updated.isActive,
      isPublished: updated.isPublished,
      managedTier: updated.managedTier as RecommendationTier | null,
      tierReason: updated.tierReason,
      tierAssignedAt: updated.tierAssignedAt ? updated.tierAssignedAt.toISOString() : null,
      tierAssignedBy: updated.tierAssignedBy,
      acceptanceRate: updated.acceptanceRate,
      minPercentageRequirement: updated.minPercentageRequirement,
      avgSatRequirement: updated.avgSatRequirement,
      coursesCount: updated.courses.length,
      courses: updated.courses,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    };
  }
}
