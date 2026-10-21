export type CatalogueStatus = 'DRAFT' | 'REVIEW' | 'PUBLISHED' | 'ARCHIVED';

export interface InstitutionSummary {
  id: string;
  slug: string;
  name: string;
  country: string;
  city: string;
  state: string | null;
  institutionType: string | null;
  establishedYear: number | null;
  overview: string;
  rankingInfo: string | null;
  hasScholarships: boolean;
  minAnnualFee: number | null;
  maxAnnualFee: number | null;
  feeCurrency: string | null;
  officialWebsiteUrl: string;
  bannerImageUrl: string | null;
  logoUrl: string | null;
  status: CatalogueStatus;
  isPublished: boolean;
  isVerified: boolean;
  publishedAt: string | null;
  archivedAt: string | null;
  coursesCount: number;
  popularPrograms: string[];
  entranceExams: string[];
  isSaved?: boolean;
  isCompared?: boolean;
}

export interface CourseSummary {
  id: string;
  institutionId: string;
  institutionName?: string;
  institutionCountry?: string;
  institutionCity?: string;
  name: string;
  department: string;
  specialization: string | null;
  level: string;
  durationYears: number | null;
  durationText: string | null;
  description: string | null;
  eligibilityCriteria: string | null;
  annualTuitionFee: number | null;
  feeCurrency: string | null;
  feeRange: string | null;
  entranceExamsRequired: string[];
  scholarshipAvailable: boolean;
  scholarshipDetails: string | null;
  applicationDeadline: string | null;
  isPopular: boolean;
  status: CatalogueStatus;
  isPublished: boolean;
  isSaved?: boolean;
}

export interface InstitutionDetail extends InstitutionSummary {
  campusFacilities: string[];
  placementInfo: string | null;
  admissionDeadlines: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  address: string | null;
  scholarshipDetails: string | null;
  courses: CourseSummary[];
}

export interface DiscoveryFilterOptions {
  countries: string[];
  cities: string[];
  departments: string[];
  specializations: string[];
  levels: string[];
  entranceExams: string[];
  feeRange: {
    min: number;
    max: number;
    currency: string;
  };
}

export interface DiscoveryPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface InstitutionListResponse {
  data: InstitutionSummary[];
  pagination: DiscoveryPagination;
  filters: DiscoveryFilterOptions;
}

export interface AdminInstitutionListResponse {
  data: InstitutionSummary[];
  pagination: DiscoveryPagination;
  statusCounts: {
    total: number;
    draft: number;
    review: number;
    published: number;
    archived: number;
    verified: number;
  };
}

export interface SavedInstitutionsAndCoursesResponse {
  savedInstitutions: InstitutionSummary[];
  savedCourses: CourseSummary[];
}

export interface ComparisonResponse {
  institutions: InstitutionDetail[];
  dimensions: {
    key: string;
    label: string;
  }[];
}

export interface CollegeSearchParams {
  search?: string;
  country?: string;
  city?: string;
  department?: string;
  course?: string;
  specialization?: string;
  level?: string;
  minFee?: number | string;
  maxFee?: number | string;
  hasScholarship?: boolean | string;
  entranceExam?: string;
  page?: number;
  limit?: number;
  sortBy?: 'name_asc' | 'name_desc' | 'fee_asc' | 'fee_desc';
}

export interface AdminCollegeSearchParams {
  search?: string;
  status?: string;
  country?: string;
  city?: string;
  isVerified?: string;
  isPublished?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
}

export interface AdminCreateInstitutionInput {
  name: string;
  country: string;
  city: string;
  state?: string | null;
  institutionType?: string | null;
  establishedYear?: number | null;
  overview: string;
  rankingInfo?: string | null;
  campusFacilities?: string[];
  placementInfo?: string | null;
  admissionDeadlines?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  address?: string | null;
  officialWebsiteUrl: string;
  hasScholarships?: boolean;
  scholarshipDetails?: string | null;
  minAnnualFee?: number | null;
  maxAnnualFee?: number | null;
  feeCurrency?: string | null;
  status?: CatalogueStatus;
  isPublished?: boolean;
  isVerified?: boolean;
}

export interface AdminUpdateInstitutionInput extends Partial<AdminCreateInstitutionInput> {}

export interface AdminCreateCourseInput {
  name: string;
  department: string;
  specialization?: string | null;
  level?: string;
  durationYears?: number | null;
  durationText?: string | null;
  description?: string | null;
  eligibilityCriteria?: string | null;
  annualTuitionFee?: number | null;
  feeCurrency?: string | null;
  feeRange?: string | null;
  entranceExamsRequired?: string[];
  scholarshipAvailable?: boolean;
  scholarshipDetails?: string | null;
  applicationDeadline?: string | null;
  isPopular?: boolean;
  status?: CatalogueStatus;
  isPublished?: boolean;
}

export interface AdminUpdateCourseInput extends Partial<AdminCreateCourseInput> {}
