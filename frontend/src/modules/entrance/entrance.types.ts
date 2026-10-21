export type ExamCategory = 'UNDERGRADUATE' | 'POSTGRADUATE' | 'LANGUAGE_PROFICIENCY';

export type ExamPlanStatus = 'PLANNED' | 'PREPARING' | 'REGISTERED' | 'COMPLETED';

export interface ExamSectionInfo {
  name: string;
  questions?: number;
  durationMinutes?: number;
  description: string;
}

export interface ImportantDateInfo {
  label: string;
  date: string;
  deadline: string;
  notes?: string;
}

export interface PrepResourceInfo {
  title: string;
  url?: string;
  description?: string;
  type: string;
}

export interface RecommendedBookInfo {
  title: string;
  author?: string;
  notes?: string;
}

export interface EntranceExamRecord {
  id: string;
  code: string;
  name: string;
  category: ExamCategory;
  description: string;
  destinations: string[];
  relevantStreams: string[];
  format: string;
  sections: ExamSectionInfo[];
  totalDurationMinutes: number;
  scoreRange: string;
  scoringDetails: string;
  validity: string;
  importantDates: ImportantDateInfo[];
  officialWebsiteUrl: string;
  prepResources: PrepResourceInfo[];
  recommendedBooks: RecommendedBookInfo[];
  testDayTips: string[];
  hasMockTest: boolean;
  isRecommendedForStudent?: boolean;
  studentPlanStatus?: ExamPlanStatus | null;
  createdAt: string;
  updatedAt: string;
}

export interface StudentExamPlanRecord {
  id: string;
  studentProfileId: string;
  examId: string;
  status: ExamPlanStatus;
  targetDate?: string | null;
  targetScore?: string | null;
  currentScore?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  exam?: EntranceExamRecord;
}

export interface StudentExamPlanInput {
  examId: string;
  status: ExamPlanStatus;
  targetDate?: string | null;
  targetScore?: string | null;
  currentScore?: string | null;
  notes?: string | null;
}

export interface UpdateExamPlanInput {
  status?: ExamPlanStatus;
  targetDate?: string | null;
  targetScore?: string | null;
  currentScore?: string | null;
  notes?: string | null;
}

export interface MockTestSummary {
  id: string;
  examId: string;
  title: string;
  description: string;
  durationMinutes: number;
  totalQuestions: number;
  totalMarks: number;
  passingMarks?: number | null;
}

export interface MockQuestionClient {
  id: string;
  section: string;
  questionText: string;
  options: string[];
  marks: number;
  orderIndex: number;
}

export interface MockTestTakingView {
  id: string;
  examId: string;
  examName: string;
  title: string;
  description: string;
  durationMinutes: number;
  totalMarks: number;
  questions: MockQuestionClient[];
}

export interface MockTestSubmissionInput {
  timeSpentSeconds: number;
  answers: Record<string, number>;
}

export interface QuestionResultBreakdown {
  questionId: string;
  section: string;
  questionText: string;
  options: string[];
  selectedOptionIndex: number | null;
  correctOptionIndex: number;
  isCorrect: boolean;
  marksObtained: number;
  maxMarks: number;
  explanation: string;
}

export interface MockTestResultRecord {
  id: string;
  mockTestId: string;
  mockTestTitle: string;
  examName: string;
  score: number;
  totalMarks: number;
  percentage: number;
  timeSpentSeconds: number;
  breakdown: QuestionResultBreakdown[];
  completedAt: string;
}

export interface StudentMockAttemptRecord {
  id: string;
  mockTestId: string;
  score: number;
  totalMarks: number;
  percentage: number;
  timeSpentSeconds: number;
  completedAt: string;
  mockTest?: {
    id: string;
    title: string;
    durationMinutes: number;
    exam: {
      id: string;
      code: string;
      name: string;
    };
  };
}
