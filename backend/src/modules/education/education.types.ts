export interface SubjectDetail {
  subject: string;
  score: number;
}

export interface StudentEducationInput {
  // 12th / Senior Secondary (Primary)
  schoolName: string;
  board: string;
  completionYear: number;
  percentage: number;
  subjectDetails: SubjectDetail[];

  // 10th / Secondary School (Optional)
  tenthSchoolName?: string;
  tenthBoard?: string;
  tenthPassingYear?: number;
  tenthPercentage?: number;
}

export interface StudentEducationRecord {
  id: string;
  studentProfileId: string;
  schoolName: string;
  board: string;
  completionYear: number;
  percentage: number;
  subjectDetails: SubjectDetail[];
  tenthSchoolName?: string | null;
  tenthBoard?: string | null;
  tenthPassingYear?: number | null;
  tenthPercentage?: number | null;
  createdAt: string;
  updatedAt: string;
}
