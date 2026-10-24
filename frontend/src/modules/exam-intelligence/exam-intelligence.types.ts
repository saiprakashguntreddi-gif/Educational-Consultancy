export interface CollegeExamRequirement {
  institutionId: string;
  institutionName: string;
  country: string;
  city?: string | null;
  avgSatRequirement?: number | null;
  minPercentageRequirement?: number | null;
  courses: {
    courseId: string;
    courseName: string;
    department: string;
    level: string;
    entranceExamsRequired: string[];
  }[];
  allRequiredExams: string[];
}

export interface RecommendedExamItem {
  examId: string;
  code: string;
  name: string;
  category: string;
  destinations: string[];
  relevantStreams: string[];
  requiredByInstitutions: string[];
  hasMockTest: boolean;
  format: string;
  durationMinutes: number;
  scoreRange: string;
  validity: string;
  officialWebsiteUrl: string;
}

export interface ExamDeadlineItem {
  examCode: string;
  examName: string;
  label: string;
  date: string;
  deadline?: string;
  officialUrl: string;
}

export interface ExamIntelligenceOverview {
  totalRequiredExamsCount: number;
  shortlistedCollegesCount: number;
  collegeRequirements: CollegeExamRequirement[];
  recommendedExams: RecommendedExamItem[];
  studentPlanSummary: {
    totalPlanned: number;
    totalPreparing: number;
    totalRegistered: number;
    totalCompleted: number;
  };
  upcomingDeadlines: ExamDeadlineItem[];
}

export interface PreparationPathMilestone {
  week: number;
  phase: string;
  objective: string;
  tasks: string[];
  recommendedResources: { title: string; type: string; url?: string }[];
}

export interface PreparationPlanResponse {
  examId: string;
  examCode: string;
  examName: string;
  targetDate?: string;
  targetScore?: string;
  recommendedBooks: string[];
  prepResources: { title: string; type: string; url?: string }[];
  testDayTips: string[];
  timeline: PreparationPathMilestone[];
}

export interface MockTestQuestionTaking {
  id: string;
  section: string;
  questionText: string;
  options: string[];
  marks: number;
  orderIndex: number;
}

export interface MockTestTakingPayload {
  id: string;
  examId: string;
  examName: string;
  examCode: string;
  title: string;
  description: string;
  durationMinutes: number;
  totalMarks: number;
  sections: string[];
  questions: MockTestQuestionTaking[];
}

export interface MockTestSectionBreakdown {
  section: string;
  totalQuestions: number;
  correctAnswers: number;
  marksObtained: number;
  totalMarks: number;
  accuracyPercentage: number;
}

export interface MockTestQuestionReview {
  questionId: string;
  section: string;
  questionText: string;
  options: string[];
  selectedOptionIndex: number | null;
  correctOptionIndex: number;
  isCorrect: boolean;
  marksAwarded: number;
  explanation?: string | null;
}

export interface MockTestEvaluationResult {
  attemptId: string;
  mockTestId: string;
  mockTestTitle: string;
  examCode: string;
  score: number;
  totalMarks: number;
  percentage: number;
  timeSpentSeconds: number;
  status: string;
  sectionBreakdown: MockTestSectionBreakdown[];
  questionReview: MockTestQuestionReview[];
  performanceVerdict: 'EXCELLENT' | 'GOOD' | 'NEEDS_IMPROVEMENT';
  recommendations: string[];
}

export type ExamPlanStatus = 'PLANNED' | 'PREPARING' | 'REGISTERED' | 'COMPLETED';

export interface StudentExamPlanRecord {
  id: string;
  studentProfileId: string;
  examId: string;
  exam: {
    id: string;
    code: string;
    name: string;
    category: string;
    officialWebsiteUrl: string;
    scoreRange: string;
  };
  status: ExamPlanStatus;
  targetDate?: string | null;
  targetScore?: string | null;
  currentScore?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SaveExamPlanInput {
  examId: string;
  status: ExamPlanStatus;
  targetDate?: string;
  targetScore?: string;
  notes?: string;
}

export interface UpdateExamPlanInput {
  status?: ExamPlanStatus;
  targetDate?: string;
  targetScore?: string;
  currentScore?: string;
  notes?: string;
}

export interface StudentMockAttemptRecord {
  id: string;
  studentProfileId: string;
  mockTestId: string;
  mockTest: {
    id: string;
    title: string;
    durationMinutes: number;
    totalMarks: number;
    exam: {
      code: string;
      name: string;
    };
  };
  score: number;
  totalMarks: number;
  percentage: number;
  timeSpentSeconds: number;
  answers: string;
  status: string;
  createdAt: string;
}
