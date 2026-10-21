export type UserRole = 'STUDENT' | 'COUNSELLOR' | 'ADMIN';

export interface UserSummary {
  id: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  isEmailVerified: boolean;
  hasProfile: boolean;
  createdAt: string;
}
