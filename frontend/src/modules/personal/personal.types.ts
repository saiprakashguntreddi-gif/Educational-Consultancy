export interface StudentActivityRecord {
  id: string;
  studentProfileId: string;
  activityName: string;
  category: string;
  organization: string | null;
  period: string | null;
  description: string;
  recognition: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface StudentAchievementRecord {
  id: string;
  studentProfileId: string;
  title: string;
  category: string;
  issuer: string | null;
  dateYear: string | null;
  description: string | null;
  certificateUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface GuardianInfo {
  name: string | null;
  relationship: string | null;
  phone: string | null;
  email: string | null;
}

export interface PersonalModuleData {
  primaryEmail: string;
  primaryPhone: string;
  alternateEmail: string | null;
  guardian: GuardianInfo;
  activities: StudentActivityRecord[];
  achievements: StudentAchievementRecord[];
}

export interface UpdateContactGuardianInput {
  primaryPhone?: string;
  alternateEmail?: string | null;
  guardianName?: string | null;
  guardianRelationship?: string | null;
  guardianPhone?: string | null;
  guardianEmail?: string | null;
}

export interface CreateActivityInput {
  activityName: string;
  category: string;
  organization?: string | null;
  period?: string | null;
  description: string;
  recognition?: string | null;
}

export interface UpdateActivityInput {
  activityName?: string;
  category?: string;
  organization?: string | null;
  period?: string | null;
  description?: string;
  recognition?: string | null;
}

export interface CreateAchievementInput {
  title: string;
  category: string;
  issuer?: string | null;
  dateYear?: string | null;
  description?: string | null;
  certificateUrl?: string | null;
}

export interface UpdateAchievementInput {
  title?: string;
  category?: string;
  issuer?: string | null;
  dateYear?: string | null;
  description?: string | null;
  certificateUrl?: string | null;
}
