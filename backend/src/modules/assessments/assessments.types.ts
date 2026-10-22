/**
 * Module 11: Eight-Pathway Assessment Suite - Types & Interfaces
 */

export type AssessmentPathwayCode =
  | 'LEARNING_STYLE'
  | 'POST_10TH_STREAM'
  | 'CAREER_PERSONALITY'
  | 'MULTIPLE_INTELLIGENCES'
  | 'ENGINEERING_BRANCH'
  | 'MANAGEMENT_COMMERCE'
  | 'HUMANITIES_LAW_POLICY'
  | 'COGNITIVE_PROBLEM_SOLVING';

export type AccessCodeStatus = 'ACTIVE' | 'USED' | 'EXPIRED' | 'REVOKED';

export type AttemptStatus = 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED';

export type QuestionControl = 'SINGLE_CHOICE' | 'LIKERT_5' | 'SCENARIO_OPTION';

export interface AssessmentQuestionOption {
  id: string;
  label: string;
  value: string;
  scoreWeights: Record<string, number>; // maps dimension -> weight
}

export interface AssessmentQuestion {
  id: string;
  orderIndex: number;
  prompt: string;
  subtext?: string;
  categoryOrSection: string;
  controlType: QuestionControl;
  options: AssessmentQuestionOption[];
}

export interface AssessmentPathwayDefinition {
  code: AssessmentPathwayCode;
  title: string;
  tagline: string;
  version: string;
  estimatedMinutes: number;
  totalQuestions: number;
  dimensions: {
    code: string;
    label: string;
    description: string;
  }[];
  instructions: string[];
  limitationsDisclaimer: string;
  questions: AssessmentQuestion[];
}

export interface AccessCodeRecord {
  id: string;
  code: string;
  pathwayCode: AssessmentPathwayCode | 'ALL_PATHWAYS';
  assignedToStudentEmail?: string;
  assignedToStudentProfileId?: string;
  createdByCounsellorId: string;
  createdByName: string;
  maxUses: number;
  usedCount: number;
  status: AccessCodeStatus;
  notes?: string;
  expiresAt: string;
  createdAt: string;
  usedAt?: string;
}

export interface StudentAssessmentAttempt {
  id: string;
  studentProfileId: string;
  studentUserId: string;
  pathwayCode: AssessmentPathwayCode;
  assessmentVersion: string;
  accessCodeUsed?: string;
  status: AttemptStatus;
  currentQuestionIndex: number;
  answers: Record<string, string>; // questionId -> optionId
  timeSpentSeconds: number;
  startedAt: string;
  lastSavedAt: string;
  completedAt?: string;
  report?: DiagnosticReport;
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
