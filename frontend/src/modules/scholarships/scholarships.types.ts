export type EligibilityStatus = 'ELIGIBLE' | 'POTENTIALLY_ELIGIBLE' | 'NOT_ELIGIBLE';

export type CriterionStatus = 'MET' | 'NOT_MET' | 'NEEDS_REVIEW' | 'NOT_APPLICABLE';

export interface EligibilityCriterionCheck {
  criterion: string;
  status: CriterionStatus;
  label: string;
  detail: string;
  studentValue?: string | number | null;
  requiredValue?: string | number | null;
}

export interface ScholarshipInstitution {
  id: string;
  name: string;
  country: string;
}

export interface ScholarshipDto {
  id: string;
  slug: string;
  name: string;
  provider: string;
  country: string;
  destinationCountry?: string | null;
  institutionId?: string | null;
  institution?: ScholarshipInstitution | null;
  department?: string | null;
  specialization?: string | null;
  studyLevel?: string | null;
  awardAmount?: number | null;
  awardCurrency?: string | null;
  awardType?: string | null;
  awardDetails: string;
  eligibilityDescription: string;
  minPercentageRequirement?: number | null;
  eligibleBoards?: string[] | null;
  requiredCitizenship?: string | null;
  genderRequirement?: string | null;
  incomeCeiling?: number | null;
  incomeCurrency?: string | null;
  requiredExams?: string[] | null;
  applicationDeadline?: string | null;
  applicationUrl: string;
  sourceInfo?: string | null;
  isActive: boolean;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  isSaved?: boolean;
  eligibility?: {
    status: EligibilityStatus;
    summary: string;
    checks: EligibilityCriterionCheck[];
  };
}

export interface StudentProfileContext {
  isVerified: boolean;
  verificationStatus: string;
  studentName: string;
  percentage: number | null;
  board: string | null;
  primaryCountry: string | null;
  department: string | null;
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
  studentProfileContext?: StudentProfileContext;
}

export interface ScholarshipQueryFilters {
  search?: string;
  country?: string;
  department?: string;
  eligibilityStatus?: 'ALL' | 'ELIGIBLE' | 'POTENTIALLY_ELIGIBLE' | 'NOT_ELIGIBLE' | 'SAVED';
  page?: number;
  limit?: number;
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

export interface UpdateScholarshipInput extends Partial<CreateScholarshipInput> {}
