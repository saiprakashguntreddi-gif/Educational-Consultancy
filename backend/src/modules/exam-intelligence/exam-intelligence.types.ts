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

export interface ExamIntelligenceOverview {
  totalRequiredExamsCount: number;
  shortlistedCollegesCount: number;
  collegeRequirements: CollegeExamRequirement[];
  recommendedExams: {
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
  }[];
  studentPlanSummary: {
    totalPlanned: number;
    totalPreparing: number;
    totalRegistered: number;
    totalCompleted: number;
  };
  upcomingDeadlines: ExamDeadlineItem[];
}

export interface ExamDeadlineItem {
  examCode: string;
  examName: string;
  label: string;
  date: string;
  deadline?: string;
  officialUrl: string;
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
  questions: {
    id: string;
    section: string;
    questionText: string;
    options: string[];
    marks: number;
    orderIndex: number;
  }[];
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
  sectionBreakdown: {
    section: string;
    totalQuestions: number;
    correctAnswers: number;
    marksObtained: number;
    totalMarks: number;
    accuracyPercentage: number;
  }[];
  questionReview: {
    questionId: string;
    section: string;
    questionText: string;
    options: string[];
    selectedOptionIndex: number | null;
    correctOptionIndex: number;
    isCorrect: boolean;
    marksAwarded: number;
    explanation?: string | null;
  }[];
  performanceVerdict: 'EXCELLENT' | 'GOOD' | 'NEEDS_IMPROVEMENT';
  recommendations: string[];
}
