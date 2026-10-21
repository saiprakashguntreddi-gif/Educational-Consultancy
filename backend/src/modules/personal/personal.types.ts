export interface StudentPersonalInfoRecord {
  id: string;
  studentProfileId: string;
  alternateEmail: string | null;
  primaryPhone: string | null;
  guardianName: string | null;
  guardianRelationship: string | null;
  guardianPhone: string | null;
  guardianEmail: string | null;
  createdAt: string;
  updatedAt: string;
}

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

export interface PersonalModulePayload {
  primaryEmail: string;
  primaryPhone: string;
  alternateEmail: string | null;
  guardian: {
    name: string | null;
    relationship: string | null;
    phone: string | null;
    email: string | null;
  };
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

export interface ActivityInput {
  activityName: string;
  category: string;
  organization?: string | null;
  period?: string | null;
  description: string;
  recognition?: string | null;
}

export interface AchievementInput {
  title: string;
  category: string;
  issuer?: string | null;
  dateYear?: string | null;
  description?: string | null;
  certificateUrl?: string | null;
}
