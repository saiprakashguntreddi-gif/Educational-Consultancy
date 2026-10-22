export type AssessmentPathwayCode =
  | 'LEARNING_STYLE'
  | 'POST_10TH_STREAM'
  | 'CAREER_PERSONALITY'
  | 'MULTIPLE_INTELLIGENCES'
  | 'ENGINEERING_BRANCH'
  | 'MANAGEMENT_COMMERCE'
  | 'HUMANITIES_LAW_POLICY'
  | 'COGNITIVE_PROBLEM_SOLVING';

export interface DimensionMeta {
  code: string;
  label: string;
  description: string;
}

export interface PathwayItem {
  code: AssessmentPathwayCode;
  title: string;
  tagline: string;
  version: string;
  estimatedMinutes: number;
  totalQuestions: number;
  dimensions: DimensionMeta[];
  status: 'AVAILABLE' | 'IN_PROGRESS' | 'COMPLETED';
  activeAttemptId?: string;
  currentQuestionIndex: number;
  answeredCount: number;
  latestReportId?: string;
  completedAt?: string;
}

export interface AssessmentQuestionOption {
  id: string;
  label: string;
  value: string;
}

export interface AssessmentQuestion {
  id: string;
  orderIndex: number;
  prompt: string;
  subtext?: string;
  categoryOrSection: string;
  controlType: 'SINGLE_CHOICE' | 'LIKERT_5' | 'SCENARIO_OPTION';
  options: AssessmentQuestionOption[];
}

export interface PathwayDetailResponse {
  code: AssessmentPathwayCode;
  title: string;
  tagline: string;
  version: string;
  estimatedMinutes: number;
  totalQuestions: number;
  dimensions: DimensionMeta[];
  instructions: string[];
  limitationsDisclaimer: string;
  questions: AssessmentQuestion[];
}

export interface StudentAssessmentAttempt {
  id: string;
  studentProfileId: string;
  pathwayCode: AssessmentPathwayCode;
  assessmentVersion: string;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED';
  currentQuestionIndex: number;
  answers: Record<string, string>;
  timeSpentSeconds: number;
  startedAt: string;
  lastSavedAt: string;
  completedAt?: string;
}

export interface DimensionScore {
  dimensionCode: string;
  label: string;
  rawScore: number;
  maxScore: number;
  percentage: number;
  band: 'HIGH' | 'MODERATE' | 'DEVELOPING';
  summary: string;
}

export interface CareerSuggestion {
  title: string;
  industry: string;
  fitLevel: 'EXCELLENT' | 'STRONG' | 'EXPLORATORY';
  description: string;
  typicalDegrees: string[];
}

export interface CounsellorActionPlan {
  counsellorId: string;
  counsellorName: string;
  reviewedAt: string;
  discussionPoints: string[];
  actionMilestones: {
    id: string;
    title: string;
    targetDeadline?: string;
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  }[];
  summaryNotes: string;
}

export interface DiagnosticReport {
  id: string;
  attemptId: string;
  studentProfileId: string;
  pathwayCode: AssessmentPathwayCode;
  pathwayTitle: string;
  version: string;
  completedAt: string;
  dimensions: DimensionScore[];
  dominantClusters: string[];
  matchingStreams: string[];
  careerSuggestions: CareerSuggestion[];
  keyStrengths: string[];
  developmentAreas: string[];
  counsellorDiscussionPrompts: string[];
  counsellorActionPlan?: CounsellorActionPlan;
  ethicsDisclaimer: string;
}

export interface AccessCodeRecord {
  id: string;
  code: string;
  pathwayCode: AssessmentPathwayCode | 'ALL_PATHWAYS';
  assignedToStudentEmail?: string;
  createdByName: string;
  maxUses: number;
  usedCount: number;
  status: 'ACTIVE' | 'USED' | 'EXPIRED' | 'REVOKED';
  notes?: string;
  expiresAt: string;
  createdAt: string;
}

export interface CounsellorIntegratedReview {
  studentProfile: {
    id: string;
    fullName: string;
    email: string;
    grade: string;
    board: string;
    citizenship: string;
    verificationStatus: string;
  };
  preferences?: {
    primaryCountry?: string;
    countries: string[];
    department?: string;
    subDepartment?: string;
  };
  education?: {
    tenthPercentage?: number;
    twelfthPercentage?: number;
    gpa?: number;
    academicStream?: string;
  };
  entranceExamsTracked: number;
  shortlistedCollegesCount: number;
  assessmentsCompleted: DiagnosticReport[];
  inProgressAttemptsCount: number;
}
