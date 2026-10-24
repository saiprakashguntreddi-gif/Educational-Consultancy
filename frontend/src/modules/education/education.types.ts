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
  studyCategory?: string | null;
  targetStream?: string | null;
  twelfthDocumentUrl?: string | null;
  tenthDocumentUrl?: string | null;
  undergradDegree?: string | null;
  undergradCollege?: string | null;
  undergradPassingYear?: number | null;
  undergradPercentage?: number | null;
  undergradDocumentUrl?: string | null;
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
  studyCategory?: 'UNDERGRADUATE' | 'POSTGRADUATE';
  targetStream?: string;
  twelfthDocumentUrl?: string;
  tenthDocumentUrl?: string;
  undergradDegree?: string;
  undergradCollege?: string;
  undergradPassingYear?: number;
  undergradPercentage?: number;
  undergradDocumentUrl?: string;
}
