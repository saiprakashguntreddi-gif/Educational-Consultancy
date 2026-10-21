/**
 * Platform User Roles and Access Control Matrix
 * Strictly separates responsibilities between Student, Counsellor, and Admin
 */

export enum Role {
  STUDENT = 'STUDENT',
  COUNSELLOR = 'COUNSELLOR',
  ADMIN = 'ADMIN',
}

export const ROLES_LIST = Object.values(Role);

export interface RolePermissions {
  canAccessStudentIntake: boolean;
  canVerifyProfiles: boolean;
  canManagePlatformUsers: boolean;
  canViewAllProfiles: boolean;
}

export const ROLE_PERMISSIONS: Record<Role, RolePermissions> = {
  [Role.STUDENT]: {
    canAccessStudentIntake: true,
    canVerifyProfiles: false,
    canManagePlatformUsers: false,
    canViewAllProfiles: false,
  },
  [Role.COUNSELLOR]: {
    canAccessStudentIntake: false,
    canVerifyProfiles: true,
    canManagePlatformUsers: false,
    canViewAllProfiles: true,
  },
  [Role.ADMIN]: {
    canAccessStudentIntake: false,
    canVerifyProfiles: true,
    canManagePlatformUsers: true,
    canViewAllProfiles: true,
  },
};
