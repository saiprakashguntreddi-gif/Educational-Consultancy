export type RecommendationTier = 'SAFE' | 'BEST_FIT' | 'ASPIRATIONAL';

export type RecommendationBatchStatus =
  | 'GENERATED'
  | 'UNDER_REVIEW'
  | 'COUNSELLOR_APPROVED'
  | 'FINALIZED';

export interface AcademicEvidence {
  studentPercentage: number;
  studentBoard?: string;
  institutionBenchmarkMin?: number;
  institutionBenchmarkAvg?: number;
  acceptanceRate?: number;
  percentageMargin: number; // positive = exceeds cutoff, negative = below
  academicRating: 'COMFORTABLE_SURPASS' | 'COMPETITIVE_ALIGNMENT' | 'REACH_TARGET';
}

export interface PreferenceEvidence {
  isPrimaryDestinationMatch: boolean;
  destinationCountry: string;
  matchedDepartment: string;
  matchedSpecializations: string[];
  programsOfferedCount: number;
  countryPreferenceNote?: string;
}

export interface EntranceExamEvidence {
  requiredExams: string[];
  studentExamsPlannedOrCleared: string[];
  isExamRequirementFulfilled: boolean;
  scoreComparisonNote?: string;
}

export interface FinancialEvidence {
  annualTuitionFeeMin?: number;
  annualTuitionFeeMax?: number;
  feeCurrency?: string;
  hasScholarshipsAvailable: boolean;
  affordabilityNote: string;
}

export interface CohortContext {
  percentile25thGpa?: number;
  percentile50thGpa?: number;
  percentile75thGpa?: number;
  percentile25thSat?: number;
  percentile75thSat?: number;
  studentPlotPoint: {
    gpaOrPercentage: number;
    standardizedScore?: number;
  };
  totalCohortSampleSize?: string;
}

export interface EvidenceDetails {
  academicComparison: AcademicEvidence;
  preferenceMatch: PreferenceEvidence;
  entranceExamMatch: EntranceExamEvidence;
  financialMatch: FinancialEvidence;
  cohortContext: CohortContext;
}

export interface RecommendationItemDto {
  id: string;
  batchId: string;
  institutionId: string;
  institutionName: string;
  institutionSlug: string;
  institutionCity: string;
  institutionCountry: string;
  institutionType?: string | null;
  rankingInfo?: string | null;
  logoUrl?: string | null;
  bannerImageUrl?: string | null;
  officialWebsiteUrl?: string;

  courseId?: string | null;
  courseName?: string | null;
  courseDepartment?: string | null;

  tier: RecommendationTier;
  counsellorTierOverride?: RecommendationTier | null;
  effectiveTier: RecommendationTier; // override if present, else tier
  fitScore: number;
  admissionProbabilityMin: number;
  admissionProbabilityMax: number;
  isDataIndicative: boolean;
  dataLimitationNote?: string | null;
  reasonSummary: string;
  evidence: EvidenceDetails;
  counsellorNotes?: string | null;
  isShortlisted: boolean;
  isAlternative: boolean;
  createdAt: string;
}

export interface RecommendationBatchDto {
  id: string;
  studentProfileId: string;
  studentFullName: string;
  status: RecommendationBatchStatus;
  strategySummary: string;
  counsellorId?: string | null;
  counsellorNotes?: string | null;
  reviewedAt?: string | null;
  generatedAt: string;
  updatedAt: string;

  // Breakdown counts
  counts: {
    total: number;
    safe: number;
    bestFit: number;
    aspirational: number;
    alternatives: number;
    shortlisted: number;
  };

  items: RecommendationItemDto[];
  alternatives: RecommendationItemDto[];
}

export interface MyRecommendationsResponse {
  isVerified: boolean;
  verificationStatus: string;
  message?: string;
  batch: RecommendationBatchDto | null;
}

export interface CounsellorReviewInput {
  status: RecommendationBatchStatus;
  counsellorNotes?: string;
}

export interface TierOverrideInput {
  tier: RecommendationTier;
  notes?: string;
}

export interface ManagedCollegeDto {
  id: string;
  slug: string;
  name: string;
  country: string;
  city: string;
  state?: string | null;
  institutionType?: string | null;
  overview: string;
  officialWebsiteUrl: string;
  rankingInfo?: string | null;
  isActive: boolean;
  isPublished: boolean;
  managedTier: RecommendationTier | null;
  tierReason?: string | null;
  tierAssignedAt?: string | null;
  tierAssignedBy?: string | null;
  acceptanceRate?: number | null;
  minPercentageRequirement?: number | null;
  avgSatRequirement?: number | null;
  coursesCount: number;
  courses: Array<{
    id: string;
    name: string;
    department: string;
    level: string;
    annualTuitionFee?: number | null;
    feeCurrency?: string | null;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface ManagedCollegesResponse {
  data: ManagedCollegeDto[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  tierCounts: {
    total: number;
    safe: number;
    bestFit: number;
    aspirational: number;
    unassigned: number;
  };
}

export interface AssignCollegeTierInput {
  tier: RecommendationTier;
  reason: string;
}

export interface CreateManagedCollegeInput {
  name: string;
  country: string;
  city: string;
  state?: string;
  institutionType?: string;
  overview: string;
  officialWebsiteUrl: string;
  initialTier: RecommendationTier;
  reason?: string;
  minPercentageRequirement?: number;
  acceptanceRate?: number;
  avgSatRequirement?: number;
  rankingInfo?: string;
}

export interface UpdateManagedCollegeInput {
  name?: string;
  country?: string;
  city?: string;
  state?: string;
  institutionType?: string;
  overview?: string;
  officialWebsiteUrl?: string;
  managedTier?: RecommendationTier;
  tierReason?: string;
  minPercentageRequirement?: number | null;
  acceptanceRate?: number | null;
  avgSatRequirement?: number | null;
  rankingInfo?: string | null;
  isActive?: boolean;
}
