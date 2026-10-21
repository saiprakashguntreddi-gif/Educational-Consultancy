export interface ExamSectionInfo {
  name: string;
  questions: number;
  durationMinutes: number;
  description?: string;
}

export interface ImportantDateInfo {
  label: string;
  date: string;
  deadline?: string;
  notes?: string;
}

export interface PrepResourceInfo {
  title: string;
  type: 'Guide' | 'Official Portal' | 'Practice' | 'Video' | 'Strategy';
  url: string;
  isFree?: boolean;
}

export interface EntranceExamRecord {
  id: string;
  code: string;
  name: string;
  category: string; // 'UNDERGRADUATE' | 'POSTGRADUATE' | 'LANGUAGE_PROFICIENCY'
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
  recommendedBooks: string[];
  testDayTips: string[];
  hasMockTest: boolean;
  isRecommendedForStudent?: boolean;
  studentPlanStatus?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface StudentExamPlanInput {
  examId: string;
  status: 'PLANNED' | 'PREPARING' | 'REGISTERED' | 'COMPLETED';
  targetDate?: string;
  targetScore?: string;
  currentScore?: string;
  notes?: string;
}

export interface StudentExamPlanRecord {
  id: string;
  studentProfileId: string;
  examId: string;
  exam: EntranceExamRecord;
  status: 'PLANNED' | 'PREPARING' | 'REGISTERED' | 'COMPLETED';
  targetDate: string | null;
  targetScore: string | null;
  currentScore: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MockQuestionClientView {
  id: string;
  section: string;
  questionText: string;
  options: string[];
  marks: number;
  orderIndex: number;
}

export interface MockTestClientView {
  id: string;
  examId: string;
  examCode: string;
  examName: string;
  title: string;
  description: string;
  durationMinutes: number;
  totalMarks: number;
  passingMarks: number | null;
  questions: MockQuestionClientView[];
}

export interface MockTestSubmissionInput {
  timeSpentSeconds: number;
  answers: Record<string, number>; // { [questionId]: selectedOptionIndex }
}

export interface QuestionResultBreakdown {
  questionId: string;
  section: string;
  questionText: string;
  options: string[];
  selectedOptionIndex: number | null;
  correctOptionIndex: number;
  isCorrect: boolean;
  marksAwarded: number;
  explanation: string | null;
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
  completedAt: string;
  breakdown: QuestionResultBreakdown[];
}

export interface ExamCatalogFilterQuery {
  destination?: string;
  category?: string;
  search?: string;
}
