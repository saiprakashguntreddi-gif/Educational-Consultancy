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

  // 10th / Secondary School
  tenthSchoolName?: string;
  tenthBoard?: string;
  tenthPassingYear?: number;
  tenthPercentage?: number;

  // Study Category & Stream (UG vs PG)
  studyCategory?: 'UNDERGRADUATE' | 'POSTGRADUATE';
  targetStream?: string;

  // Document Certificates (10th + 12th for UG; 10th + 12th + Undergrad for PG)
  twelfthDocumentUrl?: string;
  tenthDocumentUrl?: string;

  // Postgraduate Applicant Undergrad Details
  undergradDegree?: string;
  undergradCollege?: string;
  undergradPassingYear?: number;
  undergradPercentage?: number;
  undergradDocumentUrl?: string;
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

  // Study Category & Stream
  studyCategory?: string | null;
  targetStream?: string | null;

  // Document URLs
  twelfthDocumentUrl?: string | null;
  tenthDocumentUrl?: string | null;

  // Undergrad Details for PG
  undergradDegree?: string | null;
  undergradCollege?: string | null;
  undergradPassingYear?: number | null;
  undergradPercentage?: number | null;
  undergradDocumentUrl?: string | null;

  createdAt: string;
  updatedAt: string;
}
