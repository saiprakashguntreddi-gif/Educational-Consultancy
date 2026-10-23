export type EligibilityStatus = 'ELIGIBLE' | 'POTENTIALLY_ELIGIBLE' | 'NOT_ELIGIBLE';

export type CriterionStatus = 'MET' | 'NOT_MET' | 'NEEDS_REVIEW';

export interface EligibilityCriterionCheck {
  criterion: 'academic' | 'board' | 'destination' | 'department' | 'citizenship' | 'gender' | 'financial' | 'entranceExam' | 'studyLevel';
  status: CriterionStatus;
  label: string;
  detail: string;
  requiredValue?: string | number | null;
  studentValue?: string | number | null;
}

export interface ScholarshipDto {
  id: string;
  slug: string;
  name: string;
  provider: string;
  country: string;
  destinationCountry: string | null;
  institutionId: string | null;
  institutionName: string | null;
  department: string | null;
  specialization: string | null;
  studyLevel: string | null;
  awardAmount: number | null;
  awardCurrency: string | null;
  awardType: string | null;
  awardDetails: string;
  eligibilityDescription: string;
  minPercentageRequirement: number | null;
  eligibleBoards: string[] | null;
  requiredCitizenship: string | null;
  genderRequirement: string | null;
  incomeCeiling: number | null;
  incomeCurrency: string | null;
  requiredExams: string[] | null;
  applicationDeadline: string | null;
  applicationUrl: string;
  sourceInfo: string | null;
  isActive: boolean;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;

  // Student Evaluation Context (when evaluated for a student)
  eligibilityStatus?: EligibilityStatus;
  eligibilitySummary?: string;
  criteriaChecks?: EligibilityCriterionCheck[];
  eligibility?: {
    status: EligibilityStatus;
    summary: string;
    checks: EligibilityCriterionCheck[];
  };
  isSaved?: boolean;
}

export interface ScholarshipListResponse {
  scholarships: ScholarshipDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  counts: {
    all: number;
    eligible: number;
    potentiallyEligible: number;
    notEligible: number;
    saved: number;
  };
  studentProfileContext?: {
    isVerified: boolean;
    verificationStatus: string;
    studentName: string;
    percentage: number | null;
    board: string | null;
    primaryCountry: string | null;
    department: string | null;
  };
}

export interface CreateScholarshipInput {
  name: string;
  provider: string;
  country: string;
  destinationCountry?: string;
  institutionId?: string;
  department?: string;
  specialization?: string;
  studyLevel?: string;
  awardAmount?: number;
  awardCurrency?: string;
  awardType?: string;
  awardDetails: string;
  eligibilityDescription: string;
  minPercentageRequirement?: number;
  eligibleBoards?: string[];
  requiredCitizenship?: string;
  genderRequirement?: string;
  incomeCeiling?: number;
  incomeCurrency?: string;
  requiredExams?: string[];
  applicationDeadline?: string;
  applicationUrl: string;
  sourceInfo?: string;
  isActive?: boolean;
  isPublished?: boolean;
}

export interface UpdateScholarshipInput {
  name?: string;
  provider?: string;
  country?: string;
  destinationCountry?: string | null;
  institutionId?: string | null;
  department?: string | null;
  specialization?: string | null;
  studyLevel?: string | null;
  awardAmount?: number | null;
  awardCurrency?: string | null;
  awardType?: string | null;
  awardDetails?: string;
  eligibilityDescription?: string;
  minPercentageRequirement?: number | null;
  eligibleBoards?: string[] | null;
  requiredCitizenship?: string | null;
  genderRequirement?: string | null;
  incomeCeiling?: number | null;
  incomeCurrency?: string | null;
  requiredExams?: string[] | null;
  applicationDeadline?: string | null;
  applicationUrl?: string;
  sourceInfo?: string | null;
  isActive?: boolean;
  isPublished?: boolean;
}
