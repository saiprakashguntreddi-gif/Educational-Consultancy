export interface SubjectDetail {
  subject: string;
  score: number;
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

export interface StudentEducationInput {
  schoolName: string;
  board: string;
  completionYear: number;
  percentage: number;
  subjectDetails: SubjectDetail[];
  tenthSchoolName?: string;
  tenthBoard?: string;
  tenthPassingYear?: number;
  tenthPercentage?: number;
}
